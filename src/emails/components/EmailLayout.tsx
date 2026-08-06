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
  Tailwind,
} from "@react-email/components";

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans text-slate-800 my-auto mx-auto p-2">
          <Container className="border border-solid border-slate-200 rounded-lg bg-white my-[40px] mx-auto p-[32px] max-w-[600px] shadow-sm">
            
            {/* Header Brand Bar */}
            <Section className="mb-[24px] pb-[20px] border-b border-solid border-slate-100">
              <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                <tr>
                  <td align="left">
                    <span className="text-[20px] font-black tracking-tight text-indigo-600">
                      FirstLease
                    </span>
                    <span className="text-[12px] font-bold text-slate-400 block tracking-wider uppercase mt-1">
                      Statutory Compliance & Legal Registrations
                    </span>
                  </td>
                  <td align="right">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      MCA & GST Portal
                    </span>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Main Email Content Slot */}
            {children}

            {/* Footer Divider */}
            <Hr className="border-slate-100 my-[24px]" />

            {/* Corporate Footer */}
            <Section className="text-center">
              <Text className="text-[12px] text-slate-500 font-medium leading-[20px] my-0">
                FirstLease Statutory Compliance Services India Pvt. Ltd.
              </Text>
              <Text className="text-[11px] text-slate-400 leading-[18px] my-[4px]">
                Official Partner for MCA, GSTIN, FSSAI & Trademark Filings
              </Text>
              <Text className="text-[11px] text-slate-400 my-[8px]">
                Need assistance? Contact our compliance desk at{" "}
                <Link
                  href="mailto:support@firstlease.in"
                  className="text-indigo-600 underline font-semibold"
                >
                  support@firstlease.in
                </Link>{" "}
                or call +91 (800) 123-4567.
              </Text>
              <Text className="text-[10px] text-slate-400 uppercase tracking-widest my-[12px]">
                © {new Date().getFullYear()} FirstLease. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
