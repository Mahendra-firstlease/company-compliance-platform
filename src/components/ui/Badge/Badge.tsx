import React, { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium",
  {
    variants: {
      variant: {
        gray: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
        red: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
        yellow: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
        green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
        indigo: "bg-primary-light text-primary ring-1 ring-inset ring-primary/20",
        purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
        pink: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      rounded: {
        md: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "gray",
      size: "md",
      rounded: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
  icon?: ReactNode | React.ElementType;
}

export default function Badge({
  children,
  variant,
  size,
  rounded,
  icon,
  className,
  ...props
}: BadgeProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="shrink-0" />;
    }
    return icon;
  };

  return (
    <span
      className={cn(badgeVariants({ variant, size, rounded }), className)}
      {...props}
    >
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
}

export { badgeVariants };
