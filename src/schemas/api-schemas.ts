import { z } from "zod";

/**
 * Strict Input Validation Schemas for Platform APIs
 */

export const createOrderSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than zero.")
    .max(100000000, "Amount exceeds maximum transaction threshold."), // 10 Lakhs max in paise
  currency: z.string().default("INR"),
  notes: z.record(z.string(), z.any()).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string()
    .min(1, "razorpay_order_id is required.")
    .startsWith("order_", "Invalid Razorpay Order ID format."),
  razorpay_payment_id: z
    .string()
    .min(1, "razorpay_payment_id is required.")
    .startsWith("pay_", "Invalid Razorpay Payment ID format."),
  razorpay_signature: z
    .string()
    .min(1, "razorpay_signature is required.")
    .length(64, "Invalid Razorpay signature length."),
  applicationIds: z
    .array(z.string().min(1))
    .min(1, "At least one application ID is required."),
  amount: z.number().nonnegative().optional(),
  userId: z.string().nullable().optional(),
});

export const createApplicationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  userEmail: z.string().email("Invalid email format.").optional(),
  serviceSlug: z
    .string()
    .min(2, "Service slug too short.")
    .max(100, "Service slug too long."),
  serviceTitle: z.string().min(2).max(150),
  status: z
    .enum([
      "PAYMENT_PENDING",
      "PAYMENT_CONFIRMED",
      "DOCUMENTS_PENDING",
      "UNDER_REVIEW",
      "SUBMITTED",
      "APPROVED",
      "REJECTED",
    ])
    .optional(),
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters.")
    .max(100, "Customer name exceeds max length."),
  customerPhone: z
    .string()
    .min(8, "Phone number must be at least 8 digits.")
    .max(20, "Phone number exceeds max length."),
  address: z.string().max(500, "Address exceeds 500 characters.").optional(),
  governmentFee: z.number().nonnegative().optional(),
  professionalFee: z.number().nonnegative().optional(),
  totalFee: z.number().positive("Total fee must be a positive number."),
  uploadedDocs: z.record(z.string(), z.any()).optional(),
});

export const updateApplicationSchema = z.object({
  status: z
    .enum([
      "PAYMENT_PENDING",
      "PAYMENT_CONFIRMED",
      "DOCUMENTS_PENDING",
      "UNDER_REVIEW",
      "SUBMITTED",
      "APPROVED",
      "REJECTED",
    ])
    .optional(),
  customerName: z.string().min(2).max(100).optional(),
  customerPhone: z.string().min(8).max(20).optional(),
  address: z.string().max(500).optional(),
  formData: z.record(z.string(), z.any()).optional(),
  query: z.string().max(1000, "Query message exceeds 1000 characters.").optional(),
  queryResponse: z.string().max(2000).optional(),
  queryStatus: z.enum(["QUERY_RAISED", "CLIENT_RESPONDED", "RESOLVED"]).optional(),
  clientResponseFiles: z.array(z.any()).optional(),
  queryHistory: z.array(z.any()).optional(),
  assignedExecutive: z.string().max(150).optional(),
  issuedCertificates: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        certificateName: z.string().optional(),
        url: z.string().optional(),
        certificateUrl: z.string().optional(),
        issuedDate: z.string().optional(),
      })
    )
    .optional(),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Please provide a valid email address.").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password is too long."),
  phone: z.string().min(8).max(20).optional(),
});
