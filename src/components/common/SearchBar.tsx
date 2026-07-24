"use client";

import React, { useRef, ReactNode } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const searchBarVariants = cva(
  "relative flex items-center transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light text-slate-800 shadow-3xs",
        bordered:
          "bg-white border-2 border-slate-300 focus-within:border-primary text-slate-900",
        filled:
          "bg-slate-100/80 border border-transparent focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light text-slate-800",
        glass:
          "bg-white/70 backdrop-blur-md border border-white/60 focus-within:bg-white focus-within:border-primary text-slate-800 shadow-xs",
        subtle:
          "bg-transparent border border-transparent hover:bg-slate-100/50 focus-within:bg-slate-100/80 focus-within:border-slate-200 text-slate-800",
      },
      size: {
        sm: "h-8 text-xs rounded-md",
        md: "h-10 text-sm rounded-lg",
        lg: "h-12 text-base rounded-xl",
        xl: "h-14 text-base rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
        false: "w-full max-w-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

const iconSizeMap = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

const paddingLeftMap = {
  sm: "pl-8",
  md: "pl-9.5",
  lg: "pl-11",
  xl: "pl-12",
};

const paddingRightMap = {
  sm: "pr-8",
  md: "pr-9",
  lg: "pr-10",
  xl: "pr-11",
};

export interface SearchBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof searchBarVariants> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  shortcut?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputClassName?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for services, filings...",
  onSearch,
  onClear,
  loading = false,
  shortcut,
  disabled = false,
  variant,
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  inputClassName,
  ...props
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentSize = size || "md";
  const iconSize = iconSizeMap[currentSize];

  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div
      className={cn(
        searchBarVariants({ variant, size, fullWidth }),
        disabled && "opacity-60 cursor-not-allowed bg-slate-50",
        className
      )}
      {...props}
    >
      {/* Left Icon (Magnifying glass or custom left icon) */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
        {leftIcon ? (
          leftIcon
        ) : (
          <Search size={iconSize} className="shrink-0" />
        )}
      </div>

      {/* Main Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full h-full bg-transparent outline-none border-none placeholder-slate-400 font-normal",
          paddingLeftMap[currentSize],
          value || rightIcon || loading || shortcut ? paddingRightMap[currentSize] : "pr-3",
          inputClassName
        )}
      />

      {/* Right Controls Container (Loading Spinner, Clear Button, Shortcut Badge, or Custom Right Icon) */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin text-primary shrink-0" />
        ) : value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
            aria-label="Clear search input"
          >
            <X size={iconSize} />
          </button>
        ) : shortcut ? (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            {shortcut}
          </kbd>
        ) : rightIcon ? (
          <div className="text-slate-400">{rightIcon}</div>
        ) : null}
      </div>
    </div>
  );
}

export { searchBarVariants };
