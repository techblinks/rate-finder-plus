# Calcy Anti-Vibe Redesign — Phased Plan

Mobile (`MobileHomepage`, `MobileBottomNav`, mobile-scoped CSS) is intentionally untouched per user direction. All new visuals target ≥ md breakpoint. New tokens are added alongside existing ones (not replaced) so mobile semantics stay stable.

## Batch 1 — Foundation + homepage (this turn)
- `index.html`: DM Serif Display + DM Sans + DM Mono via Google Fonts (preconnect already present).
- `index.css`: add `--c-navy*`, `--c-slate*`, `--c-bg`, `--font-display/body/data`, `--r-*`, `--shadow-*`. New utility/component classes for nav, hero data panel, calc data cards, rates table, navy buttons, section-title.
- `tailwind.config.ts`: add `navy`, `slate-mid`, `slate-light`, font families `serif` (DM Serif), `mono` (DM Mono).
- `Header.tsx`: dark navy bar, 4 primary links + "More calculators" hover dropdown + right-aligned Guides. Mobile (< md) keeps a clean logo-only bar.
- `Footer.tsx`: navy background, brand column, link columns, RBA bar, legal — all on desktop (already hidden on mobile via Layout).
- `Home.tsx`: full desktop rebuild — navy hero with live RBA chip + 4-link grid + data panel; remove "Why Calcy?" emoji section, blue quick-estimate widget, topic pills, old "Current in home loans" cards. Add data-style calculator grid (4×2) and Bloomberg-style rates table. Mobile branch (`<MobileHomepage />`) untouched.

## Batch 2 — Calculator pages (DONE)
- `CalculatorPageShell.tsx`: removed `header` AdSlot. H1 in DM Serif (clamp 32–48px), navy section H2s on desktop only.
- `index.css`: `.tnum` adopts `var(--font-data)` at ≥768px so all numeric outputs render in DM Mono on desktop. Mobile typography untouched.
- `StampDuty.tsx`: state pills + property-value pills become `rounded-md` with navy active state on desktop. Mobile pill style untouched.

## Batch 3 — Polish (DONE)
- Selection pills in RentVsBuy, Lmi, Refinance, MortgageCalculatorRedesign now use `md:rounded-md` + navy active state on desktop. Mobile pill style untouched.
- Numeric outputs site-wide already inherit DM Mono on desktop via the `.tnum` rule from Batch 2.
- Remaining: keyboard a11y on hover dropdown + perf re-profile (deferred — out of scope for this redesign sweep).

## Batch 4 — Brand consistency: navy header on every inner page (DONE)
- New `PageHeader` component (`src/components/layout/PageHeader.tsx`) renders the dark navy hero band on desktop only (`hidden md:block`) — white-on-navy breadcrumbs, optional live chip with pulsing dot, DM Serif Display H1, optional subtitle.
- New CSS in `index.css`: `.page-header-band`, `.page-header-inner`, `.page-breadcrumb`, `.page-live-chip`, `.page-header-title`, `.page-header-sub`.
- `CalculatorPageShell.tsx`: desktop now renders PageHeader (`liveChip="Rates current — updated today"`); legacy breadcrumb + serif H1 + RateFreshnessBadge wrapped in `md:hidden`.
- `GuidesIndex.tsx` + `GuideArticleShell.tsx`: same treatment — PageHeader on desktop, original breadcrumb + H1 in `md:hidden`. Mobile untouched.
- `AdSlot.tsx` (Part 10): empty placeholder removed — returns `null` until ads load, so the bare "Advertisement" label never appears.

## Batch 5 — Deferred (next pass)
- Part 3: navy result panels per-calculator (DM Mono white-on-navy primary value + secondary stat cards).
- Part 5: data-forward "Related calculators" cards with stat numbers.
- Part 6/7: guides index card restyle + guide article 2-column sidebar w/ TOC + sticky calculator CTA.

## Constraints
- No calculator logic, Supabase queries, SEO content, guide articles, admin panel, or URLs change.
- Mobile (< 768px) renders identically to before this redesign.
- Existing semantic tokens (`--accent`, `--success`, `--surface`) stay; new navy palette layered on top.
