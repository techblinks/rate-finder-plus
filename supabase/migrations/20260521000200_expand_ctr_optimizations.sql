ALTER TABLE public.ctr_optimizations
  ADD COLUMN IF NOT EXISTS estimated_missed_clicks INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ctr_opportunity_score INTEGER NOT NULL DEFAULT 0 CHECK (ctr_opportunity_score >= 0 AND ctr_opportunity_score <= 100),
  ADD COLUMN IF NOT EXISTS suggested_emotional_trigger TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS suggested_semantic_improvements TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS suggested_search_intent_match TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS ctr_optimizations_missed_clicks_idx
  ON public.ctr_optimizations(estimated_missed_clicks DESC);
CREATE INDEX IF NOT EXISTS ctr_optimizations_opportunity_score_idx
  ON public.ctr_optimizations(ctr_opportunity_score DESC);
