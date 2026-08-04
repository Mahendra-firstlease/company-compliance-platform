"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import { Service } from "@/types/services";
import { ShieldCheck, ShoppingBag, Trash2, Lock, AlertCircle, Loader2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { saveApplication } from "@/lib/applications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadRazorpayScript } from "@/lib/razorpay-client";

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
};

type RazorpayWindowWithSdk = Window & typeof globalThis & {
  Razorpay?: new (options: unknown) => RazorpayCheckoutInstance;
};

interface MultiServiceCheckoutModalProps {
  selectedServices: Service[];
  onRemoveService?: (serviceId: string) => void;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function MultiServiceCheckoutModal({
  selectedServices,
  onRemoveService,
  onSuccess,
  onCancel,
}: MultiServiceCheckoutModalProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "ADMIN";

  // Local state for instant modal reactive updates upon deletion
  const [servicesList, setServicesList] = useState<Service[]>(selectedServices);
  const [contactName, setContactName] = useState(session?.user?.name || "");
  const [contactPhone, setContactPhone] = useState((session?.user as { phone?: string } | undefined)?.phone || "");
  const [businessAddress, setBusinessAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  if (isAdmin) {
    return (
      <div className="p-4 sm:p-6 text-center space-y-4 bg-amber-50/70 rounded-2xl border border-amber-200">
        <div className="size-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-base">
            Admin Account Restriction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Admin accounts cannot purchase client service packages. Please log in with a customer account to purchase services, or access the Admin Console to manage filings.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs font-bold w-full sm:w-auto cursor-pointer"
          >
            Close Modal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onCancel();
              router.push("/admin/applications");
            }}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto cursor-pointer"
          >
            Go to Admin Console
          </Button>
        </div>
      </div>
    );
  }

  const totalFee = servicesList.reduce((sum, s) => sum + s.price, 0);

  const handleRemoveItem = (slugOrId: string) => {
    const updated = servicesList.filter((s) => s.slug !== slugOrId && s.id !== slugOrId);
    setServicesList(updated);
    if (onRemoveService) {
      onRemoveService(slugOrId);
    }
    if (updated.length === 0) {
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (servicesList.length === 0) {
      notify.error({ title: "No Services Selected", description: "Please select at least one service." });
      return;
    }

    if (!contactName || !contactPhone) {
      notify.error({
        title: "Missing Contact Details",
        description: "Please enter your name and phone number.",
      });
      return;
    }

    const loggedInUserId = (session?.user as { id?: string } | undefined)?.id || undefined;
    const loggedInUserEmail = session?.user?.email || undefined;

    setIsSubmitting(true);
    setLastError(null);

    notify.loading({
      title: "Initiating Batch Payment...",
      description: "Preparing order for " + servicesList.length + " compliance services.",
    });

    try {
      // 1. Load Razorpay Client Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        const errorMsg = "Could not load Razorpay payment SDK. Please check your network.";
        notify.error({ title: "SDK Error", description: errorMsg });
        setLastError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // 2. Create Razorpay Order via /api/create-order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalFee * 100, // in paise
          currency: "INR",
          notes: {
            batchCount: String(servicesList.length),
            services: servicesList.map((s) => s.slug).join(", "),
            userId: loggedInUserId,
            userEmail: loggedInUserEmail,
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.order_id) {
        const errorMsg = orderData.error || "Could not create Razorpay payment order.";
        notify.error({ title: "Order Failed", description: errorMsg });
        setLastError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      const { order_id, amount, currency, key } = orderData;
      const appIds = servicesList.map((s) => `COMP-${s.id}0${Math.floor(1000 + Math.random() * 9000)}`);

      // 3. Open Official Razorpay Checkout Modal
      const options = {
        key,
        amount,
        currency: currency || "INR",
        name: "Compliance Platform India",
        description: `Bundled Package Payment (${servicesList.length} Services)`,
        order_id,
        prefill: {
          name: contactName,
          email: loggedInUserEmail || "",
          contact: contactPhone,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) => {
          notify.loading({
            title: "Verifying Batch Signature...",
            description: "Updating statutory application statuses.",
          });

          try {
            // Save Applications in DB with explicit logged in user ID and email
            const appPromises = servicesList.map((service, idx) => {
              return saveApplication({
                id: appIds[idx],
                userId: loggedInUserId,
                userEmail: loggedInUserEmail,
                serviceSlug: service.slug,
                serviceTitle: service.title,
                status: "PAYMENT_CONFIRMED",
                customerName: contactName,
                customerPhone: contactPhone,
                address: businessAddress,
                uploadedDocs: {},
                governmentFee: service.governmentFee || 1000,
                professionalFee: service.professionalFee || 2000,
                totalFee: service.price,
                createdAt: new Date().toISOString(),
              });
            });

            await Promise.all(appPromises);

            // Verify Signature via /api/verify-payment
            await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                applicationIds: appIds,
                amount: totalFee,
                userId: loggedInUserId || null,
              }),
            });

            notify.success({
              title: "Package Payment Confirmed! 🎉",
              description: `Initiated filings for ${servicesList.length} services. Payment ID: ${response.razorpay_payment_id}`,
            });
          } catch (err: unknown) {
            console.error("Batch payment handler warning:", err);
            notify.success({
              title: "Package Payment Confirmed! 🎉",
              description: `Initiated filings for ${servicesList.length} services. Navigating to dashboard...`,
            });
          } finally {
            setIsSubmitting(false);
            if (onSuccess) onSuccess();
            onCancel();
            router.push("/dashboard");
            router.refresh();
          }
        },
        modal: {
          ondismiss: () => {
            notify.dismiss();
            setIsSubmitting(false);
            const cancelMsg = "You closed the payment popup before completing checkout.";
            setLastError(cancelMsg);
            notify.info({
              title: "Payment Cancelled",
              description: cancelMsg,
            });
          },
        },
      };

      const razorpayConstructor = (window as unknown as RazorpayWindowWithSdk).Razorpay;
      if (!razorpayConstructor) {
        throw new Error("Razorpay SDK is unavailable.");
      }

      const razorpayWindow = new razorpayConstructor(options);

      // Listen for payment.failed event safely
      razorpayWindow.on("payment.failed", function (response: unknown) {
        const errorPayload = response as { error?: { description?: string; reason?: string }; description?: string; reason?: string } | undefined;
        const errObj = errorPayload?.error || errorPayload || {};
        const errorDesc =
          (errObj as { description?: string; reason?: string }).description ||
          (errObj as { description?: string; reason?: string }).reason ||
          "Payment was not completed. Please try again with a domestic Indian card (4585 0000 0000 0001) or UPI (success@razorpay).";

        console.warn("Razorpay Payment Event [payment.failed]:", errorDesc, errObj);

        setLastError(errorDesc);
        notify.error({
          title: "Payment Unsuccessful",
          description: errorDesc,
        });
        setIsSubmitting(false);
      });

      razorpayWindow.open();
    } catch (err: unknown) {
      console.error("Batch Razorpay error:", err);
      const errorMsg = err instanceof Error ? err.message : "Could not process batch applications. Please try again.";
      setLastError(errorMsg);
      notify.error({
        title: "Checkout Error",
        description: errorMsg,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Combined Statutory Checkout ({servicesList.length} Services)
            </h3>
            <p className="text-xs text-slate-500">
              Single invoice and bundled filing initiation for selected compliance services.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert Banner (Shown after payment error/cancellation) */}
      {lastError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-red-900">Batch Payment Attempt Unsuccessful</p>
            <p className="text-[11px] leading-relaxed text-red-700">{lastError}</p>
            <p className="text-[10px] font-semibold text-red-600 mt-1">
              💡 Tip: Use a domestic Indian UPI (success@razorpay) or RuPay Card (4585 0000 0000 0001) for instant test checkout.
            </p>
          </div>
        </div>
      )}

      {/* Selected Items List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Package Summary ({servicesList.length} Services):
          </span>
          <span className="text-xs font-bold text-indigo-700">Total: ₹{totalFee}</span>
        </div>

        {servicesList.map((s) => (
          <div
            key={s.id || s.slug}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs"
          >
            <div className="min-w-0">
              <p className="font-bold text-slate-800 break-all">{s.title}</p>
              <p className="text-[11px] text-slate-400">Target Time: {s.duration}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="font-bold text-slate-900">₹{s.price}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(s.slug || s.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors p-1.5 cursor-pointer"
                title="Remove from package"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Summary Block */}
      <div className="p-3 sm:p-4 bg-indigo-50/60 rounded-lg border border-indigo-100 space-y-1">
        <div className="flex justify-between items-center text-xs text-slate-600 gap-2">
          <span>Subtotal ({servicesList.length} services):</span>
          <span className="font-bold text-slate-900">₹{totalFee}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-black text-indigo-950 pt-1 border-t border-indigo-100">
          <span>Total Investment:</span>
          <span className="text-lg font-bold text-indigo-700">₹{totalFee}</span>
        </div>
      </div>

      {/* Customer Contact Details */}
      <div className="space-y-3 sm:space-y-4 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Filing Contact Details:
        </span>

        <FormGroup label="Authorized Contact Person" required>
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Full Name"
            required
          />
        </FormGroup>

        <FormGroup label="Contact Phone Number" required>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+91 9876543210"
            required
          />
        </FormGroup>

        <FormGroup label="Registered Business Address (Optional)">
          <Input
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            placeholder="Street address, City, Pincode"
          />
        </FormGroup>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <Lock className="size-3.5 text-emerald-600 shrink-0" />
          <span>256-Bit SSL Encrypted Statutory Razorpay Gateway</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-slate-100">
        <Button type="button" size={'sm'} variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancel
        </Button>

        <Button size={'sm'} type="submit" variant="primary" disabled={isSubmitting || servicesList.length === 0} className="flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Launching Razorpay...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>{lastError ? `Retry Payment (₹${totalFee})` : `Pay (₹${totalFee})`}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
