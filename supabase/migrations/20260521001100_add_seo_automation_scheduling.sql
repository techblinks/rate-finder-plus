CREATE TABLE IF NOT EXISTS public.seo_automation_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_key TEXT NOT NULL UNIQUE,
  job_name TEXT NOT NULL,
  function_name TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'manual' CHECK (frequency IN ('daily', 'weekly', 'manual')),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'queued', 'running', 'success', 'error', 'disabled')),
  last_error TEXT,
  rows_processed INTEGER NOT NULL DEFAULT 0,
  rows_created INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seo_automation_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.seo_automation_schedules(id) ON DELETE SET NULL,
  job_key TEXT NOT NULL,
  job_name TEXT NOT NULL,
  function_name TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled', 'system')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'skipped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  rows_processed INTEGER NOT NULL DEFAULT 0,
  rows_created INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seo_automation_schedules_enabled_idx
  ON public.seo_automation_schedules(enabled, next_run_at);
CREATE INDEX IF NOT EXISTS seo_automation_schedules_status_idx
  ON public.seo_automation_schedules(status);
CREATE INDEX IF NOT EXISTS seo_automation_runs_schedule_idx
  ON public.seo_automation_runs(schedule_id, started_at DESC);
CREATE INDEX IF NOT EXISTS seo_automation_runs_job_idx
  ON public.seo_automation_runs(job_key, started_at DESC);
CREATE INDEX IF NOT EXISTS seo_automation_runs_status_idx
  ON public.seo_automation_runs(status);

ALTER TABLE public.seo_automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_automation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seo_automation_schedules_admin" ON public.seo_automation_schedules;
CREATE POLICY "seo_automation_schedules_admin"
  ON public.seo_automation_schedules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "seo_automation_runs_admin" ON public.seo_automation_runs;
CREATE POLICY "seo_automation_runs_admin"
  ON public.seo_automation_runs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS seo_automation_schedules_updated_at ON public.seo_automation_schedules;
CREATE TRIGGER seo_automation_schedules_updated_at BEFORE UPDATE ON public.seo_automation_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.seo_automation_schedules (job_key, job_name, function_name, enabled, frequency, status, config)
VALUES
  ('gsc_sync', 'GSC Sync', 'sync-gsc-data', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('opportunity_radar', 'Opportunity Radar', 'score-seo-opportunities', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('ctr_optimizer', 'CTR Optimizer', 'optimize-ctr', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('content_gaps', 'Content Gaps', 'analyze-content-gaps', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('internal_links', 'Internal Links', 'score-internal-links', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('money_pages', 'Money Pages', 'score-money-pages', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('freshness_engine', 'Freshness Engine', 'auto-refresh-content', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('competitor_tracking', 'Competitor Tracking', 'track-competitors', false, 'manual', 'idle', '{"safe_mode": true}'::jsonb),
  ('winning_patterns', 'Winning Patterns', 'generate-daily-seo-briefing', false, 'manual', 'idle', '{"safe_mode": true, "derived_signal": true}'::jsonb),
  ('daily_seo_briefing', 'Daily SEO Briefing', 'generate-daily-seo-briefing', false, 'daily', 'idle', '{"safe_mode": true}'::jsonb),
  ('weekly_seo_briefing', 'Weekly SEO Briefing', 'generate-weekly-seo-plan', false, 'weekly', 'idle', '{"safe_mode": true}'::jsonb),
  ('draft_impact_tracking', 'Draft Impact Tracking', 'generate-daily-seo-briefing', false, 'manual', 'idle', '{"safe_mode": true, "derived_signal": true}'::jsonb)
ON CONFLICT (job_key) DO UPDATE SET
  job_name = EXCLUDED.job_name,
  function_name = EXCLUDED.function_name,
  config = seo_automation_schedules.config || EXCLUDED.config,
  updated_at = NOW();
