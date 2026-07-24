import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are missing in server environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { amount, currency = "INR", notes = {} } = body;

    // Amount validation in paise
    // If amount is passed in Rupees, convert to paise, otherwise ensure min 100 paise
    const amountInPaise = amount < 100 && amount > 0 ? Math.round(amount * 100) : Math.round(amount);

    if (!amountInPaise || amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay Order via /api/create-order:", error);
    return NextResponse.json(
      { error: error?.error?.description || error?.message || "Failed to create Razorpay Order." },
      { status: 500 }
    );
  }
}
