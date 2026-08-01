import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

interface CertificateIssuedEmailProps {
  userName?: string;
  certificateName?: string;
  registrationNumber?: string;
  issuedDate?: string;
  downloadUrl?: string;
}

export const CertificateIssuedEmail = ({
  userName = "Valued Business Client",
  certificateName = "Private Limited Certificate of Incorporation",
  registrationNumber = "U74999DL2026PTC384920",
  issuedDate = "July 30, 2026",
  downloadUrl = "https://compliance.in/dashboard/certificates",
}: CertificateIssuedEmailProps) => {
  return (
    <EmailLayout previewText={`Government Certificate Issued: ${certificateName} (${registrationNumber})`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 my-0">
          Official Government Release
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
          Statutory Certificate Ready for Download 🎉
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Great news! Your official government statutory certificate for <strong className="text-indigo-600">{certificateName}</strong> has been granted by the ministry and uploaded to your secure Vault.
        </Text>
      </Section>

      {/* Certificate Meta Box */}
      <Section className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-[20px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Issued Document:</td>
            <td className="text-[13px] font-bold text-slate-900 pb-[8px]">{certificateName}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Registration / CIN / GSTIN No:</td>
            <td className="text-[13px] font-mono font-bold text-indigo-700 pb-[8px]">{registrationNumber}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Issuance Date:</td>
            <td className="text-[13px] font-medium text-slate-700 pb-[8px]">{issuedDate}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Document Vault Status:</td>
            <td className="text-[12px] font-bold text-emerald-700 pb-[8px]">✓ Verified & Stored</td>
          </tr>
        </table>
      </Section>

      <Section className="text-center my-[28px]">
        <Button
          href={downloadUrl}
          className="bg-emerald-600 text-white font-bold text-[14px] rounded-xl px-[28px] py-[12px] inline-block shadow-sm"
        >
          Download Official Certificate PDF →
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default CertificateIssuedEmail;
