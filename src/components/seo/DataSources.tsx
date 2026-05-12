import { ExternalLink } from "lucide-react";
import type { DataSource } from "@/data/dataSources";

interface Props {
  sources: DataSource[];
  className?: string;
}

/**
 * Per-page data attribution block. Improves AEO citation trust by making
 * primary sources explicit and machine-readable. Rendered above the footer
 * on each calculator page.
 */
const DataSources = ({ sources, className = "" }: Props) => {
  if (!sources || sources.length === 0) return null;
  return (
    <section
      aria-labelledby="data-sources-heading"
      className={`rounded-2xl border border-border bg-surface p-6 ${className}`}
    >
      <h3
        id="data-sources-heading"
        className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
      >
        Data sources
      </h3>
      <ul className="data-sources-list mb-4 space-y-1.5 text-[13px]">
        {sources.map((s) => (
          <li key={s.url} className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent inline-flex items-center gap-1"
            >
              {s.label}
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
            </a>
            <span className="text-[11px] text-muted-foreground">Updated {s.updated}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        All calculations are estimates for informational purposes only. Calcy is
        not a financial adviser. Verify figures with the relevant state revenue
        office or a licensed mortgage broker before making financial decisions.
      </p>
    </section>
  );
};

export default DataSources;
