import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    // 1. Fetch user specific schedules from Prisma DB
    let schedules = await prisma.complianceSchedule.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });

    // 2. If user has no custom schedules yet, seed default statutory deadlines for them
    if (schedules.length === 0) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const defaultDeadlines = [
        {
          userId,
          title: "GSTR-1 Monthly Return Filing",
          type: "TAX",
          dueDate: new Date(currentYear, currentMonth, 11),
          status: "PENDING",
        },
        {
          userId,
          title: "GSTR-3B Monthly Summary Return",
          type: "TAX",
          dueDate: new Date(currentYear, currentMonth, 20),
          status: "PENDING",
        },
        {
          userId,
          title: "PF & ESIC Monthly Contribution Deposit",
          type: "LABOUR",
          dueDate: new Date(currentYear, currentMonth, 15),
          status: "PENDING",
        },
        {
          userId,
          title: "ROC AOC-4 & MGT-7 Annual Financial Filing",
          type: "CORPORATE",
          dueDate: new Date(currentYear, 9, 30), // 30th October
          status: "PENDING",
        },
      ];

      await prisma.complianceSchedule.createMany({
        data: defaultDeadlines,
      });

      schedules = await prisma.complianceSchedule.findMany({
        where: { userId },
        orderBy: { dueDate: "asc" },
      });
    }

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch compliance schedules.");
  }
}
