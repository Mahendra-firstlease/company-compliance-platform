import { z } from "zod";
import {
  ServiceFormConfig,
  FormFieldConfig,
  SingleFileUploadConfig,
} from "@/types/form-config.types";
import { getAllFormFields, isFieldVisible } from "../utils/field-visibility";
import { resolveFieldValidation, ResolvedFieldValidation } from "./resolve-field-validation";
import { VALIDATION_PRESETS } from "./validation-presets";

/**
 * Dynamically builds a Zod Object Validation Schema from any ServiceFormConfig
 */
export function buildDynamicZodSchema(config: ServiceFormConfig): z.ZodObject<any> {
  const fields = getAllFormFields(config.sections);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    shape[field.id] = field.dependsOn
      ? buildFieldValidator({ ...field, required: false })
      : buildFieldValidator(field);
  }

  return z.object(shape).superRefine((data, ctx) => {
    for (const field of fields) {
      if (!field.dependsOn || !field.required) continue;
      if (!isFieldVisible(field, data)) continue;

      const result = buildFieldValidator(field).safeParse(data[field.id]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: [field.id, ...issue.path],
          });
        }
      }
    }
  });
}

function requiredMessage(rules: ResolvedFieldValidation, label: string): string {
  return rules.requiredMessage || `${label} is required`;
}

function applyStringRules(
  schema: z.ZodString,
  rules: ResolvedFieldValidation,
  label: string,
): z.ZodString {
  let s = schema;

  if (rules.preset && VALIDATION_PRESETS[rules.preset]) {
    const preset = VALIDATION_PRESETS[rules.preset];
    s = s.regex(preset.pattern, rules.patternMessage || preset.message);
  } else if (rules.pattern) {
    s = s.regex(
      new RegExp(rules.pattern),
      rules.patternMessage || `Invalid ${label} format`,
    );
  }

  if (rules.minLength !== undefined) {
    s = s.min(rules.minLength, `${label} must be at least ${rules.minLength} characters`);
  }
  if (rules.maxLength !== undefined) {
    s = s.max(rules.maxLength, `${label} must be at most ${rules.maxLength} characters`);
  }

  return s;
}

function applyAllowedValues(
  schema: z.ZodTypeAny,
  rules: ResolvedFieldValidation,
  label: string,
): z.ZodTypeAny {
  if (!rules.allowedValues?.length) return schema;
  return schema.refine(
    (val) => val === undefined || val === "" || rules.allowedValues!.includes(String(val)),
    `Please select a valid option for ${label}`,
  );
}

function buildNumberValidator(
  field: FormFieldConfig,
  rules: ResolvedFieldValidation,
): z.ZodTypeAny {
  const reqMsg = requiredMessage(rules, field.label);
  const typeMsg = `${field.label} must be a valid number`;

  return z.any().superRefine((val, ctx) => {
    if (val === undefined || val === null || val === "") {
      if (rules.required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: reqMsg,
        });
      }
      return;
    }

    const num = Number(val);
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: typeMsg,
      });
      return;
    }

    if (rules.min !== undefined && num < rules.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} minimum value is ${rules.min}`,
      });
    }

    if (rules.max !== undefined && num > rules.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} maximum value is ${rules.max}`,
      });
    }
  });
}

function buildFieldValidator(field: FormFieldConfig): z.ZodTypeAny {
  const rules = resolveFieldValidation(field);
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
    case "textarea":
    case "phone": {
      const reqMsg = requiredMessage(rules, field.label);
      if (rules.required) {
        let strSchema = z.string({ error: reqMsg }).min(1, reqMsg);
        schema = applyStringRules(strSchema, rules, field.label);
      } else {
        let strSchema = z.string();
        strSchema = applyStringRules(strSchema, rules, field.label);
        schema = strSchema.optional().or(z.literal(""));
      }
      break;
    }
    case "email": {
      const reqMsg = requiredMessage(rules, field.label);
      if (rules.required) {
        let emailSchema = z
          .string({ error: reqMsg })
          .min(1, reqMsg)
          .email(`Invalid email format for ${field.label}`);
        schema = applyStringRules(emailSchema, rules, field.label);
      } else {
        let emailSchema = z.string().email(`Invalid email format for ${field.label}`);
        emailSchema = applyStringRules(emailSchema, rules, field.label);
        schema = emailSchema.optional().or(z.literal(""));
      }
      break;
    }
    case "number": {
      schema = buildNumberValidator(field, rules);
      break;
    }
    case "select":
    case "radio": {
      const reqMsg = rules.requiredMessage || `Please select ${field.label}`;
      if (rules.required) {
        let strSchema = z.string({ error: reqMsg }).min(1, reqMsg);
        schema = applyAllowedValues(strSchema, rules, field.label);
      } else {
        let strSchema = z.string().optional().or(z.literal(""));
        schema = applyAllowedValues(strSchema, rules, field.label);
      }
      break;
    }
    case "checkbox":
    case "switch": {
      const reqMsg = requiredMessage(rules, field.label);
      if (rules.required) {
        schema = z.any().refine((val) => val === true, reqMsg);
      } else {
        schema = z.boolean().optional();
      }
      break;
    }
    case "date": {
      const reqMsg = requiredMessage(rules, field.label);
      if (rules.required) {
        let dateStr = z.string({ error: reqMsg }).min(1, reqMsg);
        schema = dateStr.refine(
          (val: unknown) => {
            if (!val || val === "") return false;
            const s = String(val);
            if (rules.minDate && s < rules.minDate) return false;
            if (rules.maxDate && s > rules.maxDate) return false;
            return true;
          },
          {
            message: rules.minDate
              ? `${field.label} must be on or after ${rules.minDate}`
              : rules.maxDate
                ? `${field.label} must be on or before ${rules.maxDate}`
                : reqMsg,
          },
        );
      } else {
        let dateStr = z.string().optional().or(z.literal(""));
        schema = dateStr.refine(
          (val: unknown) => {
            if (!val || val === "") return true;
            const s = String(val);
            if (rules.minDate && s < rules.minDate) return false;
            if (rules.maxDate && s > rules.maxDate) return false;
            return true;
          },
          {
            message: rules.minDate
              ? `${field.label} must be on or after ${rules.minDate}`
              : rules.maxDate
                ? `${field.label} must be on or before ${rules.maxDate}`
                : reqMsg,
          },
        );
      }
      break;
    }
    case "front-back-file": {
      schema = buildFrontBackValidator(field, rules);
      break;
    }
    case "file":
    case "multi-file": {
      schema = buildFileValidator(field as SingleFileUploadConfig, rules);
      break;
    }
    default: {
      const fallback = field as FormFieldConfig & { label: string };
      schema = rules.required
        ? z.any().refine(
            (val) => val !== undefined && val !== null && val !== "",
            requiredMessage(rules, fallback.label),
          )
        : z.any().optional();
    }
  }

  return schema;
}

function buildFrontBackValidator(
  field: FormFieldConfig,
  rules: ResolvedFieldValidation,
): z.ZodTypeAny {
  const reqMsg = rules.requiredMessage || `${field.label} is required`;

  return z.any().superRefine((val, ctx) => {
    const isObj = val && typeof val === "object";
    const obj = isObj ? (val as Record<string, any>) : {};
    const hasFront = Boolean(obj.frontUrl || obj.front?.url);
    const hasBack = Boolean(obj.backUrl || obj.back?.url);

    if (!rules.required) {
      if (!hasFront && !hasBack) return;
      if (hasFront && !hasBack) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label}: back document is required`,
          path: ["backUrl"],
        });
      }
      if (hasBack && !hasFront) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label}: front document is required`,
          path: ["frontUrl"],
        });
      }
      return;
    }

    if (!hasFront && !hasBack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: reqMsg,
      });
      return;
    }

    if (!hasFront) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label}: front document is required`,
        path: ["frontUrl"],
      });
    }
    if (!hasBack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label}: back document is required`,
        path: ["backUrl"],
      });
    }
  });
}

function buildFileValidator(
  field: SingleFileUploadConfig,
  rules: ResolvedFieldValidation,
): z.ZodTypeAny {
  const allowedExtensions = field.uploadRule?.allowedExtensions ?? [];

  const hasUploadedFile = (val: unknown) =>
    Boolean(
      val &&
        typeof val === "object" &&
        typeof (val as { url?: string }).url === "string" &&
        (val as { url: string }).url.length > 0,
    );

  const matchesExtension = (val: unknown) => {
    if (!hasUploadedFile(val) || !allowedExtensions.length) return true;
    const name = String((val as { name?: string }).name || "").toLowerCase();
    return allowedExtensions.some((ext) => name.endsWith(`.${ext.toLowerCase()}`));
  };

  if (!rules.required) {
    return z
      .any()
      .optional()
      .refine(
        (val) => val === undefined || val === null || matchesExtension(val),
        `${field.label}: allowed types are ${allowedExtensions.join(", ")}`,
      );
  }

  return z
    .any()
    .refine(hasUploadedFile, rules.requiredMessage || `${field.label} file is required`)
    .refine(
      matchesExtension,
      `${field.label}: allowed types are ${allowedExtensions.join(", ")}`,
    );
}
