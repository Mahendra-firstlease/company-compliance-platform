import type { NotificationVariant } from "@/types/notification";
import type { ToasterProps } from "sonner";

/**
 * Default notification duration (milliseconds)
 */
export const DEFAULT_NOTIFICATION_DURATION = 4000;

/**
 * Maximum visible notifications
 */
export const MAX_VISIBLE_NOTIFICATIONS = 5;

/**
 * Default toaster position
 */
export const DEFAULT_TOASTER_POSITION: ToasterProps["position"] =
  "top-right";

/**
 * Enable rich colors
 */
export const ENABLE_RICH_COLORS = true;

/**
 * Show close button
 */
export const SHOW_CLOSE_BUTTON = true;

/**
 * Expand notifications
 */
export const EXPAND_NOTIFICATIONS = true;



/**
 * Default duration for each notification type
 */
export const NOTIFICATION_DURATIONS: Record<
  NotificationVariant,
  number
> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: Infinity,
};