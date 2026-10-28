import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import { siteConfig } from "@/config/site";

interface WelcomeEmailProps {
  userName?: string;
  userEmail?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  userName = "Valued Client",
  userEmail = "client@company.com",
  loginUrl = siteConfig.getAbsoluteUrl("/login"),
}: WelcomeEmailProps) => {
  return (
    <EmailLayout previewText={`Welcome to ${siteConfig.name}, ${userName}. Your compliance workspace is ready.`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          Welcome to {siteConfig.name}
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {userName},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
          Your business compliance workspace is active. You can now manage company filings, track ministry milestone status in real time, and store your statutory certificates securely.
        </Text>
      </Section>

      {/* Primary Call to Action */}
      <Section className="text-left my-[24px]">
        <Button
          href={loginUrl}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          Open your workspace
        </Button>
      </Section>

      <Section className="mt-[24px] pt-[16px] border-t border-slate-100">
        <Text className="text-[12px] text-slate-400 leading-[18px] my-0">
          Account email: <span className="text-slate-600 font-medium">{userEmail}</span>. If you did not create this account, please contact us at{" "}
          <span className="text-slate-600">{siteConfig.supportEmail}</span>.
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default WelcomeEmail;
