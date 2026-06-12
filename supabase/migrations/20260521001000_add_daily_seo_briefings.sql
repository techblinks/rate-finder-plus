CREATE TABLE IF NOT EXISTS public.daily_seo_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  briefing_date DATE NOT NULL UNIQUE,
  daily_summary TEXT NOT NULL,
  top_urgent_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  highest_roi_opportunity JSONB NOT NULL DEFAULT '{}'::jsonb,
  fastest_page_one_opportunity JSONB NOT NULL DEFAULT '{}'::jsonb,
  highest_confidence_recommendation JSONB NOT NULL DEFAULT '{}'::jsonb,
  biggest_traffic_decline JSONB NOT NULL DEFAULT '{}'::jsonb,
  highest_rpm_opportunity JSONB NOT NULL DEFAULT '{}'::jsonb,
  best_winning_pattern JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_implementation_queue JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  estimated_traffic_opportunity INTEGER NOT NULL DEFAULT 0,
  estimated_revenue_opportunity TEXT NOT NULL DEFAULT 'Not estimated',
  seo_trend_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS daily_seo_briefings_date_idx
  ON public.daily_seo_briefings(briefing_date DESC);
CREATE INDEX IF NOT EXISTS daily_seo_briefings_confidence_idx
  ON public.daily_seo_briefings(confidence_score DESC);
CREATE INDEX IF NOT EXISTS daily_seo_briefings_status_idx
  ON public.daily_seo_briefings(approval_status);

ALTER TABLE public.daily_seo_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_seo_briefings_admin" ON public.daily_seo_briefings;
CREATE POLICY "daily_seo_briefings_admin"
  ON public.daily_seo_briefings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS daily_seo_briefings_updated_at ON public.daily_seo_briefings;
CREATE TRIGGER daily_seo_briefings_updated_at BEFORE UPDATE ON public.daily_seo_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
