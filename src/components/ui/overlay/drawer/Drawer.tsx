"use client";

import React from "react";
import { Drawer as DrawerRoot } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  direction?: "bottom" | "right" | "top" | "left";
  snapPoints?: (string | number)[];
  activeSnapPoint?: string | number | null;
  setActiveSnapPoint?: (snapPoint: string | number | null) => void;
  fadeFromIndex?: number;
  className?: string;
}

export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  direction = "right",
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  fadeFromIndex,
  className,
}: DrawerProps) {
  return (
    <DrawerRoot.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      direction={direction}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      fadeFromIndex={fadeFromIndex as any}
    >
      <DrawerRoot.Portal>
        {/* Overlay backdrop */}
        <DrawerRoot.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-3xs" />

        {/* Main Content Drawer Panel */}
        <DrawerRoot.Content
          className={cn(
            "fixed z-50 bg-white flex flex-col border border-slate-100 shadow-2xl transition-all duration-300 ease-out focus:outline-hidden",
            direction === "bottom" &&
              "inset-x-0 bottom-0 max-h-[92%] rounded-t-2xl",
            direction === "right" &&
              "top-0 right-0 h-full w-full max-w-md border-l rounded-l-2xl",
            direction === "left" &&
              "top-0 left-0 h-full w-full max-w-md border-r rounded-r-2xl",
            direction === "top" && "inset-x-0 top-0 max-h-[92%] rounded-b-2xl",
            className,
          )}
        >
          {/* Grab Handle/Bar for bottom drawer drag controls */}
          {direction === "bottom" && (
            <div className="mx-auto w-12 h-1 rounded-full bg-slate-200 my-3 shrink-0 cursor-grab active:cursor-grabbing" />
          )}

          {/* Header section */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="space-y-1 text-left">
              <DrawerRoot.Title className="text-slate-800 font-bold text-sm md:text-base tracking-tight leading-none">
                {title || "Processor Console"}
              </DrawerRoot.Title>
              {description && (
                <DrawerRoot.Description className="text-xs text-slate-400 font-semibold mt-1 block">
                  {description}
                </DrawerRoot.Description>
              )}
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 border border-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
              aria-label="Close drawer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Drawer Body Scroll Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 text-sm text-slate-650">
            {children}
          </div>
        </DrawerRoot.Content>
      </DrawerRoot.Portal>
    </DrawerRoot.Root>
  );
}
