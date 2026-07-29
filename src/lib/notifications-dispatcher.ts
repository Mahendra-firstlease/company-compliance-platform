import { ApplicationStatus } from "@prisma/client";

export interface NotificationPayload {
  applicationId: string;
  serviceTitle: string;
  customerName: string;
  customerPhone: string;
  userEmail?: string;
  type: "STATUS_CHANGE" | "QUERY_RAISED" | "APPROVED";
  newStatus?: ApplicationStatus;
  queryText?: string;
}

/**
 * Enterprise Notification Dispatcher
 * Sends automated Email, WhatsApp, and Log notifications when application status or queries change.
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

    let messageText = "";

    if (payload.type === "QUERY_RAISED" && payload.queryText) {
      messageText = `⚠️ FirstLease Notice: A query was raised on your ${payload.serviceTitle} filing (Ref: ${payload.applicationId}): "${payload.queryText}". Please log into your workspace to upload revised documents.`;
    } else if (payload.type === "APPROVED") {
      messageText = `🎉 FirstLease Update: Your ${payload.serviceTitle} filing (Ref: ${payload.applicationId}) has been APPROVED! Your official certificate is available for download in your workspace.`;
    } else if (payload.type === "STATUS_CHANGE" && payload.newStatus) {
      messageText = `ℹ️ FirstLease Status Update: Your ${payload.serviceTitle} filing (Ref: ${payload.applicationId}) status is now ${payload.newStatus.replace("_", " ")}.`;
    }

    // 1. Log to server console / audit stream
    console.log(`[DISPATCH MESSAGE]: ${messageText}`);

    // 2. Extensible Hook for WhatsApp Provider (e.g. Twilio / Gupshup / Wati)
    if (process.env.WHATSAPP_API_KEY) {
      await dispatchWhatsAppWebhook({
        to: payload.customerPhone,
        message: messageText,
      });
    }

    // 3. Extensible Hook for Email Provider (e.g. Resend / SendGrid / Nodemailer)
    if (process.env.EMAIL_SERVER_HOST && payload.userEmail) {
      await dispatchEmailWebhook({
        to: payload.userEmail,
        subject: `FirstLease Status Update: ${payload.serviceTitle}`,
        text: messageText,
      });
    }

    return { success: true, messageText };
  } catch (error) {
    console.error("[NOTIFICATION DISPATCH ERROR]:", error);
    return { success: false, error };
  }
}

async function dispatchWhatsAppWebhook(data: { to: string; message: string }) {
  // Placeholder hook for production WhatsApp API integration
  console.log(`[WHATSAPP WEBHOOK DISPATCHED to ${data.to}]`);
}

async function dispatchEmailWebhook(data: { to: string; subject: string; text: string }) {
  // Placeholder hook for production Email API integration
  console.log(`[EMAIL WEBHOOK DISPATCHED to ${data.to}]`);
}
