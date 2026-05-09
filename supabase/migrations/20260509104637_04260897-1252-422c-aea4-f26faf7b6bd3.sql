CREATE TABLE public.content_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  target_keyword TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'brief',
  brief JSONB,
  content TEXT,
  word_count INTEGER,
  seo_score INTEGER,
  keyword_position NUMERIC(5,1),
  keyword_impressions INTEGER,
  keyword_opportunity NUMERIC(5,2),
  generated_by TEXT DEFAULT 'claude-sonnet-4-20250514',
  reviewed_by TEXT,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX content_drafts_status_idx ON public.content_drafts(status);
CREATE INDEX content_drafts_keyword_idx ON public.content_drafts(target_keyword);
CREATE INDEX content_drafts_created_idx ON public.content_drafts(created_at DESC);

ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_drafts_admin"
  ON public.content_drafts
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER content_drafts_updated
BEFORE UPDATE ON public.content_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();