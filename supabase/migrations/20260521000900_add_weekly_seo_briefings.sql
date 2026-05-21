ALTER TABLE public.weekly_seo_tasks
  ADD COLUMN IF NOT EXISTS expected_traffic_impact TEXT,
  ADD COLUMN IF NOT EXISTS expected_revenue_impact TEXT,
  ADD COLUMN IF NOT EXISTS priority_level TEXT;

ALTER TABLE public.weekly_seo_tasks
  DROP CONSTRAINT IF EXISTS weekly_seo_tasks_task_type_check;

ALTER TABLE public.weekly_seo_tasks
  ADD CONSTRAINT weekly_seo_tasks_task_type_check
  CHECK (task_type IN (
    'opportunity',
    'ctr',
    'internal_link',
    'content_gap',
    'ranking_drop',
    'freshness',
    'money_page',
    'competitor',
    'aeo',
    'schema'
  ));

ALTER TABLE public.weekly_seo_tasks
  DROP CONSTRAINT IF EXISTS weekly_seo_tasks_priority_level_check;

ALTER TABLE public.weekly_seo_tasks
  ADD CONSTRAINT weekly_seo_tasks_priority_level_check
  CHECK (priority_level IS NULL OR priority_level IN ('high', 'medium', 'low'));

CREATE TABLE IF NOT EXISTS public.weekly_seo_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  executive_summary TEXT NOT NULL,
  seo_trend_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
  growth_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  money_page_priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'reviewed', 'dismissed')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS weekly_seo_briefings_week_idx
  ON public.weekly_seo_briefings(week_start DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_briefings_status_idx
  ON public.weekly_seo_briefings(approval_status);

ALTER TABLE public.weekly_seo_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_seo_briefings_admin" ON public.weekly_seo_briefings;
CREATE POLICY "weekly_seo_briefings_admin"
  ON public.weekly_seo_briefings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS weekly_seo_briefings_updated_at ON public.weekly_seo_briefings;
CREATE TRIGGER weekly_seo_briefings_updated_at BEFORE UPDATE ON public.weekly_seo_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
