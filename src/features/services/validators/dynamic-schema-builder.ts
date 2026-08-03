import { z } from "zod";
import { ServiceFormConfig, FormFieldConfig } from "@/types/form-config.types";

/**
 * Dynamically builds a Zod Object Validation Schema from any ServiceFormConfig
 */
export function buildDynamicZodSchema(config: ServiceFormConfig): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const section of config.sections) {
    for (const field of section.fields) {
      shape[field.id] = buildFieldValidator(field);
    }
  }

  return z.object(shape);
}

function buildFieldValidator(field: FormFieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
    case "textarea":
    case "phone": {
      let strSchema = z.string();
      if (field.minLength) {
        strSchema = strSchema.min(field.minLength, `${field.label} must be at least ${field.minLength} characters`);
      }
      if (field.maxLength) {
        strSchema = strSchema.max(field.maxLength, `${field.label} must be at most ${field.maxLength} characters`);
      }
      if (field.pattern) {
        strSchema = strSchema.regex(new RegExp(field.pattern), `Invalid ${field.label} format`);
      }

      if (!field.required) {
        schema = strSchema.optional().or(z.literal(""));
      } else {
        schema = strSchema.min(1, `${field.label} is required`);
      }
      break;
    }
    case "email": {
      let emailSchema = z.string().email(`Invalid email format for ${field.label}`);
      schema = field.required ? emailSchema.min(1, `${field.label} is required`) : emailSchema.optional().or(z.literal(""));
      break;
    }
    case "number": {
      let numSchema = z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : val),
        z.coerce.number({ error: `${field.label} must be a valid number` })
      );
      if (field.min !== undefined) {
        numSchema = numSchema.refine(
          (val) => val === undefined || val >= field.min!,
          `${field.label} minimum value is ${field.min}`
        );
      }
      if (field.max !== undefined) {
        numSchema = numSchema.refine(
          (val) => val === undefined || val <= field.max!,
          `${field.label} maximum value is ${field.max}`
        );
      }
      schema = field.required
        ? numSchema.refine((val) => val !== undefined, `${field.label} is required`)
        : numSchema.optional();
      break;
    }
    case "select":
    case "radio": {
      let strSchema = z.string();
      schema = field.required ? strSchema.min(1, `Please select ${field.label}`) : strSchema.optional().or(z.literal(""));
      break;
    }
    case "checkbox":
    case "switch": {
      let boolSchema = z.boolean();
      schema = field.required ? boolSchema.refine((val) => val === true, `${field.label} must be accepted`) : boolSchema.optional();
      break;
    }
    case "date": {
      let dateStr = z.string();
      schema = field.required ? dateStr.min(1, `Please select ${field.label}`) : dateStr.optional().or(z.literal(""));
      break;
    }
    case "front-back-file": {
      const uploadedSideSchema = z
        .object({
          url: z.string().min(1),
        })
        .passthrough();

      const fbSchema = z
        .object({
          frontUrl: z.string().optional(),
          backUrl: z.string().optional(),
          front: uploadedSideSchema.optional().nullable(),
          back: uploadedSideSchema.optional().nullable(),
        })
        .superRefine((val, ctx) => {
          const hasFront = Boolean(val.frontUrl || val.front?.url);
          const hasBack = Boolean(val.backUrl || val.back?.url);

          if (!hasFront) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Front image is required",
              path: ["frontUrl"],
            });
          }
          if (!hasBack) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Back image is required",
              path: ["backUrl"],
            });
          }
        });

      schema = field.required
        ? fbSchema
        : z
            .object({
              frontUrl: z.string().optional(),
              backUrl: z.string().optional(),
              front: uploadedSideSchema.optional().nullable(),
              back: uploadedSideSchema.optional().nullable(),
            })
            .optional();
      break;
    }
    case "file":
    case "multi-file": {
      const hasUploadedFile = (val: unknown) =>
        Boolean(
          val &&
            typeof val === "object" &&
            typeof (val as { url?: string }).url === "string" &&
            (val as { url: string }).url.length > 0
        );

      schema = field.required
        ? z.any().refine(hasUploadedFile, `${field.label} file is required`)
        : z.any().optional();
      break;
    }
    default: {
      const fAny = field as any;
      schema = fAny.required ? z.any().refine((val) => val !== undefined && val !== null, `${fAny.label || "Field"} is required`) : z.any().optional();
    }
  }

  return schema;
}
