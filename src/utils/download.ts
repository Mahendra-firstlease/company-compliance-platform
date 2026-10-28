/**
 * Client-Side Download & Inline View Triggers using Next.js Server-Side Proxy Endpoint.
 * Solves CORS restrictions, supports inline viewing, and triggers native browser file download.
 */

export function getInlineViewUrl(url?: string, filename?: string): string {
  if (!url) return "#";
  if (url.startsWith("/api/documents/")) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  const targetFileName =
    filename ??
    url.split("/").pop()?.split("?")[0] ??
    "document.pdf";

  // If already an /api/download URL, ensure disposition is inline
  if (url.includes("/api/download")) {
    try {
      const dummyBase = "http://localhost";
      const parsed = new URL(url.startsWith("http") ? url : `${dummyBase}${url}`);
      parsed.searchParams.set("disposition", "inline");
      if (filename) parsed.searchParams.set("filename", targetFileName);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  }

  return `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(targetFileName)}&disposition=inline`;
}

export function downloadFile(url: string, filename?: string) {
  if (!url) return;

  const targetFileName =
    filename ??
    url.split("/").pop()?.split("?")[0] ??
    "download.pdf";

  // Handle base64 data URLs locally
  if (url.startsWith("data:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Auth-gated local document route — attach disposition=attachment to trigger download
  if (url.startsWith("/api/documents/")) {
    const separator = url.includes("?") ? "&" : "?";
    const downloadUrl = `${url}${separator}disposition=attachment&filename=${encodeURIComponent(targetFileName)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // If url is already an /api/download URL, unwrap inner target to avoid double-proxying loopback
  let finalDownloadTarget = url;
  if (url.includes("/api/download")) {
    try {
      const dummyBase = "http://localhost";
      const parsed = new URL(url.startsWith("http") ? url : `${dummyBase}${url}`);
      const innerTarget =
        parsed.searchParams.get("url") ||
        parsed.searchParams.get("fileUrl") ||
        parsed.searchParams.get("key");
      if (innerTarget) {
        finalDownloadTarget = innerTarget;
      }
    } catch {
      // Keep url if parsing fails
    }
  }

  // Route request through Server-Side Download Proxy with explicit attachment disposition
  const proxyUrl = `/api/download?url=${encodeURIComponent(finalDownloadTarget)}&filename=${encodeURIComponent(targetFileName)}&disposition=attachment`;

  const a = document.createElement("a");
  a.href = proxyUrl;
  a.download = targetFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
