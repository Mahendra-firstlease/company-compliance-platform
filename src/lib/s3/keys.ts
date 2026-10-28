import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getS3Config } from "./client";

/**
 * Normalizes and extracts the S3 object key from a full S3 URL, relative storage path,
 * or raw object key string.
 *
 * Examples:
 * - "https://my-bucket.s3.ap-south-1.amazonaws.com/compliance-documents/uuid-pan.jpg" -> "compliance-documents/uuid-pan.jpg"
 * - "compliance-documents/uuid-pan.jpg?disposition=inline" -> "compliance-documents/uuid-pan.jpg"
 * - "/storage/compliance-documents/uuid-pan.jpg" -> "compliance-documents/uuid-pan.jpg"
 * - "compliance-documents/uuid-pan.jpg" -> "compliance-documents/uuid-pan.jpg"
 */
export function extractS3Key(urlOrKey?: string | null): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;

  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  // 1. If it's a full S3 URL (virtual-hosted or path-style)
  if (trimmed.includes(".amazonaws.com/")) {
    const afterDomain = trimmed.split(".amazonaws.com/")[1];
    if (afterDomain) {
      return decodeURIComponent(afterDomain.split("?")[0]);
    }
  }

  // 2. If it starts with /storage/ or storage/
  if (trimmed.startsWith("/storage/") || trimmed.startsWith("storage/")) {
    const clean = trimmed.replace(/^\/?storage\//, "");
    return decodeURIComponent(clean.split("?")[0]);
  }

  // 3. If it starts with /api/download, unwrap the inner url/key parameter
  if (trimmed.includes("/api/download")) {
    try {
      const dummyBase = "http://localhost";
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `${dummyBase}${trimmed}`);
      const innerTarget =
        parsed.searchParams.get("key") ||
        parsed.searchParams.get("url") ||
        parsed.searchParams.get("fileUrl");
      if (innerTarget && innerTarget !== trimmed) {
        return extractS3Key(innerTarget);
      }
    } catch {
      // ignore parsing error and continue
    }
  }

  // 4. If it's a relative path or direct key starting with compliance-documents/ or similar
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return decodeURIComponent(trimmed.split("?")[0]);
  }

  return null;
}

/**
 * Checks if a string represents an S3 object (either a direct S3 key or full S3 URL).
 */
export function isS3Target(urlOrKey?: string | null): boolean {
  if (!urlOrKey) return false;
  return Boolean(
    urlOrKey.includes(".amazonaws.com/") ||
      (!urlOrKey.startsWith("http://") &&
        !urlOrKey.startsWith("https://") &&
        !urlOrKey.startsWith("/") &&
        urlOrKey.includes("/")),
  );
}

/**
 * Checks if a string represents a local filesystem storage path.
 */
export function isLocalPath(urlOrKey?: string | null): boolean {
  if (!urlOrKey) return false;
  return (
    urlOrKey.startsWith("/storage/") ||
    urlOrKey.startsWith("storage/") ||
    urlOrKey.startsWith("/uploads/")
  );
}

/**
 * Fetches S3 object metadata using HeadObjectCommand.
 * Returns metadata dictionary with lowercased keys, or null if object not found or S3 not configured.
 */
export async function getS3ObjectMetadata(
  key: string,
): Promise<Record<string, string> | null> {
  const config = getS3Config();
  const client = getS3Client();

  if (!client || !config.hasCredentials) {
    return null;
  }

  try {
    const data = await client.send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      }),
    );

    const rawMeta = (data.Metadata as Record<string, string>) || {};
    const normalized: Record<string, string> = {};

    for (const [k, v] of Object.entries(rawMeta)) {
      normalized[k.toLowerCase()] = v;
    }

    return normalized;
  } catch (err: any) {
    if (
      err.name === "NotFound" ||
      err.name === "NoSuchKey" ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }
    console.warn(`[S3 HEAD OBJECT WARNING]: Could not retrieve metadata for key '${key}':`, err.message || err);
    return null;
  }
}

