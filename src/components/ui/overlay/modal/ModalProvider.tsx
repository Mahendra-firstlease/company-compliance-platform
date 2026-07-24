"use client";

import React, { createContext, useState, useCallback, ReactNode } from "react";
import Modal from "./Modal";
import Button from "@/components/common/Button";
import { AlertOptions, ConfirmOptions, OpenOptions, ModalSize, ModalPosition, ModalAnimation } from "./types";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";

interface ModalContextType {
  alert: (options: AlertOptions) => string;
  confirm: (options: ConfirmOptions) => string;
  open: (options: OpenOptions) => string;
  close: (id: string) => void;
  closeAll: () => void;
}

export const GlobalModalContext = createContext<ModalContextType | null>(null);

interface ActiveModal {
  id: string;
  type: "alert" | "confirm" | "custom";
  title?: string;
  description?: string;
  content?: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  buttonText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ActiveModal[]>([]);

  const close = useCallback((id: string) => {
    setModals((prev) => {
      const modal = prev.find((m) => m.id === id);
      if (modal && modal.onClose) {
        modal.onClose();
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const closeAll = useCallback(() => {
    setModals((prev) => {
      prev.forEach((m) => m.onClose?.());
      return [];
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setModals((prev) => [
      ...prev,
      {
        id,
        type: "alert",
        title: options.title,
        description: options.description,
        buttonText: options.buttonText || "Okay",
        variant: options.variant || "info",
        onClose: options.onClose,
        size: "sm",
        position: "center",
        animation: "zoom",
        showCloseButton: true,
        closeOnBackdrop: true,
        closeOnEsc: true,
      },
    ]);
    return id;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setModals((prev) => [
      ...prev,
      {
        id,
        type: "confirm",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        onClose: options.onCancel, // Treat ESC/close as cancel click
        size: "sm",
        position: "center",
        animation: "zoom",
        showCloseButton: false,
        closeOnBackdrop: false, // Force explicit action
        closeOnEsc: true,
      },
    ]);
    return id;
  }, []);

  const openModal = useCallback((options: OpenOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setModals((prev) => [
      ...prev,
      {
        id,
        type: "custom",
        title: options.title,
        description: options.description,
        content: options.content,
        size: options.size || "md",
        position: options.position || "center",
        animation: options.animation || "zoom",
        showCloseButton: options.showCloseButton ?? true,
        closeOnBackdrop: options.closeOnBackdrop ?? true,
        closeOnEsc: options.closeOnEsc ?? true,
      },
    ]);
    return id;
  }, []);

  const getIcon = (variant?: string) => {
    const size = 26;
    switch (variant) {
      case "success":
        return <CheckCircle2 className="text-green-500" size={size} />;
      case "danger":
        return <AlertCircle className="text-red-500" size={size} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={size} />;
      case "info":
        return <Info className="text-blue-500" size={size} />;
      default:
        return <HelpCircle className="text-slate-500" size={size} />;
    }
  };

  const getButtonStyles = (variant?: string) => {
    if (variant === "danger") {
      return "bg-red-500 hover:bg-red-600 focus:ring-red-400 text-white";
    }
    if (variant === "success") {
      return "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white";
    }
    if (variant === "warning") {
      return "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white";
    }
    return "bg-primary hover:bg-primary-hover focus:ring-primary text-white";
  };

  return (
    <GlobalModalContext.Provider value={{ alert, confirm, open: openModal, close, closeAll }}>
      {children}

      {/* Render active programmatic modals */}
      {modals.map((m) => (
        <Modal
          key={m.id}
          open={true}
          onClose={() => close(m.id)}
          size={m.size}
          position={m.position}
          animation={m.animation}
          showCloseButton={m.showCloseButton}
          closeOnBackdrop={m.closeOnBackdrop}
          closeOnEsc={m.closeOnEsc}
        >
          {m.type === "custom" ? (
            <>
              {(m.title || m.description) && (
                <Modal.Header>
                  {m.title && <Modal.Title>{m.title}</Modal.Title>}
                  {m.description && <Modal.Description>{m.description}</Modal.Description>}
                </Modal.Header>
              )}
              {m.title ? <Modal.Body>{m.content}</Modal.Body> : m.content}
            </>
          ) : (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">{getIcon(m.variant)}</div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900 leading-6">
                    {m.title}
                  </h3>
                  {m.description && (
                    <p className="text-sm text-slate-500">
                      {m.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                {m.type === "confirm" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      m.onCancel?.();
                      close(m.id);
                    }}
                  >
                    {m.cancelText}
                  </Button>
                )}
                <Button
                  size="sm"
                  className={getButtonStyles(m.variant)}
                  onClick={() => {
                    if (m.type === "confirm") {
                      m.onConfirm?.();
                    }
                    close(m.id);
                  }}
                >
                  {m.type === "alert" ? m.buttonText : m.confirmText}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      ))}
    </GlobalModalContext.Provider>
  );
}
export type { ModalContextType };
