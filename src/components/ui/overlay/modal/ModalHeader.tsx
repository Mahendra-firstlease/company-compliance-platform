"use client";

import { ReactNode } from "react";
import { useModalContext } from "./ModalContext";
import ModalCloseButton from "./ModalCloseButton";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function ModalHeader({ children, className }: ModalHeaderProps) {
  const { showCloseButton } = useModalContext();

  return (
    <div
      className={cn(
        "flex items-start justify-between px-6 py-4 border-b border-slate-100",
        className
      )}
    >
      <div className="flex flex-col flex-1">{children}</div>
      {showCloseButton && <ModalCloseButton className="shrink-0 -mt-1 -mr-1 ml-4" />}
    </div>
  );
}
