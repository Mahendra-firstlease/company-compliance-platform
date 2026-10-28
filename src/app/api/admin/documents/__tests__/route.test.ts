import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
    },
    application: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("GET /api/admin/documents Route Handler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_admin_1", role: "ADMIN", email: "admin@portal.com" },
    } as any);
  });

  it("returns 401 Unauthorized when session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new Request("http://localhost:3000/api/admin/documents");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns 403 Forbidden when non-admin client tries to access admin documents", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_client", role: "CLIENT" },
    } as any);
    const req = new Request("http://localhost:3000/api/admin/documents");
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it("returns authenticated proxy viewUrl for S3 and local documents rather than raw private S3 URLs", async () => {
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      {
        id: "doc_s3_pan",
        applicationId: "app_1",
        docName: "PAN Card",
        fileName: "pan_card.jpg",
        fileUrl: "https://my-bucket.s3.ap-south-1.amazonaws.com/compliance-documents/pan.jpg",
        fileSize: "1.2 MB",
        fileType: "image/jpeg",
        status: "PENDING_REVIEW",
        createdAt: new Date("2026-01-01"),
        application: {
          id: "app_1",
          serviceSlug: "gst-reg",
          serviceTitle: "GST Registration",
          customerName: "Acme Corp",
          customerPhone: "9876543210",
          status: "DOCUMENTS_PENDING",
        },
        user: { id: "usr_1", name: "Acme Admin", email: "acme@corp.com" },
      },
      {
        id: "doc_local_pdf",
        applicationId: "app_2",
        docName: "Rent Agreement",
        fileName: "rent_agreement.pdf",
        fileUrl: "/storage/documents/rent_agreement.pdf",
        fileSize: "0.8 MB",
        fileType: "application/pdf",
        status: "VERIFIED",
        createdAt: new Date("2026-01-02"),
        application: {
          id: "app_2",
          serviceSlug: "pan-card",
          serviceTitle: "PAN Card Application",
          customerName: "Beta LLC",
          customerPhone: "9876543211",
          status: "APPROVED",
        },
        user: { id: "usr_2", name: "Beta Admin", email: "beta@llc.com" },
      },
    ] as any);

    vi.mocked(prisma.application.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost:3000/api/admin/documents");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);

    // Both S3 and local documents must use authenticated endpoints
    expect(data[0].viewUrl).toBe("/api/documents/doc_s3_pan");
    expect(data[0].fileUrl).toBe("/api/documents/doc_s3_pan");
    expect(data[0].viewUrl).not.toContain(".amazonaws.com");

    expect(data[1].viewUrl).toBe("/api/documents/doc_local_pdf");
    expect(data[1].fileUrl).toBe("/api/documents/doc_local_pdf");
  });
});

