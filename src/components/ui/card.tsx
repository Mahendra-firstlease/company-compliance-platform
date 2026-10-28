"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  size?: "default" | "sm";
  enableHover?: boolean;
}

function Card({
  className,
  size = "default",
  enableHover = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) relative rounded-lg bg-white text-slate-900 border border-slate-200/60 shadow-2xs py-(--card-spacing) text-sm [--card-spacing:1.5rem] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:1rem] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg transition-all duration-200",
        enableHover && "hover:-translate-y-1 hover:shadow-md hover:shadow-slate-100 hover:border-slate-300",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<"h2"> {
  as?: "h2" | "h3" | "h4" | "div";
}

function CardTitle({
  className,
  as: Component = "h2",
  ...props
}: CardTitleProps) {
  return (
    <Component
      data-slot="card-title"
      className={cn(
        "font-bold text-slate-900 text-lg md:text-xl leading-snug tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-slate-600 font-medium leading-normal", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end flex items-center shrink-0 ml-auto",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing) text-sm text-slate-650 flex-1", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-slate-100 bg-slate-50/50 p-(--card-spacing) text-xs -mb-(--card-spacing) mt-2",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
