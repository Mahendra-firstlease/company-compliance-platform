export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "switch"
  | "date"
  | "file"
  | "multi-file"
  | "front-back-file";

export interface SelectOption {
  label: string;
  value: string;
}

export type DynamicOptionsSource =
  | { type: "static"; options: SelectOption[] }
  | { type: "api"; endpoint: string; labelKey: string; valueKey: string }
  | { type: "dependent"; parentField: string; mapping: Record<string, SelectOption[]> };

export type ValidationPreset =
  | "pan"
  | "gstin"
  | "cin"
  | "llpin"
  | "aadhaar"
  | "mobile-in"
  | "pincode-in"
  | "ifsc";

/** Per-field validation — works on every field type. Legacy props (pattern, minLength) still supported. */
export interface FieldValidationConfig {
  /** Built-in Indian compliance presets (PAN, GSTIN, mobile, etc.) */
  preset?: ValidationPreset;
  /** Custom regex (used when preset is not set, or overrides preset pattern) */
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  /** Restrict select/radio to these values (auto-filled from static options if omitted) */
  allowedValues?: string[];
  requiredMessage?: string;
}

export interface BaseFieldConfig {
  id: string; // JSON path key in Application payload
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultValue?: any;
  /** Validation rules for this field — use presets or custom pattern/min/max */
  validation?: FieldValidationConfig;
  dependsOn?: {
    field: string;
    equals?: unknown;
    oneOf?: unknown[];
  };
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: "text" | "email" | "phone" | "textarea";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  min?: number;
  max?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select" | "radio";
  optionsSource: DynamicOptionsSource;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox" | "switch";
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
  minDate?: string;
  maxDate?: string;
}

export interface UploadRuleConfig {
  allowedExtensions: string[]; // e.g. ["jpg", "png", "pdf"]
  allowedMimeTypes: string[];  // e.g. ["image/jpeg", "image/png", "application/pdf"]
  minSizeBytes?: number;
  maxSizeBytes: number;       // e.g. 5 * 1024 * 1024 (5MB)
  maxImageWidth?: number;
  maxImageHeight?: number;
}

export interface SingleFileUploadConfig extends BaseFieldConfig {
  type: "file" | "multi-file";
  uploadRule: UploadRuleConfig;
}

export interface FrontBackFileUploadConfig extends BaseFieldConfig {
  type: "front-back-file";
  frontRule: UploadRuleConfig;
  backRule: UploadRuleConfig;
}

export type FormFieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | DateFieldConfig
  | SingleFileUploadConfig
  | FrontBackFileUploadConfig;

export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface ServiceFormConfig {
  serviceSlug: string;
  title: string;
  category: string;
  sections: FormSectionConfig[];
}
