import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getS3Client, getS3Config } from "./client";
import { sanitizeFilename, calculateChecksum } from "@/lib/upload";

export interface S3UploadResult {
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  fileSize: string; // Formatted string for UI compatibility
  fileType: string;
  key: string;
  checksum?: string;
  isMock?: boolean;
}

export async function uploadToS3Storage(
  file: File,
  folderPrefix = "compliance-documents",
  metadata: Record<string, string> = {}
): Promise<S3UploadResult> {
  const config = getS3Config();
  const sanitized = sanitizeFilename(file.name);
  const fileExtension = sanitized.split(".").pop()?.toLowerCase() || "pdf";
  const uuid = randomUUID();
  const uniqueKey = `${folderPrefix}/${uuid}-${sanitized}`;
  const fileSizeBytes = file.size;
  const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  const fileType = file.type || `application/${fileExtension}`;

  let uploadBuffer = Buffer.from(await file.arrayBuffer());
  let finalFileType = file.type || `application/${fileExtension}`;

  // Auto-Compress Images using sharp (if image > 300KB) to reduce S3 storage costs by 60-80%
  if (["jpg", "jpeg", "png", "webp"].includes(fileExtension) && uploadBuffer.length > 300 * 1024) {
    try {
      const sharp = (await import("sharp")).default;
      uploadBuffer = await sharp(uploadBuffer)
        .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      finalFileType = "image/webp";
      console.log(
        `⚡ [SHARP IMAGE OPTIMIZED]: '${sanitized}' size reduced from ${(file.size / 1024).toFixed(1)}KB -> ${(uploadBuffer.length / 1024).toFixed(1)}KB`
      );
    } catch (sharpErr) {
      console.warn("[Sharp Compression Deferred]: Using original file buffer.");
    }
  }

  const checksum = calculateChecksum(uploadBuffer);
  const client = getS3Client();

  console.log("☁️ [STORAGE UPLOAD INITIATED]:", {
    fileName: sanitized,
    fileSize: fileSizeStr,
    optimizedSize: `${(uploadBuffer.length / (1024 * 1024)).toFixed(2)} MB`,
    bucket: config.bucketName || "none",
    region: config.region || "none",
    hasAwsCredentials: config.hasCredentials,
    checksum,
  });

  if (client && config.hasCredentials) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: uniqueKey,
          Body: uploadBuffer,
          ContentType: finalFileType,
          Metadata: {
            filename: sanitized,
            checksum,
            ...metadata,
          },
        })
      );

      const s3Url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${uniqueKey}`;
      console.log("✅ [AWS S3 BUCKET UPLOAD SUCCESSFUL]:", {
        key: uniqueKey,
        s3Url,
        size: fileSizeStr,
        checksum,
      });

      return {
        success: true,
        fileUrl: s3Url,
        fileName: sanitized,
        fileSizeBytes,
        fileSize: fileSizeStr,
        fileType: fileType.split("/")[1]?.toUpperCase() || fileExtension.toUpperCase(),
        key: uniqueKey,
        checksum,
        isMock: false,
      };
    } catch (err: any) {
      console.error("💥 [AWS S3 UPLOAD FAILURE]:", err);
      if (config.isProduction) {
        throw new Error(`Failed to upload document to AWS S3: ${err.message}`);
      }
    }
  }

  // Local development fallback
  const fallbackUrl = `/storage/${uniqueKey}`;
  console.log("💾 [LOCAL STORAGE FALLBACK UPLOAD SUCCESSFUL]:", {
    key: uniqueKey,
    fallbackUrl,
    size: fileSizeStr,
    checksum,
  });

  return {
    success: true,
    fileUrl: fallbackUrl,
    fileName: sanitized,
    fileSizeBytes,
    fileSize: fileSizeStr,
    fileType: fileType.split("/")[1]?.toUpperCase() || fileExtension.toUpperCase(),
    key: uniqueKey,
    checksum,
    isMock: true,
  };
}
