import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { services as fallbackServices } from "@/data/services";

export async function GET() {
  try {
    const services = await Promise.race([
      prisma.service.findMany({
        include: {
          details: true,
        },
        orderBy: {
          title: "asc",
        },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database connection pool timeout")), 2000)
      ),
    ]);

    if (services && services.length > 0) {
      const formattedServices = services.map((service) => {
        const { details, ...base } = service;
        return {
          ...base,
          benefits: (details?.benefits as string[]) || [],
          eligibility: (details?.eligibility as string[]) || [],
          requiredDocuments: (details?.requiredDocuments as string[]) || [],
          faqs: (details?.faqs as any[]) || [],
          packageDeliverables: (details?.packageDeliverables as string[]) || [],
        };
      });

      return NextResponse.json(formattedServices, { status: 200 });
    }
  } catch (error) {
    console.warn(
      "[Prisma Service Notice]: Database unavailable in /api/services, utilizing static services catalogue fallback.",
      error instanceof Error ? error.message : error
    );
  }

  // Gracefully return static catalog when database is unreachable or empty
  return NextResponse.json(fallbackServices, { status: 200 });
}
