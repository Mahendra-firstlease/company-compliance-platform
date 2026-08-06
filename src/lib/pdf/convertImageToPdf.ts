import { PDFDocument } from "pdf-lib";
import { isImageExtension } from "@/lib/pdf/is-image-file";

async function embedImage(
  pdfDoc: PDFDocument,
  imageBuffer: Buffer,
  ext: string,
) {
  const normalizedExt = ext.toLowerCase().replace(/^\./, "");

  if (normalizedExt === "png") {
    return pdfDoc.embedPng(new Uint8Array(imageBuffer));
  }

  if (normalizedExt === "jpg" || normalizedExt === "jpeg") {
    return pdfDoc.embedJpg(new Uint8Array(imageBuffer));
  }

  if (normalizedExt === "webp") {
    try {
      const sharp = (await import("sharp")).default;
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();
      return pdfDoc.embedPng(new Uint8Array(pngBuffer));
    } catch {
      throw new Error(
        "WEBP certificate images require the sharp package on the server.",
      );
    }
  }

  throw new Error(`Unsupported image format for PDF conversion: ${ext}`);
}

/** Wrap a single image page into a PDF buffer. */
export async function convertImageToPdf(
  imageBuffer: Buffer,
  ext: string,
): Promise<Buffer> {
  if (!isImageExtension(ext)) {
    throw new Error("File is not a supported image format.");
  }

  const pdfDoc = await PDFDocument.create();
  const image = await embedImage(pdfDoc, imageBuffer, ext);
  const { width, height } = image.scale(1);
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
