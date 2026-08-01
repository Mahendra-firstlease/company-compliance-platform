import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { ApplicationStatusEmail } from "@/emails/ApplicationStatusEmail";
import { ContactInquiryEmail } from "@/emails/ContactInquiryEmail";
import { PaymentReceiptEmail } from "@/emails/PaymentReceiptEmail";
import { CertificateIssuedEmail } from "@/emails/CertificateIssuedEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { getGraphClient, sendEmailViaGraph } from "@/lib/graph/email";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Dedicated email dispatcher that sends email EXCLUSIVELY via Microsoft Graph API
 */
async function sendMail({ to, subject, html }: SendMailOptions) {
  // Primary & Exclusive Provider: Microsoft Graph API
  if (getGraphClient()) {
    const graphResult = await sendEmailViaGraph({ to, subject, html });
    if (graphResult.success) {
      return { success: true, provider: "MS_GRAPH", details: graphResult.details };
    }
    console.error("[ReactEmail] Microsoft Graph API transmission failed:", graphResult.error);
    return { success: false, provider: "MS_GRAPH", error: graphResult.error };
  }

  // Development Fallback: Log nicely formatted info if Graph API credentials are not configured
  const devLog = {
    status: "SIMULATED 🟡 (Configure MS_GRAPH_* variables in .env for live transmission)",
    provider: "MICROSOFT_GRAPH_DEV_MODE",
    recipient: to,
    subject,
    htmlLengthBytes: html.length,
    timestamp: new Date().toISOString(),
  };

  console.log("==================== MICROSOFT GRAPH DEV PREVIEW RESPONSE ====================");
  console.dir(devLog, { depth: null, colors: true });
  console.log("==============================================================================");

  return { success: true, simulated: true, provider: "MS_GRAPH_DEV_PREVIEW", details: devLog };
}

/**
 * Send Account Welcome Email to newly registered user
 */
export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string;
  userName: string;
}) {
  const html = await render(WelcomeEmail({ userName, userEmail: to }));
  return sendMail({
    to,
    subject: `Welcome to FirstLease Compliance Portal, ${userName}!`,
    html,
  });
}

/**
 * Send Case Filing Status Update Email
 */
export async function sendApplicationStatusEmail({
  to,
  userName,
  serviceName,
  applicationId,
  status,
  notes,
}: {
  to: string;
  userName: string;
  serviceName: string;
  applicationId: string;
  status: string;
  notes?: string;
}) {
  const html = await render(
    ApplicationStatusEmail({
      userName,
      serviceName,
      applicationId,
      status,
      notes,
    })
  );
  return sendMail({
    to,
    subject: `Filing Status Update: ${serviceName} (${applicationId})`,
    html,
  });
}

/**
 * Send Contact Inquiry Confirmation & Admin Alert
 */
export async function sendContactInquiryEmail({
  name,
  email,
  phone,
  service,
  message,
  adminNotificationEmail,
}: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  adminNotificationEmail?: string;
}) {
  // 1. Customer Confirmation Email
  const customerHtml = await render(
    ContactInquiryEmail({
      name,
      email,
      phone,
      service,
      message,
      isAdminNotification: false,
    })
  );
  await sendMail({
    to: email,
    subject: `Inquiry Received: FirstLease Statutory Compliance Desk`,
    html: customerHtml,
  });

  // 2. Optional Admin / Sales Alert Email
  if (adminNotificationEmail || process.env.ADMIN_ALERT_EMAIL) {
    const targetAdmin = adminNotificationEmail || process.env.ADMIN_ALERT_EMAIL || "leads@firstlease.in";
    const adminHtml = await render(
      ContactInquiryEmail({
        name,
        email,
        phone,
        service,
        message,
        isAdminNotification: true,
      })
    );
    await sendMail({
      to: targetAdmin,
      subject: `🚨 New Lead Inquiry: ${name} (${service || "Compliance"})`,
      html: adminHtml,
    });
  }

  return { success: true };
}

/**
 * Send Payment Fee Receipt Email
 */
export async function sendPaymentReceiptEmail({
  to,
  userName,
  serviceName,
  amount,
  transactionId,
  orderId,
}: {
  to: string;
  userName: string;
  serviceName: string;
  amount: number;
  transactionId: string;
  orderId: string;
}) {
  const html = await render(
    PaymentReceiptEmail({
      userName,
      serviceName,
      amount,
      transactionId,
      orderId,
      paymentDate: new Date().toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    })
  );
  return sendMail({
    to,
    subject: `Payment Confirmation: ₹${amount.toLocaleString("en-IN")} (${orderId})`,
    html,
  });
}

/**
 * Send Government Certificate Issuance Email
 */
export async function sendCertificateIssuedEmail({
  to,
  userName,
  certificateName,
  registrationNumber,
}: {
  to: string;
  userName: string;
  certificateName: string;
  registrationNumber: string;
}) {
  const html = await render(
    CertificateIssuedEmail({
      userName,
      certificateName,
      registrationNumber,
      issuedDate: new Date().toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    })
  );
  return sendMail({
    to,
    subject: `Government Certificate Issued: ${certificateName}`,
    html,
  });
}

/**
 * Send Password Reset Link Email
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: {
  to: string;
  userName: string;
  resetUrl: string;
}) {
  const html = await render(
    PasswordResetEmail({
      userName,
      userEmail: to,
      resetUrl,
    })
  );
  return sendMail({
    to,
    subject: `Reset Your FirstLease Password`,
    html,
  });
}
