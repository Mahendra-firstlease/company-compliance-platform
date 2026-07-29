import React from "react";
import { ApplicationStatus } from "@/types";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  LucideIcon,
} from "lucide-react";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  icon: LucideIcon;
}

const statusMap: Record<string, StatusConfig> = {
  APPROVED: {
    label: "Approved & Issued",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  VERIFIED: {
    label: "Verified Vault File",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
  },
  PENDING: {
    label: "Pending Verification",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  VERIFYING: {
    label: "Document Verification",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  DOCUMENTS_PENDING: {
    label: "Docs Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  IN_REVIEW: {
    label: "Legal Audit in Progress",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: FileCheck2,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: FileCheck2,
  },
  SUBMITTED: {
    label: "Submitted to Govt",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: FileCheck2,
  },
  QUERY_RAISED: {
    label: "Action Required (Query)",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertTriangle,
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: CreditCard,
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Cleared",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected / Defective",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  },
};

export default function StatusBadge({
  status,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normalizedKey = String(status || "").toUpperCase();
  const config = statusMap[normalizedKey] || {
    label: normalizedKey || "Unknown",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-xs font-bold gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border shadow-2xs ${config.badgeClass} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "size-3 shrink-0" : "size-3.5 shrink-0"} />
      <span>{config.label}</span>
    </span>
  );
}
