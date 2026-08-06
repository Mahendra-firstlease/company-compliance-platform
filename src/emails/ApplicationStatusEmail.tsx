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
  dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/applications`,
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
      <Section className="my-4">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-slate-400 my-0">
          Case Status Notification
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-7.5 mt-1.5 mb-4">
          Filing Status Update for {serviceName}
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-6">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-6">
          There is an official update regarding your statutory compliance application reference{" "}
          <strong className="font-mono text-indigo-600">{applicationId}</strong>.
        </Text>
      </Section>

      {/* Case Details Box */}
      <Section className="bg-slate-50 border border-slate-200 rounded-lg p-5 my-5">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-2">Service:</td>
            <td className="text-[13px] font-bold text-slate-800 pb-2 align-top">{serviceName}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-2">Reference ID:</td>
            <td className="text-[13px] font-mono font-bold text-slate-800 pb-2">{applicationId}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-2">Current Status:</td>
            <td className="pb-2">
              <span
                style={{ backgroundColor: badge.bg, color: badge.color }}
                className="text-[11px] font-black px-2.5 py-0.75 rounded-full uppercase inline-block"
              >
                {badge.text}
              </span>
            </td>
          </tr>
          {notes && (
            <tr>
              <td className="text-[12px] font-semibold text-slate-500 pt-2" colSpan={2}>
                <div className="border-t border-slate-200/80 pt-3 mt-1">
                  <strong className="text-slate-700 block mb-1">Compliance Officer Notes:</strong>
                  <span className="text-[13px] text-slate-600 leading-5">{notes}</span>
                </div>
              </td>
            </tr>
          )}
        </table>
      </Section>

      {/* Action Button */}
      <Section className="text-center my-7">
        <Button
          href={dashboardUrl}
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-lg px-7 py-3 inline-block shadow-sm"
        >
          View Case Details in Portal →
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ApplicationStatusEmail;
