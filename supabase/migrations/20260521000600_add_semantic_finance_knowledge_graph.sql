CREATE TABLE IF NOT EXISTS public.semantic_finance_knowledge_graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  graph_key TEXT NOT NULL,
  graph_name TEXT NOT NULL,
  authority_score INTEGER NOT NULL CHECK (authority_score >= 0 AND authority_score <= 100),
  entity_count INTEGER NOT NULL DEFAULT 0,
  relationship_count INTEGER NOT NULL DEFAULT 0,
  entity_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  entity_edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  topic_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  authority_connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_content_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  entity_relationships JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_entity_coverage JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (graph_key)
);

CREATE INDEX IF NOT EXISTS semantic_finance_knowledge_graphs_authority_idx
  ON public.semantic_finance_knowledge_graphs(authority_score DESC);
CREATE INDEX IF NOT EXISTS semantic_finance_knowledge_graphs_status_idx
  ON public.semantic_finance_knowledge_graphs(status);

ALTER TABLE public.semantic_finance_knowledge_graphs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "semantic_finance_knowledge_graphs_admin" ON public.semantic_finance_knowledge_graphs;
CREATE POLICY "semantic_finance_knowledge_graphs_admin"
  ON public.semantic_finance_knowledge_graphs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS semantic_finance_knowledge_graphs_updated_at ON public.semantic_finance_knowledge_graphs;
CREATE TRIGGER semantic_finance_knowledge_graphs_updated_at BEFORE UPDATE ON public.semantic_finance_knowledge_graphs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
