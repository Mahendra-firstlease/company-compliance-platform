/**
 * File Upload Rules, MIME Types & Error Messages
 */

export const FILE_UPLOAD_RULES = {
  maxSizeMB: 10,
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
} as const;

export const FILE_ERROR_MESSAGES = {
  FILE_TOO_LARGE: "File size exceeds maximum allowed limit of 10MB.",
  INVALID_TYPE: "Only PDF, JPG, and PNG documents are supported.",
  UPLOAD_FAILED: "Document upload failed. Please try again.",
} as const;
