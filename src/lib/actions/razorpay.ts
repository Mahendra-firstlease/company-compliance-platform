"use server";

import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import type { CreateOrderParams, VerifyPaymentParams } from "@/types";

export async function createRazorpayOrderAction({
  amount,
  currency = "INR",
  notes = {},
}: CreateOrderParams) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return { success: false, error: "Razorpay credentials missing in environment variables." };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Please log in to initiate payment." };
    }

    // Amount validation in paise (Minimum 100 paise)
    const amountInPaise = amount < 100 && amount > 0 ? Math.round(amount * 100) : Math.round(amount);

    if (amountInPaise < 100) {
      return { success: false, error: "Amount must be at least 100 paise (₹1)." };
    }

    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        userId: (session.user as any).id,
        ...notes,
      },
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      },
    };
  } catch (error: any) {
    console.error("Error creating Razorpay Order:", error);
    return {
      success: false,
      error: error?.error?.description || error?.message || "Failed to create payment order.",
    };
  }
}

export async function verifyRazorpayPaymentAction({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  applicationIds,
  amount,
}: VerifyPaymentParams) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return { success: false, error: "RAZORPAY_KEY_SECRET missing in server environment." };
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { success: false, error: "Missing required payment fields." };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Authentication required for payment verification." };
    }

    const userId = (session.user as any).id;

    // 1. Verify HMAC SHA256 Signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return {
        success: false,
        error: "Signature mismatch: Payment verification failed.",
      };
    }

    // 2. Update Application Statuses in MySQL via Prisma
    const perAppAmount = applicationIds.length > 0 ? amount / applicationIds.length : amount;

    await prisma.$transaction(async (tx) => {
      for (const appId of applicationIds) {
        await tx.application.update({
          where: { id: appId },
          data: {
            status: "PAYMENT_CONFIRMED",
          },
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

    revalidatePath("/dashboard");
    revalidatePath("/applications");

    return {
      success: true,
      message: "Payment verified and applications confirmed successfully!",
    };
  } catch (error: any) {
    console.error("Error verifying Razorpay Payment:", error);
    return {
      success: false,
      error: "Payment verification failed on server.",
    };
  }
}
