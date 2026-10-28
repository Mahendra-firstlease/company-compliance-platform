import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "../route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/document-auth", () => ({
  verifyDocumentAccess: vi.fn(),
}));

vi.mock("@/lib/s3", () => ({
  uploadToS3Storage: vi.fn(),
  deleteFromS3Storage: vi.fn(),
  extractS3Key: vi.fn((key: string) => key),
}));

import { getServerSession } from "next-auth";
import { verifyDocumentAccess } from "@/lib/auth/document-auth";
import { deleteFromS3Storage } from "@/lib/s3";

describe("DELETE /api/upload Route Handler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_client_1", role: "CLIENT" },
    } as any);
    vi.mocked(deleteFromS3Storage).mockResolvedValue(true);
  });

  it("returns 401 when request is unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new Request("http://localhost:3000/api/upload?key=compliance-documents/test.pdf", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when neither key nor documentId is provided", async () => {
    const req = new Request("http://localhost:3000/api/upload", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("denies deletion when ownership cannot be verified for temporary upload", async () => {
    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: false,
      reason: "FORBIDDEN",
    });

    const req = new Request(
      "http://localhost:3000/api/upload?key=compliance-documents/victim-unlinked-pan.pdf",
      { method: "DELETE" },
    );
    const res = await DELETE(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("You do not have permission to delete this document");
    expect(deleteFromS3Storage).not.toHaveBeenCalled();
  });

  it("authorizes deletion when temporary upload is owned by requesting user", async () => {
    vi.mocked(verifyDocumentAccess).mockResolvedValue({
      authorized: true,
      reason: "S3_UPLOAD_OWNER",
    });

    const req = new Request(
      "http://localhost:3000/api/upload?key=compliance-documents/my-pan.pdf",
      { method: "DELETE" },
    );
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(deleteFromS3Storage).toHaveBeenCalledWith("compliance-documents/my-pan.pdf");
  });
});

