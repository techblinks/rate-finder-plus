import { useMemo } from "react";
import type {
  AeoOptimization,
  AutoRefreshRecommendation,
  CompetitorTrackingInsight,
  ContentDraftImpactItem,
  ContentGapOpportunity,
  ContentOptimization,
  CtrOptimization,
  DailySeoBriefing,
  InternalLinkOpportunity,
  Keyword,
  Report,
  SemanticFinanceKnowledgeGraph,
  SeoAutomationRun,
  SeoAutomationSchedule,
  SeoDigestLog,
  SeoOpportunity,
  SyncJob,
  TopicClusterVisualization,
  WeeklySeoBriefing,
  WeeklySeoTask,
} from "./seoPanelTypes";

type HealthSeverity = "ok" | "warning" | "critical";

type HealthSignal = {
  label: string;
  severity: HealthSeverity;
  detail: string;
  recommendedFix: string;
};

type RunCheck = {
  label: string;
  jobTypes: string[];
  maxAgeHours: number;
  warningAgeHours: number;
  latestCompletedAt: string | null;
  latestAnyStatus: string | null;
  latestAnyStartedAt: string | null;
};

type SeoHealthPanelProps = {
  gscConnected: boolean | null;
  keywords: Keyword[];
  scoredOpportunities: SeoOpportunity[];
  ctrOptimizations: CtrOptimization[];
  dailySeoBriefing: DailySeoBriefing | null;
  weeklySeoBriefing: WeeklySeoBriefing | null;
  weeklySeoTasks: WeeklySeoTask[];
  internalLinkOpportunities: InternalLinkOpportunity[];
  contentGapOpportunities: ContentGapOpportunity[];
  contentOptimizations: ContentOptimization[];
  aeoOptimizations: AeoOptimization[];
  topicClusters: TopicClusterVisualization[];
  knowledgeGraphs: SemanticFinanceKnowledgeGraph[];
  autoRefreshRecommendations: AutoRefreshRecommendation[];
  competitorInsights: CompetitorTrackingInsight[];
  automationSchedules: SeoAutomationSchedule[];
  automationRuns: SeoAutomationRun[];
  digestLogs: SeoDigestLog[];
  contentDrafts: ContentDraftImpactItem[];
  reports: Report[];
  jobs: SyncJob[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

const isSuccessfulJob = (status: string | null | undefined) => ["completed", "success"].includes(String(status || "").toLowerCase());
const isFailedJob = (status: string | null | undefined) => ["failed", "error"].includes(String(status || "").toLowerCase());

const ageHours = (date: string | null | undefined) => {
  if (!date) return null;
  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return null;
  return Math.max(0, (Date.now() - value) / (60 * 60 * 1000));
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return "Never";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Unknown";
  return value.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
};

const formatAge = (date: string | null | undefined) => {
  const hours = ageHours(date);
  if (hours == null) return "No successful run";
  if (hours < 1) return "Less than 1 hour ago";
  if (hours < 48) return `${Math.round(hours)} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
};

const extractErrorText = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const statusClass = (severity: HealthSeverity) => {
  if (severity === "critical") return "border-red-200 bg-red-50 text-red-900";
  if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
};

const scoreClass = (score: number) => {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  if (score >= 50) return "text-orange-700";
  return "text-red-700";
};

export function SeoHealthPanel({
  gscConnected,
  keywords,
  scoredOpportunities,
  ctrOptimizations,
  dailySeoBriefing,
  weeklySeoBriefing,
  weeklySeoTasks,
  internalLinkOpportunities,
  contentGapOpportunities,
  contentOptimizations,
  aeoOptimizations,
  topicClusters,
  knowledgeGraphs,
  autoRefreshRecommendations,
  competitorInsights,
  automationSchedules,
  automationRuns,
  digestLogs,
  contentDrafts,
  reports,
  jobs,
}: SeoHealthPanelProps) {
  const health = useMemo(() => {
    const sortedJobs = [...jobs].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    const findLatestCompleted = (jobTypes: string[]) =>
      sortedJobs.find((job) => jobTypes.includes(job.job_type) && isSuccessfulJob(job.status)) || null;
    const findLatestAny = (jobTypes: string[]) => sortedJobs.find((job) => jobTypes.includes(job.job_type)) || null;

    const runChecks: RunCheck[] = [
      { label: "GSC sync", jobTypes: ["gsc_data"], maxAgeHours: 72, warningAgeHours: 36, latestCompletedAt: null, latestAnyStatus: null, latestAnyStartedAt: null },
      { label: "Opportunity Radar", jobTypes: ["seo_opportunity_scoring"], maxAgeHours: 168, warningAgeHours: 96, latestCompletedAt: null, latestAnyStatus: null, latestAnyStartedAt: null },
      { label: "CTR Optimizer", jobTypes: ["ctr_optimization"], maxAgeHours: 168, warningAgeHours: 96, latestCompletedAt: null, latestAnyStatus: null, latestAnyStartedAt: null },
      { label: "Daily Briefing", jobTypes: ["daily_seo_briefing"], maxAgeHours: 72, warningAgeHours: 36, latestCompletedAt: dailySeoBriefing?.generated_at || dailySeoBriefing?.briefing_date || null, latestAnyStatus: null, latestAnyStartedAt: null },
      { label: "Weekly Briefing", jobTypes: ["weekly_seo_briefing", "weekly_seo_plan"], maxAgeHours: 240, warningAgeHours: 168, latestCompletedAt: weeklySeoBriefing?.generated_at || weeklySeoBriefing?.week_start || null, latestAnyStatus: null, latestAnyStartedAt: null },
    ].map((check) => {
      const latestCompleted = findLatestCompleted(check.jobTypes);
      const latestAny = findLatestAny(check.jobTypes);
      return {
        ...check,
        latestCompletedAt: check.latestCompletedAt || latestCompleted?.completed_at || latestCompleted?.started_at || null,
        latestAnyStatus: latestAny?.status || null,
        latestAnyStartedAt: latestAny?.started_at || null,
      };
    });

    const recentCutoff = Date.now() - 7 * DAY_MS;
    const recentFailedJobs = sortedJobs.filter((job) => isFailedJob(job.status) && new Date(job.started_at).getTime() >= recentCutoff);
    const recentFailedAutomationRuns = automationRuns.filter((run) => run.status === "error" && new Date(run.started_at).getTime() >= recentCutoff);
    const recentFailedDigestLogs = digestLogs.filter((log) => log.status === "error" && new Date(log.generated_at || log.sent_at || 0).getTime() >= recentCutoff);
    const errorCorpus = [
      ...recentFailedJobs.map((job) => extractErrorText(job.error_log)),
      ...recentFailedAutomationRuns.map((run) => run.error_message || extractErrorText(run.result)),
      ...recentFailedDigestLogs.map((log) => log.error_message || log.message || ""),
    ].join(" \n ");
    const rlsErrorCount = (errorCorpus.match(/rls|row-level|permission|not authorized|policy/gi) || []).length;

    const staleFreshnessCount = autoRefreshRecommendations.filter((item) => item.freshness_score < 60).length;
    const automationFailureCount = automationSchedules.filter((schedule) => schedule.status === "error" || Boolean(schedule.last_error)).length + recentFailedAutomationRuns.length;
    const pendingApprovalsCount =
      weeklySeoTasks.filter((task) => task.approval_status === "pending").length +
      (weeklySeoBriefing?.approval_status === "pending" ? 1 : 0) +
      (dailySeoBriefing?.approval_status === "pending" ? 1 : 0);

    const appliedDraftsAwaitingImpact = contentDrafts.filter((draft) => {
      const publishedOrUpdated = draft.published_at || draft.updated_at;
      const daysOld = ageHours(publishedOrUpdated);
      return daysOld != null && daysOld >= 7 * 24 && draft.keyword_position == null && draft.keyword_impressions == null;
    });

    const datasetChecks = [
      { label: "GSC keywords", count: keywords.length, fix: "Run GSC Sync and confirm the Search Console property has query/page data." },
      { label: "Opportunity Radar", count: scoredOpportunities.length, fix: "Run Opportunity Radar after a successful GSC sync." },
      { label: "CTR opportunities", count: ctrOptimizations.length, fix: "Run CTR Optimizer after GSC keyword/page data is populated." },
      { label: "Content gaps", count: contentGapOpportunities.length, fix: "Run Content Gap Analyzer to repopulate missing-topic and weak-page suggestions." },
      { label: "Internal link opportunities", count: internalLinkOpportunities.length, fix: "Run Internal Linking Engine to rebuild link suggestions." },
      { label: "Freshness recommendations", count: autoRefreshRecommendations.length, fix: "Run Auto Refresh Engine to detect stale finance content." },
      { label: "Competitor insights", count: competitorInsights.length, fix: "Run Competitor Tracking once competitor source data is available." },
    ];

    const signals: HealthSignal[] = [];
    if (gscConnected === false) {
      signals.push({
        label: "Google Search Console is disconnected",
        severity: "critical",
        detail: "Core ranking, CTR, and traffic diagnostics depend on GSC data.",
        recommendedFix: "Reconnect GSC from the SEO overview before running intelligence jobs.",
      });
    }

    for (const check of runChecks) {
      const hours = ageHours(check.latestCompletedAt);
      if (hours == null) {
        signals.push({
          label: `${check.label} has not completed`,
          severity: check.label === "GSC sync" ? "critical" : "warning",
          detail: `Latest observed status: ${check.latestAnyStatus || "no run found"}.`,
          recommendedFix: `Run ${check.label} manually from its admin panel or enable its automation schedule.`,
        });
      } else if (hours > check.maxAgeHours) {
        signals.push({
          label: `${check.label} is stale`,
          severity: check.label === "GSC sync" || check.label === "Daily Briefing" ? "critical" : "warning",
          detail: `Last successful run was ${formatAge(check.latestCompletedAt)}.`,
          recommendedFix: `Run ${check.label} and check automation schedule health.`,
        });
      } else if (hours > check.warningAgeHours) {
        signals.push({
          label: `${check.label} is nearing stale status`,
          severity: "warning",
          detail: `Last successful run was ${formatAge(check.latestCompletedAt)}.`,
          recommendedFix: `Queue the next ${check.label} run before decisions rely on old data.`,
        });
      }
    }

    for (const check of datasetChecks) {
      if (check.count === 0) {
        signals.push({
          label: `${check.label} data is empty`,
          severity: check.label === "GSC keywords" && gscConnected ? "critical" : "warning",
          detail: "The health monitor found zero rows in this admin dataset.",
          recommendedFix: check.fix,
        });
      }
    }

    if (rlsErrorCount > 0) {
      signals.push({
        label: "Possible RLS or permission errors detected",
        severity: "critical",
        detail: `${rlsErrorCount} recent error references policy, permission, RLS, or authorization failures.`,
        recommendedFix: "Review admin-only RLS policies for the affected table or edge function service-role access.",
      });
    }

    if (automationFailureCount > 0) {
      signals.push({
        label: "Automation failures detected",
        severity: automationFailureCount > 2 ? "critical" : "warning",
        detail: `${automationFailureCount} schedule or run failure signal${automationFailureCount === 1 ? "" : "s"} found.`,
        recommendedFix: "Open Automation, inspect last_error and recent run logs, then rerun the failed job manually.",
      });
    }

    if (recentFailedJobs.length > 0) {
      signals.push({
        label: "Recent edge function or sync failures",
        severity: recentFailedJobs.length > 2 ? "critical" : "warning",
        detail: `${recentFailedJobs.length} sync job failure${recentFailedJobs.length === 1 ? "" : "s"} found in the last 7 days.`,
        recommendedFix: "Inspect failed function logs, environment secrets, and upstream data availability.",
      });
    }

    if (staleFreshnessCount > 0) {
      signals.push({
        label: "Freshness warnings need review",
        severity: staleFreshnessCount > 10 ? "critical" : "warning",
        detail: `${staleFreshnessCount} page${staleFreshnessCount === 1 ? "" : "s"} have freshness scores below 60.`,
        recommendedFix: "Review Auto Refresh recommendations before updating finance examples, FAQs, rates, or state rules.",
      });
    }

    if (pendingApprovalsCount > 20) {
      signals.push({
        label: "Approval queue is backing up",
        severity: "warning",
        detail: `${pendingApprovalsCount} briefing or weekly-plan item${pendingApprovalsCount === 1 ? "" : "s"} are pending.`,
        recommendedFix: "Review high-priority pending items first and reject low-confidence recommendations to keep the queue usable.",
      });
    }

    if (appliedDraftsAwaitingImpact.length > 0) {
      signals.push({
        label: "Applied drafts are awaiting impact data",
        severity: "warning",
        detail: `${appliedDraftsAwaitingImpact.length} applied or published draft${appliedDraftsAwaitingImpact.length === 1 ? "" : "s"} have no keyword position or impression data yet.`,
        recommendedFix: "Run impact tracking after the next GSC sync so applied changes can be evaluated.",
      });
    }

    const criticalIssues = signals.filter((signal) => signal.severity === "critical");
    const warnings = signals.filter((signal) => signal.severity === "warning");
    const score = Math.max(0, Math.min(100, 100 - criticalIssues.length * 14 - warnings.length * 5 - recentFailedJobs.length * 2 - recentFailedAutomationRuns.length * 2));

    return {
      score,
      status: score >= 85 ? "Healthy" : score >= 70 ? "Watch" : score >= 50 ? "Degraded" : "Critical",
      runChecks,
      criticalIssues,
      warnings,
      recommendedFixes: signals.map((signal) => signal.recommendedFix),
      failedRuns: [...recentFailedJobs, ...recentFailedAutomationRuns.map((run) => ({
        id: run.id,
        job_type: run.function_name || run.job_key,
        status: run.status,
        started_at: run.started_at,
        completed_at: run.completed_at,
        records_updated: run.rows_processed,
        triggered_by: run.trigger_type,
        error_log: run.error_message,
      } as SyncJob))],
      datasetChecks,
      pendingApprovalsCount,
      appliedDraftsAwaitingImpact,
      staleFreshnessCount,
      automationFailureCount,
      recentFailedDigestLogs,
    };
  }, [
    automationRuns,
    automationSchedules,
    autoRefreshRecommendations,
    competitorInsights,
    contentDrafts,
    contentGapOpportunities,
    ctrOptimizations,
    dailySeoBriefing,
    digestLogs,
    gscConnected,
    internalLinkOpportunities,
    jobs,
    keywords,
    scoredOpportunities,
    weeklySeoBriefing,
    weeklySeoTasks,
  ]);

  const coverage = [
    { label: "Keywords", count: keywords.length },
    { label: "Opportunities", count: scoredOpportunities.length },
    { label: "CTR", count: ctrOptimizations.length },
    { label: "Content gaps", count: contentGapOpportunities.length },
    { label: "Internal links", count: internalLinkOpportunities.length },
    { label: "Content optimizer", count: contentOptimizations.length },
    { label: "AEO", count: aeoOptimizations.length },
    { label: "Topic clusters", count: topicClusters.length },
    { label: "Knowledge graphs", count: knowledgeGraphs.length },
    { label: "Freshness", count: autoRefreshRecommendations.length },
    { label: "Competitors", count: competitorInsights.length },
    { label: "Reports", count: reports.length },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">SEO Intelligence health</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Read-only system monitor</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Checks whether admin-only SEO intelligence data, runs, approvals, and automation logs are fresh enough to support daily SEO operations. This panel does not publish, apply, or repair anything automatically.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-6 py-4 text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Health score</p>
            <p className={`mt-1 text-4xl font-bold tnum ${scoreClass(health.score)}`}>{health.score}</p>
            <p className="text-sm font-medium text-foreground">{health.status}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className={`rounded-xl border px-4 py-3 ${statusClass(health.criticalIssues.length ? "critical" : "ok")}`}>
            <p className="text-xs uppercase tracking-wide">Critical issues</p>
            <p className="mt-1 text-2xl font-semibold tnum">{health.criticalIssues.length}</p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${statusClass(health.warnings.length ? "warning" : "ok")}`}>
            <p className="text-xs uppercase tracking-wide">Warnings</p>
            <p className="mt-1 text-2xl font-semibold tnum">{health.warnings.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending approvals</p>
            <p className="mt-1 text-2xl font-semibold tnum text-foreground">{health.pendingApprovalsCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent failures</p>
            <p className="mt-1 text-2xl font-semibold tnum text-foreground">{health.failedRuns.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-foreground">Core run freshness</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">System</th>
                <th>Last successful run</th>
                <th>Age</th>
                <th>Latest status</th>
                <th>Latest attempt</th>
              </tr>
            </thead>
            <tbody>
              {health.runChecks.map((check) => {
                const hours = ageHours(check.latestCompletedAt);
                const severity: HealthSeverity = hours == null || hours > check.maxAgeHours ? "critical" : hours > check.warningAgeHours ? "warning" : "ok";
                return (
                  <tr key={check.label} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{check.label}</td>
                    <td className="text-muted-foreground">{formatDateTime(check.latestCompletedAt)}</td>
                    <td>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(severity)}`}>{formatAge(check.latestCompletedAt)}</span>
                    </td>
                    <td className="text-muted-foreground">{check.latestAnyStatus || "none"}</td>
                    <td className="text-muted-foreground">{formatDateTime(check.latestAnyStartedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-base font-semibold text-foreground">Critical issues</h3>
          <div className="mt-3 space-y-3">
            {health.criticalIssues.length === 0 && <p className="text-sm text-muted-foreground">No critical health issues detected.</p>}
            {health.criticalIssues.map((issue) => (
              <div key={`${issue.label}-${issue.detail}`} className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
                <p className="font-semibold">{issue.label}</p>
                <p className="mt-1 text-red-900">{issue.detail}</p>
                <p className="mt-2 text-xs font-medium">Fix: {issue.recommendedFix}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-base font-semibold text-foreground">Warnings</h3>
          <div className="mt-3 space-y-3">
            {health.warnings.length === 0 && <p className="text-sm text-muted-foreground">No warnings detected.</p>}
            {health.warnings.slice(0, 10).map((warning) => (
              <div key={`${warning.label}-${warning.detail}`} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">{warning.label}</p>
                <p className="mt-1 text-amber-900">{warning.detail}</p>
                <p className="mt-2 text-xs font-medium">Fix: {warning.recommendedFix}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-foreground">Recommended fixes</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {health.recommendedFixes.length === 0 && <p className="text-sm text-muted-foreground">No fixes needed from current monitor inputs.</p>}
          {Array.from(new Set(health.recommendedFixes)).slice(0, 12).map((fix) => (
            <div key={fix} className="rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
              {fix}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-foreground">Data coverage</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {coverage.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold tnum text-foreground">{item.count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-base font-semibold text-foreground">Operational queue</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Pending approvals</dt>
              <dd className="font-semibold tnum text-foreground">{health.pendingApprovalsCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Drafts awaiting impact</dt>
              <dd className="font-semibold tnum text-foreground">{health.appliedDraftsAwaitingImpact.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Freshness warnings</dt>
              <dd className="font-semibold tnum text-foreground">{health.staleFreshnessCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Automation failures</dt>
              <dd className="font-semibold tnum text-foreground">{health.automationFailureCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Digest errors</dt>
              <dd className="font-semibold tnum text-foreground">{health.recentFailedDigestLogs.length}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-base font-semibold text-foreground">Functions with recent errors</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Function or job</th>
                <th>Status</th>
                <th>Started</th>
                <th>Records</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {health.failedRuns.slice(0, 12).map((run) => (
                <tr key={run.id} className="border-t border-border">
                  <td className="py-2 font-medium text-foreground">{run.job_type}</td>
                  <td className="text-red-700">{run.status}</td>
                  <td className="text-muted-foreground">{formatDateTime(run.started_at)}</td>
                  <td className="tnum text-muted-foreground">{run.records_updated ?? 0}</td>
                  <td className="max-w-md truncate text-xs text-muted-foreground">{extractErrorText(run.error_log) || "No error message stored"}</td>
                </tr>
              ))}
              {health.failedRuns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-muted-foreground">No recent function or sync failures found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
