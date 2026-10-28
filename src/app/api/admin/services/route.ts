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
    if (userRole !== "ADMIN") {
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
    const {
      id,
      title,
      shortDescription,
      description,
      image,
      duration,
      price,
      originalPrice,
      governmentFee,
      professionalFee,
      popular,
      featured,
      details,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Service ID is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (shortDescription !== undefined) updateData.shortDescription = String(shortDescription).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (image !== undefined) updateData.image = String(image).trim();
    if (duration !== undefined) updateData.duration = String(duration).trim();
    if (price !== undefined) updateData.price = parseFloat(price) || 0;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (governmentFee !== undefined) updateData.governmentFee = parseFloat(governmentFee) || 0;
    if (professionalFee !== undefined) updateData.professionalFee = parseFloat(professionalFee) || 0;
    if (popular !== undefined) updateData.popular = Boolean(popular);
    if (featured !== undefined) updateData.featured = Boolean(featured);

    if (details !== undefined && typeof details === "object" && details !== null) {
      const cleanDetails = {
        benefits: Array.isArray(details.benefits)
          ? details.benefits.map((b: unknown) => String(b || "").trim()).filter(Boolean)
          : [],
        eligibility: Array.isArray(details.eligibility)
          ? details.eligibility.map((e: unknown) => String(e || "").trim()).filter(Boolean)
          : [],
        requiredDocuments: Array.isArray(details.requiredDocuments)
          ? details.requiredDocuments.map((d: unknown) => String(d || "").trim()).filter(Boolean)
          : [],
        packageDeliverables: Array.isArray(details.packageDeliverables)
          ? details.packageDeliverables.map((p: unknown) => String(p || "").trim()).filter(Boolean)
          : [],
        faqs: Array.isArray(details.faqs)
          ? details.faqs
              .filter((f: any) => f && typeof f === "object" && Boolean(f.question?.trim()))
              .map((f: any) => ({
                question: String(f.question || "").trim(),
                answer: String(f.answer || "").trim(),
              }))
          : [],
      };

      updateData.details = {
        upsert: {
          create: cleanDetails,
          update: cleanDetails,
        },
      };
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      include: { details: true },
    });

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update service details.");
  }
}
