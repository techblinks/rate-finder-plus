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
CREATE POLICY "ctr_optimizations_admin"
  ON public.ctr_optimizations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS ctr_optimizations_updated_at ON public.ctr_optimizations;
CREATE TRIGGER ctr_optimizations_updated_at BEFORE UPDATE ON public.ctr_optimizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
