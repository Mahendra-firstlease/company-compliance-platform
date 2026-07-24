"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  backdropClassName?: string;
  closeOnBackdrop?: boolean;
}

export default function BaseOverlay({
  open,
  onClose,
  children,
  className,
  backdropClassName,
  closeOnBackdrop = true,
}: BaseOverlayProps) {
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity duration-300",
          backdropClassName
        )}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
