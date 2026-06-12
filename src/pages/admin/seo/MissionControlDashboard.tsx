import { RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { ApprovalQueuePanel } from "./ApprovalQueuePanel";
import { DashboardHero } from "./DashboardHero";
import { GoalTrackingPanel } from "./GoalTrackingPanel";
import { GrowthMomentumPanel } from "./GrowthMomentumPanel";
import { LiveInsightsFeed } from "./LiveInsightsFeed";
import {
  buildGoalProgress,
  buildHeroMetrics,
  buildInsightFeed,
  buildPriorityActions,
  buildWarRoomLanes,
  compactNumber,
  formatNumber,
} from "./missionControlUtils";
import { TodayMissionPanel } from "./TodayMissionPanel";
import { WeeklyWarRoom } from "./WeeklyWarRoom";
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
  MoneyPageScore,
  Report,
  SemanticFinanceKnowledgeGraph,
  SeoAutomationRun,
  SeoAutomationSchedule,
  SeoFunctionRunner,
  SeoOpportunity,
  SubTab,
  SyncJob,
  TopicClusterVisualization,
  WeeklySeoBriefing,
  WeeklySeoTask,
} from "./seoPanelTypes";

export const MissionControlDashboard = ({
  gscConnected,
  latestReport,
  keywords,
  scoredOpportunities,
  moneyPageScores,
  internalLinkOpportunities,
  contentGapOpportunities,
  contentOptimizations,
  aeoOptimizations,
  topicClusters,
  knowledgeGraphs,
  autoRefreshRecommendations,
  competitorInsights,
  ctrOptimizations,
  weeklySeoTasks,
  weeklySeoBriefing,
  dailySeoBriefing,
  automationSchedules,
  automationRuns,
  contentDrafts,
  jobs,
  running,
  callFunction,
  onNavigate,
}: {
  gscConnected: boolean | null;
  latestReport: Report | null;
  keywords: Keyword[];
  scoredOpportunities: SeoOpportunity[];
  moneyPageScores: MoneyPageScore[];
  internalLinkOpportunities: InternalLinkOpportunity[];
  contentGapOpportunities: ContentGapOpportunity[];
  contentOptimizations: ContentOptimization[];
  aeoOptimizations: AeoOptimization[];
  topicClusters: TopicClusterVisualization[];
  knowledgeGraphs: SemanticFinanceKnowledgeGraph[];
  autoRefreshRecommendations: AutoRefreshRecommendation[];
  competitorInsights: CompetitorTrackingInsight[];
  ctrOptimizations: CtrOptimization[];
  weeklySeoTasks: WeeklySeoTask[];
  weeklySeoBriefing: WeeklySeoBriefing | null;
  dailySeoBriefing: DailySeoBriefing | null;
  automationSchedules: SeoAutomationSchedule[];
  automationRuns: SeoAutomationRun[];
  contentDrafts: ContentDraftImpactItem[];
  jobs: SyncJob[];
  running: string | null;
  callFunction: SeoFunctionRunner;
  onNavigate: (tab: SubTab) => void;
}) => {
  const { metrics, healthScore, momentum, traffic, monthlyValue } = buildHeroMetrics(
    gscConnected,
    latestReport,
    keywords,
    scoredOpportunities,
    moneyPageScores,
    ctrOptimizations,
    dailySeoBriefing,
    aeoOptimizations,
    automationSchedules,
    automationRuns,
    weeklySeoTasks,
  );
  const actions = buildPriorityActions(dailySeoBriefing, weeklySeoTasks, scoredOpportunities, ctrOptimizations, autoRefreshRecommendations);
  const insights = buildInsightFeed(scoredOpportunities, ctrOptimizations, internalLinkOpportunities, contentGapOpportunities, aeoOptimizations, autoRefreshRecommendations, competitorInsights, automationRuns, jobs);
  const goals = buildGoalProgress(latestReport, keywords, aeoOptimizations, weeklySeoTasks, dailySeoBriefing);
  const warRoomLanes = buildWarRoomLanes(weeklySeoTasks, contentGapOpportunities, internalLinkOpportunities, aeoOptimizations, autoRefreshRecommendations, competitorInsights);
  const activeEngines = [
    scoredOpportunities.length,
    moneyPageScores.length,
    internalLinkOpportunities.length,
    contentGapOpportunities.length,
    contentOptimizations.length,
    aeoOptimizations.length,
    topicClusters.length,
    knowledgeGraphs.length,
    autoRefreshRecommendations.length,
    competitorInsights.length,
    ctrOptimizations.length,
  ].filter((count) => count > 0).length;

  return (
    <div className="space-y-5">
      <DashboardHero metrics={metrics} momentum={momentum} healthScore={healthScore} />

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Traffic opportunity", value: compactNumber(dailySeoBriefing?.estimated_traffic_opportunity || traffic.impressions), detail: "Impressions and briefing upside", icon: TrendingUp },
          { label: "Revenue upside", value: `$${compactNumber(monthlyValue)}`, detail: "Estimated monthly SEO value", icon: Sparkles },
          { label: "Active engines", value: `${activeEngines}/11`, detail: "Loaded intelligence systems", icon: RefreshCw },
          { label: "Avg position", value: formatNumber(traffic.avgPosition, 1), detail: "Current ranking baseline", icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
                <Icon className="h-5 w-5 text-[#6EA8FF]" />
              </div>
              <p className="mt-2 text-xs text-slate-600">{item.detail}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <TodayMissionPanel actions={actions} onNavigate={onNavigate} />
        <LiveInsightsFeed insights={insights} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <GrowthMomentumPanel latestReport={latestReport} keywords={keywords} />
        <GoalTrackingPanel goals={goals} />
      </div>

      <WeeklyWarRoom lanes={warRoomLanes} onNavigate={onNavigate} />

      <ApprovalQueuePanel
        weeklySeoTasks={weeklySeoTasks}
        weeklySeoBriefing={weeklySeoBriefing}
        dailySeoBriefing={dailySeoBriefing}
        contentDrafts={contentDrafts}
        onNavigate={onNavigate}
      />

      <section className="rounded-2xl border border-white/10 bg-[#050505]/80 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6EA8FF]">Manual operations</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Run intelligence jobs</h3>
            <p className="mt-1 text-sm text-white/50">These only refresh admin suggestions and logs. They do not publish or apply changes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => callFunction("sync-gsc-data")}
              disabled={running !== null || !gscConnected}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3366FF] px-3 py-2 text-xs font-semibold text-white disabled:opacity-45"
            >
              <RefreshCw className="h-4 w-4" />
              {running === "sync-gsc-data" ? "Syncing" : "Run GSC sync"}
            </button>
            <button
              onClick={() => callFunction("score-seo-opportunities")}
              disabled={running !== null}
              className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] disabled:opacity-45"
            >
              Opportunity Radar
            </button>
            <button
              onClick={() => callFunction("generate-daily-seo-briefing")}
              disabled={running !== null}
              className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] disabled:opacity-45"
            >
              Daily briefing
            </button>
            <button
              onClick={() => callFunction("sync-trends", { rba_event: true })}
              disabled={running !== null}
              className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-400/15 disabled:opacity-45"
            >
              RBA event scan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
