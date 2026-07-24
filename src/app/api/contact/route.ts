import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, service, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
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
