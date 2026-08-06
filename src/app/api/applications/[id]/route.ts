import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { updateApplicationSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";
import {
  extractUploadedDocuments,
  formatApplicationDocuments,
  formatStoredUploadMetadata,
} from "@/lib/applications";
import { sendApplicationNotification } from "@/lib/notifications-dispatcher";
import {
  DocVerificationMap,
  getWorkflowBlockers,
} from "@/lib/application-workflow";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
      uploadedDocs: {
        ...formatStoredUploadMetadata(extractUploadedDocuments(formDataObj)),
        ...formatApplicationDocuments(application.documents),
      },
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
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (payload.status) {
      const existingFormData =
        (existingApplication.formData as Record<string, unknown>) || {};
      const mergedFormData = {
        ...existingFormData,
        ...((payload.formData || {}) as Record<string, unknown>),
      };
      const uploadedDocs = {
        ...formatStoredUploadMetadata(
          extractUploadedDocuments(mergedFormData),
        ),
        ...formatApplicationDocuments(existingApplication.documents),
      };
      const docVerifications =
        (mergedFormData._docVerification as DocVerificationMap) || {};

      const blockers = getWorkflowBlockers({
        currentStatus: existingApplication.status,
        targetStatus: payload.status,
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
        return NextResponse.json({ error: blockers[0] }, { status: 400 });
      }
    }

    if (payload.status) updateData.status = payload.status as ApplicationStatus;
    if (payload.customerName) updateData.customerName = payload.customerName;
    if (payload.customerPhone) updateData.customerPhone = payload.customerPhone;
    if (payload.address) updateData.address = payload.address;
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
    if (payload.query !== undefined) updateData.queryText = payload.query;

    // Merge query workflow metadata into formData object
    if (
      payload.queryResponse !== undefined ||
      payload.queryStatus !== undefined ||
      payload.clientResponseFiles !== undefined ||
      payload.queryHistory !== undefined
    ) {
      const existingApp = await prisma.application.findUnique({
        where: { id },
      });
      const currentForm = (payload.formData ||
        existingApp?.formData ||
        {}) as Record<string, any>;
      updateData.formData = {
        ...currentForm,
        ...(payload.queryResponse !== undefined && {
          _queryResponse: payload.queryResponse,
        }),
        ...(payload.queryStatus !== undefined && {
          _queryStatus: payload.queryStatus,
        }),
        ...(payload.clientResponseFiles !== undefined && {
          _clientResponseFiles: payload.clientResponseFiles,
        }),
        ...(payload.queryHistory !== undefined && {
          _queryHistory: payload.queryHistory,
        }),
      };
    }

    if (payload.assignedExecutive !== undefined) {
      if (
        !payload.assignedExecutive ||
        payload.assignedExecutive === "Unassigned"
      ) {
        updateData.assignedExecutiveId = null;
      } else {
        const cleanName = payload.assignedExecutive.split(",")[0].trim();
        const slugName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const execEmail = `${slugName}@firstlease.com`;

        // Atomically upsert executive user to prevent concurrency duplicate key exceptions
        const execUser = await prisma.user.upsert({
          where: { email: execEmail },
          update: { name: cleanName },
          create: {
            id: `exec_${slugName}_${Date.now()}`,
            name: cleanName,
            email: execEmail,
            role: "EXECUTIVE",
          },
        });

        updateData.assignedExecutiveId = execUser.id;
      }
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

    // Persist issued certificates to IssuedCertificate database table
    if (
      payload.issuedCertificates &&
      Array.isArray(payload.issuedCertificates) &&
      payload.issuedCertificates.length > 0
    ) {
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

    console.log(
  JSON.stringify(
    {
      documentsToCreate,
    },
    null,
    2
  )
);

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
      uploadedDocs: {
        ...formatStoredUploadMetadata(
          extractUploadedDocuments(updatedFormDataObj),
        ),
        ...formatApplicationDocuments(updatedApp.documents),
      },
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
    const { id } = await params;

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete application.");
  }
}
