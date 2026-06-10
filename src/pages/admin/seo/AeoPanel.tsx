import type { AeoOptimization } from "./seoPanelTypes";

type AeoPanelProps = {
  aeoOptimizations: AeoOptimization[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function AeoPanel({ aeoOptimizations, running, callFunction }: AeoPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AEO Optimizer</h2>
          <p className="text-xs text-muted-foreground">
            Reviews existing pages for direct answers, FAQ quality, semantic clarity, snippet readiness, concise summaries, structured answer sections, schema signals and conversational search coverage.
          </p>
        </div>
        <button
          onClick={() => callFunction("optimize-aeo")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "optimize-aeo" ? "Optimizing..." : "Run AEO optimizer"}
        </button>
      </div>
    </div>

    {aeoOptimizations.length === 0 && (
      <p className="text-sm text-muted-foreground">No AEO suggestions yet. Run the optimizer after content optimization and GSC data have been refreshed.</p>
    )}

    {aeoOptimizations.map((item) => {
      const missing = Array.isArray(item.missing_semantic_elements) ? item.missing_semantic_elements as string[] : [];
      const directAnswers = Array.isArray(item.direct_answer_blocks) ? item.direct_answer_blocks as string[] : [];
      const aiSummaries = Array.isArray(item.ai_overview_summaries) ? item.ai_overview_summaries as string[] : [];
      const snippetParagraphs = Array.isArray(item.featured_snippet_paragraphs) ? item.featured_snippet_paragraphs as string[] : [];
      const faqs = Array.isArray(item.faq_improvements) ? item.faq_improvements as string[] : [];
      const headings = Array.isArray(item.semantic_heading_improvements) ? item.semantic_heading_improvements as string[] : [];
      const queries = Array.isArray(item.conversational_search_queries) ? item.conversational_search_queries as string[] : [];
      const improvements = Array.isArray(item.recommended_improvements) ? item.recommended_improvements as string[] : [];

      return (
        <article key={item.id} className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  <a href={item.page_url} target="_blank" rel="noreferrer" className="text-accent underline">
                    {item.page_title}
                  </a>
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.priority_level === "high" ? "bg-red-100 text-red-900" : item.priority_level === "medium" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                }`}>
                  {item.priority_level} priority
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                URL: <span className="text-foreground">{item.page_url}</span> · Topic:{" "}
                <span className="text-foreground">{item.primary_topic}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent" style={{ width: `${item.aeo_score}%` }} />
              </div>
              <span className="tnum text-xs font-semibold text-foreground">{item.aeo_score}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">AEO score</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.aeo_score}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Snippet readiness</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.snippet_readiness_score}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Answer confidence</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.answer_confidence_score}</p>
            </div>
          </div>

          {missing.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {missing.slice(0, 10).map((element) => (
                <span key={`${item.id}-${element}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  missing: {element}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended improvements</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {improvements.slice(0, 7).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Direct answer blocks</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {directAnswers.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Overview summaries</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {aiSummaries.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured snippet paragraphs</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {snippetParagraphs.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">FAQ improvements</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {faqs.slice(0, 5).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Semantic heading improvements</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {headings.slice(0, 5).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversational search queries</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {queries.slice(0, 8).map((query) => (
                  <span key={`${item.id}-${query}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {query}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      );
    })}
  </section>
  );
}
