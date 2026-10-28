import {
  FormFieldConfig,
  FieldValidationConfig,
  SelectFieldConfig,
} from "@/types/form-config.types";
import { ValidationPreset } from "./validation-presets";

export interface ResolvedFieldValidation {
  required: boolean;
  requiredMessage?: string;
  preset?: ValidationPreset;
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  allowedValues?: string[];
}

function getSelectAllowedValues(field: FormFieldConfig): string[] | undefined {
  if (field.type !== "select" && field.type !== "radio") return undefined;
  const source = (field as SelectFieldConfig).optionsSource;
  if (source.type === "static") {
    return source.options.map((opt) => opt.value);
  }
  return undefined;
}

/** Merge `validation` block with legacy per-type props (pattern, minLength, etc.). */
export function resolveFieldValidation(field: FormFieldConfig): ResolvedFieldValidation {
  const v: FieldValidationConfig = field.validation ?? {};

  const textLike =
    field.type === "text" ||
    field.type === "email" ||
    field.type === "phone" ||
    field.type === "textarea"
      ? field
      : null;

  const numberField = field.type === "number" ? field : null;
  const dateField = field.type === "date" ? field : null;

  return {
    required: Boolean(field.required),
    requiredMessage: v.requiredMessage,
    preset: v.preset,
    pattern: v.pattern ?? textLike?.pattern,
    patternMessage: v.patternMessage,
    minLength: v.minLength ?? textLike?.minLength,
    maxLength: v.maxLength ?? textLike?.maxLength,
    min: v.min ?? numberField?.min,
    max: v.max ?? numberField?.max,
    minDate: v.minDate ?? dateField?.minDate,
    maxDate: v.maxDate ?? dateField?.maxDate,
    allowedValues: v.allowedValues ?? getSelectAllowedValues(field),
  };
}

/** HTML input attributes for browser-level hints (pairs with Zod validation). */
export function getInputValidationProps(
  field: FormFieldConfig,
): Record<string, string | number | undefined> {
  const rules = resolveFieldValidation(field);

  if (
    field.type === "text" ||
    field.type === "email" ||
    field.type === "phone" ||
    field.type === "textarea"
  ) {
    return {
      minLength: rules.minLength,
      maxLength: rules.maxLength,
      pattern: rules.pattern,
    };
  }

  if (field.type === "number") {
    return { min: rules.min, max: rules.max };
  }

  if (field.type === "date") {
    return { min: rules.minDate, max: rules.maxDate };
  }

  return {};
}

