"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export default function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 overflow-y-auto text-sm text-slate-600",
        className
      )}
    >
      {children}
    </div>
  );
}
