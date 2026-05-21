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

CREATE INDEX IF NOT EXISTS content_optimizations_score_idx
  ON public.content_optimizations(optimization_score DESC);
CREATE INDEX IF NOT EXISTS content_optimizations_priority_idx
  ON public.content_optimizations(priority_level);
CREATE INDEX IF NOT EXISTS content_optimizations_status_idx
  ON public.content_optimizations(status);
CREATE INDEX IF NOT EXISTS content_optimizations_page_url_idx
  ON public.content_optimizations(page_url);

ALTER TABLE public.content_optimizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_optimizations_admin" ON public.content_optimizations;
CREATE POLICY "content_optimizations_admin"
  ON public.content_optimizations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS content_optimizations_updated_at ON public.content_optimizations;
CREATE TRIGGER content_optimizations_updated_at BEFORE UPDATE ON public.content_optimizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
