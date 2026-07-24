"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import React, { useEffect } from "react";
import { ModalProps } from "./types";
import { ModalContext } from "./ModalContext";
import ModalOverlay from "./ModalOverlay";
import ModalHeader from "./ModalHeader";
import ModalTitle from "./ModalTitle";
import ModalDescription from "./ModalDescription";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import ModalCloseButton from "./ModalCloseButton";
import { cn } from "@/lib/utils";

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
  left: "items-center justify-start pl-10",
  right: "items-center justify-end pr-10",
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
            positionClasses[position]
          )}
          onClick={handleBackdropClick}
        >
          <DialogPanel
            transition
            className={cn(
              "w-full bg-white rounded-lg shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]",
              sizeClasses[size],
              animationClasses[animation]
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
