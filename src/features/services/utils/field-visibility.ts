import { FormFieldConfig } from "@/types/form-config.types";

/** Whether a config field should render given current form values. */
export function isFieldVisible(
  field: FormFieldConfig,
  values: Record<string, unknown> = {},
): boolean {
  if (!field.dependsOn) return true;

  const parentValue = values[field.dependsOn.field];
  if (field.dependsOn.oneOf?.length) {
    return field.dependsOn.oneOf.includes(parentValue);
  }
  if ("equals" in field.dependsOn) {
    return parentValue === field.dependsOn.equals;
  }
  return true;
}

export function getAllFormFields(
  sections: { fields: FormFieldConfig[] }[],
): FormFieldConfig[] {
  return sections.flatMap((section) => section.fields);
}

