import type { ContentOptimization } from "./seoPanelTypes";

type ContentOptimizerPanelProps = {
  contentOptimizations: ContentOptimization[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function ContentOptimizerPanel({ contentOptimizations, running, callFunction }: ContentOptimizerPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Content Optimizer</h2>
          <p className="text-xs text-muted-foreground">
            Reviews existing pages for headings, FAQs, semantic depth, freshness, internal links, snippet readiness, AI Overview readiness, readability and topical completeness. Suggestions are admin-only.
          </p>
        </div>
        <button
          onClick={() => callFunction("optimize-content")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "optimize-content" ? "Optimizing..." : "Run content optimizer"}
        </button>
      </div>
    </div>

    {contentOptimizations.length === 0 && (
      <p className="text-sm text-muted-foreground">No content optimization suggestions yet. Run the optimizer after GSC, CTR, internal link and content gap data has been refreshed.</p>
    )}

    {contentOptimizations.map((item) => {
      const improvements = Array.isArray(item.recommended_improvements) ? item.recommended_improvements as string[] : [];
      const headings = Array.isArray(item.improved_headings) ? item.improved_headings as string[] : [];
      const faqs = Array.isArray(item.faq_additions) ? item.faq_additions as string[] : [];
      const semanticKeywords = Array.isArray(item.semantic_keywords) ? item.semantic_keywords as string[] : [];
      const tables = Array.isArray(item.comparison_tables) ? item.comparison_tables as string[] : [];
      const snippets = Array.isArray(item.snippet_sections) ? item.snippet_sections as string[] : [];
      const directAnswers = Array.isArray(item.direct_answers) ? item.direct_answers as string[] : [];
      const examples = Array.isArray(item.finance_examples) ? item.finance_examples as string[] : [];
      const calculatorImprovements = Array.isArray(item.calculator_explanation_improvements) ? item.calculator_explanation_improvements as string[] : [];
      const aiSections = Array.isArray(item.ai_overview_sections) ? item.ai_overview_sections as string[] : [];
      const links = Array.isArray(item.internal_linking_suggestions)
        ? item.internal_linking_suggestions as Array<{ target: string; anchor: string; reason: string }>
        : [];

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
                <div className="h-full bg-accent" style={{ width: `${item.optimization_score}%` }} />
              </div>
              <span className="tnum text-xs font-semibold text-foreground">{item.optimization_score}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated impact</p>
              <p className="mt-1 text-sm text-foreground">{item.estimated_impact}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Search signals</p>
              <p className="mt-1 text-sm text-foreground">
                {(Number(item.signals?.impressions_28d || 0)).toLocaleString()} impressions · pos {item.signals?.average_position ?? "n/a"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Quality flags</p>
              <p className="mt-1 text-sm text-foreground">
                {Object.entries(item.signals?.quality_flags || {}).filter(([, value]) => value).length} issues detected
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended improvements</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {improvements.slice(0, 6).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Improved headings</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {headings.slice(0, 5).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">FAQ additions</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {faqs.slice(0, 4).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Semantic keyword opportunities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {semanticKeywords.slice(0, 10).map((keyword) => (
                  <span key={`${item.id}-${keyword}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Comparison tables</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {tables.slice(0, 3).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Snippet sections</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {snippets.slice(0, 3).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Concise direct answers</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {directAnswers.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Finance examples</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {examples.slice(0, 3).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Calculator explanation improvements</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {calculatorImprovements.slice(0, 3).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Internal linking suggestions</p>
              <div className="mt-2 space-y-2 text-sm text-foreground">
                {links.slice(0, 4).map((link) => (
                  <p key={`${item.id}-${link.target}`}>
                    <a href={link.target} target="_blank" rel="noreferrer" className="text-accent underline">{link.target}</a>
                    {" "}as "{link.anchor}"
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Overview sections</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {aiSections.slice(0, 3).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
              </ul>
            </div>
          </div>
        </article>
      );
    })}
  </section>
  );
}
