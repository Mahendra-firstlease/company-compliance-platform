import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== "ADMIN" && userRole !== "EXECUTIVE")) {
      return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        businessProfiles: true,
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            assignedExecutive: {
              select: { id: true, name: true, email: true },
            },
            documents: true,
            certificates: true,
            payments: true,
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          orderBy: { issuedDate: "desc" },
        },
        schedules: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const formattedApplications = user.applications.map((app) => ({
      id: app.id,
      serviceId: app.serviceId,
      serviceSlug: app.serviceSlug,
      serviceTitle: app.serviceTitle,
      status: app.status,
      customerName: app.customerName,
      customerPhone: app.customerPhone,
      address: app.address,
      queryText: app.queryText || undefined,
      governmentFee: app.governmentFee,
      professionalFee: app.professionalFee,
      totalFee: app.totalFee,
      assignedExecutive: app.assignedExecutive?.name || app.assignedExecutiveId || "Unassigned",
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      documentsCount: app.documents.length,
      certificatesCount: app.certificates.length,
      paymentsCount: app.payments.length,
    }));

    const responseData = {
      id: user.id,
      name: user.name || "N/A",
      email: user.email,
      phone: user.phone || "N/A",
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      businessProfiles: user.businessProfiles,
      applications: formattedApplications,
      documents: user.documents,
      payments: user.payments,
      certificates: user.certificates,
      schedules: user.schedules,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch 360-degree user profile.");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Only Admins can modify user profiles." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role && ["CLIENT", "ADMIN", "EXECUTIVE"].includes(body.role)) {
      updateData.role = body.role as Role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update user profile.");
  }
}
