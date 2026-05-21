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

CREATE INDEX IF NOT EXISTS money_page_scores_score_idx
  ON public.money_page_scores(money_score DESC);
CREATE INDEX IF NOT EXISTS money_page_scores_status_idx
  ON public.money_page_scores(status);
CREATE INDEX IF NOT EXISTS money_page_scores_page_url_idx
  ON public.money_page_scores(page_url);

ALTER TABLE public.money_page_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "money_page_scores_admin" ON public.money_page_scores;
CREATE POLICY "money_page_scores_admin"
  ON public.money_page_scores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS money_page_scores_updated_at ON public.money_page_scores;
CREATE TRIGGER money_page_scores_updated_at BEFORE UPDATE ON public.money_page_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
