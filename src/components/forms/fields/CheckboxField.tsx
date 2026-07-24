"use client";

import {
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";

import FormError from "../FormError";

interface CheckboxFieldProps<T extends FieldValues> {
  control: any;
  name: Path<T>;
  label: string;
}

export default function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
}: CheckboxFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="h-4 w-4 rounded border-gray-300"
            />

            <span>{label}</span>
          </label>

          <FormError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}