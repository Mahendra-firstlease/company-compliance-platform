import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== "ADMIN" && userRole !== "EXECUTIVE")) {
      return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const roleFilter = searchParams.get("role") || "";

    const whereClause: any = {};

    if (roleFilter && ["CLIENT", "ADMIN", "EXECUTIVE"].includes(roleFilter.toUpperCase())) {
      whereClause.role = roleFilter.toUpperCase();
    }

    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { businessProfiles: { some: { businessName: { contains: search } } } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        businessProfiles: {
          take: 1,
          select: {
            id: true,
            businessName: true,
            businessType: true,
            industry: true,
            state: true,
            employeeCount: true,
            annualTurnover: true,
          },
        },
        _count: {
          select: {
            applications: true,
            documents: true,
            payments: true,
            certificates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUsers = users.map((u) => {
      const mainBusiness = u.businessProfiles[0];
      return {
        id: u.id,
        name: u.name || "N/A",
        email: u.email,
        phone: u.phone || "N/A",
        role: u.role,
        image: u.image,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        businessName: mainBusiness?.businessName || "Not Provided",
        businessType: mainBusiness?.businessType || "N/A",
        industry: mainBusiness?.industry || "N/A",
        state: mainBusiness?.state || "N/A",
        applicationsCount: u._count.applications,
        documentsCount: u._count.documents,
        paymentsCount: u._count.payments,
        certificatesCount: u._count.certificates,
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch admin users directory.");
  }
}
