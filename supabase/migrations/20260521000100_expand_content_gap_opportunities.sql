ALTER TABLE public.content_gap_opportunities
  ADD COLUMN IF NOT EXISTS keyword_topic TEXT,
  ADD COLUMN IF NOT EXISTS estimated_traffic_opportunity INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suggested_content_type TEXT NOT NULL DEFAULT 'content_update',
  ADD COLUMN IF NOT EXISTS suggested_related_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_quick_win BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS content_gap_opportunities_quick_win_idx
  ON public.content_gap_opportunities(is_quick_win, priority_score DESC);
CREATE INDEX IF NOT EXISTS content_gap_opportunities_content_type_idx
  ON public.content_gap_opportunities(suggested_content_type);
