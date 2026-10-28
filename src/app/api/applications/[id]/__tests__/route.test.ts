import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE, PATCH } from "../route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    document: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      upsert: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/s3", () => ({
  deleteFromS3Storage: vi.fn(),
  extractS3Key: vi.fn((url: string) => {
    if (url.includes("s3.eu-north-1.amazonaws.com/")) {
      return url.split(".amazonaws.com/")[1];
    }
    if (url.startsWith("compliance-documents/")) {
      return url;
    }
    return null;
  }),
}));

vi.mock("@/lib/upload", () => ({
  cleanupUploadedFile: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ success: true }),
  RATE_LIMIT_CONFIGS: { userApi: {} },
}));

vi.mock("@/lib/notifications-dispatcher", () => ({
  sendApplicationNotification: vi.fn().mockResolvedValue(undefined),
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { deleteFromS3Storage } from "@/lib/s3";
import { cleanupUploadedFile } from "@/lib/upload";

describe("DELETE /api/applications/[id] Route Handler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_admin_1", role: "ADMIN" },
    } as any);
    vi.mocked(deleteFromS3Storage).mockResolvedValue(true);
    vi.mocked(cleanupUploadedFile).mockResolvedValue(true);
  });

  it("returns 403 when user is not admin", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_client_1", role: "CLIENT" },
    } as any);

    const req = new Request("http://localhost:3000/api/applications/app_123", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "app_123" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Admin privileges required");
  });

  it("returns 404 when application is not found", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null as any);

    const req = new Request("http://localhost:3000/api/applications/nonexistent", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("deletes S3 objects and local files when application is deleted", async () => {
    const mockApp = {
      id: "app_123",
      userId: "usr_client_1",
      documents: [
        {
          id: "doc_1",
          fileUrl: "https://my-bucket.s3.eu-north-1.amazonaws.com/compliance-documents/pan.pdf",
        },
      ],
      certificates: [
        {
          id: "cert_1",
          certificateUrl: "/storage/certificates/cert_1.pdf",
        },
      ],
      formData: {
        gstFile: {
          name: "GST Certificate",
          url: "https://my-bucket.s3.eu-north-1.amazonaws.com/compliance-documents/gst.pdf",
        },
      },
    };

    vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);
    vi.mocked(prisma.application.delete).mockResolvedValue({ id: "app_123" } as any);

    const req = new Request("http://localhost:3000/api/applications/app_123", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "app_123" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("deleted successfully");
    expect(body.cleanedS3Files).toBe(2);
    expect(body.failedS3Files).toBe(0);

    // Verify S3 files deletion called
    expect(deleteFromS3Storage).toHaveBeenCalledWith("compliance-documents/pan.pdf");
    expect(deleteFromS3Storage).toHaveBeenCalledWith("compliance-documents/gst.pdf");

    // Verify local file cleanup called
    expect(cleanupUploadedFile).toHaveBeenCalled();

    // Verify DB deletion was called
    expect(prisma.application.delete).toHaveBeenCalledWith({
      where: { id: "app_123" },
    });
  });

  it("handles partial S3 deletion failures gracefully and reports failure counts", async () => {
    const mockApp = {
      id: "app_456",
      userId: "usr_client_1",
      documents: [
        {
          id: "doc_1",
          fileUrl: "https://my-bucket.s3.eu-north-1.amazonaws.com/compliance-documents/pan.pdf",
        },
        {
          id: "doc_2",
          fileUrl: "https://my-bucket.s3.eu-north-1.amazonaws.com/compliance-documents/failing.pdf",
        },
      ],
      certificates: [],
      formData: {},
    };

    vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);
    vi.mocked(prisma.application.delete).mockResolvedValue({ id: "app_456" } as any);

    // First delete succeeds, second fails
    vi.mocked(deleteFromS3Storage)
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("AWS S3 Network timeout"));

    const req = new Request("http://localhost:3000/api/applications/app_456", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: "app_456" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cleanedS3Files).toBe(1);
    expect(body.failedS3Files).toBe(1);
  });
});

describe("PATCH /api/applications/[id] Client Query Resolution", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_client_1", role: "CLIENT" },
    } as any);
  });

  it("allows client to submit corrections when resolving a query in UNDER_REVIEW status", async () => {
    const mockApp = {
      id: "app_789",
      userId: "usr_client_1",
      status: "UNDER_REVIEW",
      queryText: "Please upload clear PAN card",
      formData: {
        panNumber: "OLD123",
      },
      documents: [],
      certificates: [],
    };

    vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);
    vi.mocked(prisma.application.update).mockResolvedValue({
      ...mockApp,
      queryText: null,
      formData: {
        panNumber: "NEW123",
        _queryStatus: "CLIENT_RESPONDED",
      },
      documents: [],
      certificates: [],
    } as any);

    const req = new Request("http://localhost:3000/api/applications/app_789", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "UNDER_REVIEW",
        query: "",
        queryStatus: "CLIENT_RESPONDED",
        queryResponse: "Revised details submitted.",
        formData: { panNumber: "NEW123" },
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "app_789" }) });
    expect(res.status).toBe(200);
    expect(prisma.application.update).toHaveBeenCalled();
  });

  it("denies client from attempting unauthorized status transitions to APPROVED", async () => {
    const mockApp = {
      id: "app_789",
      userId: "usr_client_1",
      status: "UNDER_REVIEW",
      formData: {},
      documents: [],
      certificates: [],
    };

    vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);

    const req = new Request("http://localhost:3000/api/applications/app_789", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "APPROVED",
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "app_789" }) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Only compliance staff can update application filing status");
  });
});
