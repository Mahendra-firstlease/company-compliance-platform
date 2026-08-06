import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/s3/presigned", () => ({
  getPresignedDownloadUrl: vi.fn(),
}));

import { getPresignedDownloadUrl } from "@/lib/s3/presigned";

describe("GET /api/download API Route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getPresignedDownloadUrl).mockReset();
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

  it("proxies remote files with correct headers when requesting via url", async () => {
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

  it("handles custom filenames with spaces and sanitize invalid characters", async () => {
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
});
