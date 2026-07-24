import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NotificationTitleProps
  extends HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
  }

export default function NotificationTitle({
  className,
  children,
  ...props
}: NotificationTitleProps) {
  return (
    <h4
      className={cn(
        "text-sm font-semibold leading-none tracking-tight text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}