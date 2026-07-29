import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Service } from "@/types/services";
import ApplyNowButton from "./ApplyNowButton";

export default function ServiceDetailCheckoutSidebar({
  service,
}: {
  service: Service;
}) {
 

  return (
    <aside className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-5">
      {/* Price Block */}
      <div className="space-y-1 pb-4 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
          Total Fee ({service.title})
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{service.price}
          </span>
          {service.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{service.originalPrice}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {service.governmentFee && service.professionalFee
            ? `Includes ₹${service.governmentFee} govt statutory fee & ₹${service.professionalFee} CA/CS fee.`
            : "Includes all statutory government fees & expert filing costs."}
        </p>
      </div>

      {/* Deliverables List */}
      <div className="space-y-2.5 text-xs text-gray-600">
        <span className="font-semibold text-gray-800 block">
          Package Deliverables:
        </span>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>Statutory document drafting for {service.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>Government portal fee payment receipt</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>CA / CS verification & certificate issuance</span>
        </div>
      </div>

      {/* Isolated Client Island for Modal Trigger */}
      <div className="space-y-3 pt-2">
        {/* Apply Now Button */}
        <ApplyNowButton service={service} />

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
          <span>100% Verified Statutory Compliance</span>
        </div>
      </div>
    </aside>
  );
}
