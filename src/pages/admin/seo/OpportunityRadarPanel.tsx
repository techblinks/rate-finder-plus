import type { SeoOpportunity } from "./seoPanelTypes";

type OpportunityRadarPanelProps = {
  scoredOpportunities: SeoOpportunity[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function OpportunityRadarPanel({ scoredOpportunities, running, callFunction }: OpportunityRadarPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Opportunity Radar</h2>
          <p className="text-xs text-muted-foreground">Finds near-page-1 keywords, positions 8-20, high-impression CTR gaps, declining pages, high-value finance topics, refresh needs and weak content matches.</p>
        </div>
        <button
          onClick={() => callFunction("score-seo-opportunities")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "score-seo-opportunities" ? "Scanning..." : "Run Opportunity Radar"}
        </button>
      </div>
    </div>
    {scoredOpportunities.length === 0 && (
      <p className="text-sm text-muted-foreground">No radar opportunities yet. Run GSC sync first if keyword data is empty, then run Opportunity Radar.</p>
    )}
    {scoredOpportunities.map((k, i) => {
      const target = k.target_url || "/";
      const impressions = Number(k.signals?.impressions_28d ?? 0);
      const clicks = Number(k.signals?.clicks_28d ?? 0);
      const ctr = Number(k.signals?.ctr_28d ?? 0);
      const position = Number(k.signals?.average_position ?? k.signals?.position ?? 0);
      const signalLabels = Array.isArray(k.signals?.signals) ? k.signals.signals as string[] : [];
      return (
        <div key={k.id} className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">#{i + 1}</p>
              <h3 className="text-base font-semibold text-foreground">"{k.keyword}"</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Score: <span className="font-semibold text-foreground tnum">{k.score}/100</span> · Priority: <span className="font-semibold text-foreground">{k.priority}</span>
              </p>
              <p className="text-sm text-muted-foreground">Target URL: <a href={target} target="_blank" rel="noreferrer" className="text-accent underline">{target}</a></p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Impressions</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{impressions.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Clicks</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{clicks.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">CTR</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{(ctr * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Average position</p>
              <p className="mt-1 text-lg font-semibold tnum text-foreground">{position ? position.toFixed(1) : "—"}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-1 text-sm text-foreground">{k.reason}</p>
            {signalLabels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {signalLabels.map((label) => (
                  <span key={label} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {label.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Recommended action</p>
            <p className="mt-1 text-sm text-foreground">{k.recommended_action}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted" href={`https://www.google.com/search?q=${encodeURIComponent(k.keyword)}&gl=au`} target="_blank" rel="noreferrer">View on Google</a>
            <a className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted" href={target} target="_blank" rel="noreferrer">View page</a>
          </div>
        </div>
      );
    })}
  </section>
  );
}
