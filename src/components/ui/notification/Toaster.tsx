"use client";

import { Toaster as SonnerToaster } from "sonner";

import {
  DEFAULT_TOASTER_POSITION,
  ENABLE_RICH_COLORS,
  EXPAND_NOTIFICATIONS,
  MAX_VISIBLE_NOTIFICATIONS,
  SHOW_CLOSE_BUTTON,
} from "@/constants/notification";

export default function Toaster() {
  return (
    <SonnerToaster
      position={DEFAULT_TOASTER_POSITION}
      richColors={ENABLE_RICH_COLORS}
      closeButton={SHOW_CLOSE_BUTTON}
      expand={EXPAND_NOTIFICATIONS}
      visibleToasts={MAX_VISIBLE_NOTIFICATIONS}
      gap={12}
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-slate-200 bg-white shadow-lg",

          title:
            "text-sm font-semibold text-slate-900",

          description:
            "text-sm text-slate-600",

          actionButton:
            "bg-primary text-primary-foreground",

          cancelButton:
            "bg-muted text-foreground",
        },
      }}
    />
  );
}