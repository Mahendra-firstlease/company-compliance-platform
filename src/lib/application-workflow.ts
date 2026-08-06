import { ApplicationStatus } from "@/types/application";

export type DocVerificationStatus = "VERIFIED" | "DEFECTIVE";

export type DocVerificationMap = Record<
  string,
  { status: DocVerificationStatus; reason?: string }
>;

const STATUS_RANK: Record<string, number> = {
  PAYMENT_PENDING: 0,
  DOCUMENTS_PENDING: 1,
  PAYMENT_CONFIRMED: 1,
  PENDING: 1,
  VERIFYING: 1,
  IN_REVIEW: 2,
  UNDER_REVIEW: 2,
  SUBMITTED: 3,
  APPROVED: 4,
  REJECTED: -1,
};

export function getSubmittedFormEntries(
  formData: Record<string, unknown> = {},
): [string, unknown][] {
  return Object.entries(formData).filter(
    ([fieldName]) => !fieldName.startsWith("_"),
  );
}

export function isFormDataApproved(formData: Record<string, unknown> = {}): boolean {
  if (getSubmittedFormEntries(formData).length === 0) {
    return true;
  }
  return Boolean(formData._formDataApproved);
}

export function getDocumentsVerificationSummary(
  uploadedDocs: Record<string, unknown> = {},
  docVerifications: DocVerificationMap = {},
) {
  const docKeys = Object.keys(uploadedDocs);
  if (docKeys.length === 0) {
    return {
      total: 0,
      verified: 0,
      pending: 0,
      defective: 0,
      allVerified: true,
    };
  }

  let verified = 0;
  let pending = 0;
  let defective = 0;

  for (const docKey of docKeys) {
    const status = docVerifications[docKey]?.status;
    if (status === "VERIFIED") verified += 1;
    else if (status === "DEFECTIVE") defective += 1;
    else pending += 1;
  }

  return {
    total: docKeys.length,
    verified,
    pending,
    defective,
    allVerified: verified === docKeys.length,
  };
}

export function areApplicantFilesApproved(
  uploadedDocs: Record<string, unknown> = {},
  docVerifications: DocVerificationMap = {},
): boolean {
  return getDocumentsVerificationSummary(uploadedDocs, docVerifications)
    .allVerified;
}

export function getStatusRank(status: ApplicationStatus | string): number {
  return STATUS_RANK[status] ?? 0;
}

export interface WorkflowGateContext {
  currentStatus: ApplicationStatus | string;
  targetStatus: ApplicationStatus | string;
  formData?: Record<string, unknown>;
  uploadedDocs?: Record<string, unknown>;
  docVerifications?: DocVerificationMap;
  hasActiveQuery?: boolean;
}

export function getWorkflowBlockers({
  currentStatus,
  targetStatus,
  formData = {},
  uploadedDocs = {},
  docVerifications = {},
  hasActiveQuery = false,
}: WorkflowGateContext): string[] {
  const blockers: string[] = [];
  const currentRank = getStatusRank(currentStatus);
  const targetRank = getStatusRank(targetStatus);

  if (hasActiveQuery) {
    blockers.push("Resolve the active customer query before advancing the filing stage.");
    return blockers;
  }

  if (targetRank <= currentRank && targetStatus !== currentStatus) {
    blockers.push(
      `Application is already at or beyond the "${formatStatusLabel(targetStatus)}" stage.`,
    );
    return blockers;
  }

  if (targetRank > currentRank + 1) {
    blockers.push(
      `Complete "${formatStatusLabel(getStatusForRank(currentRank + 1))}" before moving to "${formatStatusLabel(targetStatus)}".`,
    );
  }

  const requiresClientReview =
    targetRank >= getStatusRank("UNDER_REVIEW");

  if (requiresClientReview) {
    if (!isFormDataApproved(formData)) {
      blockers.push(
        'Approve "Submitted Form Data & Information" before advancing.',
      );
    }

    const docSummary = getDocumentsVerificationSummary(
      uploadedDocs,
      docVerifications,
    );
    if (!docSummary.allVerified) {
      if (docSummary.total === 0) {
        blockers.push(
          "No applicant files are available to verify yet.",
        );
      } else if (docSummary.defective > 0) {
        blockers.push(
          `Resolve ${docSummary.defective} defective applicant file(s) before advancing.`,
        );
      } else {
        blockers.push(
          `Verify all ${docSummary.pending} remaining applicant file(s) before advancing.`,
        );
      }
    }
  }

  return blockers;
}

export function canAdvanceWorkflowStatus(context: WorkflowGateContext): boolean {
  return getWorkflowBlockers(context).length === 0;
}

function getStatusForRank(rank: number): string {
  switch (rank) {
    case 1:
      return "PAYMENT_CONFIRMED";
    case 2:
      return "UNDER_REVIEW";
    case 3:
      return "SUBMITTED";
    case 4:
      return "APPROVED";
    default:
      return "UNDER_REVIEW";
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "UNDER_REVIEW":
    case "IN_REVIEW":
      return "Under Verification";
    case "SUBMITTED":
      return "Submitted to Ministry";
    case "APPROVED":
      return "Approved & Issued";
    case "PAYMENT_CONFIRMED":
    case "DOCUMENTS_PENDING":
      return "Payment Verified";
    default:
      return status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}
