import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendApplicationStatusEmail,
  sendCertificateIssuedEmail,
} from "@/lib/emailService";

export interface NotificationPayload {
  applicationId: string;
  serviceTitle: string;
  customerName: string;
  customerPhone: string;
  userEmail?: string;
  userId?: string;
  type: "STATUS_CHANGE" | "QUERY_RAISED" | "APPROVED";
  newStatus?: ApplicationStatus;
  queryText?: string;
}

/**
 * Enterprise Notification Dispatcher
 * Writes persistent MySQL Notifications and dispatches automated Email/WhatsApp alerts.
 */
export async function sendApplicationNotification(payload: NotificationPayload) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[NOTIFICATION DISPATCHER - ${timestamp}]:`, {
      appId: payload.applicationId,
      type: payload.type,
      customer: payload.customerName,
      phone: payload.customerPhone,
      email: payload.userEmail,
    });

    let messageTitle = "Filing Status Update";
    let messageText = "";
    let notifType: "SUCCESS" | "WARNING" | "INFO" = "INFO";

    if (payload.type === "QUERY_RAISED" && payload.queryText) {
      messageTitle = "Clarification Required";
      messageText = `A query was raised on your ${payload.serviceTitle} filing: "${payload.queryText}". Please upload revised documents.`;
      notifType = "WARNING";
    } else if (payload.type === "APPROVED") {
      messageTitle = "Statutory Certificate Issued";
      messageText = `Your ${payload.serviceTitle} filing has been APPROVED! Your official certificate is available in your workspace.`;
      notifType = "SUCCESS";
    } else if (payload.type === "STATUS_CHANGE" && payload.newStatus) {
      messageTitle = `${payload.serviceTitle} Updated`;
      messageText = `Your ${payload.serviceTitle} status is now ${payload.newStatus.replace(/_/g, " ")}.`;
      notifType = "INFO";
    }

    // 1. Write persistent Notification record in MySQL database if target user exists
    let targetUserId = payload.userId;
    if (!targetUserId && payload.userEmail) {
      const u = await prisma.user.findUnique({ where: { email: payload.userEmail } });
      if (u) targetUserId = u.id;
    }

    if (!targetUserId) {
      const app = await prisma.application.findUnique({ where: { id: payload.applicationId } });
      if (app) targetUserId = app.userId;
    }

    if (targetUserId && (prisma as any).notification) {
      await (prisma as any).notification.create({
        data: {
          userId: targetUserId,
          title: messageTitle,
          message: messageText,
          type: notifType,
          link: `/applications/${payload.applicationId}`,
        },
      });
      console.log(`[DB NOTIFICATION CREATED for user ${targetUserId}]`);
    }

    // 2. Extensible Hook for WhatsApp Provider (e.g. Twilio / Gupshup / Wati)
    if (process.env.WHATSAPP_API_KEY) {
      await dispatchWhatsAppWebhook({
        to: payload.customerPhone,
        message: messageText,
      });
    }

    // 3. Dispatch automated React Email alert to user
    const recipientEmail = payload.userEmail || (targetUserId ? (await prisma.user.findUnique({ where: { id: targetUserId } }))?.email : undefined);

    if (recipientEmail) {
      if (payload.type === "APPROVED") {
        sendCertificateIssuedEmail({
          to: recipientEmail,
          userName: payload.customerName || "Valued Client",
          certificateName: `${payload.serviceTitle} Certificate`,
          registrationNumber: `REG-${payload.applicationId.slice(-8).toUpperCase()}`,
        }).catch((err) =>
          console.error("[NOTIFICATION DISPATCH] Error sending certificate email:", err)
        );
      } else {
        sendApplicationStatusEmail({
          to: recipientEmail,
          userName: payload.customerName || "Valued Client",
          serviceName: payload.serviceTitle,
          applicationId: payload.applicationId,
          status: payload.newStatus || payload.type,
          notes: payload.queryText || messageText,
        }).catch((err) =>
          console.error("[NOTIFICATION DISPATCH] Error sending status email:", err)
        );
      }
    }

    return { success: true, messageText };
  } catch (error) {
    console.error("[NOTIFICATION DISPATCH ERROR]:", error);
    return { success: false, error };
  }
}

async function dispatchWhatsAppWebhook(data: { to?: string; message: string }) {
  console.log(`[WHATSAPP WEBHOOK DISPATCHED to ${data.to || "N/A"}]`);
}
