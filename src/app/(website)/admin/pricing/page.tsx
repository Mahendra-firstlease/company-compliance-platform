"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PricingConfigPage() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-2xs space-y-3 animate-in fade-in duration-300">
      <ShieldCheck size={32} className="text-primary mx-auto" />
      <h3 className="font-semibold text-slate-900 text-sm">Pricing Settings</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        Simulated admin data and processing configurations for pricing logs are currently integrated with the main overview console.
      </p>
    </div>
  );
}
