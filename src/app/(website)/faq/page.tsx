import React from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Link from "next/link";
import { HelpCircle, MapPin, PhoneCall, Mail } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQPage() {

  const complianceFaqs = [
      {
        q: "What government registrations does my business need?",
        a: "The registrations required depend on your business structure, industry, location, and nature of operations. Common requirements may include company or LLP incorporation, GST registration, MSME registration, Shops & Establishments registration, and other applicable registrations or licenses.",
      },
      {
        q: "How long does the business incorporation process take?",
        a: "The timeline depends on the type of business, completeness of documents, and government processing time. Once the required information and documents are submitted correctly, the application can be processed within the applicable statutory and government timelines.",
      },
      {
        q: "What licenses and permits are required for my business?",
        a: "Licensing requirements vary based on the industry, business activity, location, and applicable regulations. We help identify the relevant licenses, registrations, and approvals that may be required for your business.",
      },
      {
        q: "Are government fees included in the service pricing?",
        a: "Government or statutory fees may be separate from professional service charges, depending on the service selected. The applicable costs and fee components are communicated clearly before proceeding with the application.",
      },
      {
        q: "Is my personal and business information secure?",
        a: "We take appropriate measures to protect the personal, business, and financial information submitted through the website. Documents and information are handled securely and only used for the purposes associated with the requested service, subject to our applicable privacy and security policies.",
      },
      {
        q: "How can I track the status of my application?",
        a: "Application status can be tracked through the available status-tracking process on the website or through updates provided during the registration process. You may also be notified when important actions, documents, or approvals are required.",
      },
      {
        q: "Are online payments secure?",
        a: "Yes. Payments made through the website are processed through secure payment mechanisms. Users should always verify the payment page, transaction details, and amount before completing a payment and retain the transaction confirmation for their records.",
      },
  ];

  return (
    <Section className="bg-slate-50/50 min-h-screen pt-12 pb-20">
      <Container className="max-w-4xl space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary-border text-xs font-semibold text-primary">
            <HelpCircle size={14} />
            <span>FAQ Helpdesk</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            Find answers to common questions about government registrations, business incorporation, licensing requirements, timelines, and payment security.
          </p>
        </div>

        {/* FAQs Accordion List */}
        <Accordion type="single" className="space-y-4 divide-y-0">
          {complianceFaqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all py-0"
            >
              <AccordionTrigger className="p-5 text-base hover:bg-slate-50/40">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="border-t border-slate-100 p-5 mt-0 text-sm text-slate-500">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Support Grid Footer */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Still have questions?</h3>
            <p className="text-sm text-slate-500">
              {`Can't`} find the answer {`you're`} looking for? Reach out to our dedicated compliance team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Live Chat */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center flex flex-col items-center gap-2">
              <div className="size-9 bg-primary-light text-primary rounded-full flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">Address</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Sauch Tower,Udyog Vihar phase-IV Gurugram India
              </p>
              <Link href="/contact" className="mt-1">
                <span className="text-xs font-semibold text-primary hover:underline">Visit &rarr;</span>
              </Link>
            </div>

            {/* Phone support */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center flex flex-col items-center gap-2">
              <div className="size-9 bg-primary-light text-primary rounded-full flex items-center justify-center">
                <PhoneCall size={18} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">Call Support</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Call our direct support line.
              </p>
              <a href="tel:+919876543210" className="mt-1">
                <span className="text-xs font-semibold text-primary hover:underline">+91 9773880555</span>
              </a>
            </div>

            {/* Email support */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center flex flex-col items-center gap-2">
              <div className="size-9 bg-primary-light text-primary rounded-full flex items-center justify-center">
                <Mail size={18} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">Email Query</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Write to our compliance email.
              </p>
              <a href="mailto:info@cpi.com" className="mt-1">
                <span className="text-xs font-semibold text-primary hover:underline">Send Email &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}