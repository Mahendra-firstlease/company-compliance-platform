import { describe, expect, it } from "vitest";
import { mergeVaultDocuments } from "@/lib/applications";
import type { ApplicationCase } from "@/types";

const baseCase: ApplicationCase = {
  id: "APP-1",
  customerName: "Test User",
  customerPhone: "9999999999",
  serviceSlug: "gst-registration",
  serviceTitle: "GST Registration",
  status: "APPROVED",
  createdAt: "2026-01-01T00:00:00.000Z",
  uploadedDocs: {
    "PAN Card": {
      id: "doc-1",
      name: "pan.pdf",
      url: "/storage/documents/pan.pdf",
      size: 1024,
      type: "application/pdf",
    },
  },
  issuedCertificates: [
    {
      id: "cert-1",
      applicationId: "APP-1",
      userId: "user-1",
      certificateName: "GST Certificate",
      certificateUrl: "https://example.com/cert.pdf",
      issuedDate: "2026-02-01T00:00:00.000Z",
    },
  ],
};

describe("mergeVaultDocuments", () => {
  it("includes both client uploads and admin certificates", () => {
    const docs = mergeVaultDocuments([baseCase]);
    expect(docs).toHaveLength(2);
    expect(docs.some((d) => d.source === "CLIENT")).toBe(true);
    expect(docs.some((d) => d.source === "ADMIN")).toBe(true);
  });

  it("deduplicates certificates already present in uploadedDocs", () => {
    const duplicateCase: ApplicationCase = {
      ...baseCase,
      uploadedDocs: {
        "GST Certificate": {
          id: "doc-2",
          name: "gst-cert.pdf",
          url: "https://example.com/cert.pdf",
          size: 2048,
          type: "application/pdf",
          status: "VERIFIED",
        },
      },
    };

    const docs = mergeVaultDocuments([duplicateCase]);
    expect(docs).toHaveLength(1);
    expect(docs[0].source).toBe("ADMIN");
  });

  it("resolves local storage URLs to document API routes", () => {
    const docs = mergeVaultDocuments([baseCase]);
    const panDoc = docs.find((d) => d.docName === "PAN Card");
    expect(panDoc?.fileUrl).toBe("/api/documents/doc-1");
  });
});
