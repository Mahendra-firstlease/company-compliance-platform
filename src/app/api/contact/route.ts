import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactInquiryEmail } from "@/lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`contact:${ip}`, RATE_LIMIT_CONFIGS.publicApi);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many contact inquiries submitted. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const { name, email, phone, service, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Please enter a valid name (2-100 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 150) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (message && typeof message === "string" && message.length > 5000) {
      return NextResponse.json(
        { error: "Message exceeds maximum allowed length of 5000 characters." },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || "",
        interestedService: service || "General Inquiry",
        notes: message || "",
        leadStatus: "NEW",
      },
    });

    // Send automated React Email confirmation to customer & admin alert asynchronously
    sendContactInquiryEmail({
      name,
      email,
      phone,
      service,
      message,
    }).catch((err) => console.error("Failed to send contact inquiry email:", err));

    return NextResponse.json(
      { success: true, message: "Inquiry received successfully!", lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving contact lead to MySQL:", error);
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required to view leads." },
        { status: 403 }
      );
    }

    const leads = await prisma.crmLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("Error fetching CRM leads from MySQL:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
