"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export default function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t border-slate-100",
        className
      )}
    >
      {children}
    </div>
  );
}
