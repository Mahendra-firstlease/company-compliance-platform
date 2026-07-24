import React, { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium",
  {
    variants: {
      variant: {
        gray: "bg-gray-450/10 text-gray-500 ring-1 ring-inset ring-gray-450/20",
        red: "bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/20",
        yellow: "bg-yellow-400/10 text-yellow-500 ring-1 ring-inset ring-yellow-400/20",
        green: "bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-500/20",
        blue: "bg-blue-400/10 text-blue-400 ring-1 ring-inset ring-blue-400/30",
        indigo: "bg-primary-light text-primary ring-1 ring-inset ring-primary/20",
        purple: "bg-purple-400/10 text-purple-400 ring-1 ring-inset ring-purple-400/30",
        pink: "bg-pink-400/10 text-pink-400 ring-1 ring-inset ring-pink-400/20",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
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