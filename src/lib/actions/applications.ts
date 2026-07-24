"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import crypto from "crypto";

export async function updateApplicationStatusAction(
  id: string,
  data: {
    status?: ApplicationStatus;
    query?: string;
  }
) {
  try {
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
    const defaultUser = await prisma.user.upsert({
      where: { email: "guest@compliance.in" },
      update: { name: formData.customerName, phone: formData.customerPhone },
      create: {
        name: formData.customerName,
        email: "guest@compliance.in",
        phone: formData.customerPhone,
      },
    });

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
        userId: defaultUser.id,
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
