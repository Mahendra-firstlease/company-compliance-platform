export type NotificationVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationOptions {
  /**
   * Main notification title
   */
  title?: string;

  /**
   * Additional description
   */
  description?: string;

  /**
   * Auto close duration (ms)
   * Default: 4000
   */
  duration?: number;

  /**
   * Custom icon
   */
  icon?: React.ReactNode;

  /**
   * Action button
   */
  action?: NotificationAction;

  /**
   * Allow user to close manually
   */
  closeButton?: boolean;
}

export interface PromiseNotification {
  title?: string;
  description?: string;
}

export interface PromiseOptions<T = unknown> {
  loading: string | PromiseNotification;

  success:
    | string
    | PromiseNotification
    | ((data: T) => string | PromiseNotification);

  error:
    | string
    | PromiseNotification
    | ((error: Error) => string | PromiseNotification);
}