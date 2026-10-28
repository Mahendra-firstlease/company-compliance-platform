import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/s3/presigned", () => ({
  getPresignedDownloadUrl: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/document-auth", () => ({
  verifyDocumentAccess: vi.fn(),
}));

import { getPresignedDownloadUrl } from "@/lib/s3/presigned";
import { getServerSession } from "next-auth";
import { verifyDocumentAccess } from "@/lib/auth/document-auth";

describe("GET /api/download API Route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getPresignedDownloadUrl).mockReset();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_client_owner", email: "client@test.com", role: "CLIENT" },
    } as any);
    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: true,
      reason: "OWNER",
    });
  });

  it("returns 401 Unauthorized when user is not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/download?url=https://example.com/test.pdf");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Authentication required");
  });

  it("returns 400 Bad Request when missing url, key, and filename parameters", async () => {
    const req = new NextRequest("http://localhost:3000/api/download");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required 'url' or 'key' parameter");
  });

  it("returns 400 when the download target is not a valid http(s) URL", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/download?url=sample.pdf&filename=Test_Filing_Certificate",
    );
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid download URL");
  });

  it("blocks SSRF attempts targeting private or loopback IP addresses", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/download?url=http://169.254.169.254/latest/meta-data&filename=secret",
    );
    const res = await GET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Access to private or internal addresses is disallowed");
  });

  it("returns 403 Forbidden when document ownership verification fails (cross-company IDOR)", async () => {
    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: false,
      reason: "FORBIDDEN",
    });

    const req = new NextRequest(
      "http://localhost:3000/api/download?url=https://bucket.s3.region.amazonaws.com/compliance-documents/victim-pan.pdf&filename=victim-pan.pdf",
    );
    const res = await GET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("You do not have permission to access this document");
  });

  it("returns 403 Forbidden when unauthorized user attempts access using an S3 object key", async () => {
    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: false,
      reason: "UNVERIFIED_OWNERSHIP",
    });

    const req = new NextRequest(
      "http://localhost:3000/api/download?key=compliance-documents/victim-pan.pdf&filename=victim-pan.pdf",
    );
    const res = await GET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("You do not have permission to access this document");
  });

  it("proxies remote files with correct headers when requesting via url by authorized owner", async () => {
    const pdfBody = "%PDF-1.4\nOFFICIAL FILING CERTIFICATE - Test_Filing_Certificate";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/pdf" }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(pdfBody));
          controller.close();
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = new NextRequest(
      "http://localhost:3000/api/download?url=https://cdn.example.com/sample.pdf&filename=Test_Filing_Certificate&disposition=attachment",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe(
      'attachment; filename="Test_Filing_Certificate"',
    );

    const textContent = await res.text();
    expect(textContent).toContain("%PDF-1.4");
    expect(textContent).toContain(
      "OFFICIAL FILING CERTIFICATE - Test_Filing_Certificate",
    );
  });

  it("allows administrator to download any document across companies", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_admin", email: "admin@portal.com", role: "ADMIN" },
    } as any);

    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: true,
      reason: "ADMIN",
    });

    vi.mocked(getPresignedDownloadUrl).mockResolvedValue(
      "https://cdn.example.com/client-b-pan.pdf",
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/pdf" }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("%PDF-1.4-PAN-CARD"));
          controller.close();
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = new NextRequest(
      "http://localhost:3000/api/download?key=compliance-documents/client-b-pan.pdf&filename=Client_B_PAN.pdf&disposition=inline",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toBe('inline; filename="Client_B_PAN.pdf"');
  });

  it("handles custom filenames with spaces and sanitizes invalid characters", async () => {
    vi.mocked(getPresignedDownloadUrl).mockResolvedValue(
      "https://cdn.example.com/doc.pdf",
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/pdf" }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("%PDF-1.4"));
          controller.close();
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = new NextRequest(
      "http://localhost:3000/api/download?key=doc.pdf&filename=Company<License>_Final?.pdf&disposition=attachment",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const disposition = res.headers.get("content-disposition");
    expect(disposition).toContain(
      'attachment; filename="Company_License__Final_.pdf"',
    );
  });

  it("serves local storage files directly from disk with inline disposition for authorized user", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const testDir = path.join(process.cwd(), "storage", "documents");
    await fs.mkdir(testDir, { recursive: true });
    const testFilePath = path.join(testDir, "test_preview_doc.png");
    await fs.writeFile(testFilePath, Buffer.from("fake-png-bytes"));

    const req = new NextRequest(
      "http://localhost:3000/api/download?url=/storage/documents/test_preview_doc.png&disposition=inline",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("content-disposition")).toBe('inline; filename="test_preview_doc.png"');

    // Clean up
    await fs.unlink(testFilePath).catch(() => {});
  });
});
