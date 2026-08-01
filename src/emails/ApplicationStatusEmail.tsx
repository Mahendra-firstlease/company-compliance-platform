import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

interface ApplicationStatusEmailProps {
  userName?: string;
  serviceName?: string;
  applicationId?: string;
  status?: string;
  notes?: string;
  dashboardUrl?: string;
}

export const ApplicationStatusEmail = ({
  userName = "Valued Business Client",
  serviceName = "GST Registration Service",
  applicationId = "APP-2026-8941",
  status = "UNDER_REVIEW",
  notes = "Your statutory documents are being verified by our compliance executive officer before submission to the MCA/GST portal.",
  dashboardUrl = "https://compliance.in/dashboard/applications",
}: ApplicationStatusEmailProps) => {
  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return { text: "APPROVED & ISSUED", bg: "#dcfce7", color: "#15803d" };
      case "QUERY_RAISED":
      case "ACTION_REQUIRED":
        return { text: "ACTION REQUIRED", bg: "#fef3c7", color: "#b45309" };
      case "REJECTED":
        return { text: "REJECTED", bg: "#fee2e2", color: "#b91c1c" };
      case "UNDER_REVIEW":
      default:
        return { text: "IN PROGRESS / UNDER REVIEW", bg: "#e0e7ff", color: "#4338ca" };
    }
  };

  const badge = getStatusBadge(status);

  return (
    <EmailLayout previewText={`Update on ${serviceName} (${applicationId}): Status is now ${badge.text}`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 my-0">
          Case Status Notification
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
          Filing Status Update for {serviceName}
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          There is an official update regarding your statutory compliance application reference{" "}
          <strong className="font-mono text-indigo-600">{applicationId}</strong>.
        </Text>
      </Section>

      {/* Case Details Box */}
      <Section className="bg-slate-50 border border-slate-200 rounded-xl p-[20px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Service:</td>
            <td className="text-[13px] font-bold text-slate-800 pb-[8px] align-top">{serviceName}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Reference ID:</td>
            <td className="text-[13px] font-mono font-bold text-slate-800 pb-[8px]">{applicationId}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Current Status:</td>
            <td className="pb-[8px]">
              <span
                style={{ backgroundColor: badge.bg, color: badge.color }}
                className="text-[11px] font-black px-[10px] py-[3px] rounded-full uppercase inline-block"
              >
                {badge.text}
              </span>
            </td>
          </tr>
          {notes && (
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pt-[8px]" colSpan={2}>
                <div className="border-t border-slate-200/80 pt-[12px] mt-[4px]">
                  <strong className="text-slate-700 block mb-[4px]">Compliance Officer Notes:</strong>
                  <span className="text-[13px] text-slate-600 leading-[20px]">{notes}</span>
                </div>
              </td>
            </tr>
          )}
        </table>
      </Section>

      {/* Action Button */}
      <Section className="text-center my-[28px]">
        <Button
          href={dashboardUrl}
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-xl px-[28px] py-[12px] inline-block shadow-sm"
        >
          View Case Details in Portal →
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ApplicationStatusEmail;
