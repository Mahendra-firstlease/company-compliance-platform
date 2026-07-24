"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonsProps {
  className?: string;
}

export default function NavigationButtons({ className }: NavigationButtonsProps) {
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-3xs cursor-pointer active:scale-95"
        title="Go back"
        aria-label="Go back"
      >
        <ChevronLeft size={16} className="shrink-0" />
      </button>
      <button
        onClick={() => router.forward()}
        className="inline-flex items-center justify-center size-8 rounded-lg bg-white border border-slate-200 text-slate-650 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-3xs cursor-pointer active:scale-95"
        title="Go forward"
        aria-label="Go forward"
      >
        <ChevronRight size={16} className="shrink-0" />
      </button>
    </div>
  );
}
