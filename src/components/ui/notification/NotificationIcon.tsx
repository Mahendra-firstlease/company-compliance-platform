import { ReactNode } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NotificationVariant } from "@/types/notification";

interface NotificationIconProps {
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

export default function NotificationIcon({
  variant,
  icon,
  className,
}: NotificationIconProps) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center",
          variantStyles[variant].color
        )}
      >
        {icon ?? variantStyles[variant].icon}
      </span>
    </div>
  );
}