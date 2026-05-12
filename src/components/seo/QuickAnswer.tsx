import type { QuickAnswer as QA } from "@/data/quickAnswers";

interface Props {
  data: QA;
  className?: string;
}

/**
 * Compact answer pill placed near the top of calculator pages so AI Overviews
 * and Perplexity can lift a direct, citation-ready answer. Themed with
 * existing semantic tokens — no hard-coded colours.
 */
const QuickAnswer = ({ data, className = "" }: Props) => (
  <aside
    aria-label="Quick answer"
    className={`rounded-xl border border-border bg-surface px-4 py-3 ${className}`}
  >
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      Quick answer · {data.question}
    </p>
    <p className="quick-answer-a text-[14px] leading-relaxed text-foreground/90">
      {data.answer}
    </p>
  </aside>
);

export default QuickAnswer;
