import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl } from "@/lib/s3/presigned";
import { extractS3Key } from "@/lib/s3/keys";
import { verifyDocumentAccess } from "@/lib/auth/document-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

function isDisallowedInternalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "[::1]" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  const ipv4 = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local & AWS metadata 169.254.169.254
    if (a === 0) return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

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

  let fileUrl = rawFileUrl
    ? decodeURIComponent(rawFileUrl)
    : null;

  // Defensively unwrap nested /api/download proxies to avoid recursive loopbacks
  while (fileUrl && fileUrl.includes("/api/download")) {
    try {
      const dummyBase = "http://localhost";
      const parsed = new URL(fileUrl.startsWith("http") ? fileUrl : `${dummyBase}${fileUrl}`);
      const innerTarget =
        parsed.searchParams.get("url") ||
        parsed.searchParams.get("fileUrl") ||
        parsed.searchParams.get("key");
      if (innerTarget && innerTarget !== fileUrl) {
        fileUrl = decodeURIComponent(innerTarget);
      } else {
        break;
      }
    } catch {
      break;
    }
  }

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

  // Support direct local disk streaming for files in /storage/
  const isLocalPath =
    (fileUrl && (fileUrl.startsWith("/storage/") || fileUrl.startsWith("storage/"))) ||
    (keyParam && (keyParam.startsWith("/storage/") || keyParam.startsWith("storage/")));

  if (fileUrl && !isLocalPath && !keyParam) {
    if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid download URL." },
        { status: 400 }
      );
    }

    try {
      const parsed = new URL(fileUrl);
      const isSelf = new URL(req.url).host === parsed.host;
      if (!isSelf && isDisallowedInternalHost(parsed.hostname)) {
        return NextResponse.json(
          { error: "Access to private or internal addresses is disallowed." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid download URL." },
        { status: 400 }
      );
    }
  }

  const userId = (session.user as any)?.id as string;
  const userRole = (session.user as any)?.role as string;
  const docId = searchParams.get("id") || searchParams.get("documentId");

  // Enforce server-side object-level authorization
  const authResult = await verifyDocumentAccess({
    userId,
    userRole,
    fileUrl,
    key: keyParam,
    documentId: docId,
  });

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to access this document." },
      { status: 403 }
    );
  }

  let targetUrl = fileUrl;

  if (isLocalPath) {
    const rawPath = fileUrl || keyParam || "";
    const cleanSubpath = rawPath.replace(/^\/?storage\//, "");
    const safeSubpath = path.normalize(cleanSubpath).replace(/^(\.\.[\/\\])+/, "");
    const storageRoot = path.join(process.cwd(), "storage");
    let diskPath = path.resolve(storageRoot, safeSubpath);

    let stat = await fs.stat(diskPath).catch(() => null);
    if (!stat && !safeSubpath.startsWith("documents/")) {
      const fallbackPath = path.join(storageRoot, "documents", path.basename(safeSubpath));
      stat = await fs.stat(fallbackPath).catch(() => null);
      if (stat) diskPath = fallbackPath;
    }

    if (stat && stat.isFile()) {
      const buffer = await fs.readFile(diskPath);
      const ext = path.extname(diskPath).replace(".", "").toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === "pdf") contentType = "application/pdf";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "webp") contentType = "image/webp";

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `${disposition}; filename="${finalFilename}"`,
          "Content-Length": String(buffer.length),
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    return NextResponse.json(
      { error: "Local file not found in storage." },
      { status: 404 }
    );
  }

  // Extract S3 key if URL belongs to S3
  const s3Key =
    keyParam ||
    extractS3Key(fileUrl);

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

      if (presigned.startsWith("/storage/") || presigned.startsWith("storage/")) {
        const rawSub = presigned.replace(/^\/?storage\//, "");
        const safeSub = path.normalize(rawSub).replace(/^(\.\.[\/\\])+/, "");
        const storageRoot = path.join(process.cwd(), "storage");
        let diskPath = path.resolve(storageRoot, safeSub);
        let stat = await fs.stat(diskPath).catch(() => null);
        if (!stat && !safeSub.startsWith("documents/")) {
          const fallbackPath = path.join(storageRoot, "documents", path.basename(safeSub));
          stat = await fs.stat(fallbackPath).catch(() => null);
          if (stat) diskPath = fallbackPath;
        }

        if (stat && stat.isFile()) {
          const buffer = await fs.readFile(diskPath);
          const ext = path.extname(diskPath).replace(".", "").toLowerCase();
          let contentType = "application/octet-stream";
          if (ext === "pdf") contentType = "application/pdf";
          else if (ext === "png") contentType = "image/png";
          else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
          else if (ext === "webp") contentType = "image/webp";

          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `${disposition}; filename="${finalFilename}"`,
              "Content-Length": String(buffer.length),
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
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

  if (!targetUrl || (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"))) {
    return NextResponse.json(
      {
        error: "Invalid download URL.",
      },
      {
        status: 400,
      }
    );
  }

  let parsedTarget: URL;
  try {
    parsedTarget = new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid download URL." },
      { status: 400 }
    );
  }

  // Prevent SSRF: block local loopbacks, link-local, and private subnets
  const isSelf = new URL(req.url).host === parsedTarget.host;
  if (!isSelf && isDisallowedInternalHost(parsedTarget.hostname)) {
    return NextResponse.json(
      { error: "Access to private or internal addresses is disallowed." },
      { status: 403 }
    );
  }

  try {
    // Use manual redirect to inspect redirect destinations and prevent SSRF bypass (Phase 10: A10 Fix)
    let currentUrl = targetUrl;
    let response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    // If redirected, strictly validate the redirect target against internal host blocks
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectLocation = response.headers.get("location");
      if (!redirectLocation) {
        return NextResponse.json(
          { error: "Redirect location missing from remote server response." },
          { status: 502 }
        );
      }

      const nextUrl = new URL(redirectLocation, currentUrl);
      if (isDisallowedInternalHost(nextUrl.hostname)) {
        return NextResponse.json(
          { error: "Access to private or internal addresses via redirect is disallowed." },
          { status: 403 }
        );
      }

      // Execute single validated redirected fetch with manual redirect to prevent chained SSRF
      response = await fetch(nextUrl.toString(), {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
      });
    }

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

    let contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const isPdf =
      finalFilename.toLowerCase().endsWith(".pdf") ||
      (keyParam && keyParam.toLowerCase().endsWith(".pdf")) ||
      (targetUrl && targetUrl.toLowerCase().includes(".pdf"));

    if (isPdf) {
      contentType = "application/pdf";
    } else if (contentType === "application/octet-stream" || !contentType) {
      const ext = finalFilename.split(".").pop()?.toLowerCase();
      if (ext === "png") contentType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "webp") contentType = "image/webp";
    }

    const contentLength =
      response.headers.get("content-length");

    const body = response.body;

    if (!body) {
      return NextResponse.json(
        {
          error: "Downloaded file is empty.",
        },
        {
          status: 500,
        }
      );
    }

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${finalFilename}"`,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Cache-Control": "private, max-age=3600",
        ...(contentLength ? { "Content-Length": contentLength } : {}),
      },
    });
  } catch (error: any) {
    console.error("[Download Proxy Error]:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to download remote file.",
      },
      {
        status: 500,
      }
    );
  }
}
