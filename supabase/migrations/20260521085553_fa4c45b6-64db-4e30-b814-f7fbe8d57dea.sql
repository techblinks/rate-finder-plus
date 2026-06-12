
CREATE TABLE IF NOT EXISTS public.weekly_seo_task_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  week_start date,
  draft_type text NOT NULL,
  target_url text,
  target_keyword text,
  proposed_change text NOT NULL,
  before_text text,
  after_text text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_seo_impact text,
  risk_level text NOT NULL DEFAULT 'low',
  approval_status text NOT NULL DEFAULT 'pending',
  reviewed_by text,
  review_note text,
  generated_by text NOT NULL DEFAULT 'ai',
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weekly_seo_task_drafts_task_id_idx ON public.weekly_seo_task_drafts(task_id);
CREATE INDEX IF NOT EXISTS weekly_seo_task_drafts_status_idx ON public.weekly_seo_task_drafts(approval_status);

ALTER TABLE public.weekly_seo_task_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_seo_task_drafts_admin"
ON public.weekly_seo_task_drafts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_weekly_seo_task_drafts_updated_at
BEFORE UPDATE ON public.weekly_seo_task_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
