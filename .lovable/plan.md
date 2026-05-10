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

## Batch 3 — Polish (next)
- Sweep remaining selection pills (RentVsBuy:160, Lmi:438, Refinance:185, MortgageCalculatorRedesign:424) to `md:rounded-md` + navy active.
- Restyle `BarCompare` row labels with DM Mono on desktop.
- Audit `.btn-primary` on desktop sections — point to navy when in non-mobile shell.
- Validate hover dropdown a11y (keyboard) + run perf profile.

## Constraints
- No calculator logic, Supabase queries, SEO content, guide articles, admin panel, or URLs change.
- Mobile (< 768px) renders identically to before this redesign.
- Existing semantic tokens (`--accent`, `--success`, `--surface`) stay; new navy palette layered on top.
