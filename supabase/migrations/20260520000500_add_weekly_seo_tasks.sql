CREATE TABLE IF NOT EXISTS public.weekly_seo_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  task_title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('opportunity', 'ctr', 'internal_link', 'content_gap', 'ranking_drop', 'freshness')),
  affected_url TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  suggested_implementation_prompt TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'done')),
  priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
  source_refs JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (week_start, task_type, affected_url, task_title)
);

CREATE INDEX IF NOT EXISTS weekly_seo_tasks_week_idx ON public.weekly_seo_tasks(week_start DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_score_idx ON public.weekly_seo_tasks(priority_score DESC);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_status_idx ON public.weekly_seo_tasks(approval_status);
CREATE INDEX IF NOT EXISTS weekly_seo_tasks_type_idx ON public.weekly_seo_tasks(task_type);

ALTER TABLE public.weekly_seo_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_seo_tasks_admin" ON public.weekly_seo_tasks;
CREATE POLICY "weekly_seo_tasks_admin"
  ON public.weekly_seo_tasks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS weekly_seo_tasks_updated_at ON public.weekly_seo_tasks;
CREATE TRIGGER weekly_seo_tasks_updated_at BEFORE UPDATE ON public.weekly_seo_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
