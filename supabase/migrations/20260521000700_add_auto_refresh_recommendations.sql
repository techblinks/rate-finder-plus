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

CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_score_idx
  ON public.auto_refresh_recommendations(freshness_score ASC);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_priority_idx
  ON public.auto_refresh_recommendations(priority_level);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_status_idx
  ON public.auto_refresh_recommendations(status);
CREATE INDEX IF NOT EXISTS auto_refresh_recommendations_updated_idx
  ON public.auto_refresh_recommendations(last_updated_date ASC NULLS FIRST);

ALTER TABLE public.auto_refresh_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auto_refresh_recommendations_admin" ON public.auto_refresh_recommendations;
CREATE POLICY "auto_refresh_recommendations_admin"
  ON public.auto_refresh_recommendations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS auto_refresh_recommendations_updated_at ON public.auto_refresh_recommendations;
CREATE TRIGGER auto_refresh_recommendations_updated_at BEFORE UPDATE ON public.auto_refresh_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
