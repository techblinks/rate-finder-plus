## Create `publish-news` Edge Function

### Function: `supabase/functions/publish-news/index.ts`

- POST-only endpoint (return 405 otherwise) with full CORS headers (OPTIONS preflight handler).
- Parse JSON body; validate required fields (`title`, `slug`, `body`, `secret`) with Zod. `excerpt` and `published_at` optional.
- Compare `secret` against `Deno.env.get("PUBLISH_SECRET")` using constant-time comparison. Mismatch → `401 {"error":"Unauthorized"}`.
- Use service-role Supabase client (`SUPABASE_SERVICE_ROLE_KEY`) to insert into `news_articles` with `is_published = true`, `published_at = body.published_at ?? new Date().toISOString()`, `author` left to default (`'Calcy Team'`).
- On success: `200 {"success": true, "id": <uuid>}`. On DB error: `500 {"error": <message>}`. Duplicate slug → `409 {"error":"Slug already exists"}`.
- Configured with `verify_jwt = false` in `supabase/config.toml` so GitHub Actions can call it without a Supabase user JWT (auth handled by `PUBLISH_SECRET`).

### Secret

- Generate a strong random value (32-byte base64url) and store via the secrets tool as `PUBLISH_SECRET`. Requires user to confirm in the secure form — I'll prefill the generated value so you just click save.

### Deliverable to user

After deploy, share the function URL:
`https://newvydpcchjbuhcldckf.supabase.co/functions/v1/publish-news`

Example GitHub Actions curl:
```bash
curl -X POST https://newvydpcchjbuhcldckf.supabase.co/functions/v1/publish-news \
  -H "Content-Type: application/json" \
  -d '{"title":"...","slug":"...","excerpt":"...","body":"...","published_at":"2026-05-13T14:30:00Z","secret":"'"$PUBLISH_SECRET"'"}'
```

### Out of scope

- No update/delete endpoints, no auth beyond shared secret, no markdown→HTML conversion (body stored as-is).
