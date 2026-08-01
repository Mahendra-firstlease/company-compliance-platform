export const MIME_MAP: Record<string, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg", "image/pjpeg", "image/jpg"],
  jpeg: ["image/jpeg", "image/pjpeg", "image/jpg"],
  webp: ["image/webp"],
};

export interface FileSignature {
  ext: string;
  type: string;
  check: (buffer: Buffer) => boolean;
}

export const MAGIC_SIGNATURES: Record<string, FileSignature> = {
  pdf: {
    ext: "pdf",
    type: "PDF Document",
    check: (buf) =>
      buf.length >= 4 &&
      buf[0] === 0x25 &&
      buf[1] === 0x50 &&
      buf[2] === 0x44 &&
      buf[3] === 0x46,
  },
  png: {
    ext: "png",
    type: "PNG Image",
    check: (buf) =>
      buf.length >= 4 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47,
  },
  jpg: {
    ext: "jpg",
    type: "JPEG Image",
    check: (buf) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  jpeg: {
    ext: "jpeg",
    type: "JPEG Image",
    check: (buf) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  webp: {
    ext: "webp",
    type: "WEBP Image",
    check: (buf) =>
      buf.length >= 12 &&
      buf[0] === 0x52 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x46 &&
      buf[8] === 0x57 &&
      buf[9] === 0x45 &&
      buf[10] === 0x42 &&
      buf[11] === 0x50,
  },
};
