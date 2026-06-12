-- Phase 0A: Production Safety Hardening
-- GSC OAuth tokens contain sensitive Google access/refresh tokens.
-- Only admins should access them through authenticated clients; Edge Functions
-- using the Supabase service role can still access them for backend-only syncs.

DROP POLICY IF EXISTS "gsc_tokens_authenticated_all" ON public.gsc_oauth_tokens;
DROP POLICY IF EXISTS "gsc_tokens_auth_only" ON public.gsc_oauth_tokens;
DROP POLICY IF EXISTS "gsc_tokens_admin" ON public.gsc_oauth_tokens;
DROP POLICY IF EXISTS "gsc_tokens_service_role" ON public.gsc_oauth_tokens;

CREATE POLICY "gsc_tokens_admin"
ON public.gsc_oauth_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "gsc_tokens_service_role"
ON public.gsc_oauth_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.gsc_oauth_tokens IS
  'Sensitive Google Search Console OAuth tokens. RLS is restricted to admins and service-role backend jobs only.';
COMMENT ON POLICY "gsc_tokens_admin" ON public.gsc_oauth_tokens IS
  'Allows only authenticated users with the admin app_role to read or mutate GSC OAuth tokens.';
COMMENT ON POLICY "gsc_tokens_service_role" ON public.gsc_oauth_tokens IS
  'Allows trusted Supabase service-role Edge Functions to sync GSC data without exposing tokens to normal users.';
