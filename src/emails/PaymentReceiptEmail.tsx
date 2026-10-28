import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";
import { siteConfig } from "@/config/site";

interface PaymentReceiptEmailProps {
  userName?: string;
  serviceName?: string;
  amount?: number;
  transactionId?: string;
  orderId?: string;
  paymentDate?: string;
  dashboardUrl?: string;
}

export const PaymentReceiptEmail = ({
  userName = "Valued Business Client",
  serviceName = "Private Limited Incorporation",
  amount = 4999,
  transactionId = "pay_P9aK7x18vLmQ2",
  orderId = "ORD-2026-9042",
  paymentDate = "July 30, 2026",
  dashboardUrl = siteConfig.getAbsoluteUrl("/dashboard/applications"),
}: PaymentReceiptEmailProps) => {
  return (
    <EmailLayout previewText={`Receipt: ₹${amount.toLocaleString("en-IN")} for ${serviceName} (${orderId})`}>
      <Section className="my-[8px]">
        <Heading className="text-[22px] font-bold tracking-tight text-slate-900 leading-[28px] my-0 mb-[16px]">
          Payment receipt
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[14px]">
          Hello {userName},
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[22px] my-0 mb-[20px]">
          We have received your payment of <strong className="text-slate-900 font-semibold">₹{amount.toLocaleString("en-IN")}</strong> for <strong className="text-slate-900 font-semibold">{serviceName}</strong>. Your filing is now in progress.
        </Text>
      </Section>

      {/* Invoice Receipt Spec */}
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
                Order ID
              </td>
              <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                {orderId}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[8px]">
                Payment ID
              </td>
              <td className="text-[13px] font-mono text-slate-700 pb-[8px]">
                {transactionId}
              </td>
            </tr>
            <tr>
              <td className="text-[12px] font-medium text-slate-400 pb-[12px]">
                Date
              </td>
              <td className="text-[13px] font-medium text-slate-700 pb-[12px]">
                {paymentDate}
              </td>
            </tr>
          </tbody>
        </table>

        <Hr className="border-slate-200/70 my-[8px]" />

        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td className="text-[13px] font-semibold text-slate-700 pt-[6px]">
                Total paid
              </td>
              <td className="text-[15px] font-bold text-slate-900 pt-[6px] text-right">
                ₹{amount.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Action CTA */}
      <Section className="text-left my-[24px]">
        <Button
          href={dashboardUrl}
          className="bg-indigo-600 text-white font-semibold text-[13px] rounded-lg px-[24px] py-[11px] inline-block no-underline"
        >
          Track filing progress
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default PaymentReceiptEmail;
