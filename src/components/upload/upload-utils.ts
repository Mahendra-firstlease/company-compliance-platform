import { sanitizeFilename, MIME_MAP } from "@/lib/upload/client";

export { sanitizeFilename, MIME_MAP };

export interface UploadedFile {
  id?: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  key?: string;
  uploadedAt?: string;
}

interface DeleteUploadResponse {
  success: boolean;
  error?: string;
}

interface UploadApiResponse {
  success: boolean;
  id?: string;
  key?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  checksum?: string;
  error?: string;
}

/**
 * Performs strict client-side validation of
 * file size, extension and MIME type.
 */
export function validateFileSecurity(
  file: File,
  allowedExts: string[],
  maxSizeMb: number,
): { isValid: boolean; error?: string } {
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File size exceeds allowable limit of ${maxSizeMb}MB.`,
    };
  }

  const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();

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
  const mime = file.type.toLowerCase();

  if (
    expectedMimes &&
    mime &&
    !expectedMimes.map((m) => m.toLowerCase()).includes(mime)
  ) {
    return {
      isValid: false,
      error: "File content-type signature mismatch. Upload blocked for safety.",
    };
  }

  return { isValid: true };
}

/**
 * Upload a single file to the server.
 * Performs validation and returns uploaded file metadata.
 * Throws an error if the upload fails.
 */
export async function processSingleFileUpload(
  file: File,
  docName: string,
  allowedTypes: string[] = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb: number = 5,
  applicationId?: string,
  convertToPdf = false,
): Promise<UploadedFile> {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  let data: UploadApiResponse;
  console.log("📤 [CLIENT FILE UPLOAD STARTED]:", {
    fileName: file.name,
    fileSizeMB: `${sizeMb} MB`,
    fileType: file.type,
    docName,
  });

  const check = validateFileSecurity(file, allowedTypes, maxSizeMb);

  if (!check.isValid) {
    throw new Error(check.error || "Security validation failed.");
  }

  const sanitizedName = sanitizeFilename(file.name);

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("docName", docName || sanitizedName);
  if (applicationId) {
    uploadData.append("applicationId", applicationId);
  }
  if (convertToPdf) {
    uploadData.append("convertToPdf", "true");
  }

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response received from upload server.");
    }
    if (!response.ok || !data.success || !data.fileUrl) {
      throw new Error(data.error || "Upload failed.");
    }

    console.log("✅ [CLIENT UPLOAD SUCCESS]:", {
      fileName: data.fileName || sanitizedName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize || `${sizeMb} MB`,
      fileType: data.fileType || file.type,
      checksum: data.checksum,
    });

    return {
      id: data.id ?? crypto.randomUUID(),
      name: data.fileName || sanitizedName,
      size: data.fileSize || `${sizeMb} MB`,
      type: data.fileType || file.type.split("/")[1]?.toUpperCase() || "FILE",
      url: data.fileUrl,
      key: data.key || extractS3KeyFromUrl(data.fileUrl),
      uploadedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    console.error(
      "❌ [CLIENT UPLOAD FAILED]:",
      err instanceof Error ? err.message : err,
    );

    throw new Error(
      err instanceof Error
        ? err.message
        : "File upload failed. Please try again.",
    );
  }
}
/**
 * Helper to extract S3 object key from full S3 URL or storage path
 */
export function extractS3KeyFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
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
export async function deleteUploadedFile(
  keyOrUrl?: string,
  documentId?: string,
): Promise<boolean> {
  const key = extractS3KeyFromUrl(keyOrUrl) || keyOrUrl;
  if (!key && !documentId) return false;
  try {
    const query = key
      ? `key=${encodeURIComponent(key)}`
      : `documentId=${documentId}`;

    const res = await fetch(`/api/upload?${query}`, { method: "DELETE" });
    if (!res.ok) {
      console.warn("Delete request failed.");
      return false;
    }
   const data: DeleteUploadResponse = await res.json();
    if (data.success) {
      console.log(
        "🗑️ [S3 FILE REPLACEMENT DELETED OLD FILE]:",
        key || documentId,
      );
      return true;
    }
  } catch (err) {
    console.warn("S3 delete deferral notice:", err);
  }
  return false;
}
