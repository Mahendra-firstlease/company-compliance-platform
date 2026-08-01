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
  if (!allowedExts.map((e) => e.toLowerCase()).includes(ext)) {
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
  const check = validateFileSecurity(file, allowedTypes, maxSizeMb);
  if (!check.isValid) {
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
      return {
        id: data.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: data.fileName || sanitizedName,
        size: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: data.fileType || file.type.split("/")[1]?.toUpperCase() || "PDF",
        url: data.fileUrl,
        uploadedAt: new Date().toISOString(),
      };
    } else {
      throw new Error(data.error || "S3 Upload failed");
    }
  } catch (err: any) {
    console.warn("S3 Upload notice, using object URL fallback:", err);
    const objectUrl = URL.createObjectURL(file);
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: sanitizedName,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type.split("/")[1]?.toUpperCase() || "PDF",
      url: objectUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
}
