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

CREATE INDEX IF NOT EXISTS content_gap_opportunities_score_idx
  ON public.content_gap_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_type_idx
  ON public.content_gap_opportunities(gap_type);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_url_idx
  ON public.content_gap_opportunities(affected_url);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_status_idx
  ON public.content_gap_opportunities(status);

ALTER TABLE public.content_gap_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_gap_opportunities_admin" ON public.content_gap_opportunities;
CREATE POLICY "content_gap_opportunities_admin"
  ON public.content_gap_opportunities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS content_gap_opportunities_updated_at ON public.content_gap_opportunities;
CREATE TRIGGER content_gap_opportunities_updated_at BEFORE UPDATE ON public.content_gap_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
