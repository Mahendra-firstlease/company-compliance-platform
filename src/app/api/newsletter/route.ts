import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(150, "Email address is too long"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`newsletter:${ip}`, RATE_LIMIT_CONFIGS.publicApi);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many newsletter subscription attempts. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

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
