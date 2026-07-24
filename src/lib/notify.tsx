"use client";

import { toast } from "sonner";

import Notification from "@/components/ui/notification/Notification";

import type {
  NotificationOptions,
  NotificationVariant,
  PromiseOptions,
} from "@/types/notification";

import {
  DEFAULT_NOTIFICATION_DURATION,
  NOTIFICATION_DURATIONS,
} from "@/constants/notification";

type NotifyInput = string | NotificationOptions;

/**
 * Normalize input into NotificationOptions
 */
function normalize(input: NotifyInput): NotificationOptions {
  if (typeof input === "string") {
    return {
      title: input,
    };
  }

  return input;
}

/**
 * Render custom notification
 */
function showNotification(
  variant: NotificationVariant,
  input: NotifyInput
) {
  const options = normalize(input);

  return toast.custom(
    (id) => (
      <Notification
        id={id}
        variant={variant}
        title={options.title}
        description={options.description}
        icon={options.icon}
        action={options.action}
        showCloseButton={options.closeButton ?? true}
        onClose={() => toast.dismiss(id)}
      />
    ),
    {
      duration:
        options.duration ??
        NOTIFICATION_DURATIONS[variant] ??
        DEFAULT_NOTIFICATION_DURATION,
    }
  );
}

export const notify = {
  success(input: NotifyInput) {
    return showNotification("success", input);
  },

  error(input: NotifyInput) {
    return showNotification("error", input);
  },

  warning(input: NotifyInput) {
    return showNotification("warning", input);
  },

  info(input: NotifyInput) {
    return showNotification("info", input);
  },

  loading(input: NotifyInput) {
    return showNotification("loading", input);
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  custom(component: React.ReactNode, duration = DEFAULT_NOTIFICATION_DURATION) {
    return toast.custom(() => <>{component}</>, {
      duration,
    });
  },

  promise<T>(
    promise: Promise<T>,
    options: PromiseOptions<T>
  ) {
    const loadingId = notify.loading(options.loading);

    promise
      .then((data) => {
        notify.dismiss(loadingId);

        const result =
          typeof options.success === "function"
            ? options.success(data)
            : options.success;

        notify.success(result);
      })
      .catch((error) => {
        notify.dismiss(loadingId);

        const result =
          typeof options.error === "function"
            ? options.error(error)
            : options.error;

        notify.error(result);
      });

    return promise;
  },
};

export default notify;
