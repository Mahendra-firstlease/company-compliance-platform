import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { createOrderSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    // 0. Block Admin users from purchasing client services
    const session = await getServerSession(authOptions);
    if (session?.user && (session.user as any).role === "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin accounts are restricted from purchasing client service packages." },
        { status: 403 }
      );
    }

    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(`create_order:${ip}`, RATE_LIMIT_CONFIGS.publicApi);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many payment requests. Please wait a minute and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset - Math.floor(Date.now() / 1000)),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    // 2. Strict Credentials Check (No Fallback Secrets)
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Server Configuration Error: Razorpay credentials missing." },
        { status: 500 }
      );
    }

    // 3. Strict Payload Validation with Zod
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const { amount, currency, notes } = validation.data;
    let verifiedAmountInPaise = amount < 100 && amount > 0 ? Math.round(amount * 100) : Math.round(amount);

    // 4. Server-Side Price Verification (SEC-2 Fix)
    // If serviceSlug is passed in notes, verify fee directly against database record to prevent price tampering
    const targetSlug = (notes as any)?.serviceSlug || (notes as any)?.slug;
    if (targetSlug) {
      const dbService = await prisma.service.findFirst({
        where: { slug: targetSlug },
      });
      if (dbService && dbService.price > 0) {
        verifiedAmountInPaise = Math.round(dbService.price * 100);
      }
    }

    if (verifiedAmountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    // 5. Create Order via Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const order: any = await razorpay.orders.create({
      amount: verifiedAmountInPaise,
      currency: currency || "INR",
      receipt,
      notes: (notes as any) || {},
    });

    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error: any) {
    return handleApiError(error, "Failed to create Razorpay Order.");
  }
}
