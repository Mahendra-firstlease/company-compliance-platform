import { MAGIC_SIGNATURES } from "./constants";

export interface MagicBytesResult {
  isValid: boolean;
  detectedType?: string;
  expectedType?: string;
  error?: string;
}

/**
 * Verify file content by checking Magic Bytes against expected extension.
 * Returns rich diagnostic information.
 */
export function verifyMagicBytes(
  buffer: Buffer,
  extension: string
): MagicBytesResult {
  const ext = extension.toLowerCase().replace(".", "");

  if (!buffer || buffer.length < 4) {
    return {
      isValid: false,
      error: "File payload is empty or too small for binary signature verification.",
    };
  }

  const sig = MAGIC_SIGNATURES[ext];

  if (!sig) {
    // If extension not in table, skip strict signature check or allow
    return { isValid: true };
  }

  const isMatch = sig.check(buffer);

  if (!isMatch) {
    return {
      isValid: false,
      expectedType: sig.type,
      detectedType: "Unknown / Mismatched Binary",
      error: `File extension is .${ext} but binary content is not a valid ${sig.type}. Upload blocked for safety.`,
    };
  }

  return {
    isValid: true,
    expectedType: sig.type,
    detectedType: sig.type,
  };
}
