## Three new features for Calcy

Implement three independent features in one pass: an admin CMS, shareable calculator URLs, and an "Email me this calculation" flow. All three share the same Lovable Cloud (Supabase) backend.

---

### 1. Admin CMS at `/admin` (Lovable Cloud + admin role)

**Backend (migrations)**
- Enable Lovable Cloud.
- `app_role` enum (`admin`, `user`) and `user_roles` table with RLS, plus a `has_role(uuid, app_role)` SECURITY DEFINER function (standard pattern — never store role on profile).
- `site_content` table — single-row key/value store with columns: `key text primary key`, `value jsonb`, `updated_at`. Three rows seeded:
  - `rba_rates` → mirrors `src/data/rbaRates.ts`
  - `faqs` → mirrors `src/data/faqs.ts`
  - `news_cards` → array of `{ title, summary, url, date, tag }`
- RLS: anyone can `select`; only `has_role(auth.uid(),'admin')` can `update`.

**Frontend**
- `/admin/login` — email+password sign in (Supabase auth, `emailRedirectTo: origin + '/admin'`).
- `/admin` — protected route. On mount: check session + admin role, redirect to login if missing.
- One page with three tabbed sections (RBA rates form, FAQs editor by calculator key, News cards CRUD).
- "Save" writes the whole JSON blob back to `site_content` row.
- Public-side data hooks (`useRbaRates`, `useFaqs`, `useNewsCards`) read from `site_content` with the existing static files as fallback so prerender + first paint never break.
- Add a small `NewsCards` section to the home page consuming the new content.

**Bootstrap admin**: After deploy, the user signs up once, then we run a one-shot SQL insert into `user_roles` granting them `admin`.

---

### 2. Shareable result URLs

Pure frontend, zero backend.

- New helper `src/lib/shareLink.ts` with `encodeInputs(obj)` / `decodeInputs(searchParams, schema)` — simple flat key=number/string mapping (no base64; readable URLs).
- Per calculator, on each calc, replace the URL via `history.replaceState` with `?loan=…&rate=…&term=…` (debounced, no scroll jump, no router re-render).
- On mount, hydrate state from `URLSearchParams` if any known key is present, clamped to the input's min/max.
- Add a "Copy link" button beside the existing Print/Email actions in `ResultActions`. Tracks `share_link_copied` GA4 event.
- Apply to all six calculators (Mortgage, Stamp Duty, LMI, Borrowing Power, Extra Repayments, Loan Comparison) with a per-calculator key map.

---

### 3. "Email me this calculation" via Resend

**Connector**
- Connect the Resend connector via `standard_connectors--connect`.

**Backend**
- `email_subscribers` table: `id`, `email citext unique`, `consent_rba_updates bool`, `created_at`. RLS: insert allowed for anon (rate-limited via edge function); select admin-only.
- Edge function `send-calculation-email`:
  - Validates body with Zod: `email`, `calculator`, `summaryHtml` (sanitized server-side), `inputs` (record), optional `subscribeToUpdates`.
  - Simple in-memory IP rate limit (5/min) to deter abuse.
  - Upserts subscriber row (with consent flag).
  - Calls Resend gateway `/emails` with branded HTML using the existing fintech palette (#003680 / #0162E3) and includes a "View calculation" link back to the shareable URL from feature #2.
  - Returns `{ ok: true }` or 4xx on validation/rate-limit failure.

**Frontend**
- New `EmailResultModal` component: email input, optional "Send me monthly RBA rate updates" checkbox, mandatory disclaimer line, submit calls the edge function via `supabase.functions.invoke`.
- Wire `ResultActions`' existing `onEmail` prop in all six calculators to open the modal with a calculator-specific summary builder (small `buildEmailSummary(calculator, result, inputs)` helper). Tracks `email_result_sent` on success.

---

### Technical notes

- Files added: `src/pages/admin/AdminLogin.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/components/admin/{RbaRatesForm,FaqEditor,NewsCardsEditor}.tsx`, `src/components/EmailResultModal.tsx`, `src/components/NewsCards.tsx`, `src/lib/shareLink.ts`, `src/lib/buildEmailSummary.ts`, `src/hooks/{useSiteContent,useAdminGuard}.ts`, edge function `supabase/functions/send-calculation-email/index.ts`.
- Files edited: `src/App.tsx` (admin + login routes, NotFound stays as catch-all), all six calculator components (URL hydration + share button + modal wiring), `src/pages/Home.tsx` (news cards), `src/components/RbaRateIndicator.tsx` and `src/data/rbaRates.ts` consumers (use hook with static fallback), `src/components/FAQ.tsx` consumers similarly.
- Robots: `/admin` already excluded via `noindex` meta we'll add to admin pages; also append `Disallow: /admin` to `public/robots.txt`.
- Prerender script keeps using static data — admin edits only affect runtime, not the prerendered HTML, so build pipeline is unaffected.
- Security: admin role checked via `has_role()` in RLS, not on the client; client check is only for UX redirect.

---

### Out of scope

- Custom domain for Resend (uses `onboarding@resend.dev` until user adds a verified domain — they can swap later).
- Email template inlining/MJML — straightforward inline-style HTML is sufficient.
- Versioning/audit log on `site_content` edits.
