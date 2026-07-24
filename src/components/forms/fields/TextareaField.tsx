"use client";

import {
  Controller,
  Control,
  FieldValues,
  Path,
} from "react-hook-form";

import Textarea from "../Textarea";
import FormGroup from "../FormGroup";

interface TextareaFieldProps<T extends FieldValues> {
  control: any;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number
}


export default function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  rows
}: TextareaFieldProps<T>) {
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
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
          />
        </FormGroup>
      )}
    />
  );
}