import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const resolvedParams = await params;
    const docId = resolvedParams.id;
    const userId = (session.user as any).id as string;
    const userRole = (session.user as any).role as string;

    if (!docId) {
      return NextResponse.json({ error: "Document ID missing." }, { status: 400 });
    }

    // 1. Fetch Document from Database
    let documentRecord = null;
    if ((prisma as any).document) {
      documentRecord = await (prisma as any).document.findUnique({
        where: { id: docId },
      });
    }

    if (!documentRecord) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // 2. Authorization Check: Document must belong to user OR user must be ADMIN
    if (documentRecord.userId !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Access denied to document." }, { status: 403 });
    }

    // 3. Resolve File Path (Private storage directory outside /public)
    const fileUrl = documentRecord.fileUrl;
    let filePath = "";

    if (fileUrl.startsWith("/storage/")) {
      filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ""));
    } else if (fileUrl.startsWith("/uploads/")) {
      // Legacy fallback
      filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
    } else if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      // Remote S3 URL redirect
      return NextResponse.redirect(fileUrl);
    } else {
      filePath = path.join(process.cwd(), "storage", "documents", fileUrl);
    }

    const fileExists = await fs.stat(filePath).catch(() => null);
    if (!fileExists) {
      return NextResponse.json({ error: "File binary payload missing from storage." }, { status: 404 });
    }

    // 4. Read File & Return Authenticated Stream
    const buffer = await fs.readFile(filePath);

    const fileExt = (documentRecord.fileName || "").split(".").pop()?.toLowerCase() || "";
    let contentType = "application/octet-stream";
    if (fileExt === "pdf") contentType = "application/pdf";
    if (fileExt === "png") contentType = "image/png";
    if (fileExt === "jpg" || fileExt === "jpeg") contentType = "image/jpeg";
    if (fileExt === "webp") contentType = "image/webp";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${documentRecord.fileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[AUTHENTICATED DOCUMENT STREAM ERROR]:", err);
    return NextResponse.json({ error: "Internal server error reading document." }, { status: 500 });
  }
}
