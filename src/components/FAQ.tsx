import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { FaqItem, FaqLink } from "@/data/faqs";
import { ChevronDown } from "lucide-react";

/**
 * Render a plain answer string with internal links injected for the configured
 * substrings. Each link's `text` is matched once (first occurrence) so we
 * don't double-link repeated phrases like "NSW".
 */
function renderAnswer(answer: string, links?: FaqLink[]): ReactNode {
  if (!links || links.length === 0) return answer;

  const segments: { text: string; href?: string }[] = [{ text: answer }];

  for (const link of links) {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.href) continue; // already a link
      const idx = seg.text.indexOf(link.text);
      if (idx === -1) continue;
      const before = seg.text.slice(0, idx);
      const after = seg.text.slice(idx + link.text.length);
      const replacement: { text: string; href?: string }[] = [];
      if (before) replacement.push({ text: before });
      replacement.push({ text: link.text, href: link.href });
      if (after) replacement.push({ text: after });
      segments.splice(i, 1, ...replacement);
      break;
    }
  }

  return segments.map((seg, i) =>
    seg.href ? (
      <Link
        key={i}
        to={seg.href}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {seg.text}
      </Link>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );
}

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
              <div
                hidden={!isOpen}
                className="px-4 pb-4 text-[14px] leading-relaxed text-muted-foreground"
              >
                {renderAnswer(f.answer, f.links)}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FAQ;
