import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        assignedExecutive: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const uploadedDocs: Record<string, { name: string; size: string; type: string }> = {};
    application.documents.forEach((doc) => {
      uploadedDocs[doc.docName] = {
        name: doc.fileName,
        size: doc.fileSize,
        type: doc.fileType,
      };
    });

    const formatted = {
      ...application,
      query: application.queryText || undefined,
      assignedExecutive: application.assignedExecutive?.name || application.assignedExecutiveId || undefined,
      uploadedDocs,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error fetching application by id from MySQL:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status as ApplicationStatus;
    if (body.customerName) updateData.customerName = body.customerName;
    if (body.customerPhone) updateData.customerPhone = body.customerPhone;
    if (body.address) updateData.address = body.address;
    if (body.query !== undefined) updateData.queryText = body.query;

    // Handle assigned executive safely to prevent Foreign Key constraint errors
    if (body.assignedExecutive !== undefined) {
      if (!body.assignedExecutive || body.assignedExecutive === "Unassigned") {
        updateData.assignedExecutiveId = null;
      } else {
        let execUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: body.assignedExecutive },
              { name: body.assignedExecutive },
              { name: body.assignedExecutive.split(",")[0].trim() },
            ],
          },
        });

        if (!execUser) {
          const cleanName = body.assignedExecutive.split(",")[0].trim();
          const slugName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
          execUser = await prisma.user.create({
            data: {
              id: `exec_${slugName}_${Date.now()}`,
              name: cleanName,
              email: `${slugName}@firstlease.com`,
              role: "EXECUTIVE",
            },
          });
        }

        updateData.assignedExecutiveId = execUser.id;
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        documents: true,
        assignedExecutive: true,
      },
    });

    const uploadedDocs: Record<string, { name: string; size: string; type: string }> = {};
    updatedApp.documents.forEach((doc) => {
      uploadedDocs[doc.docName] = {
        name: doc.fileName,
        size: doc.fileSize,
        type: doc.fileType,
      };
    });

    const formatted = {
      ...updatedApp,
      query: updatedApp.queryText || undefined,
      assignedExecutive: updatedApp.assignedExecutive?.name || updatedApp.assignedExecutiveId || undefined,
      uploadedDocs,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error updating application in MySQL:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting application from MySQL:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
