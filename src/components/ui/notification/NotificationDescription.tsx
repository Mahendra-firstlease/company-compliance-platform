import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NotificationDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
    className?: string;
    children: React.ReactNode
  }

export default function NotificationDescription({
  className,
  children,
  ...props
}: NotificationDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}