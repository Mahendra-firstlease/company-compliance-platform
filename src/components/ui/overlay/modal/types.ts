import { ReactNode } from "react";

export type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export type ModalPosition = "center" | "top" | "bottom" | "left" | "right";

export type ModalAnimation =
  | "fade"
  | "zoom"
  | "scale"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  children: ReactNode;
}

export interface AlertOptions {
  title: string;
  description?: string;
  buttonText?: string;
  onClose?: () => void;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export interface OpenOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
}
