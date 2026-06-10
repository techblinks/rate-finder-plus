CREATE TABLE IF NOT EXISTS public.seo_digest_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  preference_key TEXT NOT NULL UNIQUE DEFAULT 'admin_seo_digest',
  daily_enabled BOOLEAN NOT NULL DEFAULT false,
  weekly_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  admin_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  recipient_email TEXT,
  send_time_local TEXT NOT NULL DEFAULT '08:00',
  timezone TEXT NOT NULL DEFAULT 'Australia/Brisbane',
  last_daily_sent_at TIMESTAMPTZ,
  last_weekly_sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seo_digest_preferences_email_format CHECK (
    recipient_email IS NULL
    OR (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(recipient_email) <= 254)
  )
);

CREATE TABLE IF NOT EXISTS public.seo_digest_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  preference_id UUID REFERENCES public.seo_digest_preferences(id) ON DELETE SET NULL,
  digest_type TEXT NOT NULL CHECK (digest_type IN ('daily', 'weekly')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'admin_notification')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'sent', 'skipped', 'error')),
  subject TEXT NOT NULL,
  recipient_email TEXT,
  email_provider_configured BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  digest_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS seo_digest_logs_generated_idx
  ON public.seo_digest_logs(generated_at DESC);
CREATE INDEX IF NOT EXISTS seo_digest_logs_type_idx
  ON public.seo_digest_logs(digest_type, generated_at DESC);
CREATE INDEX IF NOT EXISTS seo_digest_logs_status_idx
  ON public.seo_digest_logs(status);

ALTER TABLE public.seo_digest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_digest_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seo_digest_preferences_admin" ON public.seo_digest_preferences;
CREATE POLICY "seo_digest_preferences_admin"
  ON public.seo_digest_preferences
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "seo_digest_logs_admin" ON public.seo_digest_logs;
CREATE POLICY "seo_digest_logs_admin"
  ON public.seo_digest_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS seo_digest_preferences_updated_at ON public.seo_digest_preferences;
CREATE TRIGGER seo_digest_preferences_updated_at BEFORE UPDATE ON public.seo_digest_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.seo_digest_preferences (preference_key)
VALUES ('admin_seo_digest')
ON CONFLICT (preference_key) DO NOTHING;
