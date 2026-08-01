import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import {
  sanitizeFilename,
  validateUploadMetadata,
  verifyMagicBytes,
  calculateChecksum,
  cleanupUploadedFile,
} from "@/lib/upload";
import { uploadToS3Storage, deleteFromS3Storage } from "@/lib/s3";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  let createdFilePath: string | null = null;

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const userRole = (session.user as any).role as string;
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const docName = (formData.get("docName") as string) || "Verification Attachment";
    const applicationId = formData.get("applicationId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file attached in request payload." }, { status: 400 });
    }

    // 1. Verify Application Ownership & Existence if applicationId provided
    if (applicationId) {
      let appCase = null;
      if ((prisma as any).applicationCase) {
        appCase = await (prisma as any).applicationCase.findUnique({
          where: { id: applicationId },
          select: { id: true, userId: true },
        });
      }

      if (!appCase) {
        return NextResponse.json(
          { error: `Filing application ID '${applicationId}' not found.` },
          { status: 404 }
        );
      }

      if (appCase.userId !== userId && userRole !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden. You do not own this application case." },
          { status: 403 }
        );
      }
    }

    // 2. Metadata Validation (Extension & Size)
    const sanitized = sanitizeFilename(file.name);
    const metaCheck = validateUploadMetadata(sanitized, file.size, {
      allowedExtensions: ["pdf", "png", "jpg", "jpeg", "webp"],
      maxSizeMb: 5,
    });
    if (!metaCheck.isValid) {
      return NextResponse.json({ error: metaCheck.error || "Invalid file format or size." }, { status: 400 });
    }

    // 3. Verify Magic Bytes & Calculate SHA-256 Checksum
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(sanitized).replace(".", "").toLowerCase();
    const magicCheck = verifyMagicBytes(buffer, ext);
    if (!magicCheck.isValid) {
      return NextResponse.json({ error: magicCheck.error || "File signature verification failed." }, { status: 400 });
    }

    const checksum = calculateChecksum(buffer);

    // 4. Save to Private Storage (Outside /public) or S3 Storage via AWS SDK PutObjectCommand
    const s3Result = await uploadToS3Storage(file, "compliance-documents", {
      uploadedBy: userId,
      applicationId: applicationId || "unassigned",
      checksum,
    });

    if (s3Result.isMock) {
      const privateDir = path.join(process.cwd(), "storage", "documents");
      await fs.mkdir(privateDir, { recursive: true });

      const localFileName = `${Date.now()}_${s3Result.fileName}`;
      const filePath = path.join(privateDir, localFileName);
      createdFilePath = filePath;

      await fs.writeFile(filePath, buffer);
      s3Result.fileUrl = `/storage/documents/${localFileName}`;
    }

    // 5. Create Document Record with PENDING_REVIEW Status
    let dbDocument = null;
    try {
      if (applicationId && (prisma as any).document) {
        dbDocument = await (prisma as any).document.create({
          data: {
            applicationId,
            userId,
            docName,
            fileName: s3Result.fileName,
            fileUrl: s3Result.fileUrl,
            fileSize: s3Result.fileSize,
            fileType: s3Result.fileType,
            status: "PENDING_REVIEW",
          },
        });

        // Send alert notification to Admins
        try {
          const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
          for (const adm of adminUsers) {
            if ((prisma as any).notification) {
              await (prisma as any).notification.create({
                data: {
                  userId: adm.id,
                  title: "New Document Pending Review",
                  message: `${docName} (${s3Result.fileName}) uploaded for application ${applicationId}.`,
                  type: "INFO",
                  link: `/admin/applications/${applicationId}`,
                },
              });
            }
          }
        } catch (nErr) {
          console.warn("Admin notification deferred:", nErr);
        }
      }
    } catch (dbErr) {
      // Rollback local disk or S3 file on database insertion failure!
      if (createdFilePath) {
        await cleanupUploadedFile(createdFilePath);
      }
      if (!s3Result.isMock && s3Result.key) {
        deleteFromS3Storage(s3Result.key).catch(() => {});
      }
      throw dbErr;
    }

    return NextResponse.json(
      {
        success: true,
        fileUrl: s3Result.fileUrl,
        fileName: s3Result.fileName,
        fileSizeBytes: s3Result.fileSizeBytes,
        fileSize: s3Result.fileSize,
        fileType: s3Result.fileType,
        checksum,
        documentId: dbDocument?.id || null,
        status: "PENDING_REVIEW",
      },
      { status: 201 }
    );
  } catch (error) {
    if (createdFilePath) {
      await cleanupUploadedFile(createdFilePath);
    }
    return handleApiError(error, "Failed to process document upload.");
  }
}
