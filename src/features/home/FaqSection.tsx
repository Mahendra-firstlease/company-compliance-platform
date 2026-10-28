import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import React from "react";
import Image from "next/image";
import { faqs } from "@/data/faq.data";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FaqSection = () => {
  return (
    <Section className="flex-col items-center justify-center bg-slate-50/40 border-b border-slate-200/80">
      <Container className="flex flex-col md:flex-row items-start justify-center gap-10 px-4 md:px-0">
        <div className="shrink-0 max-w-sm w-full mx-auto md:mx-0">
          <Image
            width={380}
            height={380}
            className="w-full rounded-2xl h-auto object-cover shadow-2xs border border-slate-200/80"
            src="/images/home/faq/faq1.webp"
            alt="Frequently asked compliance questions illustration"
          />
        </div>

        <div className="flex-1 w-full">
          <SectionHeading
            className="mb-2"
            align="left"
            title="Frequently Asked"
            highlight="Questions"
            description="Find quick answers to common questions about our compliance services, processes, registrations, and certifications."
          />
          <Accordion type="single" className="divide-y-0 mt-6 w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-slate-200 py-1"
              >
                <AccordionTrigger className="text-base font-semibold py-3 text-slate-900 hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 max-w-2xl pb-3 leading-relaxed pl-0 mt-1 font-normal">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
};

export default FaqSection;
