import { ShieldCheck } from "lucide-react";

interface LastReviewedProps {
  /** ISO date string (YYYY-MM-DD). Defaults to today. */
  date?: string;
  /** Reviewer display name. Defaults to the Calcy editorial team. */
  reviewer?: string;
  className?: string;
}

/**
 * E-E-A-T trust badge. Shown on every calculator and guide so Google sees
 * a clear authorship + freshness signal. The same `date` should be passed
 * into <ArticleJsonLd dateModified={...}/> for consistency.
 */
const LastReviewed = ({
  date = new Date().toISOString().slice(0, 10),
  reviewer = "Calcy editorial team",
  className = "",
}: LastReviewedProps) => {
  const human = new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-muted-foreground ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
      <span>
        Last reviewed <time dateTime={date}>{human}</time> · {reviewer}
      </span>
    </div>
  );
};

export default LastReviewed;
