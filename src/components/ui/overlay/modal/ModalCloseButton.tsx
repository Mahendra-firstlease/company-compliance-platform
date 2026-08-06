"use client";

import { X } from "lucide-react";
import { useModalContext } from "./ModalContext";
import { cn } from "@/lib/utils";

interface ModalCloseButtonProps {
  className?: string;
}

export default function ModalCloseButton({ className }: ModalCloseButtonProps) {
  const { onClose } = useModalContext();

  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "rounded-lg size-11 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        className
      )}
      aria-label="Close modal"
    >
      <X size={18} />
    </button>
  );
}
