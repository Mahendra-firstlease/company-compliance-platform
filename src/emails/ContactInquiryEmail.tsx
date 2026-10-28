import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import siteConfig from "@/config/site";

interface ContactInquiryEmailProps {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  isAdminNotification?: boolean;
}

export const ContactInquiryEmail = ({
  name = "Aarav Sharma",
  email = "aarav.sharma@example.com",
  phone = "+91 98765 43210",
  service = "Private Limited Incorporation",
  message = "Interested in quick company registration and GST filing package for a tech startup.",
  isAdminNotification = false,
}: ContactInquiryEmailProps) => {
  if (isAdminNotification) {
    return (
      <EmailLayout previewText={`Lead Alert: Inquiry from ${name} for ${service}`}>
        <Section className="my-[8px]">
          <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
            New website inquiry
          </Heading>
          <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
            A new client inquiry was submitted via the contact form.
          </Text>
        </Section>

        {/* Lead Details */}
        <Section className="bg-slate-50 border border-solid border-slate-200/70 rounded-lg p-[18px] my-[20px]">
          <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td className="text-[12px] font-medium text-slate-400 pb-[8px]" style={{ width: "30%" }}>
                  Name
                </td>
                <td className="text-[13px] font-semibold text-slate-800 pb-[8px]">
                  {name}
                </td>
              </tr>
              <tr>
                <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                  Email
                </td>
                <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                  {email}
                </td>
              </tr>
              <tr>
                <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                  Phone
                </td>
                <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                  {phone || "Not provided"}
                </td>
              </tr>
              <tr>
                <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                  Service
                </td>
                <td className="text-[13px] font-semibold text-slate-800 pb-[8px]">
                  {service || "General Inquiry"}
                </td>
              </tr>
              {message && (
                <tr>
                  <td colSpan={2} className="pt-[10px]">
                    <div className="border-t border-slate-200/70 pt-[10px]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-[4px]">
                        Message
                      </span>
                      <span className="text-[13px] text-slate-700 leading-[20px]">
                        {message}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout previewText={`We received your inquiry regarding ${service}`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          We received your inquiry
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {name},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
          Thank you for contacting us regarding <strong className="text-slate-800 font-semibold">{service}</strong>. A compliance specialist will review your requirements and reach out within two business hours.
        </Text>
      </Section>

      {/* Inquiry Summary */}
      <Section className="bg-slate-50 border border-solid border-slate-200/70 rounded-lg p-[18px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]" style={{ width: "30%" }}>
                Service
              </td>
              <td className="text-[13px] font-semibold text-slate-800 pb-[8px]">
                {service || "General Compliance Inquiry"}
              </td>
            </tr>
            {phone && (
              <tr>
                <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                  Contact
                </td>
                <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                  {phone}
                </td>
              </tr>
            )}
            {message && (
              <tr>
                <td colSpan={2} className="pt-[10px]">
                  <div className="border-t border-slate-200/70 pt-[10px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-[4px]">
                      Your message
                    </span>
                    <span className="text-[13px] text-slate-700 leading-[20px]">
                      {message}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* Action CTA */}
      <Section className="text-left my-[24px]">
        <Button
          href={siteConfig.getAbsoluteUrl("/services")}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          Explore services
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ContactInquiryEmail;
