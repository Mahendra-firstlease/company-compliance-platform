import React from "react";
import { Zap, UserCheck, ShieldCheck } from "lucide-react";
import { Service } from "@/types/services";

export default function ServiceDetailQuickFeatures({ service }: { service: Service }) {
  return (
    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <Zap className="size-4 text-blue-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-medium">Processing Time</span>
          <span className="text-xs font-semibold text-gray-800">{service.duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <UserCheck className="size-4 text-blue-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-medium">Assistance</span>
          <span className="text-xs font-semibold text-gray-800">CA / CS Lead</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <ShieldCheck className="size-4 text-blue-600 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-medium">Verification</span>
          <span className="text-xs font-semibold text-gray-800">100% Portal Guarantee</span>
        </div>
      </div>
    </div>
  );
}
