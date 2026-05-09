import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GSC_CLIENT_ID = Deno.env.get('GSC_CLIENT_ID')!
const GSC_CLIENT_SECRET = Deno.env.get('GSC_CLIENT_SECRET')!

// Hardcoded — must NOT have a trailing slash (prevents //admin redirect bug)
const SITE_URL = 'https://calcy.com.au'
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return Response.redirect(
      `${SITE_URL}/admin?gsc_error=${encodeURIComponent(error)}&gsc_error_description=${encodeURIComponent(errorDescription || '')}`,
      302,
    )
  }

  // No code → start the OAuth flow
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

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GSC_CLIENT_ID,
        client_secret: GSC_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token exchange error:', tokens)
      return Response.redirect(
        `${SITE_URL}/admin?gsc_error=${encodeURIComponent(tokens.error)}&gsc_error_description=${encodeURIComponent(tokens.error_description || 'Token exchange failed')}`,
        302,
      )
    }

    if (!tokens.access_token) {
      console.error('No access token in response:', tokens)
      return Response.redirect(`${SITE_URL}/admin?gsc_error=no_access_token`, 302)
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()

    const { error: dbError } = await supabase.from('gsc_oauth_tokens').upsert(
      {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_type: tokens.token_type || 'Bearer',
        expires_at: expiresAt,
        scope: tokens.scope || 'https://www.googleapis.com/auth/webmasters.readonly',
        site_url: 'https://calcy.com.au',
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'site_url', ignoreDuplicates: false },
    )

    if (dbError) {
      console.error('Database error saving tokens:', dbError)
      return Response.redirect(
        `${SITE_URL}/admin?gsc_error=database_error&gsc_error_description=${encodeURIComponent(dbError.message)}`,
        302,
      )
    }

    console.log('GSC tokens saved successfully')
    return Response.redirect(`${SITE_URL}/admin?gsc_connected=true`, 302)
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.redirect(
      `${SITE_URL}/admin?gsc_error=unexpected_error&gsc_error_description=${encodeURIComponent(String(err))}`,
      302,
    )
  }
})
