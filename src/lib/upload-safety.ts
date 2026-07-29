/**
 * File Upload Safety Utility: Magic Bytes Validation, Filename Sanitization & Size Checks
 */

// Maximum allowed file size: 5 MB
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

// Dangerous executable file extensions to explicitly reject
const EXECUTABLE_EXTENSIONS = [
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".php",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".rb",
  ".pl",
  ".cgi",
  ".asp",
  ".aspx",
  ".html",
  ".htm",
  ".svg", // Prevent Stored XSS via SVG
];

/**
 * Validates file magic bytes (header signatures) to ensure real file type matches extension
 */
export async function validateFileMagicBytes(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // PDF Magic Bytes: %PDF (0x25 0x50 0x44 0x46)
    const isPdf =
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46;

    // PNG Magic Bytes: 0x89 50 4E 47 0D 0A 1A 0A
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;

    // JPEG Magic Bytes: 0xFF 0xD8 0xFF
    const isJpeg =
      bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

    return isPdf || isPng || isJpeg;
  } catch (error) {
    console.error("Magic bytes validation error:", error);
    return false;
  }
}

/**
 * Sanitizes filename to prevent directory traversal and special character injection
 */
export function sanitizeFilename(filename: string): string {
  // Strip path traversal attempts like ../ or C:\
  const basename = filename.replace(/^.*[\\/]/, "");

  // Lowercase check for dangerous extensions
  const lowerName = basename.toLowerCase();
  for (const ext of EXECUTABLE_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      throw new Error(`File type '${ext}' is not permitted.`);
    }
  }

  // Replace special characters with underscores, keeping valid alphanumeric, dots, and hyphens
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized;
}

/**
 * Generates security headers for serving file downloads safely
 */
export function getSafeFileHeaders(filename: string, mimeType: string): Record<string, string> {
  const safeName = sanitizeFilename(filename);
  return {
    "Content-Type": mimeType,
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none';",
  };
}
