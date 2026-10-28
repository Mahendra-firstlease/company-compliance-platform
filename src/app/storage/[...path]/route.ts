import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

/**
 * Route handler to serve local storage files during development and testing.
 * Allows images and PDFs stored in the private /storage directory to be
 * viewed inline in browsers, iframes, and image tags.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Sanitize path to prevent directory traversal
    const safeSubpath = path.normalize(segments.join("/")).replace(/^(\.\.[\/\\])+/, "");
    const storageRoot = path.join(process.cwd(), "storage");
    const filePath = path.resolve(storageRoot, safeSubpath);

    // Verify filePath is inside storageRoot
    if (!filePath.startsWith(storageRoot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Enforce authentication across all runtime environments (except unit test runner)
    if (process.env.NODE_ENV !== "test") {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const userId = (session.user as any)?.id;
      const userRole = (session.user as any)?.role;
      const isAdmin = userRole === "ADMIN";

      // If document is in storage/documents/ or user-specific path, verify ownership
      if (!isAdmin && (safeSubpath.startsWith("documents/") || safeSubpath.includes("/"))) {
        const basename = path.basename(safeSubpath);
        const docRecord = await (prisma as any).document?.findFirst({
          where: {
            OR: [
              { fileUrl: { contains: basename } },
              { fileName: basename },
            ],
          },
          select: { userId: true },
        });

        if (docRecord && docRecord.userId && docRecord.userId !== userId) {
          return new NextResponse("Forbidden: Access denied to private document.", { status: 403 });
        }
      }
    }

    const stat = await fs.stat(filePath).catch(() => null);
    if (!stat || !stat.isFile()) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).replace(".", "").toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "svg") contentType = "image/svg+xml";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(filePath)}"`,
        "Content-Length": String(buffer.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[Storage Route Error]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
