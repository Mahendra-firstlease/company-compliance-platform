import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import React from "react";
import Image from "next/image";
import { faqs } from "@/data/faq.data";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FaqSection = () => {

  return (
    <Section className="flex-col items-center justify-center">
      <Container className=" flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0">
        <Image
          width={380}
          height={380}
          className="max-w-sm w-full rounded-lg h-auto"
          src="/images/home/faq/faq1.webp"
          alt=""
        />

        <div>
          <SectionHeading
            className="mb-1"
            align="left"
            badge="FAQs"
            title="Frequently Asked "
            highlight="Questions"
            description="We provide a range of smart compliance assistants to help you stay compliant with the latest regulations and industry best practices."
          />
          <Accordion type="single" className="divide-y-0 mt-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-slate-200 py-1"
              >
                <AccordionTrigger className="text-base font-medium py-3 text-slate-800 hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 max-w-md pb-3 leading-relaxed pl-0 mt-1">
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
