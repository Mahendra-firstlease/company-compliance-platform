"use client";

import {
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";

import Select, { SelectOption } from "../Select";
import FormGroup from "../FormGroup";

interface SelectFieldProps<T extends FieldValues> {
  control: any;
  name: Path<T>;

  label?: string;
  description?: string;
  placeholder?: string;

  required?: boolean;
  disabled?: boolean;

  options: SelectOption[];
}

export default function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  options,
}: SelectFieldProps<T>) {
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
          <Select
            {...field}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
          />
        </FormGroup>
      )}
    />
  );
}