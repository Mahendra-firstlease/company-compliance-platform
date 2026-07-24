"use client";

import { createContext, useContext } from "react";

interface ModalContextProps {
  onClose: () => void;
  showCloseButton?: boolean;
}

export const ModalContext = createContext<ModalContextProps | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "Modal compound components must be rendered inside a Modal component."
    );
  }
  return context;
}
