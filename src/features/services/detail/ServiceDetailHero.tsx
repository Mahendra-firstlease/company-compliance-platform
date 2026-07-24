import React from "react";
import { Clock } from "lucide-react";
import { Service } from "@/types/services";

export default function ServiceDetailHero({ service }: { service: Service }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          Government Filing
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          {service.duration}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
        {service.title}
      </h1>

      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
        {service.shortDescription}
      </p>
    </div>
  );
}
