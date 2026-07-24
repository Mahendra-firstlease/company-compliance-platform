"use client";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

import PasswordInput from "@/components/forms/PasswordInput";
import FormGroup from "@/components/forms/FormGroup";

interface PasswordFieldProps<T extends FieldValues> {
  control: any;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
}: PasswordFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormGroup
          label={label}
          description={description}
          required={required}
          error={fieldState.error?.message}
        >
          <PasswordInput
            {...field}
            placeholder={placeholder}
            disabled={disabled}
          />
        </FormGroup>
      )}
    />
  );
}
