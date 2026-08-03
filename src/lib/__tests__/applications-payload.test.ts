import { describe, expect, it } from "vitest";
import { buildApplicationFormDataPayload } from "../applications";

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
