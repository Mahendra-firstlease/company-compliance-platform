"use client";

import React from "react";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Textarea from "@/components/forms/Textarea";
import Button from "@/components/common/Button";
import { Service } from "@/types/services";
import { Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface ServiceDetailCheckoutModalProps {
  service: Service;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isProcessing?: boolean;
  lastError?: string | null;
  defaultValues?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

export default function ServiceDetailCheckoutModal({
  service,
  onSubmit,
  onCancel,
  isProcessing = false,
  lastError = null,
  defaultValues = {},
}: ServiceDetailCheckoutModalProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-2">
      {/* Pricing Header Card */}
      <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white space-y-3 shadow-md border border-slate-800">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Selected Compliance</span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-400/20">
            {service.duration}
          </span>
        </div>
        <h4 className="text-base font-extrabold text-white leading-snug">
          {service.title}
        </h4>

        {/* Pricing breakdown */}
        <div className="border-t border-slate-800/80 pt-2.5 space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Government Statutory Fee:</span>
            <span className="font-semibold text-slate-200">₹{service.governmentFee || 1000}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Professional & Filing Charges:</span>
            <span className="font-semibold text-slate-200">₹{service.professionalFee || 2000}</span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/60 font-bold">
            <span className="text-slate-200">Total Statutory Investment:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400">₹{service.price}</span>
              {service.originalPrice && (
                <span className="text-slate-500 line-through text-xs">₹{service.originalPrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert Banner (Shown after payment error/cancellation) */}
      {lastError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-red-900">Payment Attempt Unsuccessful</p>
            <p className="text-[11px] leading-relaxed text-red-700">{lastError}</p>
            <p className="text-[10px] font-semibold text-red-600 mt-1">
              💡 Tip: Use a domestic Indian UPI (success@razorpay) or RuPay Card (4585 0000 0000 0001) for instant test checkout.
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormGroup label="Applicant Full Name" required>
            <Input
              type="text"
              required
              name="contactName"
              defaultValue={defaultValues.name || ""}
              placeholder="e.g. Rahul Sharma"
              className="rounded-xl border-slate-200 focus:ring-indigo-500"
            />
          </FormGroup>
          <FormGroup label="Mobile Number (WhatsApp)" required>
            <Input
              type="tel"
              required
              name="contactPhone"
              defaultValue={defaultValues.phone || ""}
              pattern="[0-9]{10}"
              placeholder="10 digit mobile number"
              className="rounded-xl border-slate-200 focus:ring-indigo-500"
            />
          </FormGroup>
        </div>

        <FormGroup label="Registered Business / Office Address" required>
          <Textarea
            required
            name="businessAddress"
            defaultValue={defaultValues.address || ""}
            placeholder="Enter complete address line, city, state & pincode..."
            className="h-20 resize-none rounded-xl border-slate-200 focus:ring-indigo-500 text-xs"
          />
        </FormGroup>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <Lock className="size-3.5 text-emerald-600 shrink-0" />
          <span>256-Bit SSL Encrypted Statutory Razorpay Gateway</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="rounded-xl text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isProcessing}
          className="rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-xs px-6 py-2.5 shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Launching Razorpay...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>{lastError ? "Retry Payment (₹" + service.price + ")" : "Pay with Razorpay (₹" + service.price + ")"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
