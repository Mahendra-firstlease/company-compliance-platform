import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/s3/presigned";

/**
 * Server-Side Proxy Download Route for Next.js
 *
 * Features:
 * - Supports S3 object keys or direct URLs
 * - Generates presigned URLs for private S3 objects
 * - Downloads the file server-side (avoids browser CORS issues)
 * - Forces browser download with Content-Disposition
 * - Returns proper HTTP errors instead of a mock PDF
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const rawFileUrl =
    searchParams.get("url") || searchParams.get("fileUrl");
  const rawKey = searchParams.get("key");
  const rawFilename =
    searchParams.get("filename") || searchParams.get("name");

  const disposition =
    searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  const fileUrl = rawFileUrl
    ? decodeURIComponent(rawFileUrl)
    : null;

  const keyParam = rawKey
    ? decodeURIComponent(rawKey)
    : null;

  if (!fileUrl && !keyParam) {
    return NextResponse.json(
      {
        error: "Missing required 'url' or 'key' parameter.",
      },
      {
        status: 400,
      }
    );
  }

  // Generate safe filename
  const cleanFilename = (
    rawFilename ||
    keyParam?.split("/").pop() ||
    fileUrl?.split("/").pop() ||
    "download"
  )
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .trim();

  const finalFilename =
    cleanFilename.length > 0 ? cleanFilename : "download";

  let targetUrl = fileUrl;

  // Extract S3 key if URL belongs to S3
  const s3Key =
    keyParam ||
    (fileUrl?.includes(".amazonaws.com/")
      ? fileUrl
          .split(".amazonaws.com/")[1]
          ?.split("?")[0]
      : null);

  // Generate presigned URL
  if (s3Key) {
    try {
      const presigned = await getPresignedDownloadUrl(
        s3Key,
        60 * 60
      );

      if (!presigned) {
        return NextResponse.json(
          {
            error: "Unable to generate S3 download URL.",
          },
          {
            status: 404,
          }
        );
      }

      targetUrl = presigned.startsWith("http")
        ? presigned
        : new URL(presigned, req.url).toString();
    } catch (error) {
      console.error(
        "[Download Proxy] Failed to generate presigned URL:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to generate download URL.",
        },
        {
          status: 500,
        }
      );
    }
  }

  // Convert relative URL to absolute URL
  if (
    targetUrl &&
    !targetUrl.startsWith("http") &&
    targetUrl.startsWith("/")
  ) {
    targetUrl = new URL(targetUrl, req.url).toString();
  }

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return NextResponse.json(
      {
        error: "Invalid download URL.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Remote server responded with ${response.status}.`,
        },
        {
          status: response.status,
        }
      );
    }

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const contentLength =
      response.headers.get("content-length");

    const body = response.body;

    if (!body) {
      return NextResponse.json(
        {
          error: "Downloaded file is empty.",
        },
        {
          status: 502,
        }
      );
    }

    const headers = new Headers();

    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${encodeURIComponent(
        finalFilename
      )}"`
    );
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "private, no-store");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Download Proxy] Download failed:", error);

    return NextResponse.json(
      {
        error: "Failed to download the requested file.",
      },
      {
        status: 502,
      }
    );
  }
}