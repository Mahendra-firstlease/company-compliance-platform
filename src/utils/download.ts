/**
 * Client-Side Download Trigger using Next.js Server-Side Proxy Endpoint.
 * Solves CORS restrictions and triggers native browser file download directly onto device.
 */
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

  // Auth-gated local document route — use directly
  if (url.startsWith("/api/documents/")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  // Route request through Server-Side Download Proxy
  const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(targetFileName)}`;

  const a = document.createElement("a");
  a.href = proxyUrl;
  a.download = targetFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
