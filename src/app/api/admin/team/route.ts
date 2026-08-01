import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// Initial default seed members if table is empty
const INITIAL_SEED_MEMBERS = [
  {
    name: "Anjali Gupta",
    role: "Senior CA Consultant",
    email: "anjali.gupta@firstlease.com",
    phone: "+91 98765 12345",
    specialization: "MCA Incorporation & GST Registration",
    activeCases: 4,
    completedCases: 142,
    slaRate: "98.5%",
    status: "AVAILABLE",
  },
  {
    name: "Rahul Sharma",
    role: "Company Secretary (CS)",
    email: "rahul.sharma@firstlease.com",
    phone: "+91 98765 23456",
    specialization: "Trademark & Intellectual Property",
    activeCases: 6,
    completedCases: 98,
    slaRate: "96.2%",
    status: "BUSY",
  },
  {
    name: "Vikram Malhotra",
    role: "Legal Desk Advocate",
    email: "vikram.malhotra@firstlease.com",
    phone: "+91 98765 34567",
    specialization: "FSSAI & Udyam Compliance",
    activeCases: 2,
    completedCases: 176,
    slaRate: "99.1%",
    status: "AVAILABLE",
  },
];

// Helper to fetch members with fallback raw query for Windows DLL lock safety
async function fetchMembersFromDb() {
  if ((prisma as any).teamMember) {
    return await (prisma as any).teamMember.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
  const rows: any = await prisma.$queryRaw`
    SELECT id, name, role, email, phone, specialization, activeCases, completedCases, slaRate, status, avatarUrl, createdAt, updatedAt
    FROM TeamMember
    ORDER BY createdAt DESC
  `;
  return rows;
}

// Helper to create member with fallback raw query
async function insertMemberToDb(data: any) {
  if ((prisma as any).teamMember) {
    return await (prisma as any).teamMember.create({ data });
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO TeamMember (id, name, role, email, phone, specialization, activeCases, completedCases, slaRate, status, createdAt, updatedAt)
    VALUES (${id}, ${data.name}, ${data.role}, ${data.email}, ${data.phone}, ${data.specialization}, ${data.activeCases || 0}, ${data.completedCases || 0}, ${data.slaRate || "100%"}, ${data.status || "AVAILABLE"}, ${now}, ${now})
  `;

  return { id, ...data, createdAt: now, updatedAt: now };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN" && userRole !== "EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    let members = await fetchMembersFromDb().catch(() => []);

    if (!members || members.length === 0) {
      // Auto-seed default team members into MySQL
      for (const m of INITIAL_SEED_MEMBERS) {
        await insertMemberToDb(m).catch(() => {});
      }
      members = await fetchMembersFromDb().catch(() => INITIAL_SEED_MEMBERS);
    }

    return NextResponse.json(members, { status: 200 });
  } catch (error: any) {
    console.error("[API/Admin/Team GET] Error fetching team members:", error);
    // Return initial seed members as graceful fallback
    return NextResponse.json(INITIAL_SEED_MEMBERS, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || "CLIENT";
    if (userRole !== "ADMIN" && userRole !== "EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, email, phone, specialization, status } = body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return NextResponse.json(
        { error: "Specialist name and email address are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    let existing = null;
    if ((prisma as any).teamMember) {
      existing = await (prisma as any).teamMember.findUnique({
        where: { email: cleanEmail },
      });
    } else {
      const rows: any = await prisma.$queryRaw`SELECT id FROM TeamMember WHERE email = ${cleanEmail} LIMIT 1`;
      if (rows && rows.length > 0) existing = rows[0];
    }

    if (existing) {
      return NextResponse.json(
        { error: "A specialist with this email address already exists." },
        { status: 400 }
      );
    }

    const newMember = await insertMemberToDb({
      name: name.trim(),
      role: role || "Chartered Accountant (CA)",
      email: cleanEmail,
      phone: phone || "+91 98765 99999",
      specialization: specialization || "MCA & GST Compliance",
      activeCases: 0,
      completedCases: 0,
      slaRate: "100%",
      status: status || "AVAILABLE",
    });

    return NextResponse.json(
      { success: true, message: "Specialist added successfully!", member: newMember },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API/Admin/Team POST] Error creating team member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create team member." },
      { status: 500 }
    );
  }
}
