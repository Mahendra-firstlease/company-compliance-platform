const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

export function isImageExtension(ext: string): boolean {
  return IMAGE_EXTENSIONS.has(ext.toLowerCase().replace(/^\./, ""));
}

export function isImageMimeType(mimeType?: string): boolean {
  return Boolean(mimeType?.toLowerCase().startsWith("image/"));
}

export function isImageFileName(fileName: string): boolean {
  const ext = fileName.split(".").pop() || "";
  return isImageExtension(ext);
}

export function toPdfFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "") + ".pdf";
}
