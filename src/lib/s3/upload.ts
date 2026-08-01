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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const checksum = calculateChecksum(buffer);

  const client = getS3Client();

  if (client && config.hasCredentials) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucketName,
          Key: uniqueKey,
          Body: buffer,
          ContentType: fileType,
          Metadata: {
            filename: sanitized,
            checksum,
            ...metadata,
          },
        })
      );

      const s3Url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${uniqueKey}`;

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
      console.error("[AWS S3 UPLOAD FAILURE]:", err);
      if (config.isProduction) {
        throw new Error(`Failed to upload document to AWS S3: ${err.message}`);
      }
    }
  }

  // Local development fallback
  const fallbackUrl = `/storage/${uniqueKey}`;
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
