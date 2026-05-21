
ALTER TABLE public.weekly_seo_task_drafts
  ADD COLUMN IF NOT EXISTS applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS applied_by text,
  ADD COLUMN IF NOT EXISTS rollback_snapshot jsonb;

CREATE TABLE IF NOT EXISTS public.seo_page_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  meta_title text,
  meta_description text,
  faq_additions jsonb NOT NULL DEFAULT '[]'::jsonb,
  applied_draft_id uuid,
  source_task_id uuid,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_page_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_page_overrides_admin"
ON public.seo_page_overrides
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_seo_page_overrides_updated_at
BEFORE UPDATE ON public.seo_page_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
