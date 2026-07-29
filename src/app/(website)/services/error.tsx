"use client";

import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import { AlertTriangle } from "lucide-react";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Services catalog error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="mx-auto max-w-md bg-white border border-slate-200 rounded-lg p-8 shadow-xs space-y-4">
        <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Failed to Load Catalog
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error.message || "An unexpected network or database error occurred. Please try again."}
        </p>
        <div className="pt-2">
          <Button onClick={() => reset()} fullWidth size="sm">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
