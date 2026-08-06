import {
  UploadedFile,
  IssuedCertificate,
  ApplicationCase,
  ApplicationStatus,
} from "@/types";
import apiFetch from "@/lib/apiClient";

export function buildApplicationFormDataPayload(
  formData: Record<string, any>,
  uploadedDocs?: Record<string, UploadedFile | null> | UploadedFile[]
): Record<string, any> {
  const normalizedUploads = Array.isArray(uploadedDocs)
    ? uploadedDocs.reduce<Record<string, UploadedFile>>((acc, doc) => {
        if (doc) {
          acc[doc.name || `doc_${Date.now()}`] = doc;
        }
        return acc;
      }, {})
    : Object.fromEntries(
        Object.entries(uploadedDocs || {}).filter(([, value]) => Boolean(value)) as Array<[string, UploadedFile]>
      );

  const formUploads = extractUploadedDocuments(formData);
  const allUploads = { ...formUploads, ...normalizedUploads };

  return {
    ...(formData || {}),
    ...(Object.keys(allUploads).length > 0 ? { _uploadedDocs: allUploads } : {}),
  };
}

type UploadMetadata = {
  name: string;
  size?: string | number;
  type?: string;
  url: string;
  uploadedAt?: string;
};

function isUploadMetadata(value: unknown): value is UploadMetadata {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as UploadMetadata).name === "string" &&
      typeof (value as UploadMetadata).url === "string",
  );
}

/** Collect files from dynamic upload fields, including front/back inputs. */
export function extractUploadedDocuments(
  formData: Record<string, unknown> = {},
): Record<string, UploadMetadata> {
  return Object.entries(formData).reduce<Record<string, UploadMetadata>>(
    (documents, [fieldName, value]) => {
      if (isUploadMetadata(value)) {
        documents[fieldName] = value;
      } else if (fieldName === "_uploadedDocs" && value && typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([docName, file]) => {
          if (isUploadMetadata(file)) documents[docName] = file;
        });
      } else if (value && typeof value === "object") {
        const sides = value as { front?: unknown; back?: unknown };
        if (isUploadMetadata(sides.front)) documents[`${fieldName} (Front)`] = sides.front;
        if (isUploadMetadata(sides.back)) documents[`${fieldName} (Back)`] = sides.back;
      }
      return documents;
    },
    {},
  );
}

/** Format upload metadata stored in application JSON for API consumers. */
export function formatStoredUploadMetadata(
  uploads: Record<string, UploadMetadata>,
): Record<string, UploadedFile> {
  return Object.fromEntries(
    Object.entries(uploads).map(([docName, file]) => [
      docName,
      {
        name: file.name,
        url: file.url,
        size: file.size ?? 0,
        type: file.type || "Document",
        uploadedAt: file.uploadedAt,
      },
    ]),
  );
}

export type {
  UploadedFile,
  IssuedCertificate,
  ApplicationCase,
  ApplicationStatus,
};

export interface VaultDocument {
  id: string;
  docName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  serviceTitle: string;
  serviceSlug: string;
  applicationId: string;
  status: string;
  fileUrl?: string;
  uploadedAt: string;
  source: "CLIENT" | "ADMIN";
}

export function certificateDownloadName(
  serviceTitle: string,
  certificateName: string,
): string {
  const safeService = serviceTitle.replace(/[^a-zA-Z0-9]/g, "_");
  const safeCert = certificateName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
  return `${safeService}_${safeCert}.pdf`;
}

export function resolveDocumentViewUrl(fileUrl?: string, docId?: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("/api/documents/")) return fileUrl;
  if (fileUrl.startsWith("/storage/") && docId) return `/api/documents/${docId}`;
  return `/api/download?url=${encodeURIComponent(fileUrl)}`;
}

function formatVaultDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Merge client uploads and admin-issued certificates into one vault list. */
export function mergeVaultDocuments(applications: ApplicationCase[]): VaultDocument[] {
  const list: VaultDocument[] = [];
  const seenUrls = new Set<string>();

  applications.forEach((application) => {
    if (application.uploadedDocs) {
      Object.entries(application.uploadedDocs).forEach(([docName, file], idx) => {
        const rawUrl = file.url || "";
        if (rawUrl) seenUrls.add(rawUrl);

        const isVerified =
          file.status === "VERIFIED" || application.status === "APPROVED";

        list.push({
          id: file.id || `${application.id}-${docName}-${idx}`,
          docName,
          fileName: file.name,
          fileSize:
            typeof file.size === "number"
              ? `${(file.size / 1024).toFixed(1)} KB`
              : String(file.size || "Unknown"),
          fileType: file.type || "PDF / Document",
          serviceTitle: application.serviceTitle,
          serviceSlug: application.serviceSlug,
          applicationId: application.id,
          status: isVerified ? "VERIFIED" : "REGISTERED",
          fileUrl: resolveDocumentViewUrl(rawUrl, file.id),
          uploadedAt: formatVaultDate(file.uploadedAt || application.createdAt),
          source: file.status === "VERIFIED" ? "ADMIN" : "CLIENT",
        });
      });
    }

    (application.issuedCertificates || []).forEach((cert, idx) => {
      if (cert.certificateUrl && seenUrls.has(cert.certificateUrl)) return;
      if (cert.certificateUrl) seenUrls.add(cert.certificateUrl);

      list.push({
        id: cert.id || `${application.id}-cert-${idx}`,
        docName: cert.certificateName,
        fileName: cert.certificateName,
        fileSize: "—",
        fileType: "application/pdf",
        serviceTitle: application.serviceTitle,
        serviceSlug: application.serviceSlug,
        applicationId: application.id,
        status: "VERIFIED",
        fileUrl: resolveDocumentViewUrl(cert.certificateUrl),
        uploadedAt: formatVaultDate(cert.issuedDate),
        source: "ADMIN",
      });
    });
  });

  return list;
}

export function getDashboardCertificates(
  applications: Array<
    Pick<ApplicationCase, "id" | "serviceTitle" | "serviceSlug" | "status" | "issuedCertificates">
  >,
) {
  return applications
    .filter((application) => application.status === "APPROVED")
    .flatMap((application) =>
      (application.issuedCertificates || []).map((certificate) => ({
        id: certificate.id,
        applicationId: application.id,
        serviceTitle: application.serviceTitle,
        serviceSlug: application.serviceSlug,
        certificateName: certificate.certificateName,
        certificateUrl: certificate.certificateUrl,
        issuedDate: certificate.issuedDate,
      })),
    );
}

/**
 * Shared helper to format Prisma document relations into UploadedFile record map
 */
export function formatApplicationDocuments(
  documents: Array<{ id?: string; docName: string; fileName: string; fileSize: string | number; fileType: string; fileUrl?: string }>
): Record<string, UploadedFile> {
  const uploadedDocs: Record<string, UploadedFile> = {};
  documents.forEach((doc) => {
    uploadedDocs[doc.docName] = {
      id: doc.id || doc.docName,
      name: doc.fileName,
      url:
        doc.fileUrl?.startsWith("/storage/") && doc.id
          ? `/api/documents/${doc.id}`
          : doc.fileUrl || "",
      size: typeof doc.fileSize === "number" ? doc.fileSize : 0,
      type: doc.fileType,
      uploadedAt: new Date().toISOString(),
    };
  });
  return uploadedDocs;
}

/**
 * Client-side fetch helper for user applications
 */
export async function getApplications(): Promise<ApplicationCase[]> {
  try {
    const data = await apiFetch<ApplicationCase[]>("/applications");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    return [];
  }
}

/**
 * Client-side fetch helper for single application by ID or slug
 */
export async function getApplicationBySlug(idOrSlug: string): Promise<ApplicationCase | null> {
  try {
    const data = await apiFetch<ApplicationCase>(`/applications/${idOrSlug}`);
    return data || null;
  } catch (err: any) {
    // 404 Not Found is expected when user accesses workspace before filing
    if (err?.message?.includes("404") || err?.message?.includes("not found")) {
      return null;
    }
    console.warn(`No existing application found for ${idOrSlug}`);
    return null;
  }
}

/**
 * Client-side save application helper
 */
export async function saveApplication(
  payload: Partial<ApplicationCase>
): Promise<{ success: boolean; data?: ApplicationCase; error?: string }> {
  try {
    const data = await apiFetch<ApplicationCase>("/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to save application:", err);
    return { success: false, error: err.message || "Network error" };
  }
}

/**
 * Client-side update helper for application details/status
 */
export async function updateApplication(
  id: string,
  payload: Partial<ApplicationCase>
): Promise<{ success: boolean; data?: ApplicationCase; error?: string }> {
  try {
    const data = await apiFetch<ApplicationCase>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (err: any) {
    console.error(`Failed to update application ${id}:`, err);
    return { success: false, error: err.message || "Network error" };
  }
}
