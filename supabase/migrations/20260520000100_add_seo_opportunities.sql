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
CREATE POLICY "seo_opportunities_admin"
  ON public.seo_opportunities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS seo_opportunities_updated_at ON public.seo_opportunities;
CREATE TRIGGER seo_opportunities_updated_at BEFORE UPDATE ON public.seo_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
