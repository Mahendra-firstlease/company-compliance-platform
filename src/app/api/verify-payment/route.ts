import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is missing in server environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationIds = [],
      amount = 0,
      userId = null,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)." },
        { status: 400 }
      );
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("Razorpay signature verification mismatch!");
      return NextResponse.json(
        { success: false, error: "Payment verification failed: Signature mismatch." },
        { status: 400 }
      );
    }

    // Signature matches! If database applications exist, record payment and update status
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
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay Payment via /api/verify-payment:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify Razorpay Payment." },
      { status: 500 }
    );
  }
}
