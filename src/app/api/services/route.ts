import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { services as fallbackServices } from "@/data/services";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        details: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    const formattedServices = services.map((service) => {
      const { details, ...base } = service;
      return {
        ...base,
        benefits: details?.benefits || [],
        eligibility: details?.eligibility || [],
        requiredDocuments: details?.requiredDocuments || [],
        faqs: details?.faqs || [],
      };
    });

    return NextResponse.json(formattedServices, { status: 200 });
  } catch (error) {
    console.error("Error fetching services from MySQL:", error);
    // Return fallback catalog if database fails so client app never crashes with 500
    return NextResponse.json(fallbackServices, { status: 200 });
  }
}
