import { Link } from "react-router-dom";
import { GUIDES } from "@/data/guides";

/**
 * Contextual internal links from a calculator page to the most relevant
 * AU guide articles. Strengthens topical authority by giving Google clear,
 * descriptive anchor text between hub (calculator) and spoke (guide) pages.
 */
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
};

interface RelatedGuidesProps {
  canonical: string;
}

const RelatedGuides = ({ canonical }: RelatedGuidesProps) => {
  const slugs = CALCULATOR_TO_GUIDES[canonical];
  if (!slugs?.length) return null;
  const items = slugs
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  if (!items.length) return null;

  return (
    <section aria-labelledby="related-guides-heading" className="mt-4">
      <h2 id="related-guides-heading" className="mb-3">
        Related Australian mortgage guides
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((g) => (
          <li
            key={g.slug}
            className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <Link
              to={`/guides/${g.slug}`}
              className="text-[15px] font-semibold text-primary hover:underline"
            >
              {g.title}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{g.metaDescription}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {g.category} · {g.readMins} min read
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedGuides;
