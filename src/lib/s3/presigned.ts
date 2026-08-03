import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { getS3Client, getS3Config } from "./client";
import { sanitizeFilename } from "@/lib/upload";

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
}

/**
 * Generate temporary presigned S3 upload URL for direct browser-to-S3 uploads.
 * Reduces server memory usage and scales for multi-file/large PDF uploads.
 */
export async function getPresignedUploadUrl(
  filename: string,
  folderPrefix = "compliance-documents",
  contentType = "application/pdf",
  expiresInSeconds = 900 // 15 minutes
): Promise<PresignedUrlResult> {
  const config = getS3Config();
  const client = getS3Client();

  const sanitized = sanitizeFilename(filename);
  const uuid = randomUUID();
  const key = `${folderPrefix}/${uuid}-${sanitized}`;

  if (!client || !config.hasCredentials) {
    if (config.isProduction) {
      throw new Error("AWS S3 credentials required for presigned URL generation.");
    }

    // Local development fallback endpoint
    return {
      uploadUrl: `/api/upload?mockKey=${key}`,
      fileUrl: `/storage/${key}`,
      key,
      expiresInSeconds,
    };
  }

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  const fileUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
    expiresInSeconds,
  };
}

/**
 * Generate temporary presigned S3 download URL for secure file viewing.
 * Prevents AWS S3 AccessDenied XML errors for private objects.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600 // 1 hour
): Promise<string> {
  const config = getS3Config();
  const client = getS3Client();

  if (!client || !config.hasCredentials) {
    return `/storage/${key}`;
  }

  try {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    console.error("[AWS S3 Presigned Download Error]:", err);
    return `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  }
}
