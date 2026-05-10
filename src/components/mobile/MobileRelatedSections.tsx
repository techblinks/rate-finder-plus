import { Link } from "react-router-dom";
import { GUIDES } from "@/data/guides";

const CALCULATOR_TO_GUIDES: Record<string, string[]> = {
  "/mortgage-calculator": [
    "fixed-vs-variable-rate",
    "borrowing-power-australia",
    "stamp-duty-australia-2026",
  ],
  "/stamp-duty-calculator": [
    "stamp-duty-australia-2026",
    "first-home-buyer-grants-2026",
    "what-is-lmi",
  ],
  "/borrowing-power-calculator": [
    "borrowing-power-australia",
    "fixed-vs-variable-rate",
    "what-is-lmi",
  ],
  "/lmi-calculator": [
    "what-is-lmi",
    "first-home-buyer-grants-2026",
    "borrowing-power-australia",
  ],
  "/extra-repayments-calculator": [
    "fixed-vs-variable-rate",
    "borrowing-power-australia",
  ],
  "/loan-comparison-calculator": [
    "fixed-vs-variable-rate",
    "borrowing-power-australia",
    "what-is-lmi",
  ],
  "/refinance-calculator": [
    "fixed-vs-variable-rate",
    "borrowing-power-australia",
    "what-is-lmi",
  ],
  "/rent-vs-buy-calculator": [
    "borrowing-power-australia",
    "first-home-buyer-grants-2026",
    "stamp-duty-australia-2026",
  ],
};

interface Props {
  canonical: string;
  related: { to: string; label: string }[];
}

const MobileRelatedSections = ({ canonical, related }: Props) => {
  const slugs = CALCULATOR_TO_GUIDES[canonical] ?? [];
  const guides = slugs
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="mt-8 space-y-8">
      {related.length > 0 && (
        <section aria-labelledby="m-related-calcs">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="m-related-calcs" className="text-[15px] font-semibold text-foreground">
              Try next
            </h2>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
            {related.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="snap-start shrink-0 rounded-2xl border border-border bg-card px-4 py-3 text-[13px] font-semibold text-foreground active:scale-[0.97] transition-transform"
                style={{ minWidth: 140 }}
              >
                {it.label}
                <span className="block mt-1 text-[12px] font-medium text-accent">Open →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section aria-labelledby="m-related-guides">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="m-related-guides" className="text-[15px] font-semibold text-foreground">
              Latest guides & insights
            </h2>
            <Link to="/guides" className="text-[13px] font-medium text-accent">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {guides.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "hsl(var(--accent-light))", color: "hsl(var(--accent))" }}
                >
                  {g.category}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground line-clamp-2">
                  {g.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
                  {g.metaDescription}
                </p>
                <p className="mt-2 text-[12px] font-medium text-muted-foreground">
                  {g.readMins} min read · Read more →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MobileRelatedSections;
