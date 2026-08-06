"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

// ----------------------------------------
// Select Context & Primitives
// ----------------------------------------
interface SelectContextProps {
  value: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValueLabel: string;
  setSelectedValueLabel: (label: string) => void;
  placeholder?: string;
  options?: SelectOption[];
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

interface UISelectProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
}

export function UISelect({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  placeholder = "Select an option",
  options,
}: UISelectProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [selectedValueLabel, setSelectedValueLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : localValue;

  // Dynamically synchronize selected label when value or options change
  useEffect(() => {
    if (value && options && options.length > 0) {
      const match = options.find((opt) => opt.value === value);
      if (match) {
        setSelectedValueLabel(match.label);
        return;
      }
    }
    if (value) {
      setSelectedValueLabel(value);
    } else {
      setSelectedValueLabel("");
    }
  }, [value, options]);

  const handleValueChange = (val: string) => {
    if (controlledValue === undefined) {
      setLocalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        selectedValueLabel,
        setSelectedValueLabel,
        placeholder,
        options,
      }}
    >
      <div ref={containerRef} className={cn("relative w-full", open && "z-20")}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ----------------------------------------
// SelectTrigger
// ----------------------------------------
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: ReactNode;
}

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used inside UISelect");

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-3xs cursor-pointer",
        "outline-none transition-all duration-200",
        "focus:border-primary focus:ring-2 focus:ring-primary-light",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        className
      )}
      aria-expanded={context.open}
      {...props}
    >
      {children || <SelectValue />}
      <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />
    </button>
  );
}

// ----------------------------------------
// SelectValue
// ----------------------------------------
interface SelectValueProps {
  className?: string;
  placeholder?: string;
}

export function SelectValue({ className, placeholder }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used inside UISelect");

  const displayPlaceholder = placeholder || context.placeholder;

  return (
    <span
      className={cn(
        "truncate text-left block",
        context.value ? "text-slate-800" : "text-slate-400 font-semibold",
        className
      )}
    >
      {context.selectedValueLabel || displayPlaceholder}
    </span>
  );
}

// ----------------------------------------
// SelectContent
// ----------------------------------------
interface SelectContentProps {
  className?: string;
  children: ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used inside UISelect");

  if (!context.open) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xl scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

// ----------------------------------------
// SelectGroup
// ----------------------------------------
interface SelectGroupProps {
  className?: string;
  children: ReactNode;
}

export function SelectGroup({ className, children }: SelectGroupProps) {
  return <div className={cn("space-y-0.5", className)}>{children}</div>;
}

// ----------------------------------------
// SelectLabel
// ----------------------------------------
interface SelectLabelProps {
  className?: string;
  children: ReactNode;
}

export function SelectLabel({ className, children }: SelectLabelProps) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-black text-slate-400 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </div>
  );
}

// ----------------------------------------
// SelectItem
// ----------------------------------------
interface SelectItemProps {
  className?: string;
  value: string;
  children: ReactNode;
}

export function SelectItem({ className, value, children }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used inside UISelect");

  const isSelected = context.value === value;

  useEffect(() => {
    if (isSelected) {
      const labelText = typeof children === "string" ? children : String(children);
      context.setSelectedValueLabel(labelText);
    }
  }, [isSelected, children]);

  return (
    <button
      type="button"
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left",
        isSelected
          ? "bg-primary text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      <span>{children}</span>
      {isSelected && <Check size={14} className="shrink-0 ml-2" />}
    </button>
  );
}

// ----------------------------------------
// SelectSeparator
// ----------------------------------------
interface SelectSeparatorProps {
  className?: string;
}

export function SelectSeparator({ className }: SelectSeparatorProps) {
  return <div className={cn("my-1 h-px bg-slate-100", className)} />;
}

// ----------------------------------------
// Form Select Wrapper Component
// ----------------------------------------
interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Select an option",
      label,
      error,
      helperText,
      className,
      disabled,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("space-y-1.5 w-full", className)}>
        {label && (
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}

        <UISelect
          value={value}
          defaultValue={defaultValue}
          onValueChange={onChange}
          placeholder={placeholder}
          options={options}
        >
          <SelectTrigger
            disabled={disabled}
            className={cn(
              error && "border-red-300 focus:border-red-500 focus:ring-red-100"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </UISelect>

        {error ? (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
