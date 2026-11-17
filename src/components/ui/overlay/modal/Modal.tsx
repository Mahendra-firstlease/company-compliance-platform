"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import React, { createContext, useContext, useEffect } from "react";
import { X } from "lucide-react";
import { ModalProps } from "./types";
import { cn } from "@/lib/utils";

// --- Internal Modal Context ---
interface ModalContextValue {
  onClose: () => void;
  showCloseButton?: boolean;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a Modal");
  }
  return context;
}

// --- Subcomponents ---
export interface ModalOverlayProps {
  className?: string;
}

export function ModalOverlay({ className }: ModalOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity",
        className,
      )}
    />
  );
}

export interface ModalCloseButtonProps {
  className?: string;
}

export function ModalCloseButton({ className }: ModalCloseButtonProps) {
  const { onClose } = useModalContext();

  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer",
        className,
      )}
      aria-label="Close modal"
    >
      <X size={18} />
    </button>
  );
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function ModalHeader({
  children,
  className,
  showCloseButton = true,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between px-6 pt-6 pb-2 border-b border-slate-100",
        className,
      )}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && (
        <ModalCloseButton className="shrink-0 -mt-1 -mr-1 ml-4" />
      )}
    </div>
  );
}

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h3
      className={cn(
        "text-base font-bold text-slate-900 tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn("text-xs text-slate-500 mt-1", className)}>
      {children}
    </p>
  );
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("px-6 py-4 text-sm text-slate-600", className)}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

// --- Style Maps ---
const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full h-full rounded-none",
};

const positionClasses = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-10 sm:pt-20",
  bottom: "items-end justify-center pb-10 sm:pb-20",
  left: "items-center justify-start pl-0 sm:pl-10",
  right: "items-center justify-end pr-0 sm:pr-10",
};

const animationClasses = {
  fade: "transition duration-300 ease-out data-[closed]:opacity-0",
  zoom: "transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
  scale: "transition duration-300 ease-out data-[closed]:scale-90 data-[closed]:opacity-0",
  "slide-up": "transition duration-300 ease-out data-[closed]:translate-y-4 data-[closed]:opacity-0",
  "slide-down": "transition duration-300 ease-out data-[closed]:-translate-y-4 data-[closed]:opacity-0",
  "slide-left": "transition duration-300 ease-out data-[closed]:-translate-x-4 data-[closed]:opacity-0",
  "slide-right": "transition duration-300 ease-out data-[closed]:translate-x-4 data-[closed]:opacity-0",
};

// --- Main Modal Component ---
export default function Modal({
  open,
  onClose,
  size = "md",
  position = "center",
  animation = "zoom",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  preventScroll = true,
  children,
}: ModalProps) {
  // Handle ESC close
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEsc, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose, showCloseButton }}>
      <Dialog
        open={open}
        onClose={() => {}} // Controlled manually via ESC listener and click handler
        className="relative z-50"
      >
        <ModalOverlay />

        <div
          className={cn(
            "fixed inset-0 z-50 flex w-screen overflow-y-auto p-4",
            positionClasses[position],
          )}
          onClick={handleBackdropClick}
        >
          <DialogPanel
            transition
            className={cn(
              "w-full bg-white rounded-lg shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]",
              sizeClasses[size],
              animationClasses[animation],
            )}
          >
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    </ModalContext.Provider>
  );
}

Modal.Overlay = ModalOverlay;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.CloseButton = ModalCloseButton;
export type { ModalProps };
