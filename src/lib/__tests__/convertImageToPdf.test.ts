import { describe, expect, it } from "vitest";
import { convertImageToPdf } from "@/lib/pdf/convertImageToPdf";
import { isImageFileName, toPdfFileName } from "@/lib/pdf/is-image-file";

// 1x1 red PNG
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("convertImageToPdf", () => {
  it("converts a PNG buffer into a PDF buffer", async () => {
    const pdf = await convertImageToPdf(TINY_PNG, "png");
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(100);
  });
});

describe("isImageFileName", () => {
  it("detects image extensions", () => {
    expect(isImageFileName("certificate.png")).toBe(true);
    expect(isImageFileName("certificate.pdf")).toBe(false);
  });

  it("replaces extension with .pdf", () => {
    expect(toPdfFileName("gst-cert.jpeg")).toBe("gst-cert.pdf");
  });
});
