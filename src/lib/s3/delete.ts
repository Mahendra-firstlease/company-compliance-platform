import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getS3Config } from "./client";

/**
 * Delete object from AWS S3 bucket for cleanup / rollback.
 */
export async function deleteFromS3Storage(key: string): Promise<boolean> {
  const config = getS3Config();
  const client = getS3Client();

  if (!client || !config.hasCredentials) {
    console.warn(`[S3 DELETE NOTICE]: AWS S3 credentials not set, skipping remote delete for key ${key}`);
    return true;
  }

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );
    console.log(`[S3 DELETE SUCCESS]: Removed key ${key} from bucket ${config.bucketName}`);
    return true;
  } catch (err) {
    console.error(`[S3 DELETE ERROR]: Failed to delete key ${key}:`, err);
    return false;
  }
}
