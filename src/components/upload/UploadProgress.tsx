"use client";

import React from "react";
import { Loader2, ShieldCheck } from "lucide-react";

interface UploadProgressProps {
  progressMessage?: string;
}

export default function UploadProgress({
  progressMessage = "Encrypting & Uploading to S3 Bucket...",
}: UploadProgressProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin text-indigo-600 size-4" />
          {progressMessage}
        </span>
        <ShieldCheck className="size-4 text-indigo-500" />
      </div>
      <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
      </div>
    </div>
  );
}
