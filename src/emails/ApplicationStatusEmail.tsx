import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import { siteConfig } from "@/config/site";

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
  dashboardUrl = siteConfig.getAbsoluteUrl("/dashboard/applications"),
}: ApplicationStatusEmailProps) => {
  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return { label: "Approved", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
      case "QUERY_RAISED":
      case "ACTION_REQUIRED":
        return { label: "Action required", bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
      case "REJECTED":
        return { label: "Rejected", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
      case "UNDER_REVIEW":
      default:
        return { label: "Under review", bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" };
    }
  };

  const badge = getStatusBadge(status);

  return (
    <EmailLayout previewText={`Update on ${serviceName} (${applicationId}): ${badge.label}`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          Status update: {serviceName}
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {userName},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
          There is an official update regarding your statutory compliance application.
        </Text>
      </Section>

      {/* Clean Metadata Spec */}
      <Section className="bg-slate-50 border border-solid border-slate-200/70 rounded-lg p-[18px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]" style={{ width: "35%" }}>
                Service
              </td>
              <td className="text-[13px] font-semibold text-slate-800 pb-[8px]">
                {serviceName}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                Application ID
              </td>
              <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                {applicationId}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400">
                Status
              </td>
              <td>
                <span
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                  }}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block"
                >
                  {badge.label}
                </span>
              </td>
            </tr>
            {notes && (
              <tr>
                <td colSpan={2} className="pt-[14px]">
                  <div className="border-t border-slate-200/70 pt-[12px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-[4px]">
                      Compliance note
                    </span>
                    <span className="text-[13px] text-slate-600 leading-[20px]">
                      {notes}
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
          href={dashboardUrl}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          View application
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default ApplicationStatusEmail;
