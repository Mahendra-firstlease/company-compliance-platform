import { prisma } from "@/lib/prisma";
import { extractS3Key, getS3ObjectMetadata } from "@/lib/s3";
import path from "path";

export interface DocumentAuthResult {
  authorized: boolean;
  reason?: string;
  document?: any;
  certificate?: any;
  applicationId?: string;
}

export interface VerifyDocumentAccessParams {
  userId: string;
  userRole: string;
  fileUrl?: string | null;
  key?: string | null;
  documentId?: string | null;
}

/**
 * Server-side authorization check for document viewing, downloading, and deletion.
 * Verifies that the requesting user owns the document, is the assigned executive,
 * owns the associated application, or has verified ADMIN privileges.
 */
export async function verifyDocumentAccess({
  userId,
  userRole,
  fileUrl,
  key,
  documentId,
}: VerifyDocumentAccessParams): Promise<DocumentAuthResult> {
  // 1. Administrators have platform-wide access
  if (userRole === "ADMIN") {
    return { authorized: true, reason: "ADMIN" };
  }

  // 2. Resolve identifiers
  const s3Key = extractS3Key(key || fileUrl);
  const baseName = path.basename((key || fileUrl || "").split("?")[0]);

  try {
    // 3. Check direct Document ID if provided
    if (documentId && (prisma as any).document) {
      const doc = await (prisma as any).document.findUnique({
        where: { id: documentId },
        include: {
          application: {
            select: { id: true, userId: true, assignedExecutiveId: true },
          },
        },
      });

      if (doc) {
        const isOwner =
          doc.userId === userId ||
          doc.application?.userId === userId ||
          doc.application?.assignedExecutiveId === userId;

        return isOwner
          ? { authorized: true, document: doc }
          : { authorized: false, reason: "FORBIDDEN" };
      }
    }

    // 4. Check Document record matching fileUrl, S3 key, or filename
    if ((s3Key || baseName || fileUrl) && (prisma as any).document) {
      const searchConditions: any[] = [];
      if (s3Key) searchConditions.push({ fileUrl: { contains: s3Key } });
      if (baseName && baseName !== ".") {
        searchConditions.push({ fileUrl: { contains: baseName } });
        searchConditions.push({ fileName: baseName });
      }
      if (fileUrl) searchConditions.push({ fileUrl });
      if (key) searchConditions.push({ fileUrl: { contains: key } });

      const doc = await (prisma as any).document.findFirst({
        where: { OR: searchConditions },
        include: {
          application: {
            select: { id: true, userId: true, assignedExecutiveId: true },
          },
        },
      });

      if (doc) {
        const isOwner =
          doc.userId === userId ||
          doc.application?.userId === userId ||
          doc.application?.assignedExecutiveId === userId;

        return isOwner
          ? { authorized: true, document: doc }
          : { authorized: false, reason: "FORBIDDEN" };
      }
    }

    // 5. Check IssuedCertificate record matching certificateUrl or S3 key
    if ((s3Key || baseName || fileUrl) && (prisma as any).issuedCertificate) {
      const certConditions: any[] = [];
      if (s3Key) certConditions.push({ certificateUrl: { contains: s3Key } });
      if (baseName && baseName !== ".") {
        certConditions.push({ certificateUrl: { contains: baseName } });
      }
      if (fileUrl) certConditions.push({ certificateUrl: fileUrl });
      if (key) certConditions.push({ certificateUrl: { contains: key } });

      const cert = await (prisma as any).issuedCertificate.findFirst({
        where: { OR: certConditions },
        include: {
          application: {
            select: { id: true, userId: true, assignedExecutiveId: true },
          },
        },
      });

      if (cert) {
        const isOwner =
          cert.userId === userId ||
          cert.application?.userId === userId ||
          cert.application?.assignedExecutiveId === userId;

        return isOwner
          ? { authorized: true, certificate: cert }
          : { authorized: false, reason: "FORBIDDEN" };
      }
    }

    // 6. Check Application formData uploads for user-owned applications
    if ((s3Key || baseName) && (prisma as any).application) {
      const userApplications = await (prisma as any).application.findMany({
        where: { userId },
        select: { id: true, formData: true },
      });

      const userOwnsUpload = userApplications.some((app: any) => {
        const serialized = JSON.stringify(app.formData || {});
        return (
          (s3Key && serialized.includes(s3Key)) ||
          (baseName && baseName !== "." && serialized.includes(baseName))
        );
      });

      if (userOwnsUpload) {
        return { authorized: true, reason: "APPLICATION_OWNER" };
      }

      // Explicitly deny if file belongs to another user's application
      const otherApplications = await (prisma as any).application.findMany({
        where: { userId: { not: userId } },
        select: { id: true, formData: true },
        take: 100,
      });

      const anotherUserOwnsUpload = otherApplications.some((app: any) => {
        const serialized = JSON.stringify(app.formData || {});
        return (
          (s3Key && serialized.includes(s3Key)) ||
          (baseName && baseName !== "." && serialized.includes(baseName))
        );
      });

      if (anotherUserOwnsUpload) {
        return { authorized: false, reason: "FORBIDDEN" };
      }
    }
  } catch (err: any) {
    console.warn("[DOCUMENT AUTH DATABASE WARNING]:", err.message || err);
  }

  // 7. Check S3 object metadata for unlinked / in-progress uploads
  if (s3Key) {
    const metadata = await getS3ObjectMetadata(s3Key);
    if (metadata) {
      const uploader = metadata.uploadedby || metadata.uploadedBy;
      if (uploader) {
        return uploader === userId
          ? { authorized: true, reason: "S3_UPLOAD_OWNER" }
          : { authorized: false, reason: "FORBIDDEN" };
      }
    }
  }

  // 8. If ownership cannot be established, deny access
  return { authorized: false, reason: "UNVERIFIED_OWNERSHIP" };
}

