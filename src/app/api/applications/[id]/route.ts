import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { updateApplicationSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";
import { formatApplicationDocuments } from "@/lib/applications";
import { sendApplicationNotification } from "@/lib/notifications-dispatcher";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        assignedExecutive: true,
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
        },
      });
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...application,
      query: application.queryText || undefined,
      assignedExecutive: application.assignedExecutive?.name || application.assignedExecutiveId || undefined,
      uploadedDocs: formatApplicationDocuments(application.documents),
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch application by ID.");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`patch_app:${ip}`, RATE_LIMIT_CONFIGS.userApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
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

    if (payload.status) updateData.status = payload.status as ApplicationStatus;
    if (payload.customerName) updateData.customerName = payload.customerName;
    if (payload.customerPhone) updateData.customerPhone = payload.customerPhone;
    if (payload.address) updateData.address = payload.address;
    if (payload.formData) updateData.formData = payload.formData;
    if (payload.query !== undefined) updateData.queryText = payload.query;

    if (payload.assignedExecutive !== undefined) {
      if (!payload.assignedExecutive || payload.assignedExecutive === "Unassigned") {
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

    const updatedApp = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        documents: true,
        assignedExecutive: true,
        user: true,
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

    const formatted = {
      ...updatedApp,
      query: updatedApp.queryText || undefined,
      assignedExecutive: updatedApp.assignedExecutive?.name || updatedApp.assignedExecutiveId || undefined,
      uploadedDocs: formatApplicationDocuments(updatedApp.documents),
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update application.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to delete application.");
  }
}
