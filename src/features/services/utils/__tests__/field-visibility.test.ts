import { describe, expect, it } from "vitest";
import { isFieldVisible } from "../field-visibility";
import { FormFieldConfig } from "@/types/form-config.types";

describe("isFieldVisible", () => {
  const conditionalField: FormFieldConfig = {
    id: "cinOrLlpin",
    type: "text",
    label: "CIN / LLPIN",
    dependsOn: { field: "constitutionType", oneOf: ["PVT_LTD", "LLP"] },
  };

  it("shows field when parent matches oneOf", () => {
    expect(isFieldVisible(conditionalField, { constitutionType: "PVT_LTD" })).toBe(true);
  });

  it("hides field when parent does not match", () => {
    expect(isFieldVisible(conditionalField, { constitutionType: "PROPRIETORSHIP" })).toBe(false);
  });

  it("supports equals dependency", () => {
    const field: FormFieldConfig = {
      id: "partnerDeed",
      type: "file",
      label: "Partnership Deed",
      dependsOn: { field: "constitutionType", equals: "PARTNERSHIP" },
      uploadRule: {
        allowedExtensions: ["pdf"],
        allowedMimeTypes: ["application/pdf"],
        maxSizeBytes: 5 * 1024 * 1024,
      },
    };

    expect(isFieldVisible(field, { constitutionType: "PARTNERSHIP" })).toBe(true);
    expect(isFieldVisible(field, { constitutionType: "LLP" })).toBe(false);
  });
});

