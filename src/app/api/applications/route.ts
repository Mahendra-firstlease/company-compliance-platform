import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { createApplicationSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";
import { formatApplicationDocuments } from "@/lib/applications";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const userRole = (session.user as any).role as string;
    const isAdminOrExec = userRole === "ADMIN" || userRole === "EXECUTIVE";

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`get_apps:${ip}`, RATE_LIMIT_CONFIGS.userApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    // Regular users see ONLY their own applications; Admins/Execs see all applications
    const whereCondition = isAdminOrExec ? {} : { userId };

    const applications = await prisma.application.findMany({
      where: whereCondition,
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        documents: true,
        assignedExecutive: true,
      },
    });

    const formatted = applications.map((app) => {
      return {
        ...app,
        query: app.queryText || undefined,
        assignedExecutive: app.assignedExecutive?.name || app.assignedExecutiveId || undefined,
        uploadedDocs: formatApplicationDocuments(app.documents),
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch applications.");
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`post_app:${ip}`, RATE_LIMIT_CONFIGS.userApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = createApplicationSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const payload = validation.data;
    const session = await getServerSession(authOptions);

    let targetUser: any = null;

    if (payload.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
    }

    if (!targetUser && session?.user?.email) {
      targetUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!targetUser && payload.userEmail) {
      targetUser = await prisma.user.findUnique({
        where: { email: payload.userEmail },
      });
    }

    if (!targetUser && payload.customerPhone) {
      targetUser = await prisma.user.findFirst({
        where: { phone: payload.customerPhone },
      });
    }

    if (!targetUser) {
      targetUser = await prisma.user.upsert({
        where: { email: "guest@firstlease.com" },
        update: {},
        create: {
          id: "guest-user",
          name: payload.customerName || "Guest User",
          email: "guest@firstlease.com",
          phone: payload.customerPhone || "0000000000",
          role: "CLIENT",
        },
      });
    }

    const finalUserId = targetUser.id;

    let targetService = await prisma.service.findFirst({
      where: {
        OR: [
          { slug: payload.serviceSlug },
        ],
      },
    });

    if (!targetService) {
      targetService = await prisma.service.create({
        data: {
          id: payload.serviceSlug || `service-${Date.now()}`,
          slug: payload.serviceSlug,
          title: payload.serviceTitle || "Statutory Service",
          shortDescription: payload.serviceTitle || "Statutory Service Application",
          description: payload.serviceTitle || "Statutory Service Application",
          image: "/images/services/incorporation.jpg",
          price: payload.totalFee,
          governmentFee: payload.governmentFee || 1000,
          professionalFee: payload.professionalFee || 1999,
          duration: "5-7 Days",
        },
      });
    }

    const newApp = await prisma.application.create({
      data: {
        id: payload.id || `COMP-${targetService.id}0${Math.floor(1000 + Math.random() * 9000)}`,
        userId: finalUserId,
        serviceId: targetService.id,
        serviceSlug: targetService.slug,
        serviceTitle: targetService.title || payload.serviceTitle,
        status: (payload.status as ApplicationStatus) || "DOCUMENTS_PENDING",
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        address: payload.address || "",
        governmentFee: payload.governmentFee || targetService.governmentFee,
        professionalFee: payload.professionalFee || targetService.professionalFee,
        totalFee: payload.totalFee || targetService.price,
      },
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create application.");
  }
}
