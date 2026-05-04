import { useState } from "react";
import type { FaqItem } from "@/data/faqs";
import { ChevronDown } from "lucide-react";

const FAQ = ({ items }: { items: FaqItem[] }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4">Frequently Asked Questions</h2>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-[15px] font-medium text-foreground">{f.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-[14px] leading-relaxed text-muted-foreground">
                  {f.answer}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FAQ;
