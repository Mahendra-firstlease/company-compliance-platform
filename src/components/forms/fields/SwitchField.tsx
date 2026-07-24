"use client";

import {
  Controller,
  Control,
  FieldValues,
  Path,
} from "react-hook-form";

interface SwitchFieldProps<T extends FieldValues> {
  control: any;
  name: Path<T>;
  label: string;
}

export default function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
}: SwitchFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center justify-between">
          <span>{label}</span>

          <input
            type="checkbox"
            checked={field.value}
            onChange={field.onChange}
          />
        </label>
      )}
    />
  );
}