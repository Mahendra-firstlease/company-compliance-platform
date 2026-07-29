/**
 * Administrative Overview & Operations Types
 */

export interface AdminDocumentItem {
  id: string;
  applicationId: string;
  serviceTitle: string;
  serviceSlug: string;
  customerName: string;
  customerPhone: string;
  userEmail: string;
  docName: string;
  fileName: string;
  fileSize: number | string;
  fileType: string;
  url: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
}

export interface UploadCertificatePayload {
  applicationId: string;
  userId: string;
  certificateName: string;
  certificateUrl: string;
}
