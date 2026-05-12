## What's wrong

The guide article header strip shows a hardcoded **"RBA cash rate 4.10%"** even though the live database already holds **4.35%** (post the May 2026 hike). Every other surface that reads the rate via the `useRbaRates()` / `useLiveRates()` hooks (calculators, RBA indicator, hero, footer, FAQs that were manually rewritten) is already correct.

The bug is one stale string in `src/components/guides/GuideArticleShell.tsx` plus two stale **fallback** constants used when the DB fetch fails:

- `src/components/guides/GuideArticleShell.tsx:114` — literal `"…RBA cash rate 4.10%."`
- `src/data/rbaRates.ts:5` — `cashRate: 4.10` (static fallback)
- `src/hooks/useLiveRates.ts:116, 173` — fallback `4.1` and seed `{ rate: 4.1 }`

## Auto-sync — already wired, just verifying

The site already has a backend pipeline so this never has to be edited by hand again:

- DB table `rate_data` stores the live cash rate (currently `4.35`, verified 2026-05-09).
- Edge function `supabase/functions/sync-rba-rate/index.ts` runs daily via pg_cron and writes the latest rate.
- `useLiveRates()` fetches from `rate_data`, caches for 1 hour per session, and exposes `rbaRate`.
- `useRbaRates()` wraps it for calculators.

Everything that calls these hooks updates automatically. The guide trust-strip is the only place that bypassed the hook.

## Fix

1. **`src/components/guides/GuideArticleShell.tsx`** — call `useRbaRates()` and render the rate dynamically:
   `…RBA cash rate {cashRate.toFixed(2)}%.`
   Also include the `lastUpdated` month so the strip stays self-explanatory.

2. **`src/data/rbaRates.ts`** — update the static fallback `cashRate: 4.10` → `cashRate: 4.35`. This is only used when both the DB and the in-memory default fail, but keeping it current avoids wrong numbers flashing during cold loads.

3. **`src/hooks/useLiveRates.ts`** — bump the two `4.1` fallbacks to `4.35` for the same reason (line 116 default and the `getDefaultRates()` seed at line 173).

After these edits every surface — guides, calculators, hero, FAQs, footer — sources the cash rate from the same live `rate_data` row. When the RBA changes the rate, the daily sync function updates that row and the whole site reflects it within an hour (cache TTL) without any code change.

## Audit summary (no other stale numbers found)

`rg` for `4.10`, `4.1%`, hardcoded "cash rate" mentions returned only the three locations above. All page copy that references the rate (FAQs, SEO FAQs, guide bodies, Best Home Loans page, RBA calendar comments) already says **4.35% as of May 2026**.

## Files to change

- `src/components/guides/GuideArticleShell.tsx`
- `src/data/rbaRates.ts`
- `src/hooks/useLiveRates.ts`
