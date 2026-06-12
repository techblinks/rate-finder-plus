import type { CompetitorTrackingInsight } from "./seoPanelTypes";

type CompetitorPanelProps = {
  competitorInsights: CompetitorTrackingInsight[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function CompetitorPanel({ competitorInsights, running, callFunction }: CompetitorPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Competitor Tracking</h2>
          <p className="text-xs text-muted-foreground">
            Uses stored competitor pages, GSC competitor fields, trends and content gaps to find ranking opportunities. No live scraping is performed by this engine.
          </p>
        </div>
        <button
          onClick={() => callFunction("track-competitors")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "track-competitors" ? "Tracking..." : "Track competitors"}
        </button>
      </div>
    </div>

    {competitorInsights.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No competitor insights yet. Run tracking after GSC, content gap and competitor page data are available.
      </p>
    )}

    <div className="grid gap-4">
      {competitorInsights.map((item) => {
        const growth = Array.isArray(item.competitor_growth_alerts) ? item.competitor_growth_alerts as string[] : [];
        const topics = Array.isArray(item.new_topic_alerts) ? item.new_topic_alerts as string[] : [];
        const trends = Array.isArray(item.content_trend_alerts) ? item.content_trend_alerts as string[] : [];
        const rankings = Array.isArray(item.ranking_opportunity_alerts) ? item.ranking_opportunity_alerts as string[] : [];
        const gaps = Array.isArray(item.content_gap_opportunities) ? item.content_gap_opportunities as Array<{ topic: string; affected_url: string; suggested_fix: string; score: number }> : [];
        return (
          <article key={item.id} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{item.competitor_domain}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.priority_score >= 75 ? "bg-red-100 text-red-900" : item.priority_score >= 55 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    {item.priority_score}/100
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.insight_type.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{item.detected_topic}</p>
                {item.competitor_url && (
                  <a href={item.competitor_url} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-accent underline">
                    {item.competitor_url}
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated opportunity</p>
                <p className="mt-1 text-sm text-foreground">{item.estimated_opportunity}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended response</p>
                <p className="mt-1 text-sm text-foreground">{item.recommended_response}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {growth.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Competitor growth alerts</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {growth.slice(0, 4).map((alert) => <li key={`${item.id}-growth-${alert}`}>{alert}</li>)}
                  </ul>
                </div>
              )}
              {topics.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">New topic alerts</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {topics.slice(0, 4).map((alert) => <li key={`${item.id}-topic-${alert}`}>{alert}</li>)}
                  </ul>
                </div>
              )}
              {trends.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Content trend alerts</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {trends.slice(0, 5).map((alert) => <li key={`${item.id}-trend-${alert}`}>{alert}</li>)}
                  </ul>
                </div>
              )}
              {rankings.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ranking opportunity alerts</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {rankings.slice(0, 5).map((alert) => <li key={`${item.id}-ranking-${alert}`}>{alert}</li>)}
                  </ul>
                </div>
              )}
              {gaps.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Content gap opportunities</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {gaps.slice(0, 4).map((gap) => (
                      <div key={`${item.id}-gap-${gap.topic}-${gap.affected_url}`} className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium text-foreground">{gap.topic} - {gap.score}/100</p>
                        <p className="mt-1 text-xs text-muted-foreground">{gap.affected_url}</p>
                        <p className="mt-1 text-sm text-foreground">{gap.suggested_fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  </section>
  );
}
