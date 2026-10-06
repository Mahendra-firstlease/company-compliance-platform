import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Upsert: reactivate if they previously unsubscribed
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });

    const wasAlreadySubscribed =
      subscriber.subscribedAt < new Date(Date.now() - 2000);

    return NextResponse.json(
      {
        message: wasAlreadySubscribed
          ? "You're already subscribed!"
          : "Successfully subscribed!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        ...(process.env.NODE_ENV === "development" && {
          detail: String(error),
        }),
      },
      { status: 500 }
    );
  }
}
