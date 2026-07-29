import { ApplicationCase, Service, AdminDocumentItem, UploadCertificatePayload } from "@/types";
import apiFetch from "@/lib/apiClient";

export const adminService = {
  /**
   * Fetch all user applications for administrative overview
   */
  async getApplications(): Promise<ApplicationCase[]> {
    try {
      const data = await apiFetch<ApplicationCase[]>("/admin/applications");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("adminService.getApplications error:", err);
      return [];
    }
  },

  /**
   * Fetch all statutory services for administrative catalog
   */
  async getServices(): Promise<Service[]> {
    try {
      const data = await apiFetch<Service[]>("/services");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("adminService.getServices error:", err);
      return [];
    }
  },

  /**
   * Fetch all uploaded user documents across all applications
   */
  async getDocuments(): Promise<AdminDocumentItem[]> {
    try {
      const data = await apiFetch<AdminDocumentItem[]>("/admin/documents");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("adminService.getDocuments error:", err);
      return [];
    }
  },

  /**
   * Issue official government certificate for approved application
   */
  async uploadCertificate(payload: UploadCertificatePayload): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch("/admin/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true };
    } catch (err: any) {
      console.error("adminService.uploadCertificate error:", err);
      return { success: false, error: err.message || "Upload failed" };
    }
  },
};
