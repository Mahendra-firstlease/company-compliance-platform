import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getS3Client, getS3Config } from "./client";
import { sanitizeFilename, calculateChecksum } from "@/lib/upload";
import type { S3UploadResult } from "./upload";

export async function uploadBufferToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folderPrefix = "compliance-documents",
  metadata: Record<string, string> = {},
): Promise<S3UploadResult> {
  const config = getS3Config();
  const sanitized = sanitizeFilename(fileName);
  const fileExtension = sanitized.split(".").pop()?.toLowerCase() || "pdf";
  const uniqueKey = `${folderPrefix}/${randomUUID()}-${sanitized}`;
  const fileSizeBytes = buffer.length;
  const fileSizeStr = `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`;
  const checksum = calculateChecksum(buffer);
  const client = getS3Client();

  if (client && config.hasCredentials) {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          filename: sanitized,
          checksum,
          ...metadata,
        },
      }),
    );

    return {
      success: true,
      fileUrl: `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${uniqueKey}`,
      fileName: sanitized,
      fileSizeBytes,
      fileSize: fileSizeStr,
      fileType: fileExtension.toUpperCase(),
      key: uniqueKey,
      checksum,
      isMock: false,
    };
  }

  return {
    success: true,
    fileUrl: `/storage/${uniqueKey}`,
    fileName: sanitized,
    fileSizeBytes,
    fileSize: fileSizeStr,
    fileType: fileExtension.toUpperCase(),
    key: uniqueKey,
    checksum,
    isMock: true,
  };
}
