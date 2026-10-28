import { describe, expect, it } from "vitest";
import {
  buildApplicationFormDataPayload,
  mergeUploadedDocuments,
  formatApplicationDocuments,
} from "../applications";

describe("buildApplicationFormDataPayload", () => {
  it("merges submitted form values with uploaded document metadata", () => {
    const payload = buildApplicationFormDataPayload(
      { applicantName: "Asha", panNumber: "ABCDE1234F" },
      {
        passport: {
          name: "passport.pdf",
          size: 1024,
          type: "PDF",
          url: "/storage/passport.pdf",
        },
      }
    );

    expect(payload.applicantName).toBe("Asha");
    expect(payload.panNumber).toBe("ABCDE1234F");
    expect(payload._uploadedDocs).toEqual({
      passport: {
        name: "passport.pdf",
        size: 1024,
        type: "PDF",
        url: "/storage/passport.pdf",
      },
    });
  });

  it("returns the form values unchanged when no uploads are provided", () => {
    const payload = buildApplicationFormDataPayload({ applicantName: "Asha" });

    expect(payload).toEqual({ applicantName: "Asha" });
  });

  it("includes files selected in dynamic upload fields", () => {
    const payload = buildApplicationFormDataPayload({
      panDocument: {
        name: "pan.pdf",
        size: "120 KB",
        type: "PDF",
        url: "/storage/documents/pan.pdf",
      },
      aadhaarDocument: {
        front: { name: "aadhaar-front.jpg", url: "/storage/documents/aadhaar-front.jpg" },
        back: { name: "aadhaar-back.jpg", url: "/storage/documents/aadhaar-back.jpg" },
      },
    });

    expect(Object.keys(payload._uploadedDocs)).toEqual([
      "panDocument",
      "aadhaarDocument (Front)",
      "aadhaarDocument (Back)",
    ]);
  });

  it("restores previously saved upload metadata", () => {
    const payload = buildApplicationFormDataPayload({
      _uploadedDocs: {
        supportingProof: { name: "lease.pdf", url: "/storage/documents/lease.pdf" },
      },
    });

    expect(payload._uploadedDocs.supportingProof.name).toBe("lease.pdf");
  });
});

describe("mergeUploadedDocuments deduplication", () => {
  it("deduplicates documents when db document labels differ from raw form field names", () => {
    const dbDocs = formatApplicationDocuments([
      {
        id: "doc-1",
        docName: "PAN Card Copy",
        fileName: "pan-card.jpg",
        fileSize: 1024,
        fileType: "image/jpeg",
        fileUrl: "/storage/documents/1793183003843_pan-card.jpg",
      },
      {
        id: "doc-2",
        docName: "Front Side Copy",
        fileName: "adhar-front.jpg",
        fileSize: 1024,
        fileType: "image/jpeg",
        fileUrl: "/storage/documents/1793183264397_adhar-front.jpg",
      },
      {
        id: "doc-3",
        docName: "Back Side Copy",
        fileName: "adhar-back.jpg",
        fileSize: 1024,
        fileType: "image/jpeg",
        fileUrl: "/storage/documents/1793183270380_adhar-back.jpg",
      },
      {
        id: "doc-4",
        docName: "Premises Address Proof (Utility Bill / Lease Agreement)",
        fileName: "address-profe.pdf",
        fileSize: 2048,
        fileType: "application/pdf",
        fileUrl: "/storage/documents/1793183357456_address-profe.pdf",
      },
    ]);

    const formDataUploads = {
      panDocument: {
        name: "pan-card.jpg",
        size: "0.12 MB",
        type: "JPEG",
        url: "/storage/documents/1793183003843_pan-card.jpg",
      },
      "aadhaarDocument (Front)": {
        name: "adhar-front.jpg",
        size: "0.07 MB",
        type: "WEBP",
        url: "/storage/documents/1793183264397_adhar-front.jpg",
      },
      "aadhaarDocument (Back)": {
        name: "adhar-back.jpg",
        size: "0.08 MB",
        type: "JPEG",
        url: "/storage/documents/1793183270380_adhar-back.jpg",
      },
      addressProofDocument: {
        name: "address-profe.pdf",
        size: "0.04 MB",
        type: "PDF",
        url: "/storage/documents/1793183357456_address-profe.pdf",
      },
    };

    const merged = mergeUploadedDocuments(formDataUploads, dbDocs);
    const keys = Object.keys(merged);

    // Exactly 4 documents, zero duplicates
    expect(keys.length).toBe(4);
    expect(keys).toContain("PAN Card Copy");
    expect(keys).toContain("Front Side Copy");
    expect(keys).toContain("Back Side Copy");
    expect(keys).toContain("Premises Address Proof (Utility Bill / Lease Agreement)");

    // Raw technical form keys should not appear
    expect(keys).not.toContain("panDocument");
    expect(keys).not.toContain("aadhaarDocument (Front)");
    expect(keys).not.toContain("aadhaarDocument (Back)");
    expect(keys).not.toContain("addressProofDocument");
  });
});
