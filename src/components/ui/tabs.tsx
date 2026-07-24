"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface TabsContextProps {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  className,
}: TabsProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : localValue;

  const handleValueChange = (val: string) => {
    if (controlledValue === undefined) {
      setLocalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("space-y-4 w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ----------------------------------------
// TabsList
// ----------------------------------------
interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 border border-slate-200/40",
        className
      )}
    >
      {children}
    </div>
  );
}

// ----------------------------------------
// TabsTrigger
// ----------------------------------------
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-slate-800 shadow-sm border border-slate-200/50 scale-[1.01]"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ----------------------------------------
// TabsContent
// ----------------------------------------
interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  if (context.value !== value) return null;

  return (
    <div
      className={cn(
        "w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 animate-in fade-in duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
