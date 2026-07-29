import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-response";
import { sendApplicationNotification } from "@/lib/notifications-dispatcher";

export async function POST(request: Request) {
  try {
    // 1. Session & Role Verification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN" && userRole !== "EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: Admin privilege required." }, { status: 403 });
    }

    // 2. Rate Limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`post_admin_cert:${ip}`, RATE_LIMIT_CONFIGS.userApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { applicationId, certificateName, fileUrl, fileName, fileSize, fileType } = body;

    if (!applicationId || !certificateName || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields: applicationId, certificateName, and fileUrl are mandatory." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found for the given ID." },
        { status: 404 }
      );
    }

    const newCertificate = await prisma.issuedCertificate.create({
      data: {
        applicationId: application.id,
        userId: application.userId,
        certificateName: certificateName || `Approved Certificate - ${application.serviceTitle}`,
        certificateUrl: fileUrl,
      },
    });

    await prisma.document.create({
      data: {
        applicationId: application.id,
        userId: application.userId,
        docName: certificateName || `Official Issued Certificate`,
        fileName: fileName || `${application.serviceSlug}_certificate.pdf`,
        fileUrl: fileUrl,
        fileSize: fileSize || "1.2 MB",
        fileType: fileType || "application/pdf",
        status: "VERIFIED",
      },
    });

    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        queryText: null,
      },
    });

    await sendApplicationNotification({
      applicationId: updatedApplication.id,
      serviceTitle: updatedApplication.serviceTitle,
      customerName: updatedApplication.customerName,
      customerPhone: updatedApplication.customerPhone,
      userEmail: application.user?.email || undefined,
      type: "APPROVED",
      newStatus: "APPROVED",
    });

    return NextResponse.json(
      {
        message: "Certificate uploaded and application marked as APPROVED successfully.",
        certificate: newCertificate,
        application: updatedApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload official certificate.");
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("applicationId");

    const certificates = await prisma.issuedCertificate.findMany({
      where: appId ? { applicationId: appId } : undefined,
      include: {
        application: {
          select: {
            serviceTitle: true,
            customerName: true,
          },
        },
      },
      orderBy: {
        issuedDate: "desc",
      },
    });

    return NextResponse.json(certificates, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch certificates.");
  }
}
