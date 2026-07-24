import { z } from "zod";

export const businessProfileSchema = z.object({
  businessName: z.string().min(2, "Business / Company Name is required"),
  businessType: z.string().min(1, "Please select entity structure"),
  industry: z.string().min(1, "Please select industry sector"),
  state: z.string().min(1, "Please select your state"),
  employeeCount: z.string().min(1, "Please select employee count"),
  annualTurnover: z.string().min(1, "Please select annual turnover"),
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;
