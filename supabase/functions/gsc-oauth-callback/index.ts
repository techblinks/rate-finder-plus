import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GSC_CLIENT_ID = Deno.env.get('GSC_CLIENT_ID')!
const GSC_CLIENT_SECRET = Deno.env.get('GSC_CLIENT_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Hardcoded — must NOT have a trailing slash (prevents //admin redirect bug)
const SITE_URL = 'https://calcy.com.au'
const GSC_SITE_URL = 'sc-domain:calcy.com.au'
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/gsc-oauth-callback`

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

    if (tokens.error || !tokens.access_token) {
      console.error('Token exchange failed:', JSON.stringify(tokens))
      return Response.redirect(
        `${SITE_URL}/admin?gsc_error=${encodeURIComponent(tokens.error || 'no_token')}&gsc_error_description=${encodeURIComponent(tokens.error_description || 'Token exchange failed')}`,
        302,
      )
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()

    // METHOD 1: Try saving with service role
    let saved = false
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        // Delete existing row first to avoid upsert conflicts
        await supabase.from('gsc_oauth_tokens').delete().eq('site_url', SITE_URL)

        const { error: insertError } = await supabase.from('gsc_oauth_tokens').insert({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || '',
          token_type: tokens.token_type || 'Bearer',
          expires_at: expiresAt,
          scope: tokens.scope || 'https://www.googleapis.com/auth/webmasters.readonly',
          site_url: SITE_URL,
          is_active: true,
        })

        if (!insertError) {
          saved = true
          console.log('GSC tokens saved via service role')
        } else {
          console.error('Service role insert failed:', JSON.stringify(insertError))
        }
      } catch (e) {
        console.error('Service role error:', e)
      }
    }

    if (saved) {
      return Response.redirect(`${SITE_URL}/admin?gsc_connected=true`, 302)
    }

    // METHOD 2: Fallback — pass tokens to frontend so the user's auth session can save them
    const tokenPayload = encodeURIComponent(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      token_type: tokens.token_type || 'Bearer',
      expires_in: tokens.expires_in || 3600,
      scope: tokens.scope || 'https://www.googleapis.com/auth/webmasters.readonly',
    }))

    return Response.redirect(`${SITE_URL}/admin?gsc_token=${tokenPayload}`, 302)
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.redirect(
      `${SITE_URL}/admin?gsc_error=unexpected_error&gsc_error_description=${encodeURIComponent(String(err))}`,
      302,
    )
  }
})
