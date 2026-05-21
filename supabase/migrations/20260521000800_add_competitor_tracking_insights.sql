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

CREATE INDEX IF NOT EXISTS competitor_tracking_insights_score_idx
  ON public.competitor_tracking_insights(priority_score DESC);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_type_idx
  ON public.competitor_tracking_insights(insight_type);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_status_idx
  ON public.competitor_tracking_insights(status);
CREATE INDEX IF NOT EXISTS competitor_tracking_insights_domain_idx
  ON public.competitor_tracking_insights(competitor_domain);

ALTER TABLE public.competitor_tracking_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competitor_tracking_insights_admin" ON public.competitor_tracking_insights;
CREATE POLICY "competitor_tracking_insights_admin"
  ON public.competitor_tracking_insights
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS competitor_tracking_insights_updated_at ON public.competitor_tracking_insights;
CREATE TRIGGER competitor_tracking_insights_updated_at BEFORE UPDATE ON public.competitor_tracking_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
