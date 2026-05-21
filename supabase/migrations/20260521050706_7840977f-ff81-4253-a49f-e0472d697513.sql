CREATE TABLE IF NOT EXISTS public.seo_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  target_url TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  reason TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  source_keyword_id UUID REFERENCES public.seo_keywords(id) ON DELETE SET NULL,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (keyword, target_url)
);
CREATE INDEX IF NOT EXISTS seo_opportunities_score_idx ON public.seo_opportunities(score DESC);
CREATE INDEX IF NOT EXISTS seo_opportunities_priority_idx ON public.seo_opportunities(priority);
CREATE INDEX IF NOT EXISTS seo_opportunities_target_url_idx ON public.seo_opportunities(target_url);
CREATE INDEX IF NOT EXISTS seo_opportunities_status_idx ON public.seo_opportunities(status);
ALTER TABLE public.seo_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seo_opportunities_admin" ON public.seo_opportunities;
CREATE POLICY "seo_opportunities_admin" ON public.seo_opportunities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS seo_opportunities_updated_at ON public.seo_opportunities;
CREATE TRIGGER seo_opportunities_updated_at BEFORE UPDATE ON public.seo_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.internal_link_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_page TEXT NOT NULL,
  target_page TEXT NOT NULL,
  suggested_anchor_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_page, target_page, suggested_anchor_text)
);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_priority_idx ON public.internal_link_opportunities(priority);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_source_idx ON public.internal_link_opportunities(source_page);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_target_idx ON public.internal_link_opportunities(target_page);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_status_idx ON public.internal_link_opportunities(status);
ALTER TABLE public.internal_link_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "internal_link_opportunities_admin" ON public.internal_link_opportunities;
CREATE POLICY "internal_link_opportunities_admin" ON public.internal_link_opportunities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS internal_link_opportunities_updated_at ON public.internal_link_opportunities;
CREATE TRIGGER internal_link_opportunities_updated_at BEFORE UPDATE ON public.internal_link_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.internal_link_opportunities ADD COLUMN IF NOT EXISTS relationship_type TEXT NOT NULL DEFAULT 'topic_overlap';
CREATE INDEX IF NOT EXISTS internal_link_opportunities_relationship_type_idx ON public.internal_link_opportunities(relationship_type);

CREATE TABLE IF NOT EXISTS public.content_gap_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_type TEXT NOT NULL,
  affected_url TEXT NOT NULL,
  suggested_fix TEXT NOT NULL,
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (gap_type, affected_url, suggested_fix)
);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_score_idx ON public.content_gap_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_type_idx ON public.content_gap_opportunities(gap_type);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_url_idx ON public.content_gap_opportunities(affected_url);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_status_idx ON public.content_gap_opportunities(status);
ALTER TABLE public.content_gap_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_gap_opportunities_admin" ON public.content_gap_opportunities;
CREATE POLICY "content_gap_opportunities_admin" ON public.content_gap_opportunities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS content_gap_opportunities_updated_at ON public.content_gap_opportunities;
CREATE TRIGGER content_gap_opportunities_updated_at BEFORE UPDATE ON public.content_gap_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.content_gap_opportunities
  ADD COLUMN IF NOT EXISTS keyword_topic TEXT,
  ADD COLUMN IF NOT EXISTS estimated_traffic_opportunity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suggested_content_type TEXT NOT NULL DEFAULT 'content_update',
  ADD COLUMN IF NOT EXISTS suggested_related_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_quick_win BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS content_gap_opportunities_quick_win_idx ON public.content_gap_opportunities(is_quick_win, priority_score DESC);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_content_type_idx ON public.content_gap_opportunities(suggested_content_type);

CREATE TABLE IF NOT EXISTS public.ctr_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  primary_keyword TEXT NOT NULL,
  impressions_28d INTEGER NOT NULL DEFAULT 0,
  clicks_28d INTEGER NOT NULL DEFAULT 0,
  ctr_28d NUMERIC(6,4) NOT NULL DEFAULT 0,
  position NUMERIC(5,1),
  suggested_title TEXT NOT NULL,
  suggested_meta_description TEXT NOT NULL,
  suggested_intro TEXT NOT NULL,
  suggested_faq_snippet TEXT NOT NULL,
  suggested_featured_snippet_answer TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'dismissed')),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_url, primary_keyword)
);
CREATE INDEX IF NOT EXISTS ctr_optimizations_score_idx ON public.ctr_optimizations(priority_score DESC);
CREATE INDEX IF NOT EXISTS ctr_optimizations_page_idx ON public.ctr_optimizations(page_url);
CREATE INDEX IF NOT EXISTS ctr_optimizations_status_idx ON public.ctr_optimizations(status);
ALTER TABLE public.ctr_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ctr_optimizations_admin" ON public.ctr_optimizations;
CREATE POLICY "ctr_optimizations_admin" ON public.ctr_optimizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS ctr_optimizations_updated_at ON public.ctr_optimizations;
CREATE TRIGGER ctr_optimizations_updated_at BEFORE UPDATE ON public.ctr_optimizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.ctr_optimizations
  ADD COLUMN IF NOT EXISTS estimated_missed_clicks INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ctr_opportunity_score INTEGER NOT NULL DEFAULT 0 CHECK (ctr_opportunity_score >= 0 AND ctr_opportunity_score <= 100),
  ADD COLUMN IF NOT EXISTS suggested_emotional_trigger TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS suggested_semantic_improvements TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS suggested_search_intent_match TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS ctr_optimizations_missed_clicks_idx ON public.ctr_optimizations(estimated_missed_clicks DESC);
CREATE INDEX IF NOT EXISTS ctr_optimizations_opportunity_score_idx ON public.ctr_optimizations(ctr_opportunity_score DESC);

CREATE TABLE IF NOT EXISTS public.weekly_seo_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  task_title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('opportunity', 'ctr', 'internal_link', 'content_gap', 'ranking_drop', 'freshness')),
  affected_url TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  suggested_implementation_prompt TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'done')),
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  source_refs JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (week_start, task_type, affected_url, task_title)
);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_week_idx ON public.weekly_seo_tasks(week_start DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_score_idx ON public.weekly_seo_tasks(priority_score DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_status_idx ON public.weekly_seo_tasks(approval_status);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_type_idx ON public.weekly_seo_tasks(task_type);
ALTER TABLE public.weekly_seo_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "weekly_seo_tasks_admin" ON public.weekly_seo_tasks;
CREATE POLICY "weekly_seo_tasks_admin" ON public.weekly_seo_tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS weekly_seo_tasks_updated_at ON public.weekly_seo_tasks;
CREATE TRIGGER weekly_seo_tasks_updated_at BEFORE UPDATE ON public.weekly_seo_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.weekly_seo_tasks
  ADD COLUMN IF NOT EXISTS expected_traffic_impact TEXT,
  ADD COLUMN IF NOT EXISTS expected_revenue_impact TEXT,
  ADD COLUMN IF NOT EXISTS priority_level TEXT;
ALTER TABLE public.weekly_seo_tasks DROP CONSTRAINT IF EXISTS weekly_seo_tasks_task_type_check;
ALTER TABLE public.weekly_seo_tasks ADD CONSTRAINT weekly_seo_tasks_task_type_check CHECK (task_type IN ('opportunity','ctr','internal_link','content_gap','ranking_drop','freshness','money_page','competitor','aeo','schema'));
ALTER TABLE public.weekly_seo_tasks DROP CONSTRAINT IF EXISTS weekly_seo_tasks_priority_level_check;
ALTER TABLE public.weekly_seo_tasks ADD CONSTRAINT weekly_seo_tasks_priority_level_check CHECK (priority_level IS NULL OR priority_level IN ('high','medium','low'));

CREATE TABLE IF NOT EXISTS public.money_page_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  money_score INTEGER NOT NULL CHECK (money_score >= 0 AND money_score <= 100),
  reason TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  related_internal_links_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS money_page_scores_score_idx ON public.money_page_scores(money_score DESC);
CREATE INDEX IF NOT EXISTS money_page_scores_status_idx ON public.money_page_scores(status);
CREATE INDEX IF NOT EXISTS money_page_scores_page_url_idx ON public.money_page_scores(page_url);
ALTER TABLE public.money_page_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "money_page_scores_admin" ON public.money_page_scores;
CREATE POLICY "money_page_scores_admin" ON public.money_page_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS money_page_scores_updated_at ON public.money_page_scores;
CREATE TRIGGER money_page_scores_updated_at BEFORE UPDATE ON public.money_page_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.content_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  primary_topic TEXT NOT NULL,
  optimization_score INTEGER NOT NULL CHECK (optimization_score >= 0 AND optimization_score <= 100),
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  estimated_impact TEXT NOT NULL,
  recommended_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  improved_headings JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_additions JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  comparison_tables JSONB NOT NULL DEFAULT '[]'::jsonb,
  snippet_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  direct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  finance_examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculator_explanation_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_linking_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_overview_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_url)
);
CREATE INDEX IF NOT EXISTS content_optimizations_score_idx ON public.content_optimizations(optimization_score DESC);
CREATE INDEX IF NOT EXISTS content_optimizations_priority_idx ON public.content_optimizations(priority_level);
CREATE INDEX IF NOT EXISTS content_optimizations_status_idx ON public.content_optimizations(status);
CREATE INDEX IF NOT EXISTS content_optimizations_page_url_idx ON public.content_optimizations(page_url);
ALTER TABLE public.content_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_optimizations_admin" ON public.content_optimizations;
CREATE POLICY "content_optimizations_admin" ON public.content_optimizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS content_optimizations_updated_at ON public.content_optimizations;
CREATE TRIGGER content_optimizations_updated_at BEFORE UPDATE ON public.content_optimizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.aeo_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  primary_topic TEXT NOT NULL,
  aeo_score INTEGER NOT NULL CHECK (aeo_score >= 0 AND aeo_score <= 100),
  snippet_readiness_score INTEGER NOT NULL CHECK (snippet_readiness_score >= 0 AND snippet_readiness_score <= 100),
  answer_confidence_score INTEGER NOT NULL CHECK (answer_confidence_score >= 0 AND answer_confidence_score <= 100),
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  missing_semantic_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  direct_answer_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_overview_summaries JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured_snippet_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_heading_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  conversational_search_queries JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_url)
);
CREATE INDEX IF NOT EXISTS aeo_optimizations_score_idx ON public.aeo_optimizations(aeo_score DESC);
CREATE INDEX IF NOT EXISTS aeo_optimizations_snippet_idx ON public.aeo_optimizations(snippet_readiness_score DESC);
CREATE INDEX IF NOT EXISTS aeo_optimizations_priority_idx ON public.aeo_optimizations(priority_level);
CREATE INDEX IF NOT EXISTS aeo_optimizations_status_idx ON public.aeo_optimizations(status);
CREATE INDEX IF NOT EXISTS aeo_optimizations_page_url_idx ON public.aeo_optimizations(page_url);
ALTER TABLE public.aeo_optimizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "aeo_optimizations_admin" ON public.aeo_optimizations;
CREATE POLICY "aeo_optimizations_admin" ON public.aeo_optimizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS aeo_optimizations_updated_at ON public.aeo_optimizations;
CREATE TRIGGER aeo_optimizations_updated_at BEFORE UPDATE ON public.aeo_optimizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.topic_cluster_visualizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_key TEXT NOT NULL,
  cluster_name TEXT NOT NULL,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  authority_strength INTEGER NOT NULL CHECK (authority_strength >= 0 AND authority_strength <= 100),
  node_count INTEGER NOT NULL DEFAULT 0,
  edge_count INTEGER NOT NULL DEFAULT 0,
  orphan_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  topical_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_supporting_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  graph_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  graph_edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_hierarchy JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cluster_key)
);
CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_health_idx ON public.topic_cluster_visualizations(health_score ASC);
CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_authority_idx ON public.topic_cluster_visualizations(authority_strength DESC);
CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_status_idx ON public.topic_cluster_visualizations(status);
ALTER TABLE public.topic_cluster_visualizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "topic_cluster_visualizations_admin" ON public.topic_cluster_visualizations;
CREATE POLICY "topic_cluster_visualizations_admin" ON public.topic_cluster_visualizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS topic_cluster_visualizations_updated_at ON public.topic_cluster_visualizations;
CREATE TRIGGER topic_cluster_visualizations_updated_at BEFORE UPDATE ON public.topic_cluster_visualizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.semantic_finance_knowledge_graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_key TEXT NOT NULL,
  graph_name TEXT NOT NULL,
  authority_score INTEGER NOT NULL CHECK (authority_score >= 0 AND authority_score <= 100),
  entity_count INTEGER NOT NULL DEFAULT 0,
  relationship_count INTEGER NOT NULL DEFAULT 0,
  entity_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  entity_edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  topic_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  authority_connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_content_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  entity_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_entity_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (graph_key)
);
CREATE INDEX IF NOT EXISTS semantic_finance_knowledge_graphs_authority_idx ON public.semantic_finance_knowledge_graphs(authority_score DESC);
CREATE INDEX IF NOT EXISTS semantic_finance_knowledge_graphs_status_idx ON public.semantic_finance_knowledge_graphs(status);
ALTER TABLE public.semantic_finance_knowledge_graphs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "semantic_finance_knowledge_graphs_admin" ON public.semantic_finance_knowledge_graphs;
CREATE POLICY "semantic_finance_knowledge_graphs_admin" ON public.semantic_finance_knowledge_graphs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS semantic_finance_knowledge_graphs_updated_at ON public.semantic_finance_knowledge_graphs;
CREATE TRIGGER semantic_finance_knowledge_graphs_updated_at BEFORE UPDATE ON public.semantic_finance_knowledge_graphs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.auto_refresh_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  page_type TEXT NOT NULL,
  freshness_score INTEGER NOT NULL CHECK (freshness_score >= 0 AND freshness_score <= 100),
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  last_updated_date TIMESTAMPTZ,
  outdated_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  stale_content_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated_management JSONB NOT NULL DEFAULT '{}'::jsonb,
  freshness_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_url)
);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_score_idx ON public.auto_refresh_recommendations(freshness_score ASC);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_priority_idx ON public.auto_refresh_recommendations(priority_level);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_status_idx ON public.auto_refresh_recommendations(status);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_updated_idx ON public.auto_refresh_recommendations(last_updated_date ASC NULLS FIRST);
ALTER TABLE public.auto_refresh_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auto_refresh_recommendations_admin" ON public.auto_refresh_recommendations;
CREATE POLICY "auto_refresh_recommendations_admin" ON public.auto_refresh_recommendations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS auto_refresh_recommendations_updated_at ON public.auto_refresh_recommendations;
CREATE TRIGGER auto_refresh_recommendations_updated_at BEFORE UPDATE ON public.auto_refresh_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.competitor_tracking_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_domain TEXT NOT NULL,
  competitor_url TEXT,
  detected_topic TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('competitor_growth', 'new_topic', 'content_trend', 'ranking_opportunity', 'content_gap')),
  estimated_opportunity TEXT NOT NULL,
  recommended_response TEXT NOT NULL,
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  competitor_growth_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  new_topic_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_trend_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ranking_opportunity_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_gap_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (competitor_domain, detected_topic, insight_type)
);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_score_idx ON public.competitor_tracking_insights(priority_score DESC);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_type_idx ON public.competitor_tracking_insights(insight_type);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_status_idx ON public.competitor_tracking_insights(status);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_domain_idx ON public.competitor_tracking_insights(competitor_domain);
ALTER TABLE public.competitor_tracking_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "competitor_tracking_insights_admin" ON public.competitor_tracking_insights;
CREATE POLICY "competitor_tracking_insights_admin" ON public.competitor_tracking_insights FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS competitor_tracking_insights_updated_at ON public.competitor_tracking_insights;
CREATE TRIGGER competitor_tracking_insights_updated_at BEFORE UPDATE ON public.competitor_tracking_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.weekly_seo_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  executive_summary TEXT NOT NULL,
  seo_trend_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
  growth_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  money_page_priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS weekly_seo_briefings_week_idx ON public.weekly_seo_briefings(week_start DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_briefings_status_idx ON public.weekly_seo_briefings(approval_status);
ALTER TABLE public.weekly_seo_briefings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "weekly_seo_briefings_admin" ON public.weekly_seo_briefings;
CREATE POLICY "weekly_seo_briefings_admin" ON public.weekly_seo_briefings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS weekly_seo_briefings_updated_at ON public.weekly_seo_briefings;
CREATE TRIGGER weekly_seo_briefings_updated_at BEFORE UPDATE ON public.weekly_seo_briefings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();