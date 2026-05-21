import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { DraftSandboxPreview } from "@/components/admin/DraftSandboxPreview";
import { DraftImpactInline, ImpactList, StatTile } from "@/components/admin/DraftImpactTracking";
import { PatternList } from "@/components/admin/WinningPatternsList";
import RecommendationReasoning from "@/components/admin/RecommendationReasoning";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const GSC_SITE_URL = "sc-domain:calcy.com.au";

type SubTab = "overview" | "keywords" | "opportunities" | "money-pages" | "internal-links" | "content-gaps" | "content-optimizer" | "aeo" | "topic-clusters" | "knowledge-graph" | "auto-refresh" | "competitors" | "ctr" | "weekly-plan" | "impact" | "patterns" | "reports";

type WinningPattern = {
  id: string;
  pattern_key: string;
  pattern_type: string;
  draft_type: string | null;
  page_type: string | null;
  keyword_intent: string | null;
  confidence_level: string;
  average_ctr_delta: number | null;
  average_click_delta: number | null;
  average_position_delta: number | null;
  success_count: number;
  failure_count: number;
  neutral_count: number;
  sample_draft_ids: string[];
  recommendation: string | null;
  signals: any;
  status: "winning" | "risky" | "neutral" | string;
  updated_at: string;
};

type DraftImpact = {
  id: string;
  draft_id: string;
  task_id: string | null;
  target_url: string;
  target_keyword: string | null;
  draft_type: string | null;
  applied_at: string;
  baseline_start: string | null;
  baseline_end: string | null;
  baseline_clicks: number;
  baseline_impressions: number;
  baseline_ctr: number;
  baseline_position: number | null;
  after_7d_clicks: number | null;
  after_7d_impressions: number | null;
  after_7d_ctr: number | null;
  after_7d_position: number | null;
  after_30d_clicks: number | null;
  after_30d_impressions: number | null;
  after_30d_ctr: number | null;
  after_30d_position: number | null;
  clicks_delta_7d: number | null;
  impressions_delta_7d: number | null;
  ctr_delta_7d: number | null;
  position_delta_7d: number | null;
  clicks_delta_30d: number | null;
  impressions_delta_30d: number | null;
  ctr_delta_30d: number | null;
  position_delta_30d: number | null;
  estimated_traffic_impact: number | null;
  estimated_revenue_impact: number | null;
  rpm_estimate: number | null;
  impact_status: "improving" | "neutral" | "declining" | "insufficient_data" | "awaiting_data" | string;
  confidence: string | null;
  signals: any;
  last_computed_at: string;
};

type Keyword = {
  id: string;
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_clicks_28d: number | null;
  calcy_impressions_28d: number | null;
  calcy_ctr_28d: number | null;
  monthly_search_volume: number | null;
  opportunity_score: number | null;
  trend_direction: string | null;
  intent: string | null;
};

type Report = {
  id: string;
  report_type: string;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
  total_keywords_tracked: number | null;
  total_clicks_period: number | null;
  total_impressions_period: number | null;
  avg_position: number | null;
  top_opportunities: any;
  content_recommendations: any;
  full_report_data: any;
  rba_keywords: any;
};

type SyncJob = {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_updated: number | null;
  triggered_by: string;
  error_log: any;
};

type SeoOpportunity = {
  id: string;
  keyword: string;
  target_url: string;
  score: number;
  priority: "high" | "medium" | "low";
  reason: string;
  recommended_action: string;
  generated_at: string | null;
  signals: any;
  status: string;
};

type InternalLinkOpportunity = {
  id: string;
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  relationship_type: string | null;
  reason: string;
  priority: "high" | "medium" | "low";
  generated_at: string | null;
  signals: any;
  status: string;
};

type MoneyPageScore = {
  id: string;
  page_url: string;
  page_title: string;
  money_score: number;
  reason: string;
  recommended_action: string;
  related_internal_links_needed: Array<{ target: string; anchor: string; reason: string }> | any;
  generated_at: string | null;
  signals: any;
  status: string;
};

type ContentGapOpportunity = {
  id: string;
  gap_type: string;
  affected_url: string;
  keyword_topic: string | null;
  suggested_fix: string;
  priority_score: number;
  estimated_traffic_opportunity: number;
  suggested_content_type: string;
  suggested_related_pages: string[] | any;
  is_quick_win: boolean;
  generated_at: string | null;
  signals: any;
  status: string;
};

type CtrOptimization = {
  id: string;
  page_url: string;
  primary_keyword: string;
  impressions_28d: number;
  clicks_28d: number;
  ctr_28d: number;
  position: number | null;
  estimated_missed_clicks: number;
  ctr_opportunity_score: number;
  suggested_title: string;
  suggested_meta_description: string;
  suggested_intro: string;
  suggested_faq_snippet: string;
  suggested_featured_snippet_answer: string;
  suggested_emotional_trigger: string;
  suggested_semantic_improvements: string;
  suggested_search_intent_match: string;
  reason: string;
  priority_score: number;
  generated_at: string | null;
  signals: any;
  status: string;
};

type ContentOptimization = {
  id: string;
  page_url: string;
  page_title: string;
  primary_topic: string;
  optimization_score: number;
  priority_level: "high" | "medium" | "low";
  estimated_impact: string;
  recommended_improvements: string[] | any;
  improved_headings: string[] | any;
  faq_additions: string[] | any;
  semantic_keywords: string[] | any;
  comparison_tables: string[] | any;
  snippet_sections: string[] | any;
  direct_answers: string[] | any;
  finance_examples: string[] | any;
  calculator_explanation_improvements: string[] | any;
  internal_linking_suggestions: Array<{ target: string; anchor: string; reason: string }> | any;
  ai_overview_sections: string[] | any;
  signals: any;
  status: string;
  generated_at: string | null;
};

type AeoOptimization = {
  id: string;
  page_url: string;
  page_title: string;
  primary_topic: string;
  aeo_score: number;
  snippet_readiness_score: number;
  answer_confidence_score: number;
  priority_level: "high" | "medium" | "low";
  missing_semantic_elements: string[] | any;
  direct_answer_blocks: string[] | any;
  ai_overview_summaries: string[] | any;
  featured_snippet_paragraphs: string[] | any;
  faq_improvements: string[] | any;
  semantic_heading_improvements: string[] | any;
  conversational_search_queries: string[] | any;
  recommended_improvements: string[] | any;
  signals: any;
  status: string;
  generated_at: string | null;
};

type TopicGraphNode = {
  id: string;
  label: string;
  url: string | null;
  type: "hub" | "calculator" | "article" | "faq" | "programmatic" | "gap";
  cluster: string;
  authority: number;
  inbound: number;
  outbound: number;
  is_orphan: boolean;
  is_gap: boolean;
  x: number;
  y: number;
};

type TopicGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "existing" | "suggested" | "semantic" | "missing";
  strength: number;
  label: string;
};

type TopicClusterVisualization = {
  id: string;
  cluster_key: string;
  cluster_name: string;
  health_score: number;
  authority_strength: number;
  node_count: number;
  edge_count: number;
  orphan_pages: Array<{ url: string | null; label: string; type: string; authority?: number }> | any;
  weak_internal_links: Array<{ source: string; target: string; reason: string }> | any;
  topical_gaps: Array<{ url: string; topic: string; gap_type: string; score: number }> | any;
  missing_supporting_content: Array<{ url: string | null; label: string; type: string }> | any;
  graph_nodes: TopicGraphNode[] | any;
  graph_edges: TopicGraphEdge[] | any;
  semantic_hierarchy: Array<{ level: string; pages: Array<{ url: string; title: string }> }> | any;
  alerts: Array<{ type: string; severity: "high" | "medium" | "low"; message: string }> | any;
  signals: any;
  status: string;
  generated_at: string | null;
};

type KnowledgeGraphNode = {
  id: string;
  label: string;
  type: "calculator" | "concept" | "article" | "faq" | "state" | "topic" | "programmatic" | "gap";
  url: string | null;
  authority: number;
  cluster: string;
  terms: string[];
  x: number;
  y: number;
};

type KnowledgeGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "calculates" | "explains" | "supports" | "depends_on" | "state_variant" | "related_to" | "missing" | "suggested_link";
  strength: number;
  label: string;
};

type SemanticFinanceKnowledgeGraph = {
  id: string;
  graph_key: string;
  graph_name: string;
  authority_score: number;
  entity_count: number;
  relationship_count: number;
  entity_nodes: KnowledgeGraphNode[] | any;
  entity_edges: KnowledgeGraphEdge[] | any;
  topic_relationships: Array<{ topic: string; health_score: number; authority_strength: number; related_entities: string[] }> | any;
  authority_connections: Array<{ entity: string; url: string | null; authority: number; connection_count: number }> | any;
  related_content_recommendations: Array<{ source: string; target: string; recommendation: string; priority: string }> | any;
  semantic_relationships: KnowledgeGraphEdge[] | any;
  entity_relationships: KnowledgeGraphEdge[] | any;
  suggested_internal_links: Array<{ source: string; target: string; anchor: string; priority: string; reason: string }> | any;
  missing_entity_coverage: Array<{ entity: string; url: string | null; type: string; reason: string; score?: number; related_entities?: string[] }> | any;
  signals: any;
  status: string;
  generated_at: string | null;
};

type AutoRefreshRecommendation = {
  id: string;
  page_url: string;
  page_title: string;
  page_type: string;
  freshness_score: number;
  priority_level: "high" | "medium" | "low";
  last_updated_date: string | null;
  outdated_sections: string[] | any;
  stale_content_alerts: string[] | any;
  recommended_updates: string[] | any;
  suggested_updates: string[] | any;
  last_updated_management: any;
  freshness_signals: any;
  status: string;
  generated_at: string | null;
};

type CompetitorTrackingInsight = {
  id: string;
  competitor_domain: string;
  competitor_url: string | null;
  detected_topic: string;
  insight_type: "competitor_growth" | "new_topic" | "content_trend" | "ranking_opportunity" | "content_gap";
  estimated_opportunity: string;
  recommended_response: string;
  priority_score: number;
  competitor_growth_alerts: string[] | any;
  new_topic_alerts: string[] | any;
  content_trend_alerts: string[] | any;
  ranking_opportunity_alerts: string[] | any;
  content_gap_opportunities: Array<{ topic: string; affected_url: string; suggested_fix: string; score: number }> | any;
  signals: any;
  status: string;
  generated_at: string | null;
};

type WeeklySeoTask = {
  id: string;
  week_start: string;
  task_title: string;
  task_type: "opportunity" | "ctr" | "internal_link" | "content_gap" | "ranking_drop" | "freshness" | "money_page" | "competitor" | "aeo" | "schema";
  affected_url: string;
  expected_impact: string;
  expected_traffic_impact: string | null;
  expected_revenue_impact: string | null;
  risk_level: "low" | "medium" | "high";
  priority_level: "high" | "medium" | "low" | null;
  suggested_implementation_prompt: string;
  approval_status: "pending" | "approved" | "rejected" | "done";
  priority_score: number;
  source_refs: any;
  generated_at: string | null;
};

type WeeklySeoTaskDraft = {
  id: string;
  task_id: string;
  week_start: string | null;
  draft_type: "title_meta" | "faq" | "internal_link" | "aeo_answer" | "content_refresh" | "comparison_table" | string;
  target_url: string | null;
  target_keyword: string | null;
  proposed_change: string;
  before_text: string | null;
  after_text: string | null;
  payload: any;
  expected_seo_impact: string | null;
  risk_level: "low" | "medium" | "high" | string;
  approval_status: "pending" | "approved" | "rejected" | "completed" | "applied" | string;
  reviewed_by: string | null;
  review_note: string | null;
  generated_by: string;
  generated_at: string;
  updated_at: string;
  applied_at: string | null;
  applied_by: string | null;
  rollback_snapshot: any;
};

type WeeklySeoBriefing = {
  id: string;
  week_start: string;
  executive_summary: string;
  seo_trend_overview: any;
  growth_opportunities: Array<{ source?: string; topic?: string; url?: string | null; score?: number }> | any;
  warnings_issues: Array<{ type?: string; keyword?: string; url?: string | null; score?: number; current_position?: number; previous_position?: number }> | any;
  money_page_priorities: Array<{ url: string; title: string; money_score: number; recommended_action: string }> | any;
  top_tasks: WeeklySeoTask[] | any;
  data_sources: any;
  approval_status: "pending" | "approved" | "reviewed" | "dismissed";
  generated_at: string | null;
};

const positionColor = (p: number | null | undefined) => {
  if (p == null) return "bg-muted text-muted-foreground";
  if (p <= 10) return "bg-emerald-100 text-emerald-900";
  if (p <= 20) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
};

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`;

const RedirectUriBox = () => {
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REDIRECT_URI);
      setCopied(true);
      toast({ title: "Redirect URI copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <code className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground break-all">
          {REDIRECT_URI}
        </code>
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          title="Copy redirect URI"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
          className="rounded border-border"
        />
        <span>I have pasted this exact URI into Google Cloud Console</span>
      </label>

      {verified && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>
            Good. Make sure there are no extra spaces, trailing slashes, or protocol differences in Google Cloud Console.
          </span>
        </div>
      )}

      {!verified && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>
            If you see <strong>redirect_uri_mismatch</strong>, the URI in Google Cloud Console doesn't match the one above.
          </span>
        </div>
      )}
    </div>
  );
};

const SeoPanel = () => {
  const [sub, setSub] = useState<SubTab>("overview");
  const [gscConnected, setGscConnected] = useState<boolean | null>(null);
  const [gscPreviouslyConnected, setGscPreviouslyConnected] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [scoredOpportunities, setScoredOpportunities] = useState<SeoOpportunity[]>([]);
  const [moneyPageScores, setMoneyPageScores] = useState<MoneyPageScore[]>([]);
  const [internalLinkOpportunities, setInternalLinkOpportunities] = useState<InternalLinkOpportunity[]>([]);
  const [contentGapOpportunities, setContentGapOpportunities] = useState<ContentGapOpportunity[]>([]);
  const [contentOptimizations, setContentOptimizations] = useState<ContentOptimization[]>([]);
  const [aeoOptimizations, setAeoOptimizations] = useState<AeoOptimization[]>([]);
  const [topicClusters, setTopicClusters] = useState<TopicClusterVisualization[]>([]);
  const [knowledgeGraphs, setKnowledgeGraphs] = useState<SemanticFinanceKnowledgeGraph[]>([]);
  const [autoRefreshRecommendations, setAutoRefreshRecommendations] = useState<AutoRefreshRecommendation[]>([]);
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorTrackingInsight[]>([]);
  const [ctrOptimizations, setCtrOptimizations] = useState<CtrOptimization[]>([]);
  const [weeklySeoTasks, setWeeklySeoTasks] = useState<WeeklySeoTask[]>([]);
  const [weeklySeoTaskDrafts, setWeeklySeoTaskDrafts] = useState<WeeklySeoTaskDraft[]>([]);
  const [draftImpacts, setDraftImpacts] = useState<DraftImpact[]>([]);
  const [winningPatterns, setWinningPatterns] = useState<WinningPattern[]>([]);
  const [learningPatterns, setLearningPatterns] = useState(false);
  const [trackingImpact, setTrackingImpact] = useState(false);
  const [generatingDraftFor, setGeneratingDraftFor] = useState<string | null>(null);
  const [taskActionFor, setTaskActionFor] = useState<string | null>(null);
  const [weeklySeoBriefing, setWeeklySeoBriefing] = useState<WeeklySeoBriefing | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [selectedTopicCluster, setSelectedTopicCluster] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRange, setFilterRange] = useState("all");
  const [filterTrend, setFilterTrend] = useState("all");
  const [sortBy, setSortBy] = useState<"opportunity_score" | "calcy_position" | "calcy_impressions_28d" | "calcy_clicks_28d">("opportunity_score");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("gsc_connected") === "true") {
      toast({ title: "Google Search Console connected" });
      window.history.replaceState({}, "", "/admin");
      void loadAll();
      return;
    }

    // Fallback: edge function passed tokens via URL — save them with the user's session
    const gscToken = params.get("gsc_token");
    if (gscToken) {
      window.history.replaceState({}, "", "/admin");
      (async () => {
        try {
          const tokenData = JSON.parse(decodeURIComponent(gscToken));
          const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();
          await supabase.from("gsc_oauth_tokens").delete().eq("site_url", GSC_SITE_URL);
          const { error } = await supabase.from("gsc_oauth_tokens").insert({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || "",
            token_type: tokenData.token_type || "Bearer",
            expires_at: expiresAt,
            scope: tokenData.scope || "https://www.googleapis.com/auth/webmasters.readonly",
            site_url: GSC_SITE_URL,
            is_active: true,
          });
          if (error) {
            toast({ title: "Failed to save GSC connection", description: error.message, variant: "destructive" });
          } else {
            toast({ title: "Google Search Console connected" });
          }
        } catch (err: any) {
          toast({ title: "Failed to parse GSC token", description: String(err?.message || err), variant: "destructive" });
        } finally {
          void loadAll();
        }
      })();
      return;
    }

    if (params.get("gsc_error")) {
      const desc = params.get("gsc_error_description") || params.get("gsc_error") || "";
      toast({ title: "GSC connection failed", description: desc, variant: "destructive" });
      window.history.replaceState({}, "", "/admin");
    }

    void loadAll();
  }, []);

  const loadAll = async () => {
    const [tokens, kw, opp, money, links, gaps, contentOpt, aeo, clusters, knowledge, refresh, competitors, ctr, plan, briefing, rep, sj, taskDrafts, impacts, patterns] = await Promise.all([
      supabase.from("gsc_oauth_tokens").select("id, is_active"),
      supabase.from("seo_keywords").select("*").eq("is_active", true).order("opportunity_score", { ascending: false }),
      supabase.from("seo_opportunities").select("*").eq("status", "open").order("score", { ascending: false }).limit(100),
      supabase.from("money_page_scores").select("*").eq("status", "open").order("money_score", { ascending: false }).limit(50),
      supabase.from("internal_link_opportunities").select("*").eq("status", "open").order("priority", { ascending: true }).limit(150),
      supabase.from("content_gap_opportunities").select("*").eq("status", "open").order("priority_score", { ascending: false }).limit(150),
      supabase.from("content_optimizations").select("*").eq("status", "open").order("optimization_score", { ascending: false }).limit(100),
      supabase.from("aeo_optimizations").select("*").eq("status", "open").order("aeo_score", { ascending: true }).limit(100),
      supabase.from("topic_cluster_visualizations").select("*").eq("status", "open").order("health_score", { ascending: true }).limit(50),
      supabase.from("semantic_finance_knowledge_graphs").select("*").eq("status", "open").order("authority_score", { ascending: false }).limit(5),
      supabase.from("auto_refresh_recommendations").select("*").eq("status", "open").order("freshness_score", { ascending: true }).limit(120),
      supabase.from("competitor_tracking_insights").select("*").eq("status", "open").order("priority_score", { ascending: false }).limit(120),
      supabase.from("ctr_optimizations").select("*").eq("status", "open").order("priority_score", { ascending: false }).limit(100),
      supabase.from("weekly_seo_tasks").select("*").order("week_start", { ascending: false }).order("priority_score", { ascending: false }).limit(10),
      supabase.from("weekly_seo_briefings").select("*").order("week_start", { ascending: false }).limit(1),
      supabase.from("seo_reports").select("*").order("generated_at", { ascending: false }).limit(20),
      supabase.from("sync_jobs").select("*").in("job_type", ["gsc_data", "trends", "seo_opportunity_scoring", "money_page_scoring", "internal_link_opportunities", "content_gap_analysis", "content_optimization", "aeo_optimization", "topic_cluster_visualization", "semantic_finance_knowledge_graph", "auto_refresh_engine", "competitor_tracking", "ctr_optimization", "weekly_seo_plan", "weekly_seo_briefing", "weekly_seo_task_drafts", "weekly_seo_task_review", "weekly_seo_task_draft_review", "weekly_seo_task_draft_apply", "weekly_seo_task_draft_rollback", "seo_draft_impact", "seo_winning_patterns"]).order("started_at", { ascending: false }).limit(20),
      (supabase as any).from("weekly_seo_task_drafts").select("*").order("generated_at", { ascending: false }).limit(300),
      (supabase as any).from("seo_draft_impact").select("*").order("last_computed_at", { ascending: false }).limit(300),
      (supabase as any).from("seo_winning_patterns").select("*").order("updated_at", { ascending: false }).limit(200),
    ]);
    const tokenRows = (tokens.data as { id: string; is_active: boolean | null }[] | null) || [];
    setGscConnected(tokenRows.some((t) => t.is_active));
    setGscPreviouslyConnected(tokenRows.length > 0);
    setKeywords((kw.data as Keyword[]) || []);
    setScoredOpportunities((opp.data as SeoOpportunity[]) || []);
    setMoneyPageScores((money.data as MoneyPageScore[]) || []);
    const priorityRank: Record<InternalLinkOpportunity["priority"], number> = { high: 3, medium: 2, low: 1 };
    setInternalLinkOpportunities(
      ((links.data as InternalLinkOpportunity[]) || []).sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]),
    );
    setContentGapOpportunities((gaps.data as ContentGapOpportunity[]) || []);
    setContentOptimizations((contentOpt.data as ContentOptimization[]) || []);
    setAeoOptimizations((aeo.data as AeoOptimization[]) || []);
    setTopicClusters((clusters.data as TopicClusterVisualization[]) || []);
    setKnowledgeGraphs((knowledge.data as SemanticFinanceKnowledgeGraph[]) || []);
    setAutoRefreshRecommendations((refresh.data as AutoRefreshRecommendation[]) || []);
    setCompetitorInsights((competitors.data as CompetitorTrackingInsight[]) || []);
    setCtrOptimizations((ctr.data as CtrOptimization[]) || []);
    setWeeklySeoTasks((plan.data as WeeklySeoTask[]) || []);
    setWeeklySeoTaskDrafts(((taskDrafts as any)?.data as WeeklySeoTaskDraft[]) || []);
    setDraftImpacts(((impacts as any)?.data as DraftImpact[]) || []);
    setWinningPatterns(((patterns as any)?.data as WinningPattern[]) || []);
    setWeeklySeoBriefing(((briefing.data as WeeklySeoBriefing[] | null) || [])[0] || null);
    setReports((rep.data as Report[]) || []);
    setLatestReport((rep.data?.find((r: Report) => r.report_type === "weekly_summary") as Report) || null);
    setJobs((sj.data as SyncJob[]) || []);
  };

  const callFunction = async (name: "sync-gsc-data" | "sync-trends" | "score-seo-opportunities" | "score-money-pages" | "score-internal-links" | "analyze-content-gaps" | "optimize-content" | "optimize-aeo" | "visualize-topic-clusters" | "build-knowledge-graph" | "auto-refresh-content" | "track-competitors" | "optimize-ctr" | "generate-weekly-seo-plan", body?: any) => {
    setRunning(name);
    try {
      const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} });
      if (error) throw error;
      if (data && data.success === false) {
        throw new Error(data.error || "Function returned success=false");
      }
      const parts: string[] = [];
      const candidates: Array<[string, string]> = [
        ["opportunities_scored", "opportunities"],
        ["records_updated", "records updated"],
        ["records_checked", "records checked"],
        ["total", "rows"],
        ["updated", "updated"],
        ["newKeywords", "new keywords"],
        ["inserted", "inserted"],
        ["count", "rows"],
      ];
      for (const [key, label] of candidates) {
        const v = (data as any)?.[key];
        if (typeof v === "number") parts.push(`${v} ${label}`);
      }
      const desc = parts.length > 0 ? parts.join(" • ") : "Completed.";
      toast({ title: `${name} complete`, description: desc });
      await loadAll();
    } catch (err: any) {
      const msg = err?.message || err?.error || String(err);
      console.error(`[${name}] failed:`, err);
      toast({ title: `${name} failed`, description: msg, variant: "destructive" });
    } finally {
      setRunning(null);
    }
  };

  const generateTaskDraft = async (taskId: string) => {
    setGeneratingDraftFor(taskId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-task-draft", { body: { taskId } });
      if (error) throw error;
      if (data && (data as any).success === false) throw new Error((data as any).error || "Draft generation failed");
      const count = (data as any)?.inserted ?? 0;
      toast({ title: "Draft generated", description: `${count} admin-review draft${count === 1 ? "" : "s"} created. Pending approval.` });
      await loadAll();
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("[generate-task-draft] failed:", err);
      toast({ title: "Draft generation failed", description: msg, variant: "destructive" });
    } finally {
      setGeneratingDraftFor(null);
    }
  };

  const setTaskApprovalStatus = async (taskId: string, status: "approved" | "rejected" | "completed" | "pending") => {
    setTaskActionFor(taskId);
    try {
      // weekly_seo_tasks.approval_status uses "done" historically; map "completed" -> "done"
      const taskStatus = status === "completed" ? "done" : status;
      const { error } = await supabase
        .from("weekly_seo_tasks")
        .update({ approval_status: taskStatus })
        .eq("id", taskId);
      if (error) throw error;
      // Audit trail
      await (supabase as any).from("sync_jobs").insert({
        job_type: "weekly_seo_task_review",
        status: "completed",
        triggered_by: "admin",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        records_updated: 1,
        summary: { task_id: taskId, approval_status: taskStatus },
      });
      toast({ title: `Task ${status}` });
      await loadAll();
    } catch (err: any) {
      console.error("[task status update] failed:", err);
      toast({ title: "Failed to update task", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setTaskActionFor(null);
    }
  };

  const setDraftApprovalStatus = async (draftId: string, status: "approved" | "rejected" | "completed" | "pending") => {
    try {
      const { error } = await (supabase as any)
        .from("weekly_seo_task_drafts")
        .update({ approval_status: status, reviewed_by: "admin" })
        .eq("id", draftId);
      if (error) throw error;
      await (supabase as any).from("sync_jobs").insert({
        job_type: "weekly_seo_task_draft_review",
        status: "completed",
        triggered_by: "admin",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        records_updated: 1,
        summary: { draft_id: draftId, approval_status: status },
      });
      toast({ title: `Draft ${status}` });
      await loadAll();
    } catch (err: any) {
      toast({ title: "Failed to update draft", description: err?.message || String(err), variant: "destructive" });
    }
  };

  const [applyingDraftId, setApplyingDraftId] = useState<string | null>(null);
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null);
  const APPLY_SUPPORTED = new Set(["title_meta", "faq"]);

  const applyApprovedDraft = async (draft: WeeklySeoTaskDraft) => {
    if (draft.approval_status !== "approved") {
      toast({ title: "Cannot apply", description: "Only approved drafts can be applied.", variant: "destructive" });
      return;
    }
    if (!APPLY_SUPPORTED.has(draft.draft_type)) {
      toast({ title: "Manual review only", description: `Apply is not enabled for "${draft.draft_type}" in Phase 1.`, variant: "destructive" });
      return;
    }
    const summary = draft.draft_type === "title_meta"
      ? `Update title / meta description on ${draft.target_url}`
      : `Add ${(draft.payload?.questions?.length ?? 0)} FAQ item(s) to ${draft.target_url}`;
    const ok = typeof window !== "undefined" && window.confirm(
      `Apply this approved draft?\n\n${summary}\n\nA rollback snapshot will be stored. Calculator logic, URLs, sitemap and schema are NOT modified.`,
    );
    if (!ok) return;
    setApplyingDraftId(draft.id);
    try {
      const { data, error } = await supabase.functions.invoke("apply-task-draft", { body: { draftId: draft.id } });
      if (error) throw error;
      if (data && (data as any).success === false) throw new Error((data as any).error || "Apply failed");
      toast({ title: "Draft applied", description: `Override stored for ${draft.target_url}. Rollback available.` });
      await loadAll();
    } catch (err: any) {
      console.error("[apply-task-draft] failed:", err);
      toast({ title: "Apply failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setApplyingDraftId(null);
    }
  };

  const rollbackAppliedDraft = async (draft: WeeklySeoTaskDraft) => {
    if (draft.approval_status !== "applied") {
      toast({ title: "Nothing to rollback", description: "Draft is not in 'applied' state.", variant: "destructive" });
      return;
    }
    const ok = typeof window !== "undefined" && window.confirm(
      `Roll back applied draft on ${draft.target_url}? The previous override will be restored.`,
    );
    if (!ok) return;
    setApplyingDraftId(draft.id);
    try {
      const { data, error } = await supabase.functions.invoke("rollback-task-draft", { body: { draftId: draft.id } });
      if (error) throw error;
      if (data && (data as any).success === false) throw new Error((data as any).error || "Rollback failed");
      toast({ title: "Draft rolled back", description: `Override restored for ${draft.target_url}.` });
      await loadAll();
    } catch (err: any) {
      console.error("[rollback-task-draft] failed:", err);
      toast({ title: "Rollback failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setApplyingDraftId(null);
    }
  };

  const runImpactTracker = async (draftId?: string) => {
    setTrackingImpact(true);
    try {
      const { data, error } = await supabase.functions.invoke("track-draft-impact", { body: draftId ? { draftId } : {} });
      if (error) throw error;
      if (data?.success === false) throw new Error(data?.error || "track-draft-impact failed");
      toast({
        title: "Impact tracker run complete",
        description: `Processed ${data?.processed ?? 0} applied draft${data?.processed === 1 ? "" : "s"} · winners ${data?.winners ?? 0} · losers ${data?.losers ?? 0}.`,
      });
      await loadAll();
    } catch (err: any) {
      console.error("[track-draft-impact] failed:", err);
      toast({ title: "Impact tracker failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setTrackingImpact(false);
    }
  };

  const runLearnPatterns = async () => {
    setLearningPatterns(true);
    try {
      const { data, error } = await supabase.functions.invoke("learn-winning-patterns", { body: {} });
      if (error) throw error;
      if (data?.success === false) throw new Error(data?.error || "learn-winning-patterns failed");
      toast({
        title: "Pattern learning complete",
        description: `Analyzed ${data?.analyzed ?? 0} impact records · ${data?.patterns ?? 0} patterns · winning ${data?.winning ?? 0} · risky ${data?.risky ?? 0}.`,
      });
      await loadAll();
    } catch (err: any) {
      console.error("[learn-winning-patterns] failed:", err);
      toast({ title: "Pattern learning failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setLearningPatterns(false);
    }
  };

  const impactByDraft = useMemo(() => {
    const m = new Map<string, DraftImpact>();
    for (const i of draftImpacts) m.set(i.draft_id, i);
    return m;
  }, [draftImpacts]);

  const startGscOAuth = () => {
    window.location.href = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`;
  };


  const filteredKeywords = useMemo(() => {
    let list = [...keywords];
    if (search) list = list.filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()));
    if (filterCategory !== "all") list = list.filter((k) => k.category === filterCategory);
    if (filterRange !== "all") {
      list = list.filter((k) => {
        const p = k.calcy_position ?? 999;
        if (filterRange === "page1") return p <= 10;
        if (filterRange === "page2") return p > 10 && p <= 20;
        if (filterRange === "page3+") return p > 20;
        return true;
      });
    }
    if (filterTrend !== "all") list = list.filter((k) => k.trend_direction === filterTrend);
    list.sort((a, b) => ((b[sortBy] as number) ?? 0) - ((a[sortBy] as number) ?? 0));
    if (sortBy === "calcy_position") list.reverse(); // ascending position
    return list;
  }, [keywords, search, filterCategory, filterRange, filterTrend, sortBy]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filteredKeywords.length / pageSize));
  const pageItems = filteredKeywords.slice((page - 1) * pageSize, page * pageSize);

  const categories = Array.from(new Set(keywords.map((k) => k.category).filter(Boolean))) as string[];
  const activeTopicCluster = useMemo(() => {
    if (topicClusters.length === 0) return null;
    return topicClusters.find((cluster) => cluster.cluster_key === selectedTopicCluster) || topicClusters[0];
  }, [selectedTopicCluster, topicClusters]);

  return (
    <div className="space-y-5">
      {/* GSC Connection prompt */}
      {gscConnected === false && (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {gscPreviouslyConnected ? "Reconnect Google Search Console" : "Connect Google Search Console"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {gscPreviouslyConnected
              ? "Your previous GSC connection is inactive. Reconnect to resume keyword sync and reports for calcy.com.au."
              : "Connect your GSC account to unlock exact keyword rankings, click & impression data, automated weekly reports and content recommendations for calcy.com.au."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={startGscOAuth}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              {gscPreviouslyConnected ? "🔁 Reconnect Google Search Console →" : "Connect Google Search Console →"}
            </button>
            {gscPreviouslyConnected && (
              <button
                onClick={startGscOAuth}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                title="Start the Google OAuth flow again"
              >
                Restart OAuth flow
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Requires a Google account with access to the calcy.com.au Search Console property.
          </p>
        </section>
      )}

      {/* Redirect URI helper */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Google Search Console — Redirect URI</h3>
            <p className="text-xs text-muted-foreground">
              Copy this exact URI and paste it into Google Cloud Console → Credentials → your OAuth Client ID → Authorized redirect URIs.
            </p>
          </div>
          <RedirectUriBox />
        </div>
      </section>

      {/* GSC 403 Troubleshooting */}
      <details className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 open:shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold">
          ⚠️ Getting a 403 / "access_denied" / "has not completed Google verification"? Click to fix.
        </summary>
        <div className="mt-4 space-y-4 text-sm">
          <p>
            Your Google OAuth app is in <strong>Testing</strong> mode, so only emails listed as <strong>Test users</strong> can sign in.
            Add <code className="rounded bg-amber-100 px-1 py-0.5">yadavabikash@gmail.com</code> (and any other admin email) to the test users list.
          </p>

          <div>
            <p className="font-semibold">Step-by-step</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>
                Open the Google Cloud Console OAuth consent screen:{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  console.cloud.google.com/apis/credentials/consent →
                </a>
              </li>
              <li>Make sure the project selector (top bar) is set to the same project that owns your OAuth Client ID / Secret.</li>
              <li>
                Confirm <strong>Publishing status: Testing</strong> and <strong>User type: External</strong>.
              </li>
              <li>
                Scroll down to the <strong>Test users</strong> section and click{" "}
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">+ ADD USERS</span>.
              </li>
              <li>
                Enter <code className="rounded bg-amber-100 px-1 py-0.5">yadavabikash@gmail.com</code> and click <strong>Save</strong>.
              </li>
              <li>
                Go to <strong>Data Access</strong> (or <strong>Scopes</strong>) and confirm{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5">.../auth/webmasters.readonly</code> is listed.
              </li>
              <li>
                Open <strong>Credentials → your OAuth Client ID</strong> and verify the redirect URI is exactly:
                <pre className="mt-1 overflow-x-auto rounded bg-white p-2 text-xs">
                  {`${SUPABASE_URL}/functions/v1/gsc-oauth-callback`}
                </pre>
              </li>
              <li>
                Come back here and click <strong>Connect Google Search Console</strong> again. If Google shows
                "Google hasn't verified this app", click <strong>Advanced → Go to (unsafe)</strong> to continue —
                this is normal for apps in Testing mode.
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-amber-300 bg-white/60 p-3 text-xs">
            <p className="font-semibold">Still blocked?</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Test users can take ~1 minute to propagate — wait and retry.</li>
              <li>You must sign in with the <em>exact</em> email you added (yadavabikash@gmail.com), not a different Google account.</li>
              <li>That account must also have access to the <code>calcy.com.au</code> property in Search Console.</li>
              <li>If you see <code>redirect_uri_mismatch</code>, the URI in step 7 doesn't match — copy it exactly.</li>
            </ul>
          </div>
        </div>
      </details>

      {gscConnected && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          <span>✓ Google Search Console connected — Property: calcy.com.au (Domain property)</span>
          <div className="flex items-center gap-3">
            <button onClick={() => callFunction("sync-gsc-data")} className="text-xs font-semibold underline">
              Run sync now
            </button>
            <button
              onClick={async () => {
                if (!confirm("Disconnect Google Search Console? Keyword tracking will stop.")) return;
                const { error } = await supabase
                  .from("gsc_oauth_tokens")
                  .update({ is_active: false })
                  .eq("site_url", GSC_SITE_URL);
                if (error) {
                  toast({ title: "Disconnect failed", description: error.message, variant: "destructive" });
                  return;
                }
                setGscConnected(false);
                toast({ title: "Google Search Console disconnected" });
              }}
              className="text-xs font-semibold text-red-700 underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-2 border-b border-border">
        {(["overview", "keywords", "opportunities", "money-pages", "internal-links", "content-gaps", "content-optimizer", "aeo", "topic-clusters", "knowledge-graph", "auto-refresh", "competitors", "ctr", "weekly-plan", "impact", "patterns", "reports"] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors ${
              sub === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "internal-links" ? "Internal links" : t === "content-gaps" ? "Content gaps" : t === "content-optimizer" ? "Content optimizer" : t === "topic-clusters" ? "Topic clusters" : t === "knowledge-graph" ? "Knowledge graph" : t === "auto-refresh" ? "Auto refresh" : t === "money-pages" ? "Money pages" : t === "aeo" ? "AEO" : t === "ctr" ? "CTR" : t === "weekly-plan" ? "Weekly plan" : t === "impact" ? "Impact" : t === "patterns" ? "Patterns" : t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {sub === "overview" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">SEO Intelligence — Weekly Overview</h2>
                {latestReport && (
                  <p className="text-xs text-muted-foreground">
                    Period: {latestReport.period_start} – {latestReport.period_end}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => callFunction("sync-gsc-data")}
                  disabled={running !== null || !gscConnected}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
                >
                  🔄 {running === "sync-gsc-data" ? "Syncing…" : "Run GSC Sync"}
                </button>
                <button
                  onClick={() => callFunction("sync-trends")}
                  disabled={running !== null}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  📈 {running === "sync-trends" ? "Syncing…" : "Run Trends"}
                </button>
                <button
                  onClick={() => callFunction("sync-trends", { rba_event: true })}
                  disabled={running !== null}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  ⚡ RBA Event Scan
                </button>
              </div>
            </div>

            {/* KPI grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Total clicks", value: latestReport?.total_clicks_period ?? 0, change: latestReport?.full_report_data?.clicks_change },
                { label: "Impressions", value: latestReport?.total_impressions_period ?? 0 },
                { label: "Avg position", value: latestReport?.avg_position ?? 0, change: latestReport?.full_report_data?.position_change, invert: true },
                { label: "Keywords tracked", value: latestReport?.total_keywords_tracked ?? keywords.length },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold tnum text-foreground">
                    {typeof m.value === "number" ? m.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : m.value}
                  </p>
                  {typeof m.change === "number" && (
                    <p className={`mt-1 text-xs ${(m.invert ? -m.change : m.change) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {(m.invert ? -m.change : m.change) >= 0 ? "▲" : "▼"} {Math.abs(m.change).toFixed(1)} WoW
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Top opportunities */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground">Opportunity Radar</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Keyword</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Impr.</th>
                    <th className="py-2">CTR</th>
                    <th className="py-2">Pos.</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scoredOpportunities.length === 0 && (
                    <tr><td colSpan={8} className="py-4 text-muted-foreground">Run GSC sync, then run Opportunity Radar.</td></tr>
                  )}
                  {scoredOpportunities.slice(0, 5).map((k) => (
                    <tr key={k.id} className="border-t border-border">
                      <td className="py-2 font-medium">{k.keyword}</td>
                      <td className="py-2 text-xs text-muted-foreground">{k.target_url}</td>
                      <td className="py-2 tnum">{Number(k.signals?.impressions_28d ?? 0).toLocaleString()}</td>
                      <td className="py-2 tnum">{`${(Number(k.signals?.ctr_28d ?? 0) * 100).toFixed(1)}%`}</td>
                      <td className="py-2 tnum">{Number(k.signals?.average_position ?? k.signals?.position ?? 0).toFixed(1)}</td>
                      <td className="py-2 tnum">{k.score}</td>
                      <td className="py-2 tnum">{k.priority}</td>
                      <td className="py-2 text-xs text-muted-foreground">{k.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Trends */}
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">📈 Trending up</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {keywords.filter((k) => k.trend_direction === "rising").slice(0, 5).map((k) => (
                  <li key={k.id} className="flex justify-between">
                    <span>{k.keyword}</span>
                    <span className="text-emerald-600">↑ rising</span>
                  </li>
                ))}
                {keywords.filter((k) => k.trend_direction === "rising").length === 0 && (
                  <li className="text-muted-foreground">No rising trends yet.</li>
                )}
              </ul>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">📉 Watch list — position drops</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {keywords
                  .filter((k) => (k.calcy_position_previous ?? 0) > 0 && (k.calcy_position ?? 0) - (k.calcy_position_previous ?? 0) > 2)
                  .slice(0, 5)
                  .map((k) => (
                    <li key={k.id} className="flex justify-between">
                      <span>{k.keyword}</span>
                      <span className="text-red-600 tnum">
                        {k.calcy_position_previous?.toFixed(1)} → {k.calcy_position?.toFixed(1)} ▼
                      </span>
                    </li>
                  ))}
                {keywords.filter((k) => (k.calcy_position_previous ?? 0) > 0 && (k.calcy_position ?? 0) - (k.calcy_position_previous ?? 0) > 2).length === 0 && (
                  <li className="text-muted-foreground">No drops detected.</li>
                )}
              </ul>
            </section>
          </div>

          {/* Sync history */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground">Recent sync runs</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr><th className="py-2">Job</th><th>Status</th><th>Records</th><th>Trigger</th><th>When</th></tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 8).map((j) => (
                    <tr key={j.id} className="border-t border-border">
                      <td className="py-2">{j.job_type}</td>
                      <td className={j.status === "completed" ? "text-emerald-600" : j.status === "failed" ? "text-red-600" : "text-amber-600"}>{j.status}</td>
                      <td className="tnum">{j.records_updated ?? 0}</td>
                      <td className="text-xs">{j.triggered_by}</td>
                      <td className="text-xs text-muted-foreground">{new Date(j.started_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {jobs.length === 0 && <tr><td colSpan={5} className="py-3 text-muted-foreground">No syncs yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* KEYWORDS */}
      {sub === "keywords" && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Search keywords…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 min-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterRange} onChange={(e) => { setFilterRange(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All positions</option>
              <option value="page1">Page 1 (≤10)</option>
              <option value="page2">Page 2 (11–20)</option>
              <option value="page3+">Page 3+ (&gt;20)</option>
            </select>
            <select value={filterTrend} onChange={(e) => setFilterTrend(e.target.value)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="all">All trends</option>
              <option value="rising">Rising</option>
              <option value="falling">Falling</option>
              <option value="stable">Stable</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="opportunity_score">Sort: Opportunity</option>
              <option value="calcy_position">Sort: Position</option>
              <option value="calcy_impressions_28d">Sort: Impressions</option>
              <option value="calcy_clicks_28d">Sort: Clicks</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Keyword</th>
                  <th>Category</th>
                  <th>Position</th>
                  <th>Δ</th>
                  <th>Clicks</th>
                  <th>Impr.</th>
                  <th>CTR</th>
                  <th>Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((k) => {
                  const delta = k.calcy_position_previous != null && k.calcy_position != null ? k.calcy_position - k.calcy_position_previous : null;
                  const opp = Math.min(100, Math.round((k.opportunity_score ?? 0) * 10));
                  return (
                    <tr key={k.id} className="border-t border-border">
                      <td className="py-2 font-medium">{k.keyword}</td>
                      <td><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{k.category || "—"}</span></td>
                      <td><span className={`rounded-md px-2 py-0.5 text-xs tnum ${positionColor(k.calcy_position)}`}>{k.calcy_position?.toFixed(1) ?? "—"}</span></td>
                      <td className={`tnum text-xs ${delta == null ? "" : delta < 0 ? "text-emerald-600" : delta > 0 ? "text-red-600" : ""}`}>
                        {delta == null ? "—" : delta === 0 ? "—" : `${delta < 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}`}
                      </td>
                      <td className="tnum">{k.calcy_clicks_28d ?? 0}</td>
                      <td className="tnum">{(k.calcy_impressions_28d ?? 0).toLocaleString()}</td>
                      <td className="tnum">{k.calcy_ctr_28d != null ? `${(k.calcy_ctr_28d * 100).toFixed(1)}%` : "—"}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-accent" style={{ width: `${opp}%` }} />
                          </div>
                          <span className="text-xs tnum text-muted-foreground">{opp}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageItems.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No keywords match.</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {totalPages} · {filteredKeywords.length} keywords</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1 disabled:opacity-50">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* OPPORTUNITIES */}
      {sub === "opportunities" && (
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
                          {label.replace(/_/g, " ")}
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
      )}

      {/* MONEY PAGES */}
      {sub === "money-pages" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Money Pages Scoring</h2>
                <p className="text-xs text-muted-foreground">
                  Scores core calculator pages by estimated RPM/CPC potential, finance topic value, ranking opportunity, traffic potential, internal link importance, and calculator engagement value. Suggestions are admin-only.
                </p>
              </div>
              <button
                onClick={() => callFunction("score-money-pages")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "score-money-pages" ? "Scoring..." : "Run money page scoring"}
              </button>
            </div>
          </div>

          {moneyPageScores.length === 0 && (
            <p className="text-sm text-muted-foreground">No money page scores yet. Run scoring after GSC data is synced for better ranking and traffic signals.</p>
          )}

          {moneyPageScores.map((page) => {
            const signals = page.signals || {};
            const linksNeeded = Array.isArray(page.related_internal_links_needed)
              ? page.related_internal_links_needed as Array<{ target: string; anchor: string; reason: string }>
              : [];
            return (
              <div key={page.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{page.page_title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <a href={page.page_url} target="_blank" rel="noreferrer" className="text-accent underline">{page.page_url}</a>
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Money score</p>
                    <p className="mt-1 text-2xl font-bold tnum text-foreground">{page.money_score}/100</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["RPM potential", signals.adsense_rpm_potential],
                    ["CPC / intent", signals.cpc_commercial_intent_estimate],
                    ["Ranking opportunity", signals.ranking_opportunity],
                    ["Traffic potential", signals.traffic_potential],
                    ["Finance topic", signals.finance_topic_value],
                    ["Internal links", signals.internal_link_importance],
                    ["Engagement value", signals.calculator_conversion_engagement_value],
                    ["Impressions", signals.impressions_28d],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-1 text-lg font-semibold tnum text-foreground">
                        {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="mt-1 text-sm text-foreground">{page.reason}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Recommended action</p>
                  <p className="mt-1 text-sm text-foreground">{page.recommended_action}</p>
                </div>

                <div className="mt-3 rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Related internal links needed</p>
                  {linksNeeded.length === 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">No obvious missing calculator-mesh links detected from current suggestions.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      {linksNeeded.map((link) => (
                        <li key={`${page.page_url}-${link.target}`} className="rounded-lg bg-muted/50 p-2">
                          <span className="font-medium text-foreground">{link.target}</span>
                          <span className="text-muted-foreground"> → anchor: </span>
                          <span className="font-medium text-foreground">{link.anchor}</span>
                          <p className="mt-1 text-xs text-muted-foreground">{link.reason}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* INTERNAL LINKS */}
      {sub === "internal-links" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Internal Linking Engine</h2>
                <p className="text-xs text-muted-foreground">
                  Suggests contextual links between calculators, guides, articles, FAQs and programmatic SEO pages. Detects orphan pages, weak money-page support, related finance topics, missing contextual links and repeated anchor text. Suggestions are review-only.
                </p>
              </div>
              <button
                onClick={() => callFunction("score-internal-links")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "score-internal-links" ? "Scanning..." : "Run AI link scan"}
              </button>
            </div>
          </div>

          {internalLinkOpportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">No internal link suggestions yet. Run the AI link scan to generate review-only suggestions.</p>
          )}

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Source page</th>
                  <th className="px-4 py-3">Target page</th>
                  <th className="px-4 py-3">Anchor text</th>
                  <th className="px-4 py-3">Relationship</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {internalLinkOpportunities.map((item) => (
                  <tr key={item.id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <a href={item.source_page} target="_blank" rel="noreferrer" className="text-accent underline">
                        {item.source_page}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a href={item.target_page} target="_blank" rel="noreferrer" className="text-accent underline">
                        {item.target_page}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.suggested_anchor_text}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {(item.relationship_type || item.signals?.source_signal || "topic_overlap").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.priority === "high" ? "bg-red-100 text-red-900" : item.priority === "medium" ? "bg-amber-100 text-amber-900" : "bg-muted text-muted-foreground"
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CONTENT GAPS */}
      {sub === "content-gaps" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI SEO Content Gap Analyzer</h2>
                <p className="text-xs text-muted-foreground">
                  Finds missing SEO opportunities, weak pages, missing topical coverage, FAQs, localized finance content, schema, comparisons, examples, AI Overview gaps and cannibalization risks. Suggestions are admin-only.
                </p>
              </div>
              <button
                onClick={() => callFunction("analyze-content-gaps")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "analyze-content-gaps" ? "Analyzing..." : "Run gap analyzer"}
              </button>
            </div>
          </div>

          {contentGapOpportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">No content gaps yet. Run the analyzer to generate review-only suggestions.</p>
          )}

          {contentGapOpportunities.some((item) => item.is_quick_win) && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-950">Quick Win Opportunities</h3>
                  <p className="text-xs text-emerald-800">
                    High-priority gaps that should be reviewable without creating new public pages automatically.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-950">
                  {contentGapOpportunities.filter((item) => item.is_quick_win).length} quick wins
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {contentGapOpportunities.filter((item) => item.is_quick_win).slice(0, 6).map((item) => (
                  <article key={`quick-${item.id}`} className="rounded-xl border border-emerald-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{item.gap_type.replace(/_/g, " ")}</p>
                    <h4 className="mt-1 text-sm font-semibold text-emerald-950">{item.keyword_topic || item.affected_url}</h4>
                    <p className="mt-1 text-xs text-emerald-900">{item.suggested_fix}</p>
                    <p className="mt-2 text-xs text-emerald-800">
                      Score <span className="font-semibold tnum">{item.priority_score}</span>
                      {" "}· est. traffic <span className="font-semibold tnum">{item.estimated_traffic_opportunity || 0}</span>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Gap type</th>
                  <th className="px-4 py-3">Affected URL</th>
                  <th className="px-4 py-3">Keyword/topic</th>
                  <th className="px-4 py-3">Content type</th>
                  <th className="px-4 py-3">Est. traffic</th>
                  <th className="px-4 py-3">Suggested fix</th>
                  <th className="px-4 py-3">Related pages</th>
                  <th className="px-4 py-3">Priority score</th>
                </tr>
              </thead>
              <tbody>
                {contentGapOpportunities.map((item) => {
                  const relatedPages = Array.isArray(item.suggested_related_pages)
                    ? item.suggested_related_pages as string[]
                    : [];
                  return (
                    <tr key={item.id} className="border-t border-border align-top">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                            {item.gap_type.replace(/_/g, " ")}
                          </span>
                          {item.is_quick_win && (
                            <span className="w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                              quick win
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a href={item.affected_url} target="_blank" rel="noreferrer" className="text-accent underline">
                          {item.affected_url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{item.keyword_topic || item.signals?.keyword || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {(item.suggested_content_type || "content_update").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 tnum text-xs text-foreground">{(item.estimated_traffic_opportunity || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{item.suggested_fix}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {relatedPages.length === 0 ? "—" : (
                          <div className="flex flex-col gap-1">
                            {relatedPages.slice(0, 4).map((page) => (
                              <a key={`${item.id}-${page}`} href={page} target="_blank" rel="noreferrer" className="text-accent underline">
                                {page}
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-accent" style={{ width: `${item.priority_score}%` }} />
                          </div>
                          <span className="tnum text-xs font-semibold text-foreground">{item.priority_score}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CONTENT OPTIMIZER */}
      {sub === "content-optimizer" && (
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
      )}

      {/* AEO */}
      {sub === "aeo" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">AEO Optimizer</h2>
                <p className="text-xs text-muted-foreground">
                  Reviews existing pages for direct answers, FAQ quality, semantic clarity, snippet readiness, concise summaries, structured answer sections, schema signals and conversational search coverage.
                </p>
              </div>
              <button
                onClick={() => callFunction("optimize-aeo")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "optimize-aeo" ? "Optimizing..." : "Run AEO optimizer"}
              </button>
            </div>
          </div>

          {aeoOptimizations.length === 0 && (
            <p className="text-sm text-muted-foreground">No AEO suggestions yet. Run the optimizer after content optimization and GSC data have been refreshed.</p>
          )}

          {aeoOptimizations.map((item) => {
            const missing = Array.isArray(item.missing_semantic_elements) ? item.missing_semantic_elements as string[] : [];
            const directAnswers = Array.isArray(item.direct_answer_blocks) ? item.direct_answer_blocks as string[] : [];
            const aiSummaries = Array.isArray(item.ai_overview_summaries) ? item.ai_overview_summaries as string[] : [];
            const snippetParagraphs = Array.isArray(item.featured_snippet_paragraphs) ? item.featured_snippet_paragraphs as string[] : [];
            const faqs = Array.isArray(item.faq_improvements) ? item.faq_improvements as string[] : [];
            const headings = Array.isArray(item.semantic_heading_improvements) ? item.semantic_heading_improvements as string[] : [];
            const queries = Array.isArray(item.conversational_search_queries) ? item.conversational_search_queries as string[] : [];
            const improvements = Array.isArray(item.recommended_improvements) ? item.recommended_improvements as string[] : [];

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
                      <div className="h-full bg-accent" style={{ width: `${item.aeo_score}%` }} />
                    </div>
                    <span className="tnum text-xs font-semibold text-foreground">{item.aeo_score}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">AEO score</p>
                    <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.aeo_score}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Snippet readiness</p>
                    <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.snippet_readiness_score}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Answer confidence</p>
                    <p className="mt-1 text-lg font-semibold tnum text-foreground">{item.answer_confidence_score}</p>
                  </div>
                </div>

                {missing.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {missing.slice(0, 10).map((element) => (
                      <span key={`${item.id}-${element}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        missing: {element}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-3 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended improvements</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {improvements.slice(0, 7).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Direct answer blocks</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {directAnswers.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Overview summaries</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {aiSummaries.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured snippet paragraphs</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {snippetParagraphs.slice(0, 2).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">FAQ improvements</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {faqs.slice(0, 5).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Semantic heading improvements</p>
                    <ul className="mt-2 space-y-1 text-sm text-foreground">
                      {headings.slice(0, 5).map((text) => <li key={`${item.id}-${text}`}>{text}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversational search queries</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {queries.slice(0, 8).map((query) => (
                        <span key={`${item.id}-${query}`} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* TOPIC CLUSTERS */}
      {sub === "topic-clusters" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Topic Cluster Visualizer</h2>
                <p className="text-xs text-muted-foreground">
                  Visualizes topical authority, semantic hierarchy, internal linking strength, orphan pages, weak clusters and missing supporting content. Read-only graph, no link changes.
                </p>
              </div>
              <button
                onClick={() => callFunction("visualize-topic-clusters")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "visualize-topic-clusters" ? "Mapping..." : "Build topic graph"}
              </button>
            </div>
          </div>

          {topicClusters.length === 0 && (
            <p className="text-sm text-muted-foreground">No topic cluster graph yet. Build the topic graph after internal link, money page and content gap data has been refreshed.</p>
          )}

          {topicClusters.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-3">
                {topicClusters.map((cluster) => (
                  <button
                    key={cluster.id}
                    onClick={() => setSelectedTopicCluster(cluster.cluster_key)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      activeTopicCluster?.cluster_key === cluster.cluster_key
                        ? "border-accent bg-accent/5"
                        : "border-border bg-surface hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cluster.cluster_name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {cluster.node_count} nodes - {cluster.edge_count} edges
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        cluster.health_score < 55 ? "bg-red-100 text-red-900" : cluster.health_score < 75 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                      }`}>
                        {cluster.health_score}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-accent" style={{ width: `${cluster.health_score}%` }} />
                    </div>
                  </button>
                ))}
              </aside>

              {activeTopicCluster && (() => {
                const nodes = Array.isArray(activeTopicCluster.graph_nodes) ? activeTopicCluster.graph_nodes as TopicGraphNode[] : [];
                const edges = Array.isArray(activeTopicCluster.graph_edges) ? activeTopicCluster.graph_edges as TopicGraphEdge[] : [];
                const alerts = Array.isArray(activeTopicCluster.alerts) ? activeTopicCluster.alerts as Array<{ type: string; severity: "high" | "medium" | "low"; message: string }> : [];
                const orphans = Array.isArray(activeTopicCluster.orphan_pages) ? activeTopicCluster.orphan_pages as Array<{ url: string | null; label: string; type: string; authority?: number }> : [];
                const weakLinks = Array.isArray(activeTopicCluster.weak_internal_links) ? activeTopicCluster.weak_internal_links as Array<{ source: string; target: string; reason: string }> : [];
                const gaps = Array.isArray(activeTopicCluster.topical_gaps) ? activeTopicCluster.topical_gaps as Array<{ url: string; topic: string; gap_type: string; score: number }> : [];
                const missingContent = Array.isArray(activeTopicCluster.missing_supporting_content) ? activeTopicCluster.missing_supporting_content as Array<{ url: string | null; label: string; type: string }> : [];
                const nodeById = new Map(nodes.map((node) => [node.id, node]));

                return (
                  <div className="space-y-4">
                    <section className="rounded-2xl border border-border bg-surface p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{activeTopicCluster.cluster_name} cluster</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Authority strength {activeTopicCluster.authority_strength} - read-only semantic graph
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg border border-border bg-background px-3 py-2">
                            <p className="text-xs text-muted-foreground">Health</p>
                            <p className="text-lg font-semibold tnum text-foreground">{activeTopicCluster.health_score}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-background px-3 py-2">
                            <p className="text-xs text-muted-foreground">Orphans</p>
                            <p className="text-lg font-semibold tnum text-foreground">{orphans.length}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-background px-3 py-2">
                            <p className="text-xs text-muted-foreground">Gaps</p>
                            <p className="text-lg font-semibold tnum text-foreground">{gaps.length + missingContent.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                        <svg viewBox="0 0 100 100" role="img" aria-label={`${activeTopicCluster.cluster_name} topic cluster graph`} className="h-[460px] w-full">
                          <defs>
                            <marker id="topic-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                            </marker>
                          </defs>
                          {edges.map((edge) => {
                            const source = nodeById.get(edge.source);
                            const target = nodeById.get(edge.target);
                            if (!source || !target) return null;
                            const stroke = edge.type === "missing" ? "#dc2626" : edge.type === "suggested" ? "#d97706" : edge.type === "existing" ? "#059669" : "#64748b";
                            return (
                              <line
                                key={edge.id}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke={stroke}
                                strokeWidth={Math.max(0.35, edge.strength / 140)}
                                strokeDasharray={edge.type === "missing" ? "2 2" : edge.type === "semantic" ? "3 2" : undefined}
                                opacity={0.72}
                              />
                            );
                          })}
                          {nodes.map((node) => {
                            const fill = node.type === "hub" ? "#003680" : node.is_gap ? "#fee2e2" : node.is_orphan ? "#fef3c7" : node.type === "calculator" ? "#dbeafe" : node.type === "faq" ? "#dcfce7" : "#f1f5f9";
                            const stroke = node.type === "hub" ? "#003680" : node.is_gap ? "#dc2626" : node.is_orphan ? "#d97706" : "#94a3b8";
                            const textFill = node.type === "hub" ? "#ffffff" : "#0f172a";
                            const radius = node.type === "hub" ? 7.5 : node.type === "gap" ? 5.4 : 5.8;
                            return (
                              <g key={node.id}>
                                <circle cx={node.x} cy={node.y} r={radius} fill={fill} stroke={stroke} strokeWidth={0.7} />
                                <title>{`${node.label} - ${node.type} - authority ${node.authority}`}</title>
                                <text
                                  x={node.x}
                                  y={node.y + 0.6}
                                  textAnchor="middle"
                                  fontSize={node.type === "hub" ? 2.4 : 1.85}
                                  fontWeight={node.type === "hub" ? 700 : 600}
                                  fill={textFill}
                                >
                                  {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">existing links</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">suggested links</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">semantic relationships</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-900">missing support</span>
                      </div>
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                      <section className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="text-sm font-semibold text-foreground">Weak Cluster Alerts</h4>
                        <div className="mt-3 space-y-2">
                          {alerts.length === 0 && <p className="text-sm text-muted-foreground">No cluster alerts detected.</p>}
                          {alerts.slice(0, 8).map((alert, index) => (
                            <div key={`${activeTopicCluster.id}-alert-${index}`} className="rounded-lg border border-border bg-background p-3">
                              <p className={`text-xs font-semibold ${alert.severity === "high" ? "text-red-700" : "text-amber-700"}`}>{alert.type.replace(/_/g, " ")}</p>
                              <p className="mt-1 text-sm text-foreground">{alert.message}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="text-sm font-semibold text-foreground">Orphan Pages</h4>
                        <div className="mt-3 space-y-2">
                          {orphans.length === 0 && <p className="text-sm text-muted-foreground">No orphan pages detected in this cluster.</p>}
                          {orphans.slice(0, 8).map((page) => (
                            <div key={`${activeTopicCluster.id}-${page.url || page.label}`} className="rounded-lg border border-border bg-background p-3">
                              <p className="text-sm font-medium text-foreground">{page.label}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{page.url || "planned page"} - {page.type} - authority {page.authority ?? 0}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="text-sm font-semibold text-foreground">Weak Internal Linking</h4>
                        <div className="mt-3 space-y-2">
                          {weakLinks.length === 0 && <p className="text-sm text-muted-foreground">No weak-link alerts detected.</p>}
                          {weakLinks.slice(0, 8).map((link) => (
                            <div key={`${activeTopicCluster.id}-${link.source}-${link.target}`} className="rounded-lg border border-border bg-background p-3">
                              <p className="text-xs text-muted-foreground">{link.source} {"->"} {link.target}</p>
                              <p className="mt-1 text-sm text-foreground">{link.reason}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-border bg-surface p-5">
                        <h4 className="text-sm font-semibold text-foreground">Topical Gaps</h4>
                        <div className="mt-3 space-y-2">
                          {gaps.length === 0 && missingContent.length === 0 && <p className="text-sm text-muted-foreground">No missing supporting content detected.</p>}
                          {missingContent.slice(0, 5).map((gap) => (
                            <div key={`${activeTopicCluster.id}-missing-${gap.url || gap.label}`} className="rounded-lg border border-border bg-background p-3">
                              <p className="text-sm font-medium text-foreground">{gap.label}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{gap.url || "planned page"} - {gap.type}</p>
                            </div>
                          ))}
                          {gaps.slice(0, 5).map((gap) => (
                            <div key={`${activeTopicCluster.id}-gap-${gap.url}-${gap.topic}`} className="rounded-lg border border-border bg-background p-3">
                              <p className="text-sm font-medium text-foreground">{gap.topic}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{gap.gap_type.replace(/_/g, " ")} - score {gap.score}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      )}

      {/* KNOWLEDGE GRAPH */}
      {sub === "knowledge-graph" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Semantic Finance Knowledge Graph</h2>
                <p className="text-xs text-muted-foreground">
                  Connects calculators, finance concepts, articles, FAQs, state entities and Australian finance terminology. Admin insights only, no automatic page edits or link changes.
                </p>
              </div>
              <button
                onClick={() => callFunction("build-knowledge-graph")}
                disabled={running !== null}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
              >
                {running === "build-knowledge-graph" ? "Building..." : "Build knowledge graph"}
              </button>
            </div>
          </div>

          {knowledgeGraphs.length === 0 && (
            <p className="text-sm text-muted-foreground">No knowledge graph yet. Build it after topic clusters, internal links and content gap data have been refreshed.</p>
          )}

          {knowledgeGraphs.map((graph) => {
            const nodes = Array.isArray(graph.entity_nodes) ? graph.entity_nodes as KnowledgeGraphNode[] : [];
            const edges = Array.isArray(graph.entity_edges) ? graph.entity_edges as KnowledgeGraphEdge[] : [];
            const nodeById = new Map(nodes.map((node) => [node.id, node]));
            const missing = Array.isArray(graph.missing_entity_coverage) ? graph.missing_entity_coverage as Array<{ entity: string; url: string | null; type: string; reason: string; score?: number; related_entities?: string[] }> : [];
            const links = Array.isArray(graph.suggested_internal_links) ? graph.suggested_internal_links as Array<{ source: string; target: string; anchor: string; priority: string; reason: string }> : [];
            const contentRecs = Array.isArray(graph.related_content_recommendations) ? graph.related_content_recommendations as Array<{ source: string; target: string; recommendation: string; priority: string }> : [];
            const authority = Array.isArray(graph.authority_connections) ? graph.authority_connections as Array<{ entity: string; url: string | null; authority: number; connection_count: number }> : [];
            const topics = Array.isArray(graph.topic_relationships) ? graph.topic_relationships as Array<{ topic: string; health_score: number; authority_strength: number; related_entities: string[] }> : [];

            return (
              <div key={graph.id} className="space-y-4">
                <section className="rounded-2xl border border-border bg-surface p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{graph.graph_name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {graph.entity_count} entities - {graph.relationship_count} relationships - read-only semantic map
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Authority</p>
                        <p className="text-lg font-semibold tnum text-foreground">{graph.authority_score}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Missing</p>
                        <p className="text-lg font-semibold tnum text-foreground">{missing.length}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Links</p>
                        <p className="text-lg font-semibold tnum text-foreground">{links.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                    <svg viewBox="0 0 100 100" role="img" aria-label="Semantic finance knowledge graph" className="h-[520px] w-full">
                      {edges.slice(0, 180).map((edge) => {
                        const source = nodeById.get(edge.source);
                        const target = nodeById.get(edge.target);
                        if (!source || !target) return null;
                        const stroke = edge.type === "missing" ? "#dc2626" : edge.type === "suggested_link" ? "#d97706" : edge.type === "state_variant" ? "#0e7490" : edge.type === "calculates" ? "#059669" : "#64748b";
                        return (
                          <line
                            key={edge.id}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={stroke}
                            strokeWidth={Math.max(0.25, edge.strength / 165)}
                            strokeDasharray={edge.type === "missing" ? "2 2" : edge.type === "suggested_link" ? "4 2" : undefined}
                            opacity={0.62}
                          />
                        );
                      })}
                      {nodes.slice(0, 90).map((node) => {
                        const fill = node.type === "calculator" ? "#dbeafe" : node.type === "concept" ? "#dcfce7" : node.type === "state" ? "#cffafe" : node.type === "gap" ? "#fee2e2" : node.type === "programmatic" ? "#fef3c7" : "#f1f5f9";
                        const stroke = node.type === "gap" ? "#dc2626" : node.authority >= 70 ? "#003680" : "#94a3b8";
                        const radius = node.type === "calculator" ? 5.8 : node.type === "concept" ? 5.2 : node.type === "gap" ? 4.9 : 4.4;
                        return (
                          <g key={node.id}>
                            <circle cx={node.x} cy={node.y} r={radius} fill={fill} stroke={stroke} strokeWidth={0.65} />
                            <title>{`${node.label} - ${node.type} - authority ${node.authority}`}</title>
                            <text x={node.x} y={node.y + 0.55} textAnchor="middle" fontSize={1.75} fontWeight={600} fill="#0f172a">
                              {node.label.length > 17 ? `${node.label.slice(0, 15)}...` : node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-900">calculators</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">concepts</span>
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-900">states</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">suggested links</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-900">missing coverage</span>
                  </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-border bg-surface p-5">
                    <h4 className="text-sm font-semibold text-foreground">Authority Connections</h4>
                    <div className="mt-3 space-y-2">
                      {authority.slice(0, 8).map((item) => (
                        <div key={`${graph.id}-authority-${item.entity}`} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-sm font-medium text-foreground">{item.entity}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Authority {item.authority} - {item.connection_count} connections {item.url ? `- ${item.url}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-surface p-5">
                    <h4 className="text-sm font-semibold text-foreground">Missing Entity Coverage</h4>
                    <div className="mt-3 space-y-2">
                      {missing.length === 0 && <p className="text-sm text-muted-foreground">No missing entity coverage detected.</p>}
                      {missing.slice(0, 8).map((item) => (
                        <div key={`${graph.id}-missing-${item.entity}-${item.url || ""}`} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-sm font-medium text-foreground">{item.entity}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-surface p-5">
                    <h4 className="text-sm font-semibold text-foreground">Suggested Internal Links</h4>
                    <div className="mt-3 space-y-2">
                      {links.slice(0, 8).map((link) => (
                        <div key={`${graph.id}-link-${link.source}-${link.target}`} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-xs text-muted-foreground">{link.source} {"->"} {link.target}</p>
                          <p className="mt-1 text-sm text-foreground">Anchor: "{link.anchor}" - {link.reason}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-surface p-5">
                    <h4 className="text-sm font-semibold text-foreground">Topic Relationships</h4>
                    <div className="mt-3 space-y-2">
                      {topics.slice(0, 8).map((topic) => (
                        <div key={`${graph.id}-topic-${topic.topic}`} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Health {topic.health_score} - authority {topic.authority_strength}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{topic.related_entities?.slice(0, 5).join(", ")}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-surface p-5 md:col-span-2">
                    <h4 className="text-sm font-semibold text-foreground">Related Content Recommendations</h4>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {contentRecs.slice(0, 10).map((rec) => (
                        <div key={`${graph.id}-rec-${rec.source}-${rec.target}`} className="rounded-lg border border-border bg-background p-3">
                          <p className="text-xs text-muted-foreground">{rec.source} {"->"} {rec.target}</p>
                          <p className="mt-1 text-sm text-foreground">{rec.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* AUTO REFRESH */}
      {sub === "auto-refresh" && (
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
      )}

      {/* COMPETITORS */}
      {sub === "competitors" && (
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
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.insight_type.replace(/_/g, " ")}</span>
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
      )}

      {/* CTR */}
      {sub === "ctr" && (
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
                      {signal.replace(/_/g, " ")}
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
      )}

      {/* WEEKLY PLAN */}
      {sub === "weekly-plan" && (
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
                          <p className="text-sm font-medium text-foreground">{warning.type?.replace(/_/g, " ") || "warning"}</p>
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
                    Type: <span className="font-semibold text-foreground">{task.task_type.replace(/_/g, " ")}</span> - URL:{" "}
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

              {/* Approval workflow actions */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  onClick={() => generateTaskDraft(task.id)}
                  disabled={generatingDraftFor === task.id || taskActionFor === task.id}
                  className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
                >
                  {generatingDraftFor === task.id ? "Generating draft..." : "Generate draft improvement"}
                </button>
                <button
                  onClick={() => setTaskApprovalStatus(task.id, "approved")}
                  disabled={taskActionFor === task.id || task.approval_status === "approved"}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 disabled:opacity-50"
                >
                  Mark approved
                </button>
                <button
                  onClick={() => setTaskApprovalStatus(task.id, "rejected")}
                  disabled={taskActionFor === task.id || task.approval_status === "rejected"}
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900 disabled:opacity-50"
                >
                  Mark rejected
                </button>
                <button
                  onClick={() => setTaskApprovalStatus(task.id, "completed")}
                  disabled={taskActionFor === task.id || task.approval_status === "done"}
                  className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900 disabled:opacity-50"
                >
                  Mark completed
                </button>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  Drafts are admin-review only and never auto-published.
                </span>
              </div>

              {/* Drafts list */}
              {(() => {
                const taskDrafts = weeklySeoTaskDrafts.filter((d) => d.task_id === task.id);
                if (taskDrafts.length === 0) return null;
                return (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Generated drafts ({taskDrafts.length})
                    </p>
                    {taskDrafts.map((d) => (
                      <div key={d.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                              {String(d.draft_type).replace(/_/g, " ")}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              d.risk_level === "high" ? "bg-red-100 text-red-900" : d.risk_level === "medium" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                            }`}>
                              {d.risk_level} risk
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              d.approval_status === "approved" ? "bg-emerald-100 text-emerald-900" : d.approval_status === "rejected" ? "bg-red-100 text-red-900" : d.approval_status === "completed" ? "bg-blue-100 text-blue-900" : "bg-muted text-muted-foreground"
                            }`}>
                              {d.approval_status}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(d.generated_at).toLocaleString("en-AU")} · {d.generated_by}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-foreground">{d.proposed_change}</p>

                        <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                          {d.target_url && (
                            <div><span className="font-semibold text-foreground">Target URL:</span> <a className="text-accent underline" href={d.target_url} target="_blank" rel="noreferrer">{d.target_url}</a></div>
                          )}
                          {d.target_keyword && (
                            <div><span className="font-semibold text-foreground">Target keyword:</span> {d.target_keyword}</div>
                          )}
                          {d.expected_seo_impact && (
                            <div className="md:col-span-2"><span className="font-semibold text-foreground">Expected SEO impact:</span> {d.expected_seo_impact}</div>
                          )}
                        </div>

                        {(d.before_text || d.after_text) && (
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            <div className="rounded border border-border bg-surface p-2">
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Before</p>
                              <p className="mt-1 whitespace-pre-wrap text-xs text-foreground">{d.before_text || "—"}</p>
                            </div>
                            <div className="rounded border border-emerald-200 bg-emerald-50 p-2">
                              <p className="text-[10px] uppercase tracking-wide text-emerald-800">After (proposed)</p>
                              <p className="mt-1 whitespace-pre-wrap text-xs text-emerald-950">{d.after_text || "—"}</p>
                            </div>
                          </div>
                        )}

                        {d.payload && Object.keys(d.payload).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-[11px] text-muted-foreground">Structured payload</summary>
                            <pre className="mt-2 overflow-x-auto rounded border border-border bg-surface p-2 text-[11px] text-foreground">{JSON.stringify(d.payload, null, 2)}</pre>
                          </details>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => setDraftApprovalStatus(d.id, "approved")}
                            disabled={d.approval_status === "approved"}
                            className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 disabled:opacity-50"
                          >
                            Approve draft
                          </button>
                          <button
                            onClick={() => setDraftApprovalStatus(d.id, "rejected")}
                            disabled={d.approval_status === "rejected"}
                            className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-900 disabled:opacity-50"
                          >
                            Reject draft
                          </button>
                          <button
                            onClick={() => setDraftApprovalStatus(d.id, "completed")}
                            disabled={d.approval_status === "completed"}
                            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-900 disabled:opacity-50"
                          >
                            Mark completed
                          </button>
                          <button
                            onClick={() => setDraftApprovalStatus(d.id, "pending")}
                            disabled={d.approval_status === "pending"}
                            className="rounded border border-border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground disabled:opacity-50"
                          >
                            Reset to pending
                          </button>
                          <button
                            onClick={() => setPreviewDraftId(previewDraftId === d.id ? null : d.id)}
                            className="rounded border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent"
                            title="Preview SERP, FAQ, mobile snippet and AI Overview before applying. Nothing is published."
                          >
                            {previewDraftId === d.id ? "Hide preview" : "Preview in sandbox"}
                          </button>
                          {APPLY_SUPPORTED.has(d.draft_type) ? (
                            d.approval_status === "applied" ? (
                              <button
                                onClick={() => rollbackAppliedDraft(d)}
                                disabled={applyingDraftId === d.id}
                                className="rounded border border-amber-400 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 disabled:opacity-50"
                                title="Restore the previous override from the rollback snapshot"
                              >
                                {applyingDraftId === d.id ? "Rolling back..." : "Rollback applied draft"}
                              </button>
                            ) : (
                              <button
                                onClick={() => applyApprovedDraft(d)}
                                disabled={applyingDraftId === d.id || d.approval_status !== "approved"}
                                className="rounded border border-emerald-500 bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                                title={d.approval_status === "approved" ? "Apply this approved draft (admin-only, rollback snapshot stored)" : "Only approved drafts can be applied"}
                              >
                                {applyingDraftId === d.id ? "Applying..." : "Apply approved draft"}
                              </button>
                            )
                          ) : (
                            <span className="rounded border border-dashed border-border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground" title="Phase 1 supports only title/meta and FAQ apply. Other draft types remain manual-review only.">
                              Manual review only (Phase 1)
                            </span>
                          )}
                        </div>

                        {previewDraftId === d.id && <DraftSandboxPreview draft={d as any} />}

                        {(d.applied_at || d.applied_by) && (
                          <div className="mt-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-900">
                            <span className="font-semibold">Applied</span>
                            {d.applied_at && <> at {new Date(d.applied_at).toLocaleString("en-AU")}</>}
                            {d.applied_by && <> by {d.applied_by}</>}
                            {d.rollback_snapshot && <> · rollback snapshot stored</>}
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                onClick={() => runImpactTracker(d.id)}
                                disabled={trackingImpact}
                                className="rounded border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-900 disabled:opacity-50"
                              >
                                {trackingImpact ? "Computing..." : "Recompute impact"}
                              </button>
                              {(() => {
                                const imp = impactByDraft.get(d.id);
                                if (!imp) return <span className="text-[10px] italic text-emerald-800">No impact data yet · run tracker</span>;
                                return <DraftImpactInline impact={imp} />;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </article>
          ))}
        </section>
      )}

      {/* IMPACT TRACKING */}
      {sub === "impact" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">SEO impact tracking</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Measures whether applied SEO drafts improved GSC performance. Baseline: 28 days before apply.
                  Compared against 7-day and 30-day windows after apply. Nothing is auto-rolled-back.
                </p>
              </div>
              <button
                onClick={() => runImpactTracker()}
                disabled={trackingImpact}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {trackingImpact ? "Running impact tracker..." : "Run impact tracker"}
              </button>
            </div>
            {(() => {
              const applied = weeklySeoTaskDrafts.filter((d) => d.approval_status === "applied");
              const winners = draftImpacts.filter((i) => i.impact_status === "improving");
              const losers = draftImpacts.filter((i) => i.impact_status === "declining");
              const neutral = draftImpacts.filter((i) => i.impact_status === "neutral");
              const awaiting = draftImpacts.filter((i) => i.impact_status === "awaiting_data");
              const insufficient = draftImpacts.filter((i) => i.impact_status === "insufficient_data");
              return (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <StatTile label="Applied drafts" value={applied.length} />
                  <StatTile label="Winners" value={winners.length} tone="green" />
                  <StatTile label="Losers" value={losers.length} tone="red" />
                  <StatTile label="Neutral" value={neutral.length} />
                  <StatTile label="Awaiting / low data" value={awaiting.length + insufficient.length} />
                </div>
              );
            })()}
          </div>

          {draftImpacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              No impact records yet. Apply approved drafts, then run the impact tracker.
            </div>
          ) : (
            <>
              <ImpactList
                title="Top winning changes"
                tone="green"
                emptyText="No winning changes yet — waiting for post-apply data to settle."
                impacts={[...draftImpacts]
                  .filter((i) => i.impact_status === "improving")
                  .sort((a, b) => (b.clicks_delta_30d ?? b.clicks_delta_7d ?? 0) - (a.clicks_delta_30d ?? a.clicks_delta_7d ?? 0))
                  .slice(0, 10)}
                drafts={weeklySeoTaskDrafts}
              />
              <ImpactList
                title="Changes to review or roll back"
                tone="red"
                emptyText="No declining changes — nothing flagged for rollback review."
                impacts={[...draftImpacts]
                  .filter((i) => i.impact_status === "declining")
                  .sort((a, b) => (a.clicks_delta_30d ?? a.clicks_delta_7d ?? 0) - (b.clicks_delta_30d ?? b.clicks_delta_7d ?? 0))
                  .slice(0, 10)}
                drafts={weeklySeoTaskDrafts}
              />
              <ImpactList
                title="All applied drafts (latest)"
                tone="neutral"
                emptyText="No applied drafts."
                impacts={[...draftImpacts]
                  .sort((a, b) => new Date(b.last_computed_at).getTime() - new Date(a.last_computed_at).getTime())
                  .slice(0, 50)}
                drafts={weeklySeoTaskDrafts}
              />
            </>
          )}
        </section>
      )}

      {sub === "patterns" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Winning patterns memory</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Learns from applied draft impact records to identify which draft types, page types and keyword intents drive improvements.
                  Admin-only insights. Nothing is auto-applied or auto-published.
                </p>
              </div>
              <button
                onClick={() => runLearnPatterns()}
                disabled={learningPatterns}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {learningPatterns ? "Learning..." : "Recompute patterns"}
              </button>
            </div>
            {(() => {
              const winning = winningPatterns.filter((p) => p.status === "winning");
              const risky = winningPatterns.filter((p) => p.status === "risky");
              const neutral = winningPatterns.filter((p) => p.status === "neutral");
              const highConf = winningPatterns.filter((p) => p.confidence_level === "high").length;
              return (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile label="Patterns learned" value={winningPatterns.length} />
                  <StatTile label="Winning" value={winning.length} tone="green" />
                  <StatTile label="Risky" value={risky.length} tone="red" />
                  <StatTile label="High confidence" value={highConf} />
                </div>
              );
            })()}
          </div>

          {winningPatterns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              No patterns learned yet. Apply approved drafts, run the impact tracker, then click "Recompute patterns".
            </div>
          ) : (
            <>
              <PatternList
                title="Winning patterns — prioritize in future Weekly Plans"
                tone="green"
                emptyText="No winning patterns yet."
                patterns={winningPatterns.filter((p) => p.status === "winning").sort((a, b) => (b.success_count - a.success_count))}
              />
              <PatternList
                title="Risky patterns — review or avoid"
                tone="red"
                emptyText="No risky patterns flagged."
                patterns={winningPatterns.filter((p) => p.status === "risky").sort((a, b) => (b.failure_count - a.failure_count))}
              />
              <PatternList
                title="Best performing draft types"
                tone="neutral"
                emptyText="No data."
                patterns={winningPatterns.filter((p) => p.pattern_type === "draft_type").sort((a, b) => ((b.average_ctr_delta ?? 0) - (a.average_ctr_delta ?? 0)))}
              />
              <PatternList
                title="Best performing keyword intents"
                tone="neutral"
                emptyText="No data."
                patterns={winningPatterns.filter((p) => p.pattern_type === "keyword_intent").sort((a, b) => ((b.average_click_delta ?? 0) - (a.average_click_delta ?? 0)))}
              />
              <PatternList
                title="Best performing page types"
                tone="neutral"
                emptyText="No data."
                patterns={winningPatterns.filter((p) => p.pattern_type === "page_type").sort((a, b) => ((b.average_ctr_delta ?? 0) - (a.average_ctr_delta ?? 0)))}
              />
            </>
          )}
        </section>
      )}


      {/* REPORTS */}
      {sub === "reports" && (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Reports archive</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2">Type</th><th>Date</th><th>Clicks</th><th>Impressions</th><th>Avg pos</th><th>Keywords</th><th></th></tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2">{r.report_type}</td>
                    <td className="text-xs">{new Date(r.generated_at).toLocaleDateString()}</td>
                    <td className="tnum">{r.total_clicks_period ?? "—"}</td>
                    <td className="tnum">{r.total_impressions_period?.toLocaleString() ?? "—"}</td>
                    <td className="tnum">{r.avg_position?.toFixed(1) ?? "—"}</td>
                    <td className="tnum">{r.total_keywords_tracked ?? "—"}</td>
                    <td><button className="text-xs text-accent underline" onClick={() => setOpenReportId(r.id)}>View</button></td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={7} className="py-4 text-muted-foreground">No reports yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {openReportId && (() => {
            const r = reports.find((x) => x.id === openReportId);
            if (!r) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpenReportId(null)}>
                <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{r.report_type} — {new Date(r.generated_at).toLocaleDateString()}</h3>
                    <button onClick={() => setOpenReportId(null)} className="text-sm text-muted-foreground">Close</button>
                  </div>
                  {r.content_recommendations && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Content recommendations</h4>
                      <ul className="mt-2 space-y-2 text-sm">
                        {(r.content_recommendations as any[]).map((c, i) => (
                          <li key={i} className="rounded-lg border border-border p-3">
                            <p className="font-medium">{c.keyword}</p>
                            <p className="text-xs text-muted-foreground">{c.action}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <pre className="mt-4 overflow-auto rounded-lg bg-muted p-3 text-[10px]">{JSON.stringify(r, null, 2)}</pre>
                </div>
              </div>
            );
          })()}
        </section>
      )}
    </div>
  );
};

export default SeoPanel;
