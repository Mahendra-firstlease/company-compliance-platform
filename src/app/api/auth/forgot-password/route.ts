import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/emailService";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import siteConfig from "@/config/site";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`forgot_pw:${ip}`, RATE_LIMIT_CONFIGS.auth);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // 1. Delete any existing verification tokens for this user email
      await prisma.verificationToken.deleteMany({
        where: { identifier: cleanEmail },
      });

      // 2. Generate a high-entropy 64-char crypto token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      // 3. Store in VerificationToken table
      await prisma.verificationToken.create({
        data: {
          identifier: cleanEmail,
          token,
          expires,
        },
      });

      // 4. Construct reset link URL using trusted application domain to prevent host poisoning
      const configuredBase =
        process.env.NEXT_AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        siteConfig.url ||
        "http://localhost:3000";

      let baseDomain = configuredBase.replace(/\/+$/, "");
      const originHeader = request.headers.get("origin");
      if (process.env.NODE_ENV === "development" && originHeader) {
        try {
          const originUrl = new URL(originHeader);
          if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
            baseDomain = originHeader.replace(/\/+$/, "");
          }
        } catch {
          // keep configuredBase
        }
      }
      const resetUrl = `${baseDomain}/reset-password?token=${token}`;

      // 5. Send automated React Email asynchronously
      sendPasswordResetEmail({
        to: cleanEmail,
        userName: user.name || "Valued Business Client",
        resetUrl,
      }).catch((err) =>
        console.error("[ForgotPassword] Error sending password reset email:", err)
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account is associated with this email, a password reset link has been sent to your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ForgotPassword] API route error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
