"use client";

import React, { useState } from "react";
import Button from "@/components/common/Button";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import { Service } from "@/types/services";
import { ShieldCheck, Trash2, Lock, AlertCircle, Loader2 } from "lucide-react";
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
      <div className="py-2 text-center space-y-4">
        <div className="size-11 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="font-semibold text-slate-900 text-sm">
            Admin Account Restriction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Admin accounts cannot purchase statutory client services. Please sign in with a customer account or proceed to the Admin Console.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="w-full sm:w-auto text-xs"
          >
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onCancel();
              router.push("/admin/applications");
            }}
            className="w-full sm:w-auto text-xs bg-primary text-white"
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
      title: servicesList.length === 1 ? "Connecting to Razorpay..." : "Initiating Batch Payment...",
      description:
        servicesList.length === 1
          ? `Preparing checkout for ${servicesList[0].title}.`
          : `Preparing order for ${servicesList.length} compliance services.`,
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
        description:
          servicesList.length === 1
            ? `Statutory Filing: ${servicesList[0].title}`
            : `Bundled Package Payment (${servicesList.length} Services)`,
        order_id,
        prefill: {
          name: contactName,
          email: loggedInUserEmail || "",
          contact: contactPhone,
        },
        theme: {
          color: "#207574",
        },
        handler: async (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) => {
          notify.loading({
            title: "Verifying Payment...",
            description: "Updating statutory application status.",
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
              title: "Payment Confirmed! 🎉",
              description:
                servicesList.length === 1
                  ? `Initiated filing for ${servicesList[0].title}. Payment ID: ${response.razorpay_payment_id}`
                  : `Initiated filings for ${servicesList.length} services. Payment ID: ${response.razorpay_payment_id}`,
            });
          } catch (err: unknown) {
            console.error("Batch payment handler warning:", err);
            notify.success({
              title: "Payment Confirmed! 🎉",
              description:
                servicesList.length === 1
                  ? `Initiated filing for ${servicesList[0].title}. Navigating to dashboard...`
                  : `Initiated filings for ${servicesList.length} services. Navigating to dashboard...`,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert Banner (Shown after payment error/cancellation) */}
      {lastError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-950">
              {servicesList.length === 1 ? "Payment Incomplete" : "Batch Payment Incomplete"}
            </p>
            <p className="text-xs leading-relaxed text-red-800">{lastError}</p>
            <p className="text-xs text-red-700">
              💡 For test checkouts, you can use domestic UPI (success@razorpay) or RuPay Card (4585 0000 0000 0001).
            </p>
          </div>
        </div>
      )}

      {/* Order Summary Strip */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/80">
          <span className="font-medium text-slate-700">
            {servicesList.length > 1 ? `Selected Services (${servicesList.length})` : "Order Summary"}
          </span>
          <span>Statutory & portal fees included</span>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-0.5">
          {servicesList.map((s) => (
            <div
              key={s.id || s.slug}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{s.title}</p>
                {s.duration && (
                  <p className="text-xs text-slate-500 mt-0.5">Turnaround: {s.duration}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-slate-900">₹{s.price.toLocaleString("en-IN")}</span>
                {servicesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(s.slug || s.id)}
                    className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-md hover:bg-slate-200/60 cursor-pointer"
                    title="Remove from package"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-700">Total Payable</span>
          <span className="text-base font-bold text-slate-900">
            ₹{totalFee.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Customer Contact Details */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-700">
          APPLICANT & CONTACT DETAILS
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Contact Person" required>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </FormGroup>

          <FormGroup label="Contact Number" required>
            <Input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder=" Enter mobile"
              required
            />
          </FormGroup>
        </div>

        <FormGroup label="Principal Place of Business">
          <Input
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            placeholder="Street, city, state, PIN code"
          />
        </FormGroup>
      </div>

      {/* Security footnote */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
        <Lock className="size-3.5 text-emerald-600 shrink-0" />
        <span>Secure payment powered by Razorpay </span>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          size="sm"
          type="submit"
          variant="primary"
          disabled={isSubmitting || servicesList.length === 0}
          className="flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto min-w-[130px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>
                {lastError
                  ? `Retry Payment (₹${totalFee.toLocaleString("en-IN")})`
                  : `Pay ₹${totalFee.toLocaleString("en-IN")}`}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
