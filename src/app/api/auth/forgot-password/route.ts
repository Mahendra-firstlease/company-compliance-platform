import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/emailService";

export async function POST(request: Request) {
  try {
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

      // 4. Construct reset link URL
      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_AUTH_URL ||
        "http://localhost:3000";
      const resetUrl = `${origin}/reset-password?token=${token}`;

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
