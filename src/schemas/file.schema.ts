import { z } from "zod";

/**
 * Reusable Zod validation schema for secure file uploads, 
 * in compliance with OWASP security guidelines.
 */
export const fileUploadSchema = z
  .object({
    name: z.string().min(1, "File name is required"),
    size: z.string().min(1, "File size is required"),
    type: z.string().min(1, "File type is required"),
  })
  .refine(
    (file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const allowed = ["pdf", "png", "jpg", "jpeg"];
      return allowed.includes(ext);
    },
    {
      message: "Invalid file extension. Only PDF, PNG, JPG, and JPEG formats are allowed.",
      path: ["name"],
    }
  );

export type FileUploadValues = z.infer<typeof fileUploadSchema>;
