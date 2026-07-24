"use client";

import { Description } from "@headlessui/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalDescriptionProps {
  children: ReactNode;
  className?: string;
}

export default function ModalDescription({
  children,
  className,
}: ModalDescriptionProps) {
  return (
    <Description
      className={cn(
        "text-sm text-slate-500 mt-1.5",
        className
      )}
    >
      {children}
    </Description>
  );
}
