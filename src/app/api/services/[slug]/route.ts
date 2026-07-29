import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        details: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const { details, ...base } = service;
    const formattedService = {
      ...base,
      benefits: (details?.benefits as string[]) || [],
      eligibility: (details?.eligibility as string[]) || [],
      requiredDocuments: (details?.requiredDocuments as string[]) || [],
      faqs: (details?.faqs as any[]) || [],
    };

    return NextResponse.json(formattedService, { status: 200 });
  } catch (error) {
    console.error("Error fetching service by slug from MySQL:", error);
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
}
