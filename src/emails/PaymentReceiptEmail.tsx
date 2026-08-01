import React from "react";
import {
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

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
  serviceName = "Private Limited Incorporation Package",
  amount = 4999,
  transactionId = "pay_P9aK7x18vLmQ2",
  orderId = "ORD-2026-9042",
  paymentDate = "July 30, 2026",
  dashboardUrl = "https://compliance.in/dashboard/documents",
}: PaymentReceiptEmailProps) => {
  return (
    <EmailLayout previewText={`Payment Confirmation: ₹${amount.toLocaleString("en-IN")} for ${serviceName} (${orderId})`}>
      <Section className="my-[16px]">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 my-0">
          Payment Verified & Confirmed
        </Text>
        <Heading className="text-[22px] font-extrabold text-slate-900 leading-[30px] mt-[6px] mb-[16px]">
          Filing Fee Payment Receipt
        </Heading>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          Hello <strong className="text-slate-800">{userName}</strong>,
        </Text>
        <Text className="text-[14px] text-slate-600 leading-[24px]">
          We have successfully received your payment of <strong className="text-slate-900">₹{amount.toLocaleString("en-IN")}</strong> for <strong className="text-indigo-600">{serviceName}</strong>. Your filing application has entered the active case queue.
        </Text>
      </Section>

      {/* Invoice Receipt Box */}
      <Section className="bg-slate-50 border border-slate-200 rounded-xl p-[20px] my-[20px]">
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Order Reference:</td>
            <td className="text-[13px] font-mono font-bold text-slate-800 pb-[8px] align-top">{orderId}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Razorpay Payment ID:</td>
            <td className="text-[13px] font-mono text-indigo-600 pb-[8px]">{transactionId}</td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 pb-[8px]">Date:</td>
            <td className="text-[13px] font-medium text-slate-700 pb-[8px]">{paymentDate}</td>
          </tr>
        </table>

        <Hr className="border-slate-200 my-[12px]" />

        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tr>
            <td className="text-[13px] font-bold text-slate-800 py-[4px]">{serviceName}</td>
            <td className="text-[13px] font-bold text-slate-900 py-[4px] text-right">
              ₹{amount.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr>
            <td className="text-[12px] font-semibold text-slate-500 py-[2px]">Govt Fee & Filing Professional Desk</td>
            <td className="text-[12px] text-slate-500 py-[2px] text-right">Included</td>
          </tr>
          <tr>
            <td className="text-[13px] font-black text-slate-900 pt-[10px]">Total Amount Paid:</td>
            <td className="text-[15px] font-black text-emerald-700 pt-[10px] text-right">
              ₹{amount.toLocaleString("en-IN")}
            </td>
          </tr>
        </table>
      </Section>

      <Section className="text-center my-[28px]">
        <Button
          href={dashboardUrl}
          className="bg-indigo-600 text-white font-bold text-[14px] rounded-xl px-[28px] py-[12px] inline-block shadow-sm"
        >
          Track Case Progress in Portal →
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default PaymentReceiptEmail;
