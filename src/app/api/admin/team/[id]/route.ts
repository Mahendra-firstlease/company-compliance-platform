import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, role, email, phone, specialization, status, activeCases, completedCases, slaRate } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Team member ID is required." },
        { status: 400 }
      );
    }

    if ((prisma as any).teamMember) {
      const updated = await (prisma as any).teamMember.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(role && { role: role.trim() }),
          ...(email && { email: email.trim().toLowerCase() }),
          ...(phone && { phone: phone.trim() }),
          ...(specialization && { specialization: specialization.trim() }),
          ...(status && { status }),
          ...(activeCases !== undefined && { activeCases: Number(activeCases) }),
          ...(completedCases !== undefined && { completedCases: Number(completedCases) }),
          ...(slaRate && { slaRate }),
        },
      });

      return NextResponse.json(
        { success: true, message: "Team member updated successfully!", member: updated },
        { status: 200 }
      );
    }

    // Fallback Raw SQL execution for Windows DLL lock
    const now = new Date();
    await prisma.$executeRaw`
      UPDATE TeamMember
      SET name = COALESCE(${name || null}, name),
          role = COALESCE(${role || null}, role),
          email = COALESCE(${email ? email.toLowerCase() : null}, email),
          phone = COALESCE(${phone || null}, phone),
          specialization = COALESCE(${specialization || null}, specialization),
          status = COALESCE(${status || null}, status),
          updatedAt = ${now}
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { success: true, message: "Team member updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API/Admin/Team/[id] PUT] Error updating team member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update team member." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Team member ID is required." },
        { status: 400 }
      );
    }

    if ((prisma as any).teamMember) {
      await (prisma as any).teamMember.delete({
        where: { id },
      });
    } else {
      await prisma.$executeRaw`DELETE FROM TeamMember WHERE id = ${id}`;
    }

    return NextResponse.json(
      { success: true, message: "Team member removed successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API/Admin/Team/[id] DELETE] Error deleting team member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete team member." },
      { status: 500 }
    );
  }
}
