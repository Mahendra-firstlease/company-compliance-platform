"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";
import { sendWelcomeEmail } from "@/lib/emailService";
import { after } from "next/server";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function registerUserAction(formData: RegisterFormValues | RegisterFormValues[] | FormData | unknown) {
  try {
    let clientIp = "127.0.0.1";
    try {
      const headerList = await headers();
      clientIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    } catch {
      // Non-request contexts
    }

    const rateLimit = checkRateLimit(`register:${clientIp}`, RATE_LIMIT_CONFIGS.auth);
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many registration attempts. Please wait a few minutes before trying again.",
      };
    }

    // Gracefully handle array payloads, direct objects, or FormData
    let rawInput: any = formData;
    if (Array.isArray(formData)) {
      rawInput = formData[0];
    } else if (typeof FormData !== "undefined" && formData instanceof FormData) {
      rawInput = Object.fromEntries(formData.entries());
    }

    if (rawInput && typeof rawInput === "object") {
      if (rawInput.acceptTerms === "true" || rawInput.acceptTerms === "on" || rawInput.acceptTerms === 1) {
        rawInput.acceptTerms = true;
      }
    }

    const validated = registerSchema.safeParse(rawInput);

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

    // 3. Create user in database
    const user = await prisma.user.create({
      data: {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: "CLIENT",
      },
    });

    // 4. Send automated Welcome Email asynchronously via Next.js after() lifecycle
    const welcomePayload = {
      to: normalizedEmail,
      userName: user.name || firstName || "Valued Client",
    };

    try {
      if (typeof after === "function") {
        after(async () => {
          try {
            await sendWelcomeEmail(welcomePayload);
          } catch (emailErr) {
            console.error("[Register] Error sending welcome email asynchronously:", emailErr);
          }
        });
      } else {
        sendWelcomeEmail(welcomePayload).catch((emailErr) =>
          console.error("[Register] Error sending welcome email:", emailErr)
        );
      }
    } catch {
      // Fallback for non-request environments (e.g. CLI/scripts)
      sendWelcomeEmail(welcomePayload).catch((emailErr) =>
        console.error("[Register] Error sending welcome email:", emailErr)
      );
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error: any) {
    console.error("Error registering user via Server Action:", error);

    // Handle known Prisma errors
    if (error && typeof error === "object") {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "An account with this email address already exists. Please login instead.",
        };
      }
      if (error.code === "P1001" || error.code === "P1000") {
        return {
          success: false,
          error: "Database connection failed. Please ensure the database server is running.",
        };
      }
    }

    const errorMessage =
      error instanceof Error && error.message
        ? error.message
        : typeof error === "string"
        ? error
        : "An unexpected server error occurred during registration. Please try again.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
