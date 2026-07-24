import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Service } from "@/types/services";

export default function FaqsTab({ service }: { service: Service }) {
  const faqs = service.faqs || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Frequently Asked Questions
      </h3>

      {faqs.length > 0 ? (
        <Accordion type="single" className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-gray-200 rounded-lg px-4 bg-white"
            >
              <AccordionTrigger className="text-sm font-semibold text-gray-800 py-3 cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-3 pt-1 border-t border-gray-100">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-gray-500 py-2">
          No FAQs available for this service yet.
        </p>
      )}
    </div>
  );
}
