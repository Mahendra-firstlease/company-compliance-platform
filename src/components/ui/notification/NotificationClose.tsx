import { ButtonHTMLAttributes } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface NotificationCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
  }

export default function NotificationClose({
  className,
  ...props
}: NotificationCloseProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md p-1 transition-colors",
        "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
        "",
        className
      )}
      {...props}
    >
      <X size={16} />
    </button>
  );
}