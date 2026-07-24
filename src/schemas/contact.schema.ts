import { z } from "zod";

export const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required"),

  email: z
    .email("Please enter a valid email"),

  phone: z
    .string()
    .min(10, "Please enter a valid phone number"),

  companyName: z
    .string()
    .optional(),

  service: z
    .string()
    .min(1, "Please select a service"),

  subject: z
    .string()
    .min(3, "Subject is required"),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<
  typeof contactSchema
>;