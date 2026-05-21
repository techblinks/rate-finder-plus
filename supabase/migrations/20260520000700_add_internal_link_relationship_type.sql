ALTER TABLE public.internal_link_opportunities
  ADD COLUMN IF NOT EXISTS relationship_type TEXT NOT NULL DEFAULT 'topic_overlap';

CREATE INDEX IF NOT EXISTS internal_link_opportunities_relationship_type_idx
  ON public.internal_link_opportunities(relationship_type);
