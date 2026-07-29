export type ApplicationStatus =
  | "DRAFT"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "DOCUMENTS_PENDING"
  | "PENDING"
  | "VERIFYING"
  | "IN_REVIEW"
  | "UNDER_REVIEW"
  | "SUBMITTED"
  | "QUERY_RAISED"
  | "APPROVED"
  | "REJECTED";

export interface UploadedFile {
  id?: string;
  name: string;
  url?: string;
  type: string;
  size: number | string;
  uploadedAt?: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
}

export interface IssuedCertificate {
  id: string;
  applicationId: string;
  userId: string;
  certificateName: string;
  certificateUrl: string;
  issuedDate: string;
}

export interface ApplicationCase {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  serviceSlug: string;
  serviceTitle: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
  formData?: Record<string, any>;
  documents?: UploadedFile[];
  uploadedDocs: Record<string, UploadedFile>;
  issuedCertificates?: IssuedCertificate[];
  queryNote?: string;
  query?: string;
  adminNote?: string;
  assignedExecutive?: string;
  governmentFee?: number;
  professionalFee?: number;
  totalFee?: number;
}
