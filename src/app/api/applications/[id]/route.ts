import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { updateApplicationSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";
import {
  extractUploadedDocuments,
  formatApplicationDocuments,
  formatStoredUploadMetadata,
  mergeUploadedDocuments,
} from "@/lib/applications";
import { sendApplicationNotification } from "@/lib/notifications-dispatcher";
import {
  DocVerificationMap,
  getWorkflowBlockers,
} from "@/lib/application-workflow";
import { deleteFromS3Storage, extractS3Key } from "@/lib/s3";
import { cleanupUploadedFile } from "@/lib/upload";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    let application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        assignedExecutive: true,
        certificates: true,
      },
    });

    // Fallback: search by serviceSlug if ID lookup returns null
    if (!application) {
      application = await prisma.application.findFirst({
        where: { serviceSlug: id },
        orderBy: { createdAt: "desc" },
        include: {
          documents: true,
          assignedExecutive: true,
          certificates: true,
        },
      });
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Ownership & authorization guard: user must be owner or staff
    const currentUserId = (session.user as any)?.id;
    const currentUserRole = (session.user as any)?.role;
    const isStaff = currentUserRole === "ADMIN";
    const isOwner = application.userId === currentUserId;

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this application." },
        { status: 403 }
      );
    }

    const formDataObj = (application.formData as Record<string, any>) || {};
    const formatted = {
      ...application,
      query: application.queryText || undefined,
      queryResponse: formDataObj._queryResponse || undefined,
      queryStatus:
        formDataObj._queryStatus ||
        (application.queryText ? "QUERY_RAISED" : "RESOLVED"),
      clientResponseFiles: formDataObj._clientResponseFiles || [],
      queryHistory: formDataObj._queryHistory || [],
      assignedExecutive:
        application.assignedExecutive?.name ||
        application.assignedExecutiveId ||
        undefined,
      issuedCertificates: (application.certificates || []).map(
        (certificate) => ({
          id: certificate.id,
          applicationId: certificate.applicationId,
          userId: certificate.userId,
          certificateName: certificate.certificateName,
          certificateUrl: certificate.certificateUrl,
          issuedDate: certificate.issuedDate.toISOString(),
        }),
      ),
uploadedDocs: mergeUploadedDocuments(
        formatStoredUploadMetadata(extractUploadedDocuments(formDataObj)),
        formatApplicationDocuments(
          application.documents,
          new Set((application.certificates || []).map((c) => c.certificateUrl).filter(Boolean)),
        ),
        new Set((application.certificates || []).map((c) => c.certificateUrl).filter(Boolean)),
      ),
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch application by ID.");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(
      `patch_app:${ip}`,
      RATE_LIMIT_CONFIGS.userApi,
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validation = updateApplicationSchema.safeParse(body);
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const payload = validation.data;
    const updateData: any = {};

    const existingApplication = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        certificates: true,
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Ownership & authorization guard: user must be owner or staff
    const currentUserId = (session.user as any)?.id;
    const currentUserRole = (session.user as any)?.role;
    const isStaff = currentUserRole === "ADMIN";
    const isOwner = existingApplication.userId === currentUserId;

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to modify this application." },
        { status: 403 }
      );
    }

    if (payload.status) {
      const isStatusUnchanged = payload.status === existingApplication.status;

      const isClientAllowedTransition =
        !isStaff &&
        isOwner &&
        (isStatusUnchanged ||
          (payload.status === "UNDER_REVIEW" &&
            (existingApplication.status === "PAYMENT_CONFIRMED" ||
              existingApplication.status === "DOCUMENTS_PENDING" ||
              existingApplication.status === "UNDER_REVIEW" ||
              Boolean(existingApplication.queryText) ||
              payload.queryStatus === "CLIENT_RESPONDED")));

      if (!isStaff && !isClientAllowedTransition) {
        return NextResponse.json(
          { error: "Forbidden: Only compliance staff can update application filing status." },
          { status: 403 }
        );
      }

      const existingFormData =
        (existingApplication.formData as Record<string, unknown>) || {};
      const mergedFormData = {
        ...existingFormData,
        ...((payload.formData || {}) as Record<string, unknown>),
      };
      const existingCertUrls = new Set(
        (existingApplication.certificates || []).map((c: any) => c.certificateUrl).filter(Boolean),
      );
      const uploadedDocs = mergeUploadedDocuments(
        formatStoredUploadMetadata(extractUploadedDocuments(mergedFormData)),
        formatApplicationDocuments(existingApplication.documents, existingCertUrls),
        existingCertUrls,
      );
      const docVerifications =
        (mergedFormData._docVerification as DocVerificationMap) || {};

      const blockers = getWorkflowBlockers({
        currentStatus: existingApplication.status,
        targetStatus: payload.status as ApplicationStatus,
        formData: mergedFormData,
        uploadedDocs,
        docVerifications,
        hasActiveQuery: Boolean(
          payload.query !== undefined
            ? payload.query
            : existingApplication.queryText,
        ),
      });

      if (blockers.length > 0) {
        return NextResponse.json(
          {
            error: "Status advancement blocked by statutory requirements.",
            blockers,
          },
          { status: 400 },
        );
      }

      updateData.status = payload.status as ApplicationStatus;
    }

    if (payload.customerName) updateData.customerName = payload.customerName;
    if (payload.customerPhone) updateData.customerPhone = payload.customerPhone;
    if (payload.address) updateData.address = payload.address;

    if (payload.query !== undefined) {
      updateData.queryText = payload.query;
    }

    if (payload.assignedExecutive !== undefined) {
      // Only staff can reassign executives
      if (!isStaff) {
        return NextResponse.json(
          { error: "Forbidden: Only staff can reassign executives." },
          { status: 403 }
        );
      }

      if (
        !payload.assignedExecutive ||
        payload.assignedExecutive === "Unassigned"
      ) {
        updateData.assignedExecutiveId = null;
      } else {
        const cleanName = payload.assignedExecutive.split(",")[0].trim();
        const slugName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const execEmail = `${slugName}@complianceportalindia.com`;

        // Atomically upsert executive user to prevent concurrency duplicate key exceptions
        const execUser = await prisma.user.upsert({
          where: { email: execEmail },
          update: { name: cleanName },
          create: {
            id: `exec_${slugName}_${Date.now()}`,
            name: cleanName,
            email: execEmail,
            role: "ADMIN",
          },
        });

        updateData.assignedExecutiveId = execUser.id;
      }
    }

    if (payload.formData) {
      const existingFormData =
        (existingApplication.formData as Record<string, any>) || {};
      const currentForm = (payload.formData || {}) as Record<string, any>;
      updateData.formData = {
        ...existingFormData,
        ...currentForm,
        ...(payload.formData._uploadedDocs
          ? { _uploadedDocs: payload.formData._uploadedDocs }
          : {}),
      };
    }

    const uploadedDocs = (payload.formData?._uploadedDocs || {}) as Record<
      string,
      {
        name?: unknown;
        size?: unknown;
        type?: unknown;
        url?: unknown;
      }
    >;

    const existingDocuments = await prisma.document.findMany({
      where: { applicationId: id },
      select: {
        fileUrl: true,
      },
    });

    const existingUrls = new Set(
      existingDocuments.map((document) => document.fileUrl),
    );

    const documentsToCreate = Object.entries(uploadedDocs).flatMap(
      ([docName, file]) => {
        if (
          typeof file?.name !== "string" ||
          typeof file?.url !== "string" ||
          !file.url ||
          file.url.startsWith("blob:") ||
          existingUrls.has(file.url)
        ) {
          return [];
        }

        existingUrls.add(file.url);
        return [
          {
            userId: existingApplication.userId,
            docName,
            fileName: file.name,
            fileUrl: file.url,
            fileSize: String(file.size || "Unknown"),
            fileType: typeof file.type === "string" ? file.type : "Document",
            status: "PENDING_REVIEW",
          },
        ];
      },
    );

    if (
      payload.issuedCertificates &&
      Array.isArray(payload.issuedCertificates) &&
      payload.issuedCertificates.length > 0
    ) {
      if (isStaff) {
        const existingCerts = await prisma.issuedCertificate.findMany({
          where: { applicationId: id },
          select: { certificateUrl: true },
        });
        const existingCertUrls = new Set(
          existingCerts.map((c) => c.certificateUrl),
        );

        for (const cert of payload.issuedCertificates) {
          const certName = cert.certificateName || cert.name;
          const certUrl = cert.certificateUrl || cert.url;
          if (certName && certUrl && !existingCertUrls.has(certUrl)) {
            await prisma.issuedCertificate.create({
              data: {
                applicationId: id,
                userId: existingApplication.userId,
                certificateName: certName,
                certificateUrl: certUrl,
              },
            });
            existingCertUrls.add(certUrl);
          }
        }
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        ...updateData,
        ...(documentsToCreate.length > 0
          ? { documents: { create: documentsToCreate } }
          : {}),
      },
      include: {
        documents: true,
        assignedExecutive: true,
        user: true,
        certificates: true,
      },
    });

    // Invoke Notification Dispatcher for status changes or query alerts
    if (payload.query) {
      await sendApplicationNotification({
        applicationId: updatedApp.id,
        serviceTitle: updatedApp.serviceTitle,
        customerName: updatedApp.customerName,
        customerPhone: updatedApp.customerPhone,
        userEmail: updatedApp.user?.email || undefined,
        type: "QUERY_RAISED",
        queryText: payload.query,
      });
    } else if (payload.queryStatus === "CLIENT_RESPONDED") {
      await sendApplicationNotification({
        applicationId: updatedApp.id,
        serviceTitle: updatedApp.serviceTitle,
        customerName: updatedApp.customerName,
        customerPhone: updatedApp.customerPhone,
        userEmail: updatedApp.user?.email || undefined,
        type: "QUERY_RESPONDED",
        clientReply: payload.queryResponse,
      });
    } else if (payload.status === "APPROVED") {
      await sendApplicationNotification({
        applicationId: updatedApp.id,
        serviceTitle: updatedApp.serviceTitle,
        customerName: updatedApp.customerName,
        customerPhone: updatedApp.customerPhone,
        userEmail: updatedApp.user?.email || undefined,
        type: "APPROVED",
        newStatus: "APPROVED",
      });
    } else if (payload.status) {
      await sendApplicationNotification({
        applicationId: updatedApp.id,
        serviceTitle: updatedApp.serviceTitle,
        customerName: updatedApp.customerName,
        customerPhone: updatedApp.customerPhone,
        userEmail: updatedApp.user?.email || undefined,
        type: "STATUS_CHANGE",
        newStatus: payload.status as ApplicationStatus,
      });
    }

    const updatedFormDataObj =
      (updatedApp.formData as Record<string, any>) || {};
    const issuedCertificates = Array.isArray(
      (
        updatedApp as {
          certificates?: Array<{
            id: string;
            applicationId: string;
            userId: string;
            certificateName: string;
            certificateUrl: string;
            issuedDate: Date;
          }>;
        }
      ).certificates,
    )
      ? (
          updatedApp as {
            certificates?: Array<{
              id: string;
              applicationId: string;
              userId: string;
              certificateName: string;
              certificateUrl: string;
              issuedDate: Date;
            }>;
          }
        ).certificates!.map((certificate) => ({
          id: certificate.id,
          applicationId: certificate.applicationId,
          userId: certificate.userId,
          certificateName: certificate.certificateName,
          certificateUrl: certificate.certificateUrl,
          issuedDate: certificate.issuedDate.toISOString(),
        }))
      : [];
    const formatted = {
      ...updatedApp,
      query: updatedApp.queryText || undefined,
      queryResponse: updatedFormDataObj._queryResponse || undefined,
      queryStatus:
        updatedFormDataObj._queryStatus ||
        (updatedApp.queryText ? "QUERY_RAISED" : "RESOLVED"),
      clientResponseFiles: updatedFormDataObj._clientResponseFiles || [],
      queryHistory: updatedFormDataObj._queryHistory || [],
      assignedExecutive:
        updatedApp.assignedExecutive?.name ||
        updatedApp.assignedExecutiveId ||
        undefined,
      issuedCertificates,
      uploadedDocs: mergeUploadedDocuments(
        formatStoredUploadMetadata(extractUploadedDocuments(updatedFormDataObj)),
        formatApplicationDocuments(
          updatedApp.documents,
          new Set(issuedCertificates.map((c: any) => c.certificateUrl || c.url).filter(Boolean)),
        ),
        new Set(issuedCertificates.map((c: any) => c.certificateUrl || c.url).filter(Boolean)),
      ),
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update application.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required to delete applications." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 1. Fetch application with all associated documents and certificates before deletion
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        certificates: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    // 2. Collect all S3 keys and local file paths to clean up
    const s3KeysToDelete = new Set<string>();
    const localFilesToDelete = new Set<string>();

    const recordFileUrl = (url?: string | null) => {
      if (!url) return;
      const s3Key = extractS3Key(url);
      if (s3Key) {
        s3KeysToDelete.add(s3Key);
      }
      if (url.startsWith("/storage/") || url.startsWith("storage/")) {
        const cleanSub = url.replace(/^\/?storage\//, "");
        const safeSub = path.normalize(cleanSub).replace(/^(\.\.[\/\\])+/, "");
        localFilesToDelete.add(path.resolve(process.cwd(), "storage", safeSub));
      }
    };

    // Documents
    application.documents.forEach((doc) => recordFileUrl(doc.fileUrl));

    // Certificates
    application.certificates.forEach((cert) => recordFileUrl(cert.certificateUrl));

    // Stored formData uploads
    const storedUploads = extractUploadedDocuments((application.formData as Record<string, unknown>) || {});
    Object.values(storedUploads).forEach((file: any) => {
      if (file?.url) recordFileUrl(file.url);
      if (file?.key) s3KeysToDelete.add(file.key);
      if (file?.front?.url) recordFileUrl(file.front.url);
      if (file?.back?.url) recordFileUrl(file.back.url);
    });

    // 3. Delete application in database (cascades Document relations in MySQL)
    await prisma.application.delete({
      where: { id },
    });

    // 4. Clean up S3 objects and local storage files with error tracking
    const s3Results: { key: string; success: boolean }[] = [];
    for (const key of s3KeysToDelete) {
      try {
        const ok = await deleteFromS3Storage(key);
        s3Results.push({ key, success: ok });
      } catch (s3Err) {
        console.error(`[APPLICATION S3 CLEANUP ERROR] Failed to delete S3 key ${key}:`, s3Err);
        s3Results.push({ key, success: false });
      }
    }

    for (const localPath of localFilesToDelete) {
      await cleanupUploadedFile(localPath);
    }

    const cleanedCount = s3Results.filter((r) => r.success).length;
    const failedCount = s3Results.filter((r) => !r.success).length;

    console.log(`[APPLICATION DELETION COMPLETE]: App ${id} deleted. Cleaned ${cleanedCount} S3 files, ${failedCount} failed.`);

    return NextResponse.json(
      {
        message: "Application deleted successfully",
        cleanedS3Files: cleanedCount,
        failedS3Files: failedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete application.");
  }
}
