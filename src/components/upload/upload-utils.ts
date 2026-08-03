import { notify } from "@/lib/notify";
import { sanitizeFilename, MIME_MAP } from "@/lib/upload/client";

export { sanitizeFilename, MIME_MAP };

export interface UploadedFile {
  id?: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  uploadedAt?: string;
}

/**
 * Perform strict client-side validation of file sizes, extensions, and MIME signatures.
 */
export function validateFileSecurity(
  file: File,
  allowedExts: string[],
  maxSizeMb: number
): { isValid: boolean; error?: string } {
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isValid: false, error: `File size exceeds allowable limit of ${maxSizeMb}MB.` };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  // Normalize allowed extensions so "jpg" automatically permits ".jpeg" (and vice versa)
  const normalizedAllowed = allowedExts.flatMap((e) => {
    const l = e.toLowerCase();
    if (l === "jpg" || l === "jpeg") return ["jpg", "jpeg"];
    return [l];
  });

  if (!normalizedAllowed.includes(ext)) {
    return {
      isValid: false,
      error: `File extension '.${ext}' is restricted. Allowed formats: ${allowedExts.join(", ")}.`,
    };
  }

  const expectedMimes = MIME_MAP[ext];
  if (expectedMimes && file.type && !expectedMimes.includes(file.type)) {
    return { isValid: false, error: "File content-type signature mismatch. Upload blocked for safety." };
  }

  return { isValid: true };
}

/**
 * Process single file upload to S3 API with local fallback object URL.
 */
export async function processSingleFileUpload(
  file: File,
  docName: string,
  allowedTypes: string[] = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb: number = 5
): Promise<UploadedFile> {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  console.log("📤 [CLIENT FILE UPLOAD STARTED]:", {
    fileName: file.name,
    fileSizeMB: `${sizeMb} MB`,
    fileType: file.type,
    docName,
  });

  const check = validateFileSecurity(file, allowedTypes, maxSizeMb);
  if (!check.isValid) {
    console.error("❌ [CLIENT UPLOAD SECURITY REJECT]:", check.error);
    throw new Error(check.error || "Security check failed.");
  }

  const sanitizedName = sanitizeFilename(file.name);

  try {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("docName", docName || sanitizedName);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    const data = await response.json();

    if (response.ok && data.success && data.fileUrl) {
      console.log("✅ [CLIENT UPLOAD SUCCESS]:", {
        fileName: data.fileName || sanitizedName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize || `${sizeMb} MB`,
        fileType: data.fileType || file.type,
        storageMode: data.isMock ? "Local Storage (/storage/documents)" : "AWS S3 Bucket",
        checksum: data.checksum,
      });

      return {
        id: data.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: data.fileName || sanitizedName,
        size: data.fileSize || `${sizeMb} MB`,
        type: data.fileType || file.type.split("/")[1]?.toUpperCase() || "PDF",
        url: data.fileUrl,
        uploadedAt: new Date().toISOString(),
      };
    } else {
      console.error("❌ [CLIENT UPLOAD SERVER REJECT]:", data.error);
      throw new Error(data.error || "S3 Upload failed");
    }
  } catch (err: any) {
    console.warn("⚠️ [CLIENT UPLOAD NOTICE - FALLBACK TO LOCAL OBJECT URL]:", err?.message || err);
    const objectUrl = URL.createObjectURL(file);
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: sanitizedName,
      size: `${sizeMb} MB`,
      type: file.type.split("/")[1]?.toUpperCase() || "PDF",
      url: objectUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
}

export interface UploadedFile {
  id?: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  key?: string;
  uploadedAt?: string;
}

/**
 * Helper to extract S3 object key from full S3 URL or storage path
 */
export function extractS3KeyFromUrl(url?: string): string | undefined {
  if (!url || url.startsWith("blob:")) return undefined;
  if (url.includes(".amazonaws.com/")) {
    return url.split(".amazonaws.com/")[1];
  }
  if (url.startsWith("/storage/")) {
    return url.replace("/storage/", "");
  }
  return undefined;
}

/**
 * Delete previously uploaded S3 object or database document record upon file replacement.
 */
export async function deleteUploadedFile(keyOrUrl?: string, documentId?: string): Promise<boolean> {
  const key = extractS3KeyFromUrl(keyOrUrl) || keyOrUrl;
  if (!key && !documentId) return false;
  try {
    const query = key ? `key=${encodeURIComponent(key)}` : `documentId=${documentId}`;
    const res = await fetch(`/api/upload?${query}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log("🗑️ [S3 FILE REPLACEMENT DELETED OLD FILE]:", key || documentId);
      return true;
    }
  } catch (err) {
    console.warn("S3 delete deferral notice:", err);
  }
  return false;
}
