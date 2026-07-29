import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        benefits: (details?.benefits as string[]) || [],
        eligibility: (details?.eligibility as string[]) || [],
        requiredDocuments: (details?.requiredDocuments as string[]) || [],
        faqs: (details?.faqs as any[]) || [],
      };
    });

    return NextResponse.json(formattedServices, { status: 200 });
  } catch (error) {
    console.error("Error fetching services from MySQL:", error);
    // Return empty array if database query fails so client displays no services UI
    return NextResponse.json([], { status: 200 });
  }
}
