import type { AutoRefreshRecommendation } from "./seoPanelTypes";

type FreshnessPanelProps = {
  autoRefreshRecommendations: AutoRefreshRecommendation[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function FreshnessPanel({ autoRefreshRecommendations, running, callFunction }: FreshnessPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Auto Refresh Engine</h2>
          <p className="text-xs text-muted-foreground">
            Scores finance page freshness across rates, examples, FAQs, lender references, tax rules, state regulations and borrowing assumptions. Admin approval is required before any public update.
          </p>
        </div>
        <button
          onClick={() => callFunction("auto-refresh-content")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "auto-refresh-content" ? "Checking..." : "Check freshness"}
        </button>
      </div>
    </div>

    {autoRefreshRecommendations.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No freshness recommendations yet. Run the engine to generate review-only stale content alerts.
      </p>
    )}

    <div className="grid gap-4">
      {autoRefreshRecommendations.map((item) => {
        const outdated = Array.isArray(item.outdated_sections) ? item.outdated_sections as string[] : [];
        const alerts = Array.isArray(item.stale_content_alerts) ? item.stale_content_alerts as string[] : [];
        const updates = Array.isArray(item.recommended_updates) ? item.recommended_updates as string[] : [];
        const suggestions = Array.isArray(item.suggested_updates) ? item.suggested_updates as string[] : [];
        const management = item.last_updated_management || {};
        const daysSinceUpdate = typeof management.days_since_update === "number" ? management.days_since_update : null;
        return (
          <article key={item.id} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{item.page_title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.priority_level === "high" ? "bg-red-100 text-red-900" : item.priority_level === "medium" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    {item.priority_level} priority
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.page_type}</span>
                </div>
                <a href={item.page_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-accent underline">
                  {item.page_url}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last updated: {item.last_updated_date ? new Date(item.last_updated_date).toLocaleDateString("en-AU") : "Not tracked"}
                  {daysSinceUpdate !== null ? ` - ${daysSinceUpdate} days ago` : ""}
                </p>
              </div>
              <div className="min-w-[140px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Freshness</span>
                  <span className="tnum text-sm font-semibold text-foreground">{item.freshness_score}/100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={item.freshness_score < 55 ? "h-full bg-red-500" : item.freshness_score < 75 ? "h-full bg-amber-500" : "h-full bg-emerald-500"}
                    style={{ width: `${item.freshness_score}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Outdated sections</p>
                {outdated.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {outdated.map((section) => (
                      <span key={`${item.id}-${section}`} className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">{section}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No specific stale section detected.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Stale content alerts</p>
                {alerts.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {alerts.slice(0, 4).map((alert) => <li key={`${item.id}-${alert}`}>{alert}</li>)}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No alerts.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended updates</p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {updates.slice(0, 5).map((update) => <li key={`${item.id}-${update}`}>{update}</li>)}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Suggested updates</p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {suggestions.slice(0, 5).map((update) => <li key={`${item.id}-${update}`}>{update}</li>)}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated management</p>
                <p className="mt-1 text-sm text-foreground">
                  {management.visible_label_guidance || "Only update visible freshness labels after admin review."}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
  );
}
