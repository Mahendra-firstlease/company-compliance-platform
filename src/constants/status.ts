/**
 * Application Status Enums and UI Badge Configurations
 */

export const APPLICATION_STATUS = {
  DRAFT: "DRAFT",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  DOCUMENTS_PENDING: "DOCUMENTS_PENDING",
  IN_REVIEW: "IN_REVIEW",
  GOVT_SUBMITTED: "GOVT_SUBMITTED",
  CERTIFICATE_ISSUED: "CERTIFICATE_ISSUED",
  REJECTED: "REJECTED",
} as const;

export type ApplicationStatusType = keyof typeof APPLICATION_STATUS;

export const STATUS_BADGE_CONFIG = {
  DRAFT: { label: "Draft", variant: "secondary", color: "bg-slate-100 text-slate-700" },
  PENDING_PAYMENT: { label: "Payment Due", variant: "warning", color: "bg-amber-100 text-amber-800" },
  DOCUMENTS_PENDING: { label: "Docs Needed", variant: "warning", color: "bg-orange-100 text-orange-800" },
  IN_REVIEW: { label: "In Verification", variant: "info", color: "bg-blue-100 text-blue-800" },
  GOVT_SUBMITTED: { label: "Submitted to Govt", variant: "info", color: "bg-indigo-100 text-indigo-800" },
  CERTIFICATE_ISSUED: { label: "Completed", variant: "success", color: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Query Raised", variant: "destructive", color: "bg-rose-100 text-rose-800" },
} as const;
