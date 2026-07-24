"use client";

import { useContext } from "react";
import { GlobalModalContext } from "./ModalProvider";

export function useModal() {
  const context = useContext(GlobalModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider.");
  }
  return context;
}
export default useModal;
