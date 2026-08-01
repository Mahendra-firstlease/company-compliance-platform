import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN" && userRole !== "EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      orderBy: { title: "asc" },
      include: { details: true },
    });

    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch admin services catalog.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, price, governmentFee, professionalFee, popular, featured } = body;

    if (!id) {
      return NextResponse.json({ error: "Service ID is required." }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(governmentFee !== undefined && { governmentFee: parseFloat(governmentFee) }),
        ...(professionalFee !== undefined && { professionalFee: parseFloat(professionalFee) }),
        ...(popular !== undefined && { popular: Boolean(popular) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
    });

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update service pricing.");
  }
}
