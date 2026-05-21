CREATE TABLE IF NOT EXISTS public.seo_draft_impact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL UNIQUE REFERENCES public.weekly_seo_task_drafts(id) ON DELETE CASCADE,
  task_id uuid,
  target_url text NOT NULL,
  target_keyword text,
  draft_type text,
  applied_at timestamptz NOT NULL,

  baseline_start date,
  baseline_end date,
  baseline_clicks integer NOT NULL DEFAULT 0,
  baseline_impressions integer NOT NULL DEFAULT 0,
  baseline_ctr numeric NOT NULL DEFAULT 0,
  baseline_position numeric,

  after_7d_start date,
  after_7d_end date,
  after_7d_clicks integer,
  after_7d_impressions integer,
  after_7d_ctr numeric,
  after_7d_position numeric,

  after_30d_start date,
  after_30d_end date,
  after_30d_clicks integer,
  after_30d_impressions integer,
  after_30d_ctr numeric,
  after_30d_position numeric,

  clicks_delta_7d integer,
  impressions_delta_7d integer,
  ctr_delta_7d numeric,
  position_delta_7d numeric,

  clicks_delta_30d integer,
  impressions_delta_30d integer,
  ctr_delta_30d numeric,
  position_delta_30d numeric,

  estimated_traffic_impact integer,
  estimated_revenue_impact numeric,
  rpm_estimate numeric,

  impact_status text NOT NULL DEFAULT 'awaiting_data',
  confidence text,
  notes text,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,

  last_computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_draft_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_draft_impact_admin"
ON public.seo_draft_impact
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_seo_draft_impact_status ON public.seo_draft_impact(impact_status);
CREATE INDEX IF NOT EXISTS idx_seo_draft_impact_applied_at ON public.seo_draft_impact(applied_at DESC);

DROP TRIGGER IF EXISTS trg_seo_draft_impact_updated_at ON public.seo_draft_impact;
CREATE TRIGGER trg_seo_draft_impact_updated_at
BEFORE UPDATE ON public.seo_draft_impact
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();