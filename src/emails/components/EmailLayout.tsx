import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Tailwind,
} from "@react-email/components";
import { siteConfig } from "@/config/site";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
  logoUrl?: string;
}

export const EmailLayout = ({
  previewText,
  children,
  logoUrl = siteConfig.getEmailAssetUrl("/company-logo/logo-lg.png"),
}: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-slate-50 font-sans text-slate-800 my-auto mx-auto p-4 sm:p-6">
          <Container className="bg-white border border-solid border-slate-200/80 rounded-xl my-[32px] mx-auto p-[36px] max-w-[560px]">
            {/* Header with Company Logo */}
            <Section className="mb-[28px] pb-[18px] border-b border-solid border-slate-100">
              <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td align="left" style={{ verticalAlign: "middle" }}>
                      <Link href={siteConfig.url} style={{ textDecoration: "none", display: "inline-block" }}>
                        <Img
                          src={logoUrl}
                          alt={siteConfig.name}
                          width={134}
                          height={43}
                          style={{
                            display: "block",
                            border: "none",
                            outline: "none",
                            textDecoration: "none",
                          }}
                        />
                      </Link>
                    </td>
                    <td align="right" style={{ verticalAlign: "middle" }}>
                      <span className="text-[11px] font-medium text-slate-400">
                        Official Notification
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Main Email Content */}
            {children}

            {/* Footer Divider */}
            <Hr className="border-slate-100 my-[28px]" />

            {/* Distilled Footer */}
            <Section className="text-center">
              <Text className="text-[12px] text-slate-500 font-medium leading-[18px] my-0">
                {siteConfig.company}
              </Text>
              <Text className="text-[11px] text-slate-400 leading-[18px] my-[6px]">
                Questions or support? Write to{" "}
                <Link
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="text-indigo-600 font-medium underline"
                >
                  {siteConfig.supportEmail}
                </Link>
              </Text>
              <Text className="text-[10px] text-slate-400 leading-[16px] my-[10px]">
                © {new Date().getFullYear()} {siteConfig.company}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
