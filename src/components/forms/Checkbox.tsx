"use client";

import React from "react";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export default function Checkbox({
  label,
  checked = false,
  onChange,
  error,
  disabled = false,
}: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <span>{label}</span>
      </label>
      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
    </div>
  );
}
