import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

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
      <EmailLayout previewText={`New Lead Alert: Inquiry from ${name} for ${service}`}>
        <Section className="my-[16px]">
          <Text className="text-[12px] font-bold uppercase tracking-wider text-amber-600 my-0">
            Internal Sales & Compliance Lead Alert
          </Text>
          <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
            New Website Inquiry Received
          </Heading>
          <Text className="text-[14px] text-slate-600 leading-[24px]">
            A new client inquiry has been submitted via the web portal contact desk.
          </Text>
        </Section>

        <Section className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-[20px] my-[20px]">
          <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Client Name:</td>
              <td className="text-[13px] font-bold text-slate-900 pb-[8px]">{name}</td>
            </tr>
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Email Address:</td>
              <td className="text-[13px] font-mono text-indigo-600 pb-[8px]">{email}</td>
            </tr>
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Phone Number:</td>
              <td className="text-[13px] font-mono text-slate-900 pb-[8px]">{phone || "N/A"}</td>
            </tr>
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Service Interest:</td>
              <td className="text-[13px] font-bold text-indigo-700 pb-[8px]">{service || "General Inquiry"}</td>
            </tr>
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pt-[8px]" colSpan={2}>
                <div className="border-t border-amber-200/60 pt-[12px] mt-[4px]">
                  <strong className="text-slate-800 block mb-[4px]">Message Notes:</strong>
                  <span className="text-[13px] text-slate-700 italic leading-[20px]">"{message}"</span>
                </div>
              </td>
            </tr>
          </table>
        </Section>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout previewText={`Inquiry Confirmation: We received your request for ${service}`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 my-0">
          Inquiry Received
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
          Thank you for contacting FirstLease Compliance
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{name}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          We have received your inquiry regarding <strong className="text-indigo-600">{service}</strong>. A dedicated compliance executive has been assigned to your request and will get in touch with you within 2 business hours.
        </Text>
      </Section>

      <Section className="bg-slate-50 border border-slate-200 rounded-lg p-[20px] my-[20px]">
        <Text className="text-[12px] font-bold text-slate-700 uppercase tracking-wider my-0 mb-[8px]">
          Summary of Your Request:
        </Text>
        <Text className="text-[13px] text-slate-600 my-[4px]">
          <strong>Selected Service:</strong> {service || "General Compliance Inquiry"}
        </Text>
        {phone && (
          <Text className="text-[13px] text-slate-600 my-[4px]">
            <strong>Callback Contact:</strong> {phone}
          </Text>
        )}
        <Text className="text-[13px] text-slate-600 my-[4px]">
          <strong>Submitted Message:</strong> "{message}"
        </Text>
      </Section>

      <Section className="text-center my-[28px]">
        <Button
          href="https://compliance.in/services"
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-lg px-[28px] py-[12px] inline-block shadow-sm"
        >
          Explore All Compliance Services →
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ContactInquiryEmail;
