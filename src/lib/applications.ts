import {
  UploadedFile,
  IssuedCertificate,
  ApplicationCase,
  ApplicationStatus,
} from "@/types";
import apiFetch from "@/lib/apiClient";

export type {
  UploadedFile,
  IssuedCertificate,
  ApplicationCase,
  ApplicationStatus,
};

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
      url: doc.fileUrl || "",
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
