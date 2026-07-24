"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { businessProfileSchema, BusinessProfileFormValues } from "@/schemas/profile.schema";

export async function getUserProfileWithBusinessAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        businessProfiles: {
          take: 1,
          orderBy: { id: "desc" },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const businessProfile = user.businessProfiles[0] || null;

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
        businessProfile,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Failed to fetch profile data" };
  }
}

export async function saveBusinessProfileAction(formData: BusinessProfileFormValues) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Please log in to save business profile" };
    }

    const userId = (session.user as any).id;
    const validated = businessProfileSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid profile form data",
      };
    }

    const { businessName, businessType, industry, state, employeeCount, annualTurnover } = validated.data;

    // Check if user already has a business profile
    const existing = await prisma.businessProfile.findFirst({
      where: { userId },
    });

    let profile;
    if (existing) {
      profile = await prisma.businessProfile.update({
        where: { id: existing.id },
        data: {
          businessName,
          businessType,
          industry,
          state,
          employeeCount,
          annualTurnover,
        },
      });
    } else {
      profile = await prisma.businessProfile.create({
        data: {
          userId,
          businessName,
          businessType,
          industry,
          state,
          employeeCount,
          annualTurnover,
        },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error saving business profile:", error);
    return { success: false, error: "Failed to save business profile" };
  }
}
