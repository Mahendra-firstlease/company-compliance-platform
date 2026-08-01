import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing password reset token." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Find token in VerificationToken table
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "This password reset token is invalid or has already been used." },
        { status: 400 }
      );
    }

    // 2. Check token expiration
    if (new Date() > verificationRecord.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      }).catch(() => {});

      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Hash new password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Update user account password in database
    await prisma.user.update({
      where: { email: verificationRecord.identifier },
      data: { passwordHash },
    });

    // 5. Delete consumed reset token from database
    await prisma.verificationToken.deleteMany({
      where: { identifier: verificationRecord.identifier },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your password has been updated successfully! You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ResetPassword] API route error:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again." },
      { status: 500 }
    );
  }
}
