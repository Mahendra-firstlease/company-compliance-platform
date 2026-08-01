/**
 * Sanitize filename to prevent path traversal, directory escape,
 * hidden file creation, and malicious command injection (OWASP).
 */
export function sanitizeFilename(filename: string): string {
  const baseName = filename.split(/[\\/]/).pop() || "";
  let cleanName = baseName.replace(/\.\.+/g, ".");
  // Strip leading dots to prevent creating hidden system files like .hidden.pdf -> hidden.pdf
  cleanName = cleanName.replace(/^\.+/, "");
  cleanName = cleanName.replace(/[^a-zA-Z0-9_\.-]/g, "_");

  if (!cleanName || cleanName === ".") {
    cleanName = `attachment_${Date.now()}`;
  }

  if (cleanName.length > 80) {
    const extIdx = cleanName.lastIndexOf(".");
    const ext = extIdx !== -1 ? cleanName.substring(extIdx) : "";
    cleanName = cleanName.substring(0, 80 - ext.length) + ext;
  }
  return cleanName;
}
