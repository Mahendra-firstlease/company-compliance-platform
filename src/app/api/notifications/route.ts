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
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Safe model check for hot-reloaded dev server singleton
    if (!(prisma as any).notification) {
      return NextResponse.json([], { status: 200 });
    }

    const notifications = await (prisma as any).notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (
      errorMsg.includes("Timed out fetching a new connection") ||
      errorMsg.includes("connection pool") ||
      error?.code === "P2024"
    ) {
      console.warn("[Prisma Pool Deferred]: Connection pool busy, deferring notifications fetch.");
      return NextResponse.json([], { status: 200 });
    }
    return handleApiError(error, "Failed to fetch user notifications.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, title, message, type, link } = body;

    const recipientId = targetUserId || (session.user as any).id;

    if (!(prisma as any).notification) {
      return NextResponse.json({ error: "Notification service initializing." }, { status: 503 });
    }

    const notification = await (prisma as any).notification.create({
      data: {
        userId: recipientId,
        title: title || "Portal Alert",
        message: message || "",
        type: type || "INFO",
        link: link || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create notification.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json().catch(() => ({}));
    const { notificationId, markAllRead } = body;

    if (!(prisma as any).notification) {
      return NextResponse.json({ message: "Success" });
    }

    if (markAllRead) {
      await (prisma as any).notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "All notifications marked as read." });
    }

    if (notificationId) {
      const updated = await (prisma as any).notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Notification ID or markAllRead required." }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "Failed to update notification.");
  }
}
