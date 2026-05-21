CREATE TABLE IF NOT EXISTS public.internal_link_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_page TEXT NOT NULL,
  target_page TEXT NOT NULL,
  suggested_anchor_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_page, target_page, suggested_anchor_text)
);

CREATE INDEX IF NOT EXISTS internal_link_opportunities_priority_idx
  ON public.internal_link_opportunities(priority);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_source_idx
  ON public.internal_link_opportunities(source_page);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_target_idx
  ON public.internal_link_opportunities(target_page);
CREATE INDEX IF NOT EXISTS internal_link_opportunities_status_idx
  ON public.internal_link_opportunities(status);

ALTER TABLE public.internal_link_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internal_link_opportunities_admin" ON public.internal_link_opportunities;
CREATE POLICY "internal_link_opportunities_admin"
  ON public.internal_link_opportunities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS internal_link_opportunities_updated_at ON public.internal_link_opportunities;
CREATE TRIGGER internal_link_opportunities_updated_at BEFORE UPDATE ON public.internal_link_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
