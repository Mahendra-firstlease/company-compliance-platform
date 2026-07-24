"use client";

import Button from "@/components/common/Button";
import { Check, ShieldCheck } from "lucide-react";
import { Service } from "@/types/services";

interface ServiceDetailCheckoutCardProps {
  service: Service;
  onApply: () => void;
}


export default function ServiceDetailCheckoutCard({
  service,
  onApply,
}: ServiceDetailCheckoutCardProps) {
  return (
    <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
      {/* Price Block */}
      <div className="space-y-1 pb-4 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
          Total Statutory Fee
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900">
            ₹{service.price}
          </span>
          {service.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{service.originalPrice}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Includes government statutory fees & portal charges.
        </p>
      </div>

      {/* Deliverables List */}
      <div className="space-y-2.5 text-xs text-gray-600">
        <span className="font-semibold text-gray-800 block">
          Package Includes:
        </span>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>Statutory document drafting & filing</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>Government portal fee payment receipt</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>CA / CS verification certificate</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={onApply}
          fullWidth
          size="lg"
          variant="primary"
          className="font-semibold text-sm py-3"
        >
          Apply Now
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>100% Guaranteed Compliance</span>
        </div>
      </div>
    </div>
  );
}
