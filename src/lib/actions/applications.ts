"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function updateApplicationStatusAction(
  id: string,
  data: {
    status?: ApplicationStatus;
    query?: string;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    const role = (session.user as any)?.role;
    if (role !== "ADMIN") {
      return {
        success: false,
        error: "Forbidden: Admin privileges required.",
      };
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.query !== undefined && { queryText: data.query }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating application status via Server Action:", error);
    return { success: false, error: "Failed to update application" };
  }
}

export async function createApplicationAction(formData: {
  serviceSlug: string;
  customerName: string;
  customerPhone: string;
  address?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any)?.id) {
      return { success: false, error: "Authentication required to initiate filing." };
    }

    const userId = (session.user as any).id;

    const service = await prisma.service.findUnique({
      where: { slug: formData.serviceSlug },
    });

    if (!service) {
      throw new Error("Service not found");
    }

    const application = await prisma.application.create({
      data: {
        id: `COMP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex")}`,
        serviceId: service.id,
        userId,
        serviceSlug: service.slug,
        serviceTitle: service.title,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        address: formData.address || "",
        status: ApplicationStatus.DOCUMENTS_PENDING,
        governmentFee: service.governmentFee,
        professionalFee: service.professionalFee,
        totalFee: service.price,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return { success: true, data: application };
  } catch (error) {
    console.error("Error creating application via Server Action:", error);
    return { success: false, error: "Failed to create application" };
  }
}
