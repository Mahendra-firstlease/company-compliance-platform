import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { verifyPaymentSchema } from "@/schemas/api-schemas";
import { handleApiError, handleValidationError } from "@/lib/api-response";
import { sendPaymentReceiptEmail } from "@/lib/emailService";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimit = checkRateLimit(
      `verify_payment:${ip}`,
      RATE_LIMIT_CONFIGS.publicApi,
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Too many payment verification attempts. Please wait a minute and try again.",
        },
        { status: 429 },
      );
    }

    // 2. Strict Credentials Check (No Fallback Secrets)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "Server Configuration Error: Razorpay credentials missing." },
        { status: 500 },
      );
    }

    // 3. Strict Zod Input Validation
    const body = await req.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationIds,
      amount = 0,
      userId = null,
    } = validation.data;

    // 4. HMAC-SHA256 Cryptographic Signature Check
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8"),
    );

    if (!isSignatureValid) {
      console.error("Razorpay signature verification mismatch!");
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: Invalid Signature.",
        },
        { status: 400 },
      );
    }

    // 5. Update Database Records Atomically
    if (applicationIds.length > 0 && userId) {
      const perAppAmount = amount > 0 ? amount / applicationIds.length : amount;

      await prisma.$transaction(async (tx) => {
        for (const appId of applicationIds) {
          await tx.application.update({
            where: { id: appId },
            data: { status: "PAYMENT_CONFIRMED" },
          });

          await tx.payment.create({
            data: {
              applicationId: appId,
              userId,
              amount: perAppAmount,
              currency: "INR",
              paymentMethod: "RAZORPAY",
              transactionId: `${razorpay_payment_id}_${appId.slice(-4)}`,
              status: "SUCCESS",
            },
          });
        }
      });

      // Send automated React Email tax payment receipt asynchronously
      (async () => {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          const firstApp = await prisma.application.findUnique({ where: { id: applicationIds[0] } });
          if (user?.email) {
            await sendPaymentReceiptEmail({
              to: user.email,
              userName: user.name || "Valued Client",
              serviceName: firstApp?.serviceTitle || "Compliance Service Filing",
              amount: amount || perAppAmount,
              transactionId: razorpay_payment_id,
              orderId: razorpay_order_id,
            });
          }
        } catch (emailErr) {
          console.error("[VerifyPayment] Error sending receipt email:", emailErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to verify Razorpay Payment.");
  }
}
