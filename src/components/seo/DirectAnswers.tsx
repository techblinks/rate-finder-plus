export interface DirectAnswerItem {
  q: string;
  a: string;
}

interface Props {
  items: DirectAnswerItem[];
  className?: string;
  title?: string;
}

/**
 * Conversational Q&A block embedded in guide articles. Distinct from the
 * FAQ schema — this is plain HTML, structured for direct AI extraction at
 * the top of the article body.
 */
const DirectAnswers = ({ items, title = "Quick answers", className = "" }: Props) => {
  if (!items || items.length === 0) return null;
  return (
    <aside
      aria-label={title}
      className={`rounded-r-lg border border-border border-l-4 border-l-foreground bg-surface px-6 py-5 ${className}`}
    >
      <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="border-b border-border pb-4 last:border-b-0 last:pb-0"
          >
            <p className="mb-1 text-[15px] font-semibold text-foreground">{it.q}</p>
            <p className="faq-answer text-[14px] leading-relaxed text-muted-foreground">
              {it.a}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default DirectAnswers;
