import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import { siteConfig } from "@/config/site";

interface CertificateIssuedEmailProps {
  userName?: string;
  certificateName?: string;
  registrationNumber?: string;
  issuedDate?: string;
  downloadUrl?: string;
}

export const CertificateIssuedEmail = ({
  userName = "Valued Business Client",
  certificateName = "Certificate of Incorporation",
  registrationNumber = "U74999DL2026PTC384920",
  issuedDate = "July 30, 2026",
  downloadUrl = siteConfig.getAbsoluteUrl("/dashboard/certificates"),
}: CertificateIssuedEmailProps) => {
  return (
    <EmailLayout previewText={`Certificate Issued: ${certificateName} (${registrationNumber})`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          Your certificate is ready
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {userName},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
          Your official certificate for <strong className="text-slate-800 font-semibold">{certificateName}</strong> has been granted by the issuing authority and archived in your document vault.
        </Text>
      </Section>

      {/* Certificate Meta Box */}
      <Section className="bg-slate-50 border border-solid border-slate-200/70 rounded-lg p-[18px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]" style={{ width: "35%" }}>
                Certificate
              </td>
              <td className="text-[13px] font-semibold text-slate-800 pb-[8px]">
                {certificateName}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                Registration No.
              </td>
              <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                {registrationNumber}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400">
                Issued date
              </td>
              <td className="text-[13px] font-medium text-slate-700">
                {issuedDate}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Action CTA */}
      <Section className="text-left my-[24px]">
        <Button
          href={downloadUrl}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          Download certificate
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default CertificateIssuedEmail;
