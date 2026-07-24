import { ButtonHTMLAttributes } from "react";

import Button from "@/components/common/Button";

interface NotificationActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
  }

export default function NotificationAction({
  children,
  ...props
}: NotificationActionProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 px-3 text-xs"
      {...props}
    >
      {children}
    </Button>
  );
}