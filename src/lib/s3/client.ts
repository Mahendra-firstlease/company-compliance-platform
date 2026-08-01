import { S3Client } from "@aws-sdk/client-s3";

export function getS3Config() {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const isProduction = process.env.NODE_ENV === "production";

  const hasCredentials = Boolean(bucketName && accessKeyId && secretAccessKey);

  if (isProduction && !hasCredentials) {
    throw new Error(
      "[FATAL S3 CONFIG ERROR]: Missing AWS S3 production credentials (AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)."
    );
  }

  return {
    bucketName: bucketName || "mock-compliance-bucket",
    region,
    accessKeyId,
    secretAccessKey,
    hasCredentials,
    isProduction,
  };
}

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client | null {
  const config = getS3Config();

  if (!config.hasCredentials) {
    return null;
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!,
      },
    });
  }

  return s3ClientInstance;
}
