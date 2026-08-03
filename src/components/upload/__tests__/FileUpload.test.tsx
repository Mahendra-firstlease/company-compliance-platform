import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateFileSecurity, processSingleFileUpload } from "../upload-utils";

describe("Dynamic Client File Upload & S3 Helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateFileSecurity()", () => {
    it("approves valid PDF files within 5MB size limit", () => {
      const validFile = new File(["dummy content"], "pan_card.pdf", { type: "application/pdf" });
      const result = validateFileSecurity(validFile, ["pdf", "png", "jpg"], 5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("approves valid PNG and JPEG image files when jpg is allowed", () => {
      const validPng = new File(["image data"], "aadhaar_front.png", { type: "image/png" });
      const resultPng = validateFileSecurity(validPng, ["pdf", "png", "jpg"], 5);
      expect(resultPng.isValid).toBe(true);

      const validJpeg = new File(["image data"], "passport_photo.jpeg", { type: "image/jpeg" });
      const resultJpeg = validateFileSecurity(validJpeg, ["pdf", "png", "jpg"], 5);
      expect(resultJpeg.isValid).toBe(true);
    });

    it("rejects files exceeding the 5MB size limit", () => {
      // Mock 6MB file
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large_document.pdf", {
        type: "application/pdf",
      });
      const result = validateFileSecurity(largeFile, ["pdf", "png"], 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("File size exceeds allowable limit of 5MB");
    });

    it("rejects restricted file extensions (.exe / .bat)", () => {
      const unsafeFile = new File(["echo test"], "malicious_script.exe", {
        type: "application/x-msdownload",
      });
      const result = validateFileSecurity(unsafeFile, ["pdf", "png", "jpg"], 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("File extension '.exe' is restricted");
    });

    it("rejects content-type MIME mismatch for security", () => {
      const fakePdf = new File(["text data"], "fake_doc.pdf", { type: "text/plain" });
      const result = validateFileSecurity(fakePdf, ["pdf"], 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("content-type signature mismatch");
    });
  });

  describe("processSingleFileUpload()", () => {
    it("successfully uploads a file and returns S3 response metadata", async () => {
      const mockFile = new File(["test data"], "director_pan.pdf", { type: "application/pdf" });

      // Mock fetch response for /api/upload
      const globalFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          fileName: "director_pan.pdf",
          fileUrl: "https://firstlease-compliance-documents.s3.ap-south-1.amazonaws.com/compliance-documents/uuid-director_pan.pdf",
          fileSize: "0.01 MB",
          fileType: "PDF",
          checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          isMock: false,
        }),
      });
      vi.stubGlobal("fetch", globalFetch);

      const result = await processSingleFileUpload(mockFile, "Director PAN Card", ["pdf"], 5);

      expect(globalFetch).toHaveBeenCalledWith("/api/upload", expect.any(Object));
      expect(result.name).toBe("director_pan.pdf");
      expect(result.url).toContain("amazonaws.com");
      expect(result.type).toBe("PDF");
    });

    it("handles S3 network fallback gracefully", async () => {
      const mockFile = new File(["test data"], "rent_agreement.pdf", { type: "application/pdf" });

      const globalFetch = vi.fn().mockRejectedValue(new Error("Network Error"));
      vi.stubGlobal("fetch", globalFetch);
      vi.stubGlobal("URL", {
        createObjectURL: vi.fn().mockReturnValue("blob:http://localhost:3000/mock-uuid"),
      });

      const result = await processSingleFileUpload(mockFile, "Rent Agreement", ["pdf"], 5);

      expect(result.name).toBe("rent_agreement.pdf");
      expect(result.url).toContain("blob:http://localhost:3000");
    });
  });
});
