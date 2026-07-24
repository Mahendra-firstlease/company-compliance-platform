import React from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Link from "next/link";
import { HelpCircle, MessageSquare, PhoneCall, Mail } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQPage() {

  const complianceFaqs = [
    {
      q: "What documents are required for registrations?",
      a: "Required documents vary per compliance product. Usually, basic KYC details (promoter PAN Cards, Aadhaar Cards, or Passports) and address proof of the registered office (Utility bill, Rent agreement, or NOC from owner) are mandatory. You can view the exact checklist on each individual Service Detail Page."
    },
    {
      q: "How long does the incorporation process take?",
      a: "Incorporating a Private Limited Company or LLP typically takes 7 to 10 working days. This timeframe covers digital signature certificates (DSC), director identification numbers (DIN), name approval reservations, and final Certificate of Incorporation (COI) issuance."
    },
    {
      q: "Are the government fees included in the pricing?",
      a: "Yes, the listed price on our portal represents a transparent fee structure. We display the breakdown of government fees and our professional filing charges clearly so you face zero hidden costs."
    },
    {
      q: "Is document upload and storage secure?",
      a: "Absolutely. We prioritize document security. All files uploaded through our secure portal are encrypted both in transit (SSL/TLS) and at rest. Access is strictly restricted to assigned compliance experts and executives handling your files."
    },
    {
      q: "How can I track my application status?",
      a: "After you complete your document uploads and fees, you will receive real-time updates directly on your dashboard. We track milestones from 'Document Review' and 'Government Submission' up to final 'Certificate Generated'."
    },
    {
      q: "What is your refund policy?",
      a: "Professional service charges are fully refundable if we have not initiated the document verification or filing process. Any statutory government fees already paid to government departments are non-refundable."
    },
    {
      q: "Can I register a business at a residential address?",
      a: "Yes. Under Indian company law, you can register a residential property (including rental properties with a landlord NOC) as your business's registered office address."
    }
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
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
                <MessageSquare size={18} />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">Live Web Chat</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Chat with a legal associate online.
              </p>
              <Link href="/contact" className="mt-1">
                <span className="text-xs font-semibold text-primary hover:underline">Start Chat &rarr;</span>
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
                <span className="text-xs font-semibold text-primary hover:underline">+91 98765 43210</span>
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
              <a href="mailto:support@complianceportal.com" className="mt-1">
                <span className="text-xs font-semibold text-primary hover:underline">Send Email &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
