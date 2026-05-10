# Calcy Anti-Vibe Redesign — Phased Plan

Mobile (`MobileHomepage`, `MobileBottomNav`, mobile-scoped CSS) is intentionally untouched per user direction. All new visuals target ≥ md breakpoint. New tokens are added alongside existing ones (not replaced) so mobile semantics stay stable.

## Batch 1 — Foundation + homepage (this turn)
- `index.html`: DM Serif Display + DM Sans + DM Mono via Google Fonts (preconnect already present).
- `index.css`: add `--c-navy*`, `--c-slate*`, `--c-bg`, `--font-display/body/data`, `--r-*`, `--shadow-*`. New utility/component classes for nav, hero data panel, calc data cards, rates table, navy buttons, section-title.
- `tailwind.config.ts`: add `navy`, `slate-mid`, `slate-light`, font families `serif` (DM Serif), `mono` (DM Mono).
- `Header.tsx`: dark navy bar, 4 primary links + "More calculators" hover dropdown + right-aligned Guides. Mobile (< md) keeps a clean logo-only bar.
- `Footer.tsx`: navy background, brand column, link columns, RBA bar, legal — all on desktop (already hidden on mobile via Layout).
- `Home.tsx`: full desktop rebuild — navy hero with live RBA chip + 4-link grid + data panel; remove "Why Calcy?" emoji section, blue quick-estimate widget, topic pills, old "Current in home loans" cards. Add data-style calculator grid (4×2) and Bloomberg-style rates table. Mobile branch (`<MobileHomepage />`) untouched.

## Batch 2 — Calculator pages (next turn)
- `CalculatorPageShell.tsx`: drop the `header` AdSlot above results, restyle title/breadcrumb with DM Serif, navy result panel, white input panel, sidebar ad slot.
- `RangeField`, `BarCompare`, calculator inputs: tabular DM Mono on all numbers.
- State pills (StampDuty.tsx): `rounded-md` + navy active.
- Sweep `rounded-full` → `rounded-md` on desktop CTAs (keep mobile pills).

## Batch 3 — Polish (next turn)
- Buttons: ensure `.btn-primary` defaults to navy on desktop sections; mobile keeps current accent.
- All number renderings: `tnum` + DM Mono via existing `.tnum` utility re-pointed.
- Validate hover dropdown a11y (keyboard).
- Run perf profile + visual QA.

## Constraints
- No calculator logic, Supabase queries, SEO content, guide articles, admin panel, or URLs change.
- Mobile (< 768px) renders identically to before this redesign.
- Existing semantic tokens (`--accent`, `--success`, `--surface`) stay; new navy palette layered on top.
