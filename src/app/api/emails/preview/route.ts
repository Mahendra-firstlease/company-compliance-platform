import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { ApplicationStatusEmail } from "@/emails/ApplicationStatusEmail";
import { ContactInquiryEmail } from "@/emails/ContactInquiryEmail";
import { PaymentReceiptEmail } from "@/emails/PaymentReceiptEmail";
import { CertificateIssuedEmail } from "@/emails/CertificateIssuedEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get("template") || "welcome";

  let html = "";

  try {
    switch (template.toLowerCase()) {
      case "welcome":
        html = await render(
          WelcomeEmail({
            userName: "Rajesh Kumar",
            userEmail: "rajesh.kumar@techcorp.in",
          })
        );
        break;

      case "status":
      case "application":
        html = await render(
          ApplicationStatusEmail({
            userName: "Rajesh Kumar",
            serviceName: "GST Registration & Filing Service",
            applicationId: "APP-2026-9012",
            status: "UNDER_REVIEW",
            notes: "Application verified by Senior CS. Pending MCA portal acknowledgement upload.",
          })
        );
        break;

      case "contact":
      case "inquiry":
        html = await render(
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
        html = await render(
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

      case "payment":
      case "receipt":
        html = await render(
          PaymentReceiptEmail({
            userName: "Rajesh Kumar",
            serviceName: "Private Limited Registration & Tax Desk",
            amount: 7499,
            transactionId: "pay_R8xL92m1k0P",
            orderId: "ORD-2026-4410",
          })
        );
        break;

      case "certificate":
      case "issued":
        html = await render(
          CertificateIssuedEmail({
            userName: "Rajesh Kumar",
            certificateName: "Private Limited Certificate of Incorporation",
            registrationNumber: "U74999DL2026PTC384920",
          })
        );
        break;

      case "reset":
      case "password-reset":
        html = await render(
          PasswordResetEmail({
            userName: "Rajesh Kumar",
            userEmail: "rajesh.kumar@techcorp.in",
            resetUrl: "http://localhost:3000/reset-password?token=sample-reset-token-12345",
          })
        );
        break;

      default:
        return NextResponse.json(
          {
            error: "Unknown template type",
            availableTemplates: [
              "welcome",
              "status",
              "contact",
              "contact-admin",
              "payment",
              "certificate",
              "reset",
            ],
          },
          { status: 400 }
        );
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("[ReactEmail Preview Error]:", error);
    return NextResponse.json(
      { error: "Failed to render email template", details: error.message },
      { status: 500 }
    );
  }
}
