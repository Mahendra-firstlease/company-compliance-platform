import crypto from "crypto";

/**
 * Calculate SHA-256 checksum hash of file buffer.
 * Useful for duplicate detection, auditing, and file integrity verification.
 */
export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
