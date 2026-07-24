"use client";

import { DialogTitle } from "@headlessui/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalTitleProps {
  children: ReactNode;
  className?: string;
}

export default function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <DialogTitle
      className={cn(
        "text-lg font-semibold leading-6 text-slate-900",
        className
      )}
    >
      {children}
    </DialogTitle>
  );
}
