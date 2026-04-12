import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQItem } from "@/data/faq";

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

const FAQSection = ({ faqs, title = "Frequently Asked Questions" }: FAQSectionProps) => {
  if (!faqs.length) return null;

  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
