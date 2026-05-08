import { Link } from "react-router-dom";

export interface NextStepLink {
  to: string;
  title: string;
  description: string;
}

/**
 * Contextual cross-link block used inside calculator SEO sections to guide
 * users (and search engines) between related tools. Heavier than the bottom
 * "Related calculators" grid — descriptive anchor text + sentence of context.
 */
const NextStepsLinks = ({ items }: { items: NextStepLink[] }) => (
  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {items.map((it) => (
      <li key={it.to}>
        <Link
          to={it.to}
          className="group block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/50"
        >
          <div className="text-[14px] font-semibold text-foreground group-hover:text-accent">
            {it.title} →
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {it.description}
          </p>
        </Link>
      </li>
    ))}
  </ul>
);

export default NextStepsLinks;
