import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
  Link,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import siteConfig from "@/config/site";

interface PasswordResetEmailProps {
  userName?: string;
  userEmail?: string;
  resetUrl?: string;
}

export const PasswordResetEmail = ({
  userName = "Valued Client",
  userEmail = "client@example.com",
  resetUrl = siteConfig.getAbsoluteUrl("/reset-password?token=sample-reset-token-12345"),
}: PasswordResetEmailProps) => {
  return (
    <EmailLayout previewText={`Reset your ${siteConfig.name} password`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          Reset your password
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {userName},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[16px]">
          We received a request to reset the password for your account (<strong className="text-slate-800 font-medium">{userEmail}</strong>). This link is valid for 60 minutes and can only be used once.
        </Text>
      </Section>

      {/* Primary Action Button */}
      <Section className="text-left my-[24px]">
        <Button
          href={resetUrl}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          Reset password
        </Button>
      </Section>

      <Section className="mt-[24px] pt-[16px] border-t border-slate-100">
        <Text className="text-[12px] text-slate-400 leading-[18px] my-0 mb-[6px]">
          If the button does not work, copy and paste this link into your browser:
        </Text>
        <Link
          href={resetUrl}
          className="text-[12px] text-indigo-600 font-mono break-all leading-[18px] underline block mb-[16px]"
        >
          {resetUrl}
        </Link>
        <Text className="text-[12px] text-slate-400 leading-[18px] my-0">
          If you did not request this change, you can safely ignore this email. Your current password will not be changed.
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default PasswordResetEmail;
