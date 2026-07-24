"use client";

import { DialogBackdrop } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface ModalOverlayProps {
  className?: string;
}

export default function ModalOverlay({ className }: ModalOverlayProps) {
  return (
    <DialogBackdrop
      transition
      className={cn(
        "fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs transition-opacity duration-300 ease-out data-[closed]:opacity-0",
        className
      )}
    />
  );
}
