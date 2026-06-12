import type { DailySeoBriefing } from "./seoPanelTypes";
import { DraftWorkflowPanel } from "./DraftWorkflowPanel";
import { ImpactTrackingPanel } from "./ImpactTrackingPanel";
import { PatternsPanel } from "./PatternsPanel";

type DailyBriefingPanelProps = {
  dailySeoBriefing: DailySeoBriefing | null;
  running: string | null;
  dailyBriefingSuccess: string | null;
  dailyBriefingError: string | null;
  runDailyBriefing: () => void | Promise<void>;
};

export function DailyBriefingPanel({ dailySeoBriefing, running, dailyBriefingSuccess, dailyBriefingError, runDailyBriefing }: DailyBriefingPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily AI SEO Briefing</h2>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            A daily admin-only operations view generated from ranking, CTR, RPM, freshness, internal linking, AEO, competitor, weekly planning, and decision intelligence signals.
          </p>
        </div>
        <button
          type="button"
          onClick={runDailyBriefing}
          disabled={running !== null}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running === "generate-daily-seo-briefing" ? "Generating..." : "Generate daily briefing"}
        </button>
      </div>
    </div>

    {running === "generate-daily-seo-briefing" && (
      <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
        Generating daily briefing from SEO intelligence sources...
      </div>
    )}

    {dailyBriefingSuccess && (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        {dailyBriefingSuccess}
      </div>
    )}

    {dailyBriefingError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {dailyBriefingError}
      </div>
    )}

    {!dailySeoBriefing && running !== "generate-daily-seo-briefing" && (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <h3 className="text-base font-semibold text-foreground">No daily briefing generated yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate a briefing after GSC, CTR, content gap, money page, freshness, competitor, and weekly planning data are available.
        </p>
      </div>
    )}

    {dailySeoBriefing && (() => {
      const urgentActions = Array.isArray(dailySeoBriefing.top_urgent_actions) ? dailySeoBriefing.top_urgent_actions : [];
      const implementationQueue = Array.isArray(dailySeoBriefing.suggested_implementation_queue) ? dailySeoBriefing.suggested_implementation_queue : [];
      const riskAlerts = Array.isArray(dailySeoBriefing.risk_alerts) ? dailySeoBriefing.risk_alerts : [];
      const trendOverview = dailySeoBriefing.seo_trend_overview || {};
      const cards = [
        { label: "Highest ROI opportunity", data: dailySeoBriefing.highest_roi_opportunity },
        { label: "Fastest page-1 opportunity", data: dailySeoBriefing.fastest_page_one_opportunity },
        { label: "Highest confidence recommendation", data: dailySeoBriefing.highest_confidence_recommendation },
        { label: "Biggest traffic decline", data: dailySeoBriefing.biggest_traffic_decline },
        { label: "Highest RPM opportunity", data: dailySeoBriefing.highest_rpm_opportunity },
      ];

      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Briefing date</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">
                  {new Date(dailySeoBriefing.briefing_date).toLocaleDateString()}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground">
                  {dailySeoBriefing.approval_status}
                </span>
                <span className="rounded-full border border-border bg-background px-3 py-1 font-semibold text-foreground">
                  Confidence {dailySeoBriefing.confidence_score}/100
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{dailySeoBriefing.daily_summary}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Traffic opportunity</p>
                <p className="mt-1 text-2xl font-bold tnum text-foreground">
                  {dailySeoBriefing.estimated_traffic_opportunity.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue opportunity</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{dailySeoBriefing.estimated_revenue_opportunity}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Data signals</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Object.values(trendOverview).filter((v) => typeof v === "number" && v > 0).length || "No"} active signal groups
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
              <h3 className="text-base font-semibold text-foreground">Top 3 urgent actions</h3>
              <div className="mt-3 space-y-3">
                {urgentActions.length === 0 && <p className="text-sm text-muted-foreground">No urgent actions found in the latest data.</p>}
                {urgentActions.slice(0, 3).map((item: any, index: number) => (
                  <div key={`${item.task}-${index}`} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.source || "SEO intelligence"}</p>
                        <h4 className="mt-1 font-semibold text-foreground">{item.task}</h4>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Score {item.priority_score ?? 0}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{item.url}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{item.prompt}</p>
                  </div>
                ))}
              </div>
            </section>

            <ImpactTrackingPanel riskAlerts={riskAlerts} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
              const item: any = card.data || {};
              return (
                <div key={card.label} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <h4 className="mt-2 text-sm font-semibold text-foreground">{item.task || item.keyword || item.topic || "No signal yet"}</h4>
                  <p className="mt-2 break-all text-xs text-muted-foreground">{item.url || item.target_url || item.affected_url || "No target URL"}</p>
                  {(item.priority_score || item.score || item.confidence_score || item.position) && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Score: {item.priority_score ?? item.score ?? item.confidence_score ?? item.position}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <PatternsPanel bestWinningPattern={dailySeoBriefing.best_winning_pattern} />
          <DraftWorkflowPanel implementationQueue={implementationQueue} />
        </div>
      );
    })()}
  </section>
  );
}
