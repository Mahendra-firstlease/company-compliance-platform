import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

interface PasswordResetEmailProps {
  userName?: string;
  userEmail?: string;
  resetUrl?: string;
}

export const PasswordResetEmail = ({
  userName = "Valued Client",
  userEmail = "client@example.com",
  resetUrl = "https://compliance.in/reset-password?token=sample-reset-token-12345",
}: PasswordResetEmailProps) => {
  return (
    <EmailLayout previewText={`Password Reset Request for your FirstLease Account (${userEmail})`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-amber-600 my-0">
          Account Security Notice
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
          Password Reset Verification Request
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          We received a request to reset the password for your FirstLease corporate compliance account (<strong className="font-mono text-indigo-600">{userEmail}</strong>).
        </Text>
      </Section>

      {/* Expiration Notice Box */}
      <Section className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-[20px] my-[20px]">
        <Text className="text-[13px] font-bold text-amber-900 my-0 mb-[6px]">
          ⚠️ Important Expiration Warning:
        </Text>
        <Text className="text-[13px] text-amber-800 leading-[20px] my-0">
          This single-use password reset link is valid for <strong>60 minutes</strong>. After expiration, you will need to initiate a new request.
        </Text>
      </Section>

      {/* Primary Reset Password Action Button */}
      <Section className="text-center my-[28px]">
        <Button
          href={resetUrl}
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-xl px-[32px] py-[13px] inline-block shadow-sm"
        >
          Reset Your Account Password →
        </Button>
      </Section>

      <Text className="text-[12px] text-slate-500 leading-[20px]">
        Or copy and paste this link into your browser:
      </Text>
      <Text className="text-[11px] font-mono text-indigo-600 break-all bg-slate-50 p-[10px] rounded-lg border border-slate-200/80 my-[8px]">
        {resetUrl}
      </Text>

      <Text className="text-[12px] text-slate-400 leading-[20px] mt-[20px]">
        If you did not request a password reset, you can safely ignore this email — your current password will remain unchanged and secure.
      </Text>
    </EmailLayout>
  );
};

export default PasswordResetEmail;
