import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Service } from "@/types/services";

export default function FaqsTab({ service }: { service: Service }) {
  const faqs = service.faqs || [];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">
        Frequently Asked Questions
      </h2>

      {faqs.length > 0 ? (
        <Accordion type="single" className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="py-2.5 first:pt-0 last:pb-0"
            >
              <AccordionTrigger className="text-sm font-semibold text-slate-800 hover:text-primary py-2 cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-slate-500 py-2">
          No FAQs available for this service yet.
        </p>
      )}
    </div>
  );
}
