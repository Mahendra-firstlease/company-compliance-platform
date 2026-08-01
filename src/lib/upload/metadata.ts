import path from "path";

export interface UploadMetadataOptions {
  allowedExtensions?: string[];
  maxSizeMb?: number;
}

/**
 * Validate upload file size and extension metadata.
 * Uses path.extname and Set lookup for robust, efficient checks.
 */
export function validateUploadMetadata(
  filename: string,
  fileSize: number,
  options: UploadMetadataOptions = {}
): { isValid: boolean; error?: string } {
  const allowedExtensions = options.allowedExtensions || ["pdf", "png", "jpg", "jpeg", "webp"];
  const maxSizeMb = options.maxSizeMb ?? 5;

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (fileSize > maxBytes) {
    return { isValid: false, error: `File size exceeds allowable limit of ${maxSizeMb}MB.` };
  }

  const rawExt = path.extname(filename).replace(".", "").toLowerCase();
  const allowedSet = new Set(allowedExtensions.map((e) => e.toLowerCase()));

  if (!rawExt || !allowedSet.has(rawExt)) {
    return {
      isValid: false,
      error: `File extension '.${rawExt || "none"}' is restricted. Allowed formats: ${allowedExtensions.join(", ")}.`,
    };
  }

  return { isValid: true };
}

// Alias for backward compatibility
export const validateFileSecurityServer = (
  filename: string,
  fileSize: number,
  allowedExts?: string[],
  maxSizeMb?: number
) => validateUploadMetadata(filename, fileSize, { allowedExtensions: allowedExts, maxSizeMb });
