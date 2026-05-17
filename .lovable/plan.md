
# Email My Results — Lead Capture

## Part 1 — Database (migration)

Create `public.calculation_leads`:

- `id uuid pk default gen_random_uuid()`
- `email text not null`
- `calculator_type text not null` (`mortgage` | `borrowing_power` | `stamp_duty` | `lmi` | `refinance`)
- `inputs jsonb not null default '{}'::jsonb`
- `result_summary text`
- `suburb text`
- `created_at timestamptz not null default now()`

Enable RLS with these policies:

- **Insert (public, anon + authenticated)** — `WITH CHECK (true)` and a lightweight email format check (`email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'` and `length(email) <= 254`) to limit junk.
- **Select (admin only)** — `USING (has_role(auth.uid(), 'admin'))`. No user-row self-read (privacy requirement).
- **Update / Delete** — admin-only via the same `has_role` check.

Indexes: `created_at desc`, `calculator_type`.

## Part 2 — Shared lead-capture UI

New files:

- `src/lib/leads.ts` — `submitLead({ calculator_type, email, inputs, result_summary, suburb? })`. Inserts via `supabase.from('calculation_leads')`, validates email with `zod`, fires `trackEvent('lead_capture_submit', { calculator })`. Returns `{ ok, error }`.
- `src/components/EmailResultsDialog.tsx` — Radix `Dialog` with email input, consent line ("We'll email you a copy of these results. No spam."), submit + success states. Props: `open`, `onOpenChange`, `calculator`, `inputs`, `resultSummary`, `suburb?`.

Wire into existing `ResultActions` ("Email me this" button is already there with `onEmail` prop) — each calculator passes an `onEmail` handler that opens the dialog and supplies a tailored `resultSummary` string, plus the inputs object and (where relevant) suburb from route/page context.

Calculators to wire up:

1. `MortgageCalculatorRedesign.tsx` (mortgage)
2. `BorrowingPower.tsx` (borrowing_power)
3. `StampDuty.tsx` (stamp_duty) — pass `lockedState`/suburb when present
4. `Lmi.tsx` (lmi)
5. `Refinance.tsx` (refinance) — also needs a `ResultActions` mount (verify; add if missing)

Each `resultSummary` is a one-line plain-English string built from the current computed values (e.g. mortgage: "Monthly repayment: $3,241 on $600,000 loan at 6.24% over 30 years").

## Part 3 — Admin Leads panel

- New file `src/pages/admin/LeadsPanel.tsx`: table of leads (email, calculator, result summary, suburb, created), filter by calculator, search by email, CSV export, pagination (50/page). Reads via `supabase.from('calculation_leads').select(...).order('created_at', { ascending: false })`.
- Update `AdminDashboard.tsx`:
  - Add `"leads"` to `TabKey`
  - Add nav item under **Growth** group: `{ key: "leads", label: "Leads", icon: "📧" }`
  - Add `PAGE_META.leads`
  - Render `<LeadsPanel />` when `tab === "leads"`

## Technical notes

- Use the existing `supabase` client; no edge function needed for insert (RLS handles it).
- `zod` schema: trimmed email, max 254 chars, valid email format. Client- and DB-side both enforce.
- No automated email is actually sent yet — the "Email my results" submission only captures the lead. Copy in the dialog reflects that ("We'll send a copy shortly"). If transactional email is wanted later, that's a follow-up (Resend edge function).
- No changes to existing calculator formulas, SEO, schemas, or meta tags.

## Open questions

- Should the dialog also fire a transactional email now (requires Resend secret + edge function), or capture-only for v1? Plan assumes **capture-only**; confirm if you want sending wired up.
