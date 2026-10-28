import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { ApplicationStatusEmail } from "@/emails/ApplicationStatusEmail";
import { ContactInquiryEmail } from "@/emails/ContactInquiryEmail";
import { PaymentReceiptEmail } from "@/emails/PaymentReceiptEmail";
import { CertificateIssuedEmail } from "@/emails/CertificateIssuedEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import siteConfig from "@/config/site";

export async function GET(request: NextRequest) {
  // In production, restrict preview endpoint to authenticated Admins only
  if (process.env.NODE_ENV === "production") {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get("template") || "welcome";
  const statusParam = searchParams.get("status") || "UNDER_REVIEW";

  let emailHtml = "";

  try {
    switch (template.toLowerCase()) {
      case "welcome":
        emailHtml = await render(
          WelcomeEmail({
            userName: "Rajesh Kumar",
            userEmail: "rajesh.kumar@techcorp.in",
          })
        );
        break;

      case "status":
      case "application":
        emailHtml = await render(
          ApplicationStatusEmail({
            userName: "Rajesh Kumar",
            serviceName: "GST Registration & Filing Service",
            applicationId: "APP-2026-9012",
            status: statusParam,
            notes: "Documents verified by Senior Officer. Case submitted for final ministry seal.",
          })
        );
        break;

      case "contact":
      case "inquiry":
        emailHtml = await render(
          ContactInquiryEmail({
            name: "Priya Malhotra",
            email: "priya@venturestudio.co",
            phone: "+91 98765 12345",
            service: "Private Limited Incorporation",
            message: "Need urgent incorporation for dual director company with foreign equity investment.",
            isAdminNotification: false,
          })
        );
        break;

      case "contact-admin":
      case "lead":
        emailHtml = await render(
          ContactInquiryEmail({
            name: "Priya Malhotra",
            email: "priya@venturestudio.co",
            phone: "+91 98765 12345",
            service: "Private Limited Incorporation",
            message: "Need urgent incorporation for dual director company with foreign equity investment.",
            isAdminNotification: true,
          })
        );
        break;

      case "receipt":
      case "payment":
        emailHtml = await render(
          PaymentReceiptEmail({
            userName: "Rajesh Kumar",
            transactionId: "pay_N8g2X1Z9qL4v",
            amount: 4999,
            serviceName: "Private Limited Incorporation",
            orderId: "ORD-2026-9012",
            paymentDate: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          })
        );
        break;

      case "certificate":
      case "approved":
        emailHtml = await render(
          CertificateIssuedEmail({
            userName: "Rajesh Kumar",
            certificateName: "Certificate of Incorporation",
            registrationNumber: "U74999DL2026PTC384920",
            issuedDate: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            downloadUrl: siteConfig.getAbsoluteUrl("/dashboard/certificates"),
          })
        );
        break;

      case "password":
      case "reset":
        emailHtml = await render(
          PasswordResetEmail({
            userName: "Rajesh Kumar",
            userEmail: "rajesh.kumar@techcorp.in",
            resetUrl: siteConfig.getAbsoluteUrl("/reset-password?token=sample_reset_token_12345"),
          })
        );
        break;

      default:
        emailHtml = await render(
          WelcomeEmail({
            userName: "Rajesh Kumar",
            userEmail: "rajesh.kumar@techcorp.in",
          })
        );
        break;
    }

    const currentKey = template.toLowerCase();

    const tabs = [
      { key: "welcome", label: "Welcome" },
      { key: "status", label: "Status Update" },
      { key: "receipt", label: "Payment Receipt" },
      { key: "certificate", label: "Certificate Issued" },
      { key: "password", label: "Password Reset" },
      { key: "contact", label: "Inquiry (Client)" },
      { key: "contact-admin", label: "Lead Alert (Admin)" },
    ];

    const toolbarHtml = `
      <div id="email-preview-bar" style="position:sticky;top:0;left:0;right:0;z-index:99999;background:#0f172a;color:#f8fafc;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:13px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;display:inline-flex;align-items:center;gap:6px;">
            <span style="width:8px;height:8px;background:#6366f1;border-radius:9999px;display:inline-block;"></span>
            ${siteConfig.name}
          </span>
          <span style="font-size:11px;color:#94a3b8;font-weight:500;">Email Gallery</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          ${tabs
            .map((t) => {
              const active = currentKey === t.key || (currentKey === "application" && t.key === "status");
              return `
              <a href="/api/emails/preview?template=${t.key}" style="text-decoration:none;font-size:11px;font-weight:600;padding:5px 11px;border-radius:6px;transition:all 0.15s ease;${
                active
                  ? "background:#4f46e5;color:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,0.2);"
                  : "background:#1e293b;color:#cbd5e1;border:1px solid #334155;"
              }">${t.label}</a>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    // Inject the navigation toolbar right below <body> tag
    const outputHtml = emailHtml.replace(/<body([^>]*)>/i, `<body$1>${toolbarHtml}`);

    return new NextResponse(outputHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:30px;"><h3>Failed to render template:</h3><pre>${err.message}</pre></body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
