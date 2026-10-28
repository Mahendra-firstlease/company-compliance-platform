import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyDocumentAccess } from "../document-auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    issuedCertificate: {
      findFirst: vi.fn(),
    },
    application: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/s3", () => ({
  extractS3Key: vi.fn((val: string) => {
    if (!val) return null;
    if (val.includes(".amazonaws.com/")) return val.split(".amazonaws.com/")[1]?.split("?")[0];
    if (val.startsWith("/storage/")) return val.replace("/storage/", "");
    if (val.includes("compliance-documents/")) return val;
    return null;
  }),
  getS3ObjectMetadata: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getS3ObjectMetadata } from "@/lib/s3";

describe("verifyDocumentAccess Authorization Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(prisma.document.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.document.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.issuedCertificate.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.application.findMany).mockResolvedValue([]);
    vi.mocked(getS3ObjectMetadata).mockResolvedValue(null);
  });

  it("authorizes ADMIN users platform-wide regardless of document owner", async () => {
    const result = await verifyDocumentAccess({
      userId: "usr_admin_1",
      userRole: "ADMIN",
      key: "compliance-documents/any-company-pan.jpg",
    });

    expect(result.authorized).toBe(true);
    expect(result.reason).toBe("ADMIN");
  });

  it("authorizes client owner when document record matches userId in database", async () => {
    vi.mocked(prisma.document.findFirst).mockResolvedValue({
      id: "doc_123",
      userId: "usr_client_a",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/client-a-pan.jpg",
      fileName: "pan.jpg",
      application: { id: "app_1", userId: "usr_client_a" },
    } as any);

    const result = await verifyDocumentAccess({
      userId: "usr_client_a",
      userRole: "CLIENT",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/client-a-pan.jpg",
    });

    expect(result.authorized).toBe(true);
    expect(result.document.id).toBe("doc_123");
  });

  it("denies access when client attempts to access another company document (cross-company IDOR)", async () => {
    vi.mocked(prisma.document.findFirst).mockResolvedValue({
      id: "doc_456",
      userId: "usr_victim_company",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/victim-pan.jpg",
      fileName: "victim_pan.jpg",
      application: { id: "app_2", userId: "usr_victim_company" },
    } as any);

    const result = await verifyDocumentAccess({
      userId: "usr_attacker_company",
      userRole: "CLIENT",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/victim-pan.jpg",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe("FORBIDDEN");
  });

  it("denies access when client modifies the S3 URL to target another document", async () => {
    vi.mocked(prisma.document.findFirst).mockResolvedValue({
      id: "doc_789",
      userId: "usr_company_b",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/company-b-gst.pdf",
      fileName: "gst.pdf",
      application: { id: "app_3", userId: "usr_company_b" },
    } as any);

    const result = await verifyDocumentAccess({
      userId: "usr_company_a",
      userRole: "CLIENT",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/company-b-gst.pdf",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe("FORBIDDEN");
  });

  it("denies access when client provides an S3 key directly for another user's document", async () => {
    vi.mocked(prisma.document.findFirst).mockResolvedValue({
      id: "doc_999",
      userId: "usr_company_b",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/secret-doc.pdf",
      fileName: "secret.pdf",
      application: { id: "app_4", userId: "usr_company_b" },
    } as any);

    const result = await verifyDocumentAccess({
      userId: "usr_company_a",
      userRole: "CLIENT",
      key: "compliance-documents/secret-doc.pdf",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe("FORBIDDEN");
  });

  it("authorizes certificate owner when certificate record matches userId", async () => {
    vi.mocked(prisma.issuedCertificate.findFirst).mockResolvedValue({
      id: "cert_101",
      userId: "usr_client_a",
      certificateUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/gst_cert.pdf",
      certificateName: "GST Certificate",
      application: { id: "app_1", userId: "usr_client_a" },
    } as any);

    const result = await verifyDocumentAccess({
      userId: "usr_client_a",
      userRole: "CLIENT",
      fileUrl: "https://bucket.s3.ap-south-1.amazonaws.com/compliance-documents/gst_cert.pdf",
    });

    expect(result.authorized).toBe(true);
    expect(result.certificate.id).toBe("cert_101");
  });

  it("authorizes temporary in-progress upload when S3 metadata uploadedBy matches userId", async () => {
    vi.mocked(getS3ObjectMetadata).mockResolvedValue({
      uploadedby: "usr_client_temp",
      applicationid: "unassigned",
    });

    const result = await verifyDocumentAccess({
      userId: "usr_client_temp",
      userRole: "CLIENT",
      key: "compliance-documents/temp-unlinked-pan.jpg",
    });

    expect(result.authorized).toBe(true);
    expect(result.reason).toBe("S3_UPLOAD_OWNER");
  });

  it("denies temporary in-progress upload when S3 metadata uploadedBy belongs to another user", async () => {
    vi.mocked(getS3ObjectMetadata).mockResolvedValue({
      uploadedby: "usr_other_client",
      applicationid: "unassigned",
    });

    const result = await verifyDocumentAccess({
      userId: "usr_attacker",
      userRole: "CLIENT",
      key: "compliance-documents/temp-unlinked-pan.jpg",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe("FORBIDDEN");
  });

  it("denies access when document has no matching database record and no S3 metadata", async () => {
    const result = await verifyDocumentAccess({
      userId: "usr_random_user",
      userRole: "CLIENT",
      key: "compliance-documents/non-existent.pdf",
    });

    expect(result.authorized).toBe(false);
    expect(result.reason).toBe("UNVERIFIED_OWNERSHIP");
  });
});

