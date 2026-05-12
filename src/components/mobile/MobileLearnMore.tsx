import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Section {
  heading: string;
  body: ReactNode;
}

/**
 * Mobile-only accordion stack rendering the long-form SEO sections that
 * the desktop layout shows expanded. Content lives in the DOM (not
 * display:none-hidden via JS), so Google indexes it normally — this is the
 * recommended pattern for mobile-first content per Google's guidelines.
 */
const MobileLearnMore = ({ sections }: { sections: Section[] }) => {
  if (!sections.length) return null;
  return (
    <section aria-label="Learn more" className="mt-8">
      <h2 className="mb-3 text-[16px] font-semibold text-foreground">Learn more</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {sections.map((s, i) => (
          <details
            key={s.heading}
            className={`group ${i > 0 ? "border-t border-border" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-[14px] font-semibold text-foreground">{s.heading}</h3>
              <ChevronDown
                className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t border-border px-4 py-4 text-[14px] leading-relaxed text-muted-foreground">
              {s.body}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default MobileLearnMore;
