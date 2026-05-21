CREATE TABLE IF NOT EXISTS public.topic_cluster_visualizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_key TEXT NOT NULL,
  cluster_name TEXT NOT NULL,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  authority_strength INTEGER NOT NULL CHECK (authority_strength >= 0 AND authority_strength <= 100),
  node_count INTEGER NOT NULL DEFAULT 0,
  edge_count INTEGER NOT NULL DEFAULT 0,
  orphan_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  topical_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_supporting_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  graph_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  graph_edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  semantic_hierarchy JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (cluster_key)
);

CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_health_idx
  ON public.topic_cluster_visualizations(health_score ASC);
CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_authority_idx
  ON public.topic_cluster_visualizations(authority_strength DESC);
CREATE INDEX IF NOT EXISTS topic_cluster_visualizations_status_idx
  ON public.topic_cluster_visualizations(status);

ALTER TABLE public.topic_cluster_visualizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topic_cluster_visualizations_admin" ON public.topic_cluster_visualizations;
CREATE POLICY "topic_cluster_visualizations_admin"
  ON public.topic_cluster_visualizations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS topic_cluster_visualizations_updated_at ON public.topic_cluster_visualizations;
CREATE TRIGGER topic_cluster_visualizations_updated_at BEFORE UPDATE ON public.topic_cluster_visualizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
