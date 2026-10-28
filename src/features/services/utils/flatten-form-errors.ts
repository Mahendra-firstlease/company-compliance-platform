import { FieldErrors } from "react-hook-form";

export function formatFieldIdToLabel(fieldId: string): string {
  const leaf = fieldId.split(".").pop() || fieldId;
  return leaf
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function cleanErrorMessage(fieldIdOrLabel: string, rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return `${formatFieldIdToLabel(fieldIdOrLabel)} is required`;
  }

  if (
    rawMessage.includes("expected string, received undefined") ||
    rawMessage.includes("expected string, received null") ||
    rawMessage.includes("expected object, received undefined") ||
    rawMessage.includes("expected number, received undefined") ||
    rawMessage.includes("expected boolean, received undefined") ||
    rawMessage.includes("Invalid input: expected")
  ) {
    return `${formatFieldIdToLabel(fieldIdOrLabel)} is required`;
  }

  return rawMessage;
}

export function flattenFormErrors(
  errors: FieldErrors,
  prefix = "",
): { fieldId: string; message: string }[] {
  const items: { fieldId: string; message: string }[] = [];

  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const fieldId = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && "message" in value && value.message) {
      items.push({
        fieldId,
        message: cleanErrorMessage(fieldId, String(value.message)),
      });
      continue;
    }

    if (typeof value === "object") {
      items.push(...flattenFormErrors(value as FieldErrors, fieldId));
    }
  }

  return items;
}
