export type SubTab = "overview" | "health" | "automation" | "digest" | "daily-briefing" | "keywords" | "opportunities" | "money-pages" | "internal-links" | "content-gaps" | "content-optimizer" | "aeo" | "topic-clusters" | "knowledge-graph" | "auto-refresh" | "competitors" | "ctr" | "weekly-plan" | "reports";

export type SeoFunctionName =
  | "sync-gsc-data"
  | "sync-trends"
  | "score-seo-opportunities"
  | "score-money-pages"
  | "score-internal-links"
  | "analyze-content-gaps"
  | "optimize-content"
  | "optimize-aeo"
  | "visualize-topic-clusters"
  | "build-knowledge-graph"
  | "auto-refresh-content"
  | "track-competitors"
  | "optimize-ctr"
  | "generate-weekly-seo-plan"
  | "generate-daily-seo-briefing"
  | "run-seo-automation"
  | "send-seo-digest";

export type SeoFunctionRunner = (name: SeoFunctionName, body?: any) => Promise<void>;

export type Keyword = {
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

export type Report = {
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

export type SyncJob = {
  id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_updated: number | null;
  triggered_by: string;
  error_log: any;
};

export type SeoOpportunity = {
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

export type InternalLinkOpportunity = {
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

export type MoneyPageScore = {
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

export type ContentGapOpportunity = {
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

export type CtrOptimization = {
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

export type ContentOptimization = {
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

export type AeoOptimization = {
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

export type TopicGraphNode = {
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

export type TopicGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "existing" | "suggested" | "semantic" | "missing";
  strength: number;
  label: string;
};

export type TopicClusterVisualization = {
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

export type KnowledgeGraphNode = {
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

export type KnowledgeGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "calculates" | "explains" | "supports" | "depends_on" | "state_variant" | "related_to" | "missing" | "suggested_link";
  strength: number;
  label: string;
};

export type SemanticFinanceKnowledgeGraph = {
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

export type AutoRefreshRecommendation = {
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

export type CompetitorTrackingInsight = {
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

export type WeeklySeoTask = {
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

export type WeeklySeoBriefing = {
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

export type DailySeoBriefing = {
  id: string;
  briefing_date: string;
  daily_summary: string;
  top_urgent_actions: Array<{ task: string; source: string; url: string; priority_score: number; priority_level: string; risk_level: string; prompt: string }> | any;
  highest_roi_opportunity: any;
  fastest_page_one_opportunity: any;
  highest_confidence_recommendation: any;
  biggest_traffic_decline: any;
  highest_rpm_opportunity: any;
  best_winning_pattern: any;
  risk_alerts: Array<{ type: string; url?: string | null; message: string }> | any;
  suggested_implementation_queue: Array<{ task: string; source: string; url: string; priority_score: number; priority_level: string; risk_level: string; expected_traffic_impact: string; expected_revenue_impact: string; prompt: string }> | any;
  confidence_score: number;
  estimated_traffic_opportunity: number;
  estimated_revenue_opportunity: string;
  seo_trend_overview: any;
  data_sources: any;
  approval_status: "pending" | "approved" | "reviewed" | "dismissed";
  generated_at: string | null;
};

export type SeoAutomationSchedule = {
  id: string;
  job_key: string;
  job_name: string;
  function_name: string | null;
  enabled: boolean;
  frequency: "daily" | "weekly" | "manual";
  last_run_at: string | null;
  next_run_at: string | null;
  status: "idle" | "queued" | "running" | "success" | "error" | "disabled";
  last_error: string | null;
  rows_processed: number;
  rows_created: number;
  config: any;
  updated_at: string | null;
};

export type SeoAutomationRun = {
  id: string;
  schedule_id: string | null;
  job_key: string;
  job_name: string;
  function_name: string | null;
  trigger_type: "manual" | "scheduled" | "system";
  status: "running" | "success" | "error" | "skipped";
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  rows_processed: number;
  rows_created: number;
  error_message: string | null;
  result: any;
};

export type SeoDigestPreference = {
  id: string;
  preference_key: string;
  daily_enabled: boolean;
  weekly_enabled: boolean;
  email_enabled: boolean;
  admin_notifications_enabled: boolean;
  recipient_email: string | null;
  send_time_local: string;
  timezone: string;
  last_daily_sent_at: string | null;
  last_weekly_sent_at: string | null;
  last_error: string | null;
  updated_at: string | null;
};

export type SeoDigestLog = {
  id: string;
  preference_id: string | null;
  digest_type: "daily" | "weekly";
  channel: "email" | "admin_notification";
  status: "created" | "sent" | "skipped" | "error";
  subject: string;
  recipient_email: string | null;
  email_provider_configured: boolean;
  message: string | null;
  digest_payload: any;
  error_message: string | null;
  generated_at: string | null;
  sent_at: string | null;
};

export type ContentDraftImpactItem = {
  id: string;
  title: string;
  status: string;
  slug: string | null;
  target_keyword: string | null;
  keyword_position: number | null;
  keyword_impressions: number | null;
  keyword_opportunity: number | null;
  published_at: string | null;
  updated_at: string | null;
};

export const positionColor = (p: number | null | undefined) => {
  if (p == null) return "bg-muted text-muted-foreground";
  if (p <= 10) return "bg-emerald-100 text-emerald-900";
  if (p <= 20) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
};
