DROP POLICY IF EXISTS "gsc_tokens_auth_only" ON public.gsc_oauth_tokens;
DROP POLICY IF EXISTS "gsc_tokens_authenticated_all" ON public.gsc_oauth_tokens;
DROP POLICY IF EXISTS "gsc_tokens_service_role" ON public.gsc_oauth_tokens;

CREATE POLICY "gsc_tokens_authenticated_all" ON public.gsc_oauth_tokens
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "gsc_tokens_service_role" ON public.gsc_oauth_tokens
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);