import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { services as fallbackServices } from "@/data/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    try {
      const service = await prisma.service.findUnique({
        where: { slug },
        include: {
          details: true,
        },
      });

      if (service) {
        const { details, ...baseService } = service;
        const formattedService = {
          ...baseService,
          benefits: details?.benefits || [],
          eligibility: details?.eligibility || [],
          requiredDocuments: details?.requiredDocuments || [],
          faqs: details?.faqs || [],
        };
        return NextResponse.json(formattedService, { status: 200 });
      }
    } catch (dbErr) {
      console.error("Prisma lookup failed, falling back to static services:", dbErr);
    }

    // Fallback to static catalog by slug
    const fallback = fallbackServices.find((s) => s.slug === slug);
    if (fallback) {
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json(
      { error: "Service not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error fetching service by slug from MySQL:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch service details",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
