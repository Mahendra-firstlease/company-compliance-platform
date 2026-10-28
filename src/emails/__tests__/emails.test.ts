import { describe, it, expect } from "vitest";
import { render } from "@react-email/render";
import { WelcomeEmail } from "../WelcomeEmail";
import { ApplicationStatusEmail } from "../ApplicationStatusEmail";
import { ContactInquiryEmail } from "../ContactInquiryEmail";
import { PaymentReceiptEmail } from "../PaymentReceiptEmail";
import { CertificateIssuedEmail } from "../CertificateIssuedEmail";
import { PasswordResetEmail } from "../PasswordResetEmail";
import siteConfig from "@/config/site";

describe("Email Templates Rendering", () => {
  it("renders WelcomeEmail without errors and contains correct site domain", async () => {
    const html = await render(
      WelcomeEmail({ userName: "Aarav Sharma", userEmail: "aarav@example.com" })
    );
    expect(html).toContain("Welcome");
    expect(html).toContain("Aarav Sharma");
    expect(html).toContain(siteConfig.emailAssetUrl);
  });

  it("renders ApplicationStatusEmail with dynamic badge and links", async () => {
    const html = await render(
      ApplicationStatusEmail({
        userName: "Aarav Sharma",
        serviceName: "GST Registration",
        applicationId: "APP-2026-9012",
        status: "APPROVED",
        notes: "Approved by authority.",
      })
    );
    expect(html).toContain("APP-2026-9012");
    expect(html).toContain("Approved");
    expect(html).toContain(siteConfig.getAbsoluteUrl("/dashboard/applications"));
  });

  it("renders ContactInquiryEmail for client and admin notifications", async () => {
    const clientHtml = await render(
      ContactInquiryEmail({
        name: "Priya Malhotra",
        email: "priya@example.com",
        service: "Company Incorporation",
        message: "Looking for fast track registration.",
        isAdminNotification: false,
      })
    );
    expect(clientHtml).toContain("Company Incorporation");
    expect(clientHtml).toContain(siteConfig.getAbsoluteUrl("/services"));

    const adminHtml = await render(
      ContactInquiryEmail({
        name: "Priya Malhotra",
        email: "priya@example.com",
        service: "Company Incorporation",
        message: "Looking for fast track registration.",
        isAdminNotification: true,
      })
    );
    expect(adminHtml).toContain("New website inquiry");
    expect(adminHtml).toContain("Priya Malhotra");
  });

  it("renders PaymentReceiptEmail with formatted amounts and transaction ID", async () => {
    const html = await render(
      PaymentReceiptEmail({
        userName: "Rajesh Kumar",
        transactionId: "pay_N8g2X1Z9qL4v",
        amount: 4999,
        serviceName: "Private Limited Incorporation",
        orderId: "ORD-2026-9012",
        paymentDate: "27 Oct 2026",
      })
    );
    expect(html).toContain("pay_N8g2X1Z9qL4v");
    expect(html).toContain("4,999");
  });

  it("renders CertificateIssuedEmail and PasswordResetEmail", async () => {
    const certHtml = await render(
      CertificateIssuedEmail({
        userName: "Rajesh Kumar",
        certificateName: "Certificate of Incorporation",
        registrationNumber: "U74999DL2026PTC384920",
        issuedDate: "27 Oct 2026",
      })
    );
    expect(certHtml).toContain("U74999DL2026PTC384920");

    const resetHtml = await render(
      PasswordResetEmail({
        userName: "Rajesh Kumar",
        userEmail: "rajesh@example.com",
      })
    );
    expect(resetHtml).toContain("Reset your password");
    expect(resetHtml).toContain(siteConfig.url);
  });
});

