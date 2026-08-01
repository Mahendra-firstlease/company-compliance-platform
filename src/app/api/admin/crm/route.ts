import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

// Lead Item Mock/DB Storage structure
interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceRequested: string;
  status: "NEW" | "CONTACTED" | "QUOTATION_SENT" | "CONVERTED";
  assignedExecutive?: string;
  notes?: string;
  createdAt: string;
}

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

    // Generate sample CRM leads from uncompleted/guest users and consultation enquiries
    const users = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { applications: true },
    });

    const leads: LeadItem[] = users.map((u, idx) => {
      const hasApps = u.applications.length > 0;
      const status: "NEW" | "CONTACTED" | "QUOTATION_SENT" | "CONVERTED" = hasApps
        ? "CONVERTED"
        : idx % 3 === 0
        ? "NEW"
        : idx % 3 === 1
        ? "CONTACTED"
        : "QUOTATION_SENT";

      return {
        id: `LEAD-${u.id.substring(0, 8)}`,
        name: u.name || "Enquiry Lead",
        email: u.email,
        phone: u.phone || "+91 9876543210",
        serviceRequested: u.applications[0]?.serviceTitle || "General Statutory Filing Consultation",
        status,
        assignedExecutive: idx % 2 === 0 ? "Anjali Gupta (Senior Legal Advisor)" : "Rahul Sharma (CA)",
        notes: hasApps ? "Converted into paid filing case." : "Requested consultation callback.",
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch CRM leads.");
  }
}
