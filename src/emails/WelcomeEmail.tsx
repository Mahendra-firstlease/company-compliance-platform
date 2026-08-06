import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

interface WelcomeEmailProps {
  userName?: string;
  userEmail?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  userName = "Valued Client",
  userEmail = "client@company.com",
  loginUrl = "https://compliance.in/login",
}: WelcomeEmailProps) => {
  return (
    <EmailLayout previewText={`Welcome to FirstLease, ${userName}! Your business compliance portal is ready.`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-indigo-600 my-0">
          Account Activation Complete
        </Text>
        <Heading className="text-[24px] font-extrabold text-slate-900 leading-[32px] mt-[8px] mb-[16px]">
          Welcome to FirstLease Statutory Compliance
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Thank you for creating your corporate account on FirstLease. Your business workspace is now active, giving you direct access to 15+ statutory registration services, real-time government filing tracking, and secure document vault storage.
        </Text>
      </Section>

      {/* Feature Highlights Box */}
      <Section className="bg-slate-50 border border-slate-200/80 rounded-lg p-[20px] my-[20px]">
        <Text className="text-[13px] font-bold text-slate-800 my-0 mb-[12px]">
          Your Portal Capabilities:
        </Text>
        <Text className="text-[13px] text-slate-600 my-[6px]">
          ✓ <strong>Fast-Track Filings:</strong> Apply for Private Limited, GST, FSSAI & MSME.
        </Text>
        <Text className="text-[13px] text-slate-600 my-[6px]">
          ✓ <strong>Real-Time Case Tracker:</strong> Monitor ministry processing milestones.
        </Text>
        <Text className="text-[13px] text-slate-600 my-[6px]">
          ✓ <strong>Cloud Document Vault:</strong> Retrieve issued governmental certificates anytime.
        </Text>
        <Text className="text-[13px] text-slate-600 my-[6px]">
          ✓ <strong>Dedicated Officer:</strong> Assigned Chartered Accountant & CS consultation.
        </Text>
      </Section>

      {/* Primary Call to Action Button */}
      <Section className="text-center my-[28px]">
        <Button
          href={loginUrl}
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-lg px-[28px] py-[12px] inline-block shadow-sm"
        >
          Access Your Client Dashboard →
        </Button>
      </Section>

      <Text className="text-[12px] text-slate-400 leading-[20px]">
        Account Email: <span className="font-mono text-slate-600">{userEmail}</span>. If you did not create this account, please notify our security team at security@firstlease.in.
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
