"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";

export async function registerUserAction(formData: RegisterFormValues) {
  try {
    const validated = registerSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid registration form data.",
      };
    }

    const { firstName, lastName, email, phone, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists. Please login instead.",
      };
    }

    // 2. Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user in database without initial businessProfile (user will complete in /business-profile)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email: normalizedEmail,
        passwordHash,
        phone,
        role: "CLIENT",
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Error registering user via Server Action:", error);
    return {
      success: false,
      error: "An unexpected server error occurred during registration. Please try again.",
    };
  }
}
