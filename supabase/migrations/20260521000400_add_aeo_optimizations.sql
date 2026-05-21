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

CREATE INDEX IF NOT EXISTS aeo_optimizations_score_idx
  ON public.aeo_optimizations(aeo_score DESC);
CREATE INDEX IF NOT EXISTS aeo_optimizations_snippet_idx
  ON public.aeo_optimizations(snippet_readiness_score DESC);
CREATE INDEX IF NOT EXISTS aeo_optimizations_priority_idx
  ON public.aeo_optimizations(priority_level);
CREATE INDEX IF NOT EXISTS aeo_optimizations_status_idx
  ON public.aeo_optimizations(status);
CREATE INDEX IF NOT EXISTS aeo_optimizations_page_url_idx
  ON public.aeo_optimizations(page_url);

ALTER TABLE public.aeo_optimizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aeo_optimizations_admin" ON public.aeo_optimizations;
CREATE POLICY "aeo_optimizations_admin"
  ON public.aeo_optimizations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS aeo_optimizations_updated_at ON public.aeo_optimizations;
CREATE TRIGGER aeo_optimizations_updated_at BEFORE UPDATE ON public.aeo_optimizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
