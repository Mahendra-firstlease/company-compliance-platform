"use client";

import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function ServiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Service detail error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="mx-auto max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
        <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Service Not Found
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error.message || "We could not find the requested compliance service details."}
        </p>
        <div className="flex gap-2 pt-2">
          <Button onClick={() => reset()} variant="outline" size="sm" fullWidth>
            Try Again
          </Button>
          <Link href="/services" className="w-full">
            <Button size="sm" fullWidth leftIcon={<ArrowLeft size={14} />}>
              Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
