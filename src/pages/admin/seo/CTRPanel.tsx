import type { CtrOptimization } from "./seoPanelTypes";

type CTRPanelProps = {
  ctrOptimizations: CtrOptimization[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function CTRPanel({ ctrOptimizations, running, callFunction }: CTRPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI CTR Optimization Engine</h2>
          <p className="text-xs text-muted-foreground">
            Finds high-impression, low-CTR pages, weak snippets, positions 3-15 and declining-click opportunities. Suggestions are admin-only and do not change metadata automatically.
          </p>
        </div>
        <button
          onClick={() => callFunction("optimize-ctr")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "optimize-ctr" ? "Optimizing..." : "Run CTR optimizer"}
        </button>
      </div>
    </div>

    {ctrOptimizations.length === 0 && (
      <p className="text-sm text-muted-foreground">No CTR suggestions yet. Run the optimizer after GSC data has been synced.</p>
    )}

    {ctrOptimizations.map((item) => (
      <article key={item.id} className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              <a href={item.page_url} target="_blank" rel="noreferrer" className="text-accent underline">
                {item.page_url}
              </a>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Keyword: <span className="font-semibold text-foreground">{item.primary_keyword}</span> · Impressions:{" "}
              <span className="tnum text-foreground">{item.impressions_28d.toLocaleString()}</span> · CTR:{" "}
              <span className="tnum text-foreground">{(item.ctr_28d * 100).toFixed(1)}%</span> · Avg pos:{" "}
              <span className="tnum text-foreground">{item.position?.toFixed(1) ?? "—"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-accent" style={{ width: `${item.ctr_opportunity_score || item.priority_score}%` }} />
            </div>
            <span className="tnum text-xs font-semibold text-foreground">{item.ctr_opportunity_score || item.priority_score}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{item.reason}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Impressions</p>
            <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.impressions_28d.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Clicks</p>
            <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.clicks_28d.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">CTR</p>
            <p className="mt-1 text-lg font-semibold tnum text-foreground">{(item.ctr_28d * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg position</p>
            <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.position?.toFixed(1) ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Missed clicks</p>
            <p className="mt-1 text-lg font-semibold tnum text-foreground">{(item.estimated_missed_clicks || 0).toLocaleString()}</p>
          </div>
        </div>

        {Array.isArray(item.signals?.detection_signals) && item.signals.detection_signals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.signals.detection_signals.map((signal: string) => (
              <span key={`${item.id}-${signal}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {signal.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">SEO title</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_title}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Meta description</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_meta_description}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Improved intro</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_intro}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">FAQ snippet</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_faq_snippet}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured snippet answer</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_featured_snippet_answer}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Emotional trigger improvement</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_emotional_trigger || "Use clearer, more practical SERP wording without overpromising."}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Semantic improvements</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_semantic_improvements || "Reflect related query language naturally in headings and snippets."}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Search intent matching</p>
            <p className="mt-1 text-sm text-foreground">{item.suggested_search_intent_match || "Align title, meta, intro and FAQ copy with the primary search intent."}</p>
          </div>
        </div>
      </article>
    ))}
  </section>
  );
}
