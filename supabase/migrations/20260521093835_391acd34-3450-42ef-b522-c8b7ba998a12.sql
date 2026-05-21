
CREATE TABLE IF NOT EXISTS public.seo_winning_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_key text NOT NULL UNIQUE,
  pattern_type text NOT NULL,
  draft_type text,
  page_type text,
  keyword_intent text,
  confidence_level text NOT NULL DEFAULT 'low',
  average_ctr_delta numeric,
  average_click_delta numeric,
  average_position_delta numeric,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  neutral_count integer NOT NULL DEFAULT 0,
  sample_draft_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendation text,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_winning_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY seo_winning_patterns_admin
ON public.seo_winning_patterns
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_seo_winning_patterns_type ON public.seo_winning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_seo_winning_patterns_status ON public.seo_winning_patterns(status);

CREATE TRIGGER trg_seo_winning_patterns_updated_at
BEFORE UPDATE ON public.seo_winning_patterns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
