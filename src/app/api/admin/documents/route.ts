import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    // 1. Session & Role Verification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN" && userRole !== "EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: Admin privilege required." }, { status: 403 });
    }

    // 2. Rate Limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`get_admin_docs:${ip}`, RATE_LIMIT_CONFIGS.userApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterType = searchParams.get("type") || "ALL";

    // 3. Fetch all documents from Prisma DB with relational details
    const dbDocuments = await prisma.document.findMany({
      include: {
        application: {
          select: {
            id: true,
            serviceSlug: true,
            serviceTitle: true,
            customerName: true,
            customerPhone: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const dbApplications = await prisma.application.findMany({
      include: {
        documents: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const documentList: any[] = [];
    const seenIds = new Set<string>();

    dbDocuments.forEach((doc) => {
      seenIds.add(doc.id);
      documentList.push({
        id: doc.id,
        applicationId: doc.applicationId,
        serviceTitle: doc.application?.serviceTitle || "Statutory Service",
        serviceSlug: doc.application?.serviceSlug || "service",
        customerName: doc.application?.customerName || doc.user?.name || "Client User",
        customerPhone: doc.application?.customerPhone || "N/A",
        userEmail: doc.user?.email || "N/A",
        docName: doc.docName,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        status: doc.status || "PENDING",
        createdAt: doc.createdAt,
      });
    });

    dbApplications.forEach((app) => {
      app.documents.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          documentList.push({
            id: doc.id,
            applicationId: app.id,
            serviceTitle: app.serviceTitle,
            serviceSlug: app.serviceSlug,
            customerName: app.customerName,
            customerPhone: app.customerPhone,
            userEmail: app.user?.email || "N/A",
            docName: doc.docName,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            status: doc.status || "PENDING",
            createdAt: doc.createdAt,
          });
        }
      });
    });

    let filtered = documentList;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.fileName.toLowerCase().includes(q) ||
          d.docName.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.applicationId.toLowerCase().includes(q)
      );
    }

    if (filterType !== "ALL") {
      filtered = filtered.filter(
        (d) => d.docName.toLowerCase().includes(filterType.toLowerCase()) || d.fileType.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch admin user documents.");
  }
}
