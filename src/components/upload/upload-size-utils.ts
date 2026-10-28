/** Convert upload rule bytes to a human label (e.g. 50 KB, 1 MB). */
export function formatMaxFileSize(maxSizeBytes: number): string {
  if (maxSizeBytes < 1024 * 1024) {
    return `${Math.round(maxSizeBytes / 1024)} KB`;
  }
  const mb = maxSizeBytes / (1024 * 1024);
  return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

export function dropzoneRejectMessage(
  code: string | undefined,
  allowedTypes: string[],
  maxSizeBytes: number,
): string {
  const sizeLabel = formatMaxFileSize(maxSizeBytes);
  if (code === "file-too-large") {
    return `File size exceeds the maximum allowed limit of ${sizeLabel}.`;
  }
  if (code === "file-invalid-type") {
    return `Invalid file type. Allowed formats: ${allowedTypes.join(", ").toUpperCase()}.`;
  }
  return "File could not be uploaded. Check the format and size.";
}

