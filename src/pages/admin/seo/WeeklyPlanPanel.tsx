import type { WeeklySeoBriefing, WeeklySeoTask } from "./seoPanelTypes";

type WeeklyPlanPanelProps = {
  weeklySeoBriefing: WeeklySeoBriefing | null;
  weeklySeoTasks: WeeklySeoTask[];
  running: string | null;
  callFunction: (name: "generate-weekly-seo-plan") => void | Promise<void>;
};

export function WeeklyPlanPanel({ weeklySeoBriefing, weeklySeoTasks, running, callFunction }: WeeklyPlanPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly SEO Briefing</h2>
          <p className="text-xs text-muted-foreground">
            Generates the top 10 admin-review tasks, trend overview, growth opportunities, warnings, freshness work, AEO improvements and money-page priorities.
          </p>
        </div>
        <button
          onClick={() => callFunction("generate-weekly-seo-plan")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "generate-weekly-seo-plan" ? "Generating..." : "Generate weekly briefing"}
        </button>
      </div>
    </div>

    {weeklySeoBriefing && (() => {
      const trends = weeklySeoBriefing.seo_trend_overview || {};
      const growth = Array.isArray(weeklySeoBriefing.growth_opportunities) ? weeklySeoBriefing.growth_opportunities as Array<{ source?: string; topic?: string; url?: string | null; score?: number }> : [];
      const warnings = Array.isArray(weeklySeoBriefing.warnings_issues) ? weeklySeoBriefing.warnings_issues as Array<{ type?: string; keyword?: string; url?: string | null; score?: number; current_position?: number; previous_position?: number }> : [];
      const money = Array.isArray(weeklySeoBriefing.money_page_priorities) ? weeklySeoBriefing.money_page_priorities as Array<{ url: string; title: string; money_score: number; recommended_action: string }> : [];
      const sources = weeklySeoBriefing.data_sources || {};
      return (
        <div className="space-y-4">
          <article className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Week of {new Date(weeklySeoBriefing.week_start).toLocaleDateString("en-AU")}</p>
                <h3 className="mt-1 text-base font-semibold text-foreground">Weekly summary dashboard</h3>
                <p className="mt-2 text-sm text-foreground">{weeklySeoBriefing.executive_summary}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                {weeklySeoBriefing.approval_status}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracked keywords</p>
                <p className="tnum mt-1 text-lg font-semibold text-foreground">{trends.tracked_keywords ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Impressions</p>
                <p className="tnum mt-1 text-lg font-semibold text-foreground">{Number(trends.recent_impressions || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ranking drops</p>
                <p className="tnum mt-1 text-lg font-semibold text-foreground">{trends.ranking_drops ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Data sources</p>
                <p className="tnum mt-1 text-lg font-semibold text-foreground">{Object.values(sources).filter((value) => Number(value) > 0).length}</p>
              </div>
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">SEO trend overview</h3>
              <div className="mt-3 grid gap-2">
                {Array.isArray(trends.rising_keywords) && trends.rising_keywords.length > 0 ? (
                  trends.rising_keywords.slice(0, 6).map((keyword: string) => (
                    <div key={`rising-${keyword}`} className="rounded-lg bg-background p-3 text-sm text-foreground">{keyword}</div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No rising keyword trend surfaced in this briefing.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">Warnings / issues</h3>
              <div className="mt-3 space-y-2">
                {warnings.length > 0 ? warnings.slice(0, 6).map((warning, index) => (
                  <div key={`warning-${index}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{warning.type?.replaceAll("_", " ") || "warning"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {warning.keyword || warning.url || `Score ${warning.score ?? "n/a"}`}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No critical warnings in the latest briefing.</p>
                )}
              </div>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">Growth opportunities</h3>
              <div className="mt-3 space-y-2">
                {growth.slice(0, 6).map((item, index) => (
                  <div key={`growth-${index}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{item.topic || "Opportunity"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.source || "SEO engine"} - Score {item.score ?? "n/a"}</p>
                    {item.url && <p className="mt-1 text-xs text-accent">{item.url}</p>}
                  </div>
                ))}
                {growth.length === 0 && <p className="text-sm text-muted-foreground">No growth opportunities generated yet.</p>}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">Money-page priorities</h3>
              <div className="mt-3 space-y-2">
                {money.slice(0, 6).map((item) => (
                  <div key={`money-${item.url}`} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span className="tnum text-xs font-semibold text-foreground">{item.money_score}/100</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.recommended_action}</p>
                  </div>
                ))}
                {money.length === 0 && <p className="text-sm text-muted-foreground">No money-page priorities generated yet.</p>}
              </div>
            </article>
          </div>
        </div>
      );
    })()}

    {weeklySeoTasks.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No weekly tasks yet. Run the briefing after the SEO engines have data.
      </p>
    )}

    {weeklySeoTasks.map((task, index) => (
      <article key={task.id} className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">#{index + 1} - Week of {new Date(task.week_start).toLocaleDateString()}</p>
            <h3 className="mt-1 text-base font-semibold text-foreground">{task.task_title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Type: <span className="font-semibold text-foreground">{task.task_type.replaceAll("_", " ")}</span> - URL:{" "}
              <a href={task.affected_url} target="_blank" rel="noreferrer" className="text-accent underline">
                {task.affected_url}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              task.risk_level === "high" ? "bg-red-100 text-red-900" : task.risk_level === "medium" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
            }`}>
              {task.risk_level} risk
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              task.approval_status === "approved" ? "bg-emerald-100 text-emerald-900" : task.approval_status === "rejected" ? "bg-red-100 text-red-900" : task.approval_status === "done" ? "bg-blue-100 text-blue-900" : "bg-muted text-muted-foreground"
            }`}>
              {task.approval_status}
            </span>
            {task.priority_level && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {task.priority_level} priority
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent" style={{ width: `${task.priority_score}%` }} />
              </div>
              <span className="tnum text-xs font-semibold text-foreground">{task.priority_score}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Expected impact</p>
            <p className="mt-1 text-sm text-foreground">{task.expected_impact}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Traffic impact</p>
            <p className="mt-1 text-sm text-foreground">{task.expected_traffic_impact || "Not estimated"}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">RPM / revenue impact</p>
            <p className="mt-1 text-sm text-foreground">{task.expected_revenue_impact || "Not estimated"}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval status</p>
            <p className="mt-1 text-sm text-foreground">
              {task.approval_status === "pending" ? "Pending admin approval before implementation." : task.approval_status}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Suggested implementation prompt</p>
            <p className="mt-1 text-sm text-foreground">{task.suggested_implementation_prompt}</p>
          </div>
        </div>
      </article>
    ))}
  </section>
  );
}
