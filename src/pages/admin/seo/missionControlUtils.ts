import type {
  AeoOptimization,
  AutoRefreshRecommendation,
  CompetitorTrackingInsight,
  ContentGapOpportunity,
  CtrOptimization,
  DailySeoBriefing,
  InternalLinkOpportunity,
  Keyword,
  MoneyPageScore,
  Report,
  SeoAutomationRun,
  SeoAutomationSchedule,
  SeoOpportunity,
  SyncJob,
  WeeklySeoBriefing,
  WeeklySeoTask,
} from "./seoPanelTypes";

export type MissionMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "amber" | "red" | "neutral";
  progress?: number;
};

export type MissionAction = {
  title: string;
  source: string;
  url?: string | null;
  why: string;
  trafficImpact: string;
  revenueImpact: string;
  difficulty: "Low" | "Medium" | "High";
  confidence: number;
  roi: number;
  pattern?: string;
};

export type MissionInsight = {
  label: string;
  detail: string;
  tone: "blue" | "green" | "amber" | "red" | "neutral";
  time: string;
};

export type MissionGoal = {
  label: string;
  value: string;
  progress: number;
  detail: string;
};

export type WarRoomLane = {
  label: string;
  items: Array<{ title: string; detail: string; priority: string }>;
};

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const formatNumber = (value: number | null | undefined, digits = 0) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: digits });

export const compactNumber = (value: number | null | undefined) =>
  Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));

export const average = (values: Array<number | null | undefined>) => {
  const usable = values.map(Number).filter((value) => Number.isFinite(value));
  if (usable.length === 0) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
};

export const getLatestTraffic = (report: Report | null, keywords: Keyword[]) => {
  const clicks = report?.total_clicks_period ?? keywords.reduce((sum, item) => sum + Number(item.calcy_clicks_28d || 0), 0);
  const impressions = report?.total_impressions_period ?? keywords.reduce((sum, item) => sum + Number(item.calcy_impressions_28d || 0), 0);
  const avgPosition = report?.avg_position ?? average(keywords.map((item) => item.calcy_position));
  const clicksChange = Number(report?.full_report_data?.clicks_change ?? 0);
  return { clicks, impressions, avgPosition, clicksChange };
};

export const estimateMonthlySeoValue = (moneyPageScores: MoneyPageScore[], ctrOptimizations: CtrOptimization[], dailySeoBriefing: DailySeoBriefing | null) => {
  const briefingEstimate = String(dailySeoBriefing?.estimated_revenue_opportunity || "").match(/\d[\d,]*/)?.[0];
  if (briefingEstimate) return Number(briefingEstimate.replace(/,/g, ""));
  const missedClicks = ctrOptimizations.reduce((sum, item) => sum + Number(item.estimated_missed_clicks || 0), 0);
  const commercialScore = average(moneyPageScores.slice(0, 8).map((item) => item.money_score));
  return Math.round((missedClicks * 1.8) + (commercialScore * 62));
};

export const buildPriorityActions = (
  dailySeoBriefing: DailySeoBriefing | null,
  weeklySeoTasks: WeeklySeoTask[],
  scoredOpportunities: SeoOpportunity[],
  ctrOptimizations: CtrOptimization[],
  autoRefreshRecommendations: AutoRefreshRecommendation[],
): MissionAction[] => {
  const dailyActions = Array.isArray(dailySeoBriefing?.top_urgent_actions) ? dailySeoBriefing.top_urgent_actions : [];
  const queue = Array.isArray(dailySeoBriefing?.suggested_implementation_queue) ? dailySeoBriefing.suggested_implementation_queue : [];
  const fromDaily = [...dailyActions, ...queue].slice(0, 3).map((item: any) => ({
    title: item.task || item.title || "Review daily SEO recommendation",
    source: item.source || "Daily briefing",
    url: item.url,
    why: item.prompt || "Prioritized by the daily briefing from current SEO intelligence signals.",
    trafficImpact: item.expected_traffic_impact || `${formatNumber(dailySeoBriefing?.estimated_traffic_opportunity)} estimated visits`,
    revenueImpact: item.expected_revenue_impact || dailySeoBriefing?.estimated_revenue_opportunity || "Revenue impact estimated after approval",
    difficulty: item.risk_level === "high" ? "High" : item.risk_level === "medium" ? "Medium" : "Low",
    confidence: clamp(Number(dailySeoBriefing?.confidence_score || item.priority_score || 70)),
    roi: clamp(Number(item.priority_score || dailySeoBriefing?.confidence_score || 70)),
    pattern: "Daily decision intelligence",
  })) satisfies MissionAction[];

  if (fromDaily.length >= 3) return fromDaily.slice(0, 3);

  const fromWeekly = weeklySeoTasks.slice(0, 3).map((task) => ({
    title: task.task_title,
    source: task.task_type.replace(/_/g, " "),
    url: task.affected_url,
    why: task.expected_impact || task.suggested_implementation_prompt,
    trafficImpact: task.expected_traffic_impact || "Traffic lift expected",
    revenueImpact: task.expected_revenue_impact || "Revenue impact depends on SERP movement",
    difficulty: task.risk_level === "high" ? "High" : task.risk_level === "medium" ? "Medium" : "Low",
    confidence: clamp(task.priority_score),
    roi: clamp(task.priority_score),
    pattern: "Weekly SEO briefing",
  })) satisfies MissionAction[];

  const fromFallback = [
    ...scoredOpportunities.slice(0, 2).map((item) => ({
      title: item.keyword,
      source: "Opportunity Radar",
      url: item.target_url,
      why: item.reason,
      trafficImpact: `${formatNumber(Number(item.signals?.impressions_28d || 0))} impressions in play`,
      revenueImpact: "Revenue impact depends on page intent and CTR lift",
      difficulty: item.priority === "high" ? "Medium" : "Low",
      confidence: clamp(item.score),
      roi: clamp(item.score),
      pattern: "High impression, reachable ranking",
    })),
    ...ctrOptimizations.slice(0, 1).map((item) => ({
      title: item.primary_keyword,
      source: "CTR optimizer",
      url: item.page_url,
      why: item.reason,
      trafficImpact: `${formatNumber(item.estimated_missed_clicks)} missed clicks`,
      revenueImpact: "Fastest revenue path without ranking movement",
      difficulty: "Low" as const,
      confidence: clamp(item.ctr_opportunity_score),
      roi: clamp(item.priority_score),
      pattern: "SERP snippet lift",
    })),
    ...autoRefreshRecommendations.slice(0, 1).map((item) => ({
      title: item.page_title || item.page_url,
      source: "Freshness engine",
      url: item.page_url,
      why: Array.isArray(item.stale_content_alerts) ? item.stale_content_alerts[0] || "Freshness signal is declining." : "Freshness signal is declining.",
      trafficImpact: "Protect rankings and AI trust",
      revenueImpact: "Preserves finance content trust",
      difficulty: "Medium" as const,
      confidence: clamp(100 - Number(item.freshness_score || 0)),
      roi: clamp(100 - Number(item.freshness_score || 0)),
      pattern: "Freshness recovery",
    })),
  ] satisfies MissionAction[];

  return [...fromDaily, ...fromWeekly, ...fromFallback].slice(0, 3);
};

export const buildInsightFeed = (
  scoredOpportunities: SeoOpportunity[],
  ctrOptimizations: CtrOptimization[],
  internalLinkOpportunities: InternalLinkOpportunity[],
  contentGapOpportunities: ContentGapOpportunity[],
  aeoOptimizations: AeoOptimization[],
  autoRefreshRecommendations: AutoRefreshRecommendation[],
  competitorInsights: CompetitorTrackingInsight[],
  automationRuns: SeoAutomationRun[],
  jobs: SyncJob[],
): MissionInsight[] => {
  const failedRun = [...automationRuns, ...jobs].find((item: any) => item.status === "error" || item.status === "failed");
  return [
    {
      label: "Opportunity radar",
      detail: `${scoredOpportunities.filter((item) => item.priority === "high").length} high-priority ranking opportunities are open.`,
      tone: scoredOpportunities.some((item) => item.priority === "high") ? "green" : "neutral",
      time: "Live",
    },
    {
      label: "CTR engine",
      detail: `${ctrOptimizations.length} snippet improvements can recover missed organic clicks.`,
      tone: ctrOptimizations.length > 0 ? "blue" : "neutral",
      time: "Now",
    },
    {
      label: "Internal links",
      detail: `${internalLinkOpportunities.filter((item) => item.priority === "high").length} high-priority link opportunities are waiting for approval.`,
      tone: internalLinkOpportunities.some((item) => item.priority === "high") ? "amber" : "neutral",
      time: "Now",
    },
    {
      label: "Content gaps",
      detail: `${contentGapOpportunities.filter((item) => item.is_quick_win).length} quick-win gaps are ready for review.`,
      tone: contentGapOpportunities.some((item) => item.is_quick_win) ? "green" : "neutral",
      time: "Today",
    },
    {
      label: "AEO readiness",
      detail: `Average answer confidence is ${formatNumber(average(aeoOptimizations.map((item) => item.answer_confidence_score)), 0)}.`,
      tone: average(aeoOptimizations.map((item) => item.answer_confidence_score)) >= 70 ? "green" : "amber",
      time: "AI",
    },
    {
      label: "Freshness watch",
      detail: `${autoRefreshRecommendations.filter((item) => item.priority_level === "high").length} finance pages need urgent freshness review.`,
      tone: autoRefreshRecommendations.some((item) => item.priority_level === "high") ? "red" : "neutral",
      time: "Today",
    },
    {
      label: "Competitor tracking",
      detail: `${competitorInsights.filter((item) => item.priority_score >= 75).length} competitor movements need a response plan.`,
      tone: competitorInsights.some((item) => item.priority_score >= 75) ? "amber" : "neutral",
      time: "Market",
    },
    {
      label: "System monitor",
      detail: failedRun ? `${(failedRun as any).job_name || (failedRun as any).job_type} has a recent error to review.` : "No recent failed SEO operations in the loaded run history.",
      tone: failedRun ? "red" : "green",
      time: "Ops",
    },
  ];
};

export const buildWarRoomLanes = (
  weeklySeoTasks: WeeklySeoTask[],
  contentGapOpportunities: ContentGapOpportunity[],
  internalLinkOpportunities: InternalLinkOpportunity[],
  aeoOptimizations: AeoOptimization[],
  autoRefreshRecommendations: AutoRefreshRecommendation[],
  competitorInsights: CompetitorTrackingInsight[],
): WarRoomLane[] => [
  {
    label: "Execution queue",
    items: weeklySeoTasks.slice(0, 4).map((item) => ({
      title: item.task_title,
      detail: item.expected_impact,
      priority: item.priority_level || "medium",
    })),
  },
  {
    label: "Refresh queue",
    items: autoRefreshRecommendations.slice(0, 4).map((item) => ({
      title: item.page_title || item.page_url,
      detail: Array.isArray(item.recommended_updates) ? item.recommended_updates[0] || "Review outdated finance assumptions." : "Review outdated finance assumptions.",
      priority: item.priority_level,
    })),
  },
  {
    label: "Authority links",
    items: internalLinkOpportunities.slice(0, 4).map((item) => ({
      title: `${item.source_page} to ${item.target_page}`,
      detail: item.reason,
      priority: item.priority,
    })),
  },
  {
    label: "Strategic risks",
    items: [
      ...competitorInsights.slice(0, 2).map((item) => ({
        title: item.detected_topic,
        detail: item.recommended_response,
        priority: item.priority_score >= 75 ? "high" : "medium",
      })),
      ...contentGapOpportunities.slice(0, 1).map((item) => ({
        title: item.keyword_topic || item.gap_type,
        detail: item.suggested_fix,
        priority: item.priority_score >= 75 ? "high" : "medium",
      })),
      ...aeoOptimizations.slice(0, 1).map((item) => ({
        title: item.page_title || item.page_url,
        detail: Array.isArray(item.recommended_improvements) ? item.recommended_improvements[0] || "Improve answer readiness." : "Improve answer readiness.",
        priority: item.priority_level,
      })),
    ],
  },
];

export const buildGoalProgress = (
  latestReport: Report | null,
  keywords: Keyword[],
  aeoOptimizations: AeoOptimization[],
  weeklySeoTasks: WeeklySeoTask[],
  dailySeoBriefing: DailySeoBriefing | null,
): MissionGoal[] => {
  const traffic = getLatestTraffic(latestReport, keywords);
  const pageOneCount = keywords.filter((item) => Number(item.calcy_position || 999) <= 10).length;
  const aeoScore = average(aeoOptimizations.map((item) => item.aeo_score));
  const approvalDone = weeklySeoTasks.filter((item) => item.approval_status === "done" || item.approval_status === "approved").length;
  const revenueEstimate = Number(String(dailySeoBriefing?.estimated_revenue_opportunity || "").match(/\d[\d,]*/)?.[0]?.replace(/,/g, "") || 0);
  return [
    { label: "$10K/month SEO goal", value: `$${compactNumber(revenueEstimate)}`, progress: clamp((revenueEstimate / 10000) * 100), detail: "Estimated incremental monthly opportunity" },
    { label: "Organic traffic goal", value: compactNumber(traffic.clicks), progress: clamp((traffic.clicks / 100000) * 100), detail: "Monthly organic clicks target" },
    { label: "Page-1 keyword goal", value: `${pageOneCount}`, progress: clamp((pageOneCount / 50) * 100), detail: "Keywords ranking in positions 1-10" },
    { label: "AI visibility goal", value: `${formatNumber(aeoScore, 0)}`, progress: clamp(aeoScore), detail: "Answer engine readiness target" },
    { label: "Approval velocity", value: `${approvalDone}/${Math.max(weeklySeoTasks.length, 1)}`, progress: clamp((approvalDone / Math.max(weeklySeoTasks.length, 1)) * 100), detail: "Approved or completed weekly tasks" },
  ];
};

export const buildHeroMetrics = (
  gscConnected: boolean | null,
  latestReport: Report | null,
  keywords: Keyword[],
  scoredOpportunities: SeoOpportunity[],
  moneyPageScores: MoneyPageScore[],
  ctrOptimizations: CtrOptimization[],
  dailySeoBriefing: DailySeoBriefing | null,
  aeoOptimizations: AeoOptimization[],
  automationSchedules: SeoAutomationSchedule[],
  automationRuns: SeoAutomationRun[],
  weeklySeoTasks: WeeklySeoTask[],
) => {
  const traffic = getLatestTraffic(latestReport, keywords);
  const aeoScore = average(aeoOptimizations.map((item) => item.aeo_score || item.snippet_readiness_score));
  const monthlyValue = estimateMonthlySeoValue(moneyPageScores, ctrOptimizations, dailySeoBriefing);
  const enabledSchedules = automationSchedules.filter((item) => item.enabled).length;
  const failedRuns = automationRuns.filter((item) => item.status === "error").length;
  const pendingApprovals = weeklySeoTasks.filter((item) => item.approval_status === "pending").length;
  const healthScore = clamp(100 - (gscConnected ? 0 : 25) - Math.min(failedRuns * 8, 30) - (keywords.length === 0 ? 20 : 0));
  const momentum = clamp(50 + Number(traffic.clicksChange || 0) * 5 + scoredOpportunities.filter((item) => item.priority === "high").length);

  const metrics: MissionMetric[] = [
    { label: "Organic growth", value: traffic.clicksChange >= 0 ? "Improving" : "Declining", detail: `${traffic.clicksChange >= 0 ? "+" : ""}${formatNumber(traffic.clicksChange, 1)}% click movement`, tone: traffic.clicksChange >= 0 ? "green" : "red", progress: momentum },
    { label: "AI visibility", value: `${formatNumber(aeoScore, 0)}`, detail: "AEO readiness score", tone: aeoScore >= 70 ? "green" : "amber", progress: aeoScore },
    { label: "SEO health", value: `${formatNumber(healthScore, 0)}`, detail: gscConnected ? "Systems connected" : "GSC needs attention", tone: healthScore >= 75 ? "green" : healthScore >= 55 ? "amber" : "red", progress: healthScore },
    { label: "Monthly SEO value", value: `$${compactNumber(monthlyValue)}`, detail: "Estimated opportunity", tone: "blue", progress: clamp(monthlyValue / 100) },
    { label: "Traffic base", value: compactNumber(traffic.impressions), detail: `${compactNumber(traffic.clicks)} clicks tracked`, tone: "neutral", progress: clamp((traffic.clicks / Math.max(traffic.impressions, 1)) * 1000) },
    { label: "Revenue potential", value: `$${compactNumber(monthlyValue * 1.35)}`, detail: "Modelled upside from active engines", tone: "green", progress: clamp(monthlyValue / 75) },
    { label: "Active opportunities", value: `${scoredOpportunities.length}`, detail: "Open ranking opportunities", tone: scoredOpportunities.length > 0 ? "blue" : "neutral", progress: clamp(scoredOpportunities.length * 4) },
    { label: "Pending approvals", value: `${pendingApprovals}`, detail: "Admin review queue", tone: pendingApprovals > 0 ? "amber" : "green", progress: clamp(100 - pendingApprovals * 10) },
    { label: "Automation", value: `${enabledSchedules}/${automationSchedules.length || 0}`, detail: "Schedules enabled", tone: enabledSchedules > 0 ? "green" : "neutral", progress: clamp((enabledSchedules / Math.max(automationSchedules.length, 1)) * 100) },
    { label: "System health", value: failedRuns === 0 ? "Stable" : "Review", detail: `${failedRuns} recent run errors`, tone: failedRuns === 0 ? "green" : "red", progress: clamp(100 - failedRuns * 12) },
  ];

  return { metrics, healthScore, momentum, traffic, monthlyValue };
};
