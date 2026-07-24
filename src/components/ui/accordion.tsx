"use client";

import * as React from "react";
import { createContext, useContext, useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextProps {
  activeValues: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: any) => void;
  children: ReactNode;
}

export function Accordion({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}: AccordionProps) {
  const [localValues, setLocalValues] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const activeValues = controlledValue !== undefined
    ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue])
    : localValues;

  const toggleItem = (itemValue: string) => {
    let nextValues: string[];
    if (type === "single") {
      nextValues = activeValues.includes(itemValue) ? [] : [itemValue];
    } else {
      nextValues = activeValues.includes(itemValue)
        ? activeValues.filter((v) => v !== itemValue)
        : [...activeValues, itemValue];
    }

    if (controlledValue === undefined) {
      setLocalValues(nextValues);
    }
    if (onValueChange) {
      onValueChange(type === "single" ? (nextValues[0] || null) : nextValues);
    }
  };

  return (
    <AccordionContext.Provider value={{ activeValues, toggleItem }}>
      <div className={cn("divide-y divide-slate-100", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextProps {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextProps | undefined>(undefined);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function AccordionItem({
  value,
  children,
  className,
  ...props
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = context.activeValues.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        className={cn(
          "py-3 transition-colors duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AccordionTrigger({
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used inside AccordionItem");
  }

  const { isOpen, value } = itemContext;

  return (
    <button
      type="button"
      onClick={() => accordionContext.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between text-left py-2 font-semibold text-sm text-slate-700 hover:text-primary transition-colors focus:outline-none cursor-pointer",
        className
      )}
      aria-expanded={isOpen}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2",
          isOpen && "rotate-180 text-primary"
        )}
      />
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps) {
  const itemContext = useContext(AccordionItemContext);
  if (!itemContext) {
    throw new Error("AccordionContent must be used inside AccordionItem");
  }

  const { isOpen } = itemContext;

  return (
    <div
      className={cn(
        "grid transition-all duration-350 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none mt-0"
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "text-xs text-slate-400 leading-relaxed pl-1 pb-2",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
