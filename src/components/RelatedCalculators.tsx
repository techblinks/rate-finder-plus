import { Link } from "react-router-dom";

interface RelatedItem {
  to: string;
  label: string;
}

const RelatedCalculators = ({ items }: { items: RelatedItem[] }) => (
  <section aria-labelledby="related-heading">
    <h2 id="related-heading" className="mb-4">Related calculators</h2>
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((it) => (
        <li key={it.to}>
          <Link
            to={it.to}
            className="block rounded-lg border border-border bg-surface px-4 py-3 text-[14px] font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export default RelatedCalculators;
