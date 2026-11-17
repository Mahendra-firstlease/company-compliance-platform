"use client";

import React, { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";
import { NotificationVariant } from "@/types/notification";

// --- Notification Title ---
export interface NotificationTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function NotificationTitle({ className, children, ...props }: NotificationTitleProps) {
  return (
    <h4
      className={cn("text-sm font-semibold leading-none tracking-tight text-slate-900", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

// --- Notification Description ---
export interface NotificationDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: ReactNode;
}

export function NotificationDescription({ className, children, ...props }: NotificationDescriptionProps) {
  return (
    <p className={cn("text-sm leading-relaxed text-slate-600", className)} {...props}>
      {children}
    </p>
  );
}

// --- Notification Action ---
export interface NotificationActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function NotificationAction({ children, ...props }: NotificationActionProps) {
  return (
    <Button size="sm" variant="outline" className="h-8 px-3 text-xs" {...props}>
      {children}
    </Button>
  );
}

// --- Notification Close ---
export interface NotificationCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function NotificationClose({ className, ...props }: NotificationCloseProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md p-1 transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        className,
      )}
      {...props}
    >
      <X size={16} />
    </button>
  );
}

// --- Notification Progress ---
export interface NotificationProgressProps {
  className?: string;
}

export function NotificationProgress({ className }: NotificationProgressProps) {
  return (
    <div className={cn("h-1 w-full overflow-hidden bg-slate-200", className)}>
      <div className="h-full w-full origin-left animate-pulse bg-blue-600" />
    </div>
  );
}

// --- Notification Icon ---
export interface NotificationIconProps {
  variant: NotificationVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<
  NotificationVariant,
  {
    icon: ReactNode;
    color: string;
  }
> = {
  success: {
    icon: <CheckCircle2 size={22} />,
    color: "text-green-600",
  },
  error: {
    icon: <AlertCircle size={22} />,
    color: "text-red-600",
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    color: "text-yellow-500",
  },
  info: {
    icon: <Info size={22} />,
    color: "text-blue-600",
  },
  loading: {
    icon: <Loader2 size={22} className="animate-spin" />,
    color: "text-slate-500",
  },
};

export function NotificationIcon({ variant, icon, className }: NotificationIconProps) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100",
        className,
      )}
    >
      <span className={cn("flex items-center justify-center", variantStyles[variant].color)}>
        {icon ?? variantStyles[variant].icon}
      </span>
    </div>
  );
}

// --- Main Notification Component ---
export interface NotificationProps {
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
