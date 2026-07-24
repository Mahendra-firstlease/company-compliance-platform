import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        documents: true,
        assignedExecutive: true,
      },
    });

    // Format documents map for client components compatibility
    const formatted = applications.map((app) => {
      const uploadedDocs: Record<string, { name: string; size: string; type: string }> = {};
      app.documents.forEach((doc) => {
        uploadedDocs[doc.docName] = {
          name: doc.fileName,
          size: doc.fileSize,
          type: doc.fileType,
        };
      });

      return {
        ...app,
        query: app.queryText || undefined,
        assignedExecutive: app.assignedExecutive?.name || app.assignedExecutiveId || undefined,
        uploadedDocs,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications from MySQL:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    let targetUser: any = null;

    // 1. Try finding user by body.userId passed from client session
    if (body.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: body.userId },
      });
    }

    // 2. Try finding user by server session email or user ID
    if (!targetUser && session?.user?.email) {
      targetUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    // 3. Try finding user by body.userEmail
    if (!targetUser && body.userEmail) {
      targetUser = await prisma.user.findUnique({
        where: { email: body.userEmail },
      });
    }

    // 4. Try finding user by phone number
    if (!targetUser && body.customerPhone) {
      targetUser = await prisma.user.findFirst({
        where: { phone: body.customerPhone },
      });
    }

    // 5. Fallback to guest user ONLY if no user is found in database
    if (!targetUser) {
      targetUser = await prisma.user.upsert({
        where: { email: "guest@firstlease.com" },
        update: {},
        create: {
          id: "guest-user",
          name: body.customerName || "Guest User",
          email: "guest@firstlease.com",
          phone: body.customerPhone || "0000000000",
          role: "CLIENT",
        },
      });
    }

    const finalUserId = targetUser.id;

    // Find target service or fallback to creating service definition in DB
    let targetService = await prisma.service.findFirst({
      where: {
        OR: [
          { slug: body.serviceSlug },
          { id: body.serviceId || "non-existent-id" },
        ],
      },
    });

    if (!targetService) {
      targetService = await prisma.service.create({
        data: {
          id: body.serviceId || body.serviceSlug || `service-${Date.now()}`,
          slug: body.serviceSlug || "company-incorporation",
          title: body.serviceTitle || "Statutory Service",
          shortDescription: body.serviceTitle || "Statutory Service Application",
          description: body.serviceTitle || "Statutory Service Application",
          image: "/images/services/incorporation.jpg",
          price: body.totalFee || 2999,
          governmentFee: body.governmentFee || 1000,
          professionalFee: body.professionalFee || 1999,
          duration: "5-7 Days",
        },
      });
    }

    const newApp = await prisma.application.create({
      data: {
        id: body.id || `COMP-${targetService.id}0${Math.floor(1000 + Math.random() * 9000)}`,
        userId: finalUserId,
        serviceId: targetService.id,
        serviceSlug: targetService.slug,
        serviceTitle: targetService.title || body.serviceTitle,
        status: (body.status as ApplicationStatus) || "DOCUMENTS_PENDING",
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        address: body.address || "",
        governmentFee: body.governmentFee || targetService.governmentFee,
        professionalFee: body.professionalFee || targetService.professionalFee,
        totalFee: body.totalFee || targetService.price,
      },
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error("Error creating application in MySQL:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
