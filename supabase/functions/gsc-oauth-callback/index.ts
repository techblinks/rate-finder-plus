import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const GSC_CLIENT_ID = Deno.env.get('GSC_CLIENT_ID')!
const GSC_CLIENT_SECRET = Deno.env.get('GSC_CLIENT_SECRET')!
const REDIRECT_URI = Deno.env.get('SUPABASE_URL') + '/functions/v1/gsc-oauth-callback'
const SITE_URL = Deno.env.get('SITE_URL') || 'https://calcy.com.au'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return Response.redirect(`${SITE_URL}/admin?gsc_error=${encodeURIComponent(error)}`, 302)
  }

  if (!code) {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', GSC_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/webmasters.readonly')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    return Response.redirect(authUrl.toString(), 302)
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenResponse.json()
  if (tokens.error) {
    return Response.redirect(`${SITE_URL}/admin?gsc_error=${encodeURIComponent(tokens.error)}`, 302)
  }

  await supabase.from('gsc_oauth_tokens').upsert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type ?? 'Bearer',
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scope: tokens.scope,
    site_url: 'https://calcy.com.au',
    is_active: true,
  }, { onConflict: 'site_url' })

  return Response.redirect(`${SITE_URL}/admin?gsc_connected=true`, 302)
})
