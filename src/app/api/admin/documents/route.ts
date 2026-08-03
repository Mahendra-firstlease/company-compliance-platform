import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-response";
import {
  extractUploadedDocuments,
  formatStoredUploadMetadata,
} from "@/lib/applications";

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
    const userId = searchParams.get("userId") || undefined;
    const userFilter = userId ? { userId } : undefined;

    // 3. Fetch all documents from Prisma DB with relational details
    const dbDocuments = await prisma.document.findMany({
      where: userFilter,
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
      where: userFilter,
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
    const seenUrls = new Set<string>();

    dbDocuments.forEach((doc) => {
      seenIds.add(doc.id);
      seenUrls.add(doc.fileUrl);
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
        viewUrl: doc.fileUrl.startsWith("/storage/")
          ? `/api/documents/${doc.id}`
          : doc.fileUrl,
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
            viewUrl: doc.fileUrl.startsWith("/storage/")
              ? `/api/documents/${doc.id}`
              : doc.fileUrl,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            status: doc.status || "PENDING",
            createdAt: doc.createdAt,
          });
        }
      });

      // Older applications stored upload metadata in formData before a Document
      // relation was created. Read that database data so admins can still review
      // every client's file, while avoiding duplicates for persisted records.
      const storedUploads = formatStoredUploadMetadata(
        extractUploadedDocuments((app.formData as Record<string, unknown>) || {}),
      );
      Object.entries(storedUploads).forEach(([docName, file]) => {
        if (!file.url || seenUrls.has(file.url)) return;

        seenUrls.add(file.url);
        documentList.push({
          id: `stored-${app.id}-${docName}`,
          applicationId: app.id,
          serviceTitle: app.serviceTitle,
          serviceSlug: app.serviceSlug,
          customerName: app.customerName,
          customerPhone: app.customerPhone,
          userEmail: app.user?.email || "N/A",
          docName,
          fileName: file.name,
          fileUrl: file.url,
          viewUrl: file.url,
          fileSize: file.size,
          fileType: file.type,
          status: "PENDING_REVIEW",
          createdAt: app.updatedAt,
        });
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
