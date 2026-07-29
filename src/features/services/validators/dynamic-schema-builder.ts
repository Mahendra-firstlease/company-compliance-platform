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
      let numSchema = z.coerce.number();
      if (field.min !== undefined) {
        numSchema = numSchema.min(field.min, `${field.label} minimum value is ${field.min}`);
      }
      if (field.max !== undefined) {
        numSchema = numSchema.max(field.max, `${field.label} maximum value is ${field.max}`);
      }
      schema = field.required ? numSchema : numSchema.optional();
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
      let fbSchema = z.object({
        frontUrl: z.string().min(1, "Front image is required"),
        backUrl: z.string().min(1, "Back image is required"),
      });
      schema = field.required ? fbSchema : fbSchema.partial().optional();
      break;
    }
    case "file":
    case "multi-file": {
      let fileSchema = z.any();
      schema = field.required ? fileSchema.refine((val) => !!val, `${field.label} file is required`) : fileSchema.optional();
      break;
    }
    default: {
      const fAny = field as any;
      schema = fAny.required ? z.any().refine((val) => val !== undefined && val !== null, `${fAny.label || "Field"} is required`) : z.any().optional();
    }
  }

  return schema;
}
