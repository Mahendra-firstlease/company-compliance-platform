"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

import NotificationIcon from "./NotificationIcon";
import NotificationTitle from "./NotificationTitle";
import NotificationDescription from "./NotificationDescription";
import NotificationAction from "./NotificationAction";
import NotificationClose from "./NotificationClose";
import NotificationProgress from "./NotificationProgress";
import { NotificationVariant } from "@/types/notification";

interface NotificationProps {
  id?: string | number;

  variant?: NotificationVariant;

  title?: string;

  description?: string;

  icon?: ReactNode;

  action?: {
    label: string;
    onClick: () => void;
  };

  onClose?: () => void;

  showCloseButton?: boolean;

  showProgress?: boolean;

  className?: string;

  children?: ReactNode;
}

export default function Notification({
  variant = "info",
  title,
  description,
  icon,
  action,
  onClose,
  showCloseButton = true,
  showProgress = false,
  className,
  children,
}: NotificationProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-lg border bg-white shadow-xl",
        "border-slate-200",
        "",
        className,
      )}
    >
      <div className="flex gap-4 p-4">
        <NotificationIcon variant={variant} icon={icon} />

        <div className="flex-1 space-y-1">
          {title && <NotificationTitle>{title}</NotificationTitle>}

          {description && (
            <NotificationDescription>{description}</NotificationDescription>
          )}

          {children}
        </div>

        {showCloseButton && <NotificationClose onClick={onClose} />}
      </div>

      {(action || showProgress) && (
        <div className="border-t border-slate-100">
          {action && (
            <div className="px-4 pt-3">
              <NotificationAction onClick={action.onClick}>
                {action.label}
              </NotificationAction>
            </div>
          )}

          {showProgress && <NotificationProgress />}
        </div>
      )}
    </div>
  );
}
