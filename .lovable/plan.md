
# Sprint 2 — Unify Calcy on the light mobile design system

Goal: replace the dark "anti-vibe" desktop theme with the light theme that already ships on mobile, color-code result cards by calculator category, and keep every calculator's logic, routing, SEO and Sprint 1 mobile fixes untouched.

The base tokens in `src/index.css` are already light (`--background: #FFF`, navy foreground, blue accent). The dark theme is delivered through a small set of override classes (`.site-nav-redesign`, `.hero-redesign`, `.page-header-band`, `.calc-data-card`, `.rates-table`, `.trust-bar`, `--c-navy*`, `--c-bg-redesign`). So the unification is mostly a swap of those classes — not a token-wide rewrite.

## 1. Central category palette (single source of truth)

Add `src/data/calcCategories.ts` exporting one map keyed by canonical path:

```text
mortgage             → blue    (#2563eb / #eff6ff)
stamp-duty           → green   (#16a34a / #f0fdf4)
borrowing-power      → purple  (#a855f7 / #fdf4ff)
lmi                  → orange  (#ea580c / #fff7ed)
loan-comparison      → slate   (#475569 / #f8fafc)
rent-vs-buy          → red     (#dc2626 / #fef2f2)
refinance            → teal    (#0d9488 / #f0fdf4)
extra-repayments     → amber   (#d97706 / #fffbeb)
hecs-borrowing       → purple  (shares borrowing-power)
```

Mirror as CSS custom properties on `:root` (`--cat-mortgage-fg`, `--cat-mortgage-bg`, …) so SSR/prerendered pages render with zero JS.

## 2. CSS overrides — turn the dark classes light

In `src/index.css` (anti-vibe block ~line 386), rewrite to light tokens while preserving class names:

- `.site-nav-redesign` → white bg, bottom border `hsl(var(--border))`, sticky.
- `.nav-link-redesign` → foreground @ 65 %, hover accent, active solid accent.
- `.hero-redesign` → `bg-background`, foreground text. H1 keeps DM Serif Display.
- `.live-indicator` / `.live-dot` → green dot, muted-foreground label.
- `.hero-calc-link` → light card on `surface`, border `border`, hover lifts.
- `.hero-data-panel` + `.data-*` → white card, navy values, success-green modifier.
- `.trust-bar` → `surface` bg, border separators.
- `.calc-card-grid` → transparent bg, `gap: 12px`.
- `.calc-data-card` → white, 1 px border, `r-xl`, hover lift + accent border, leading category-tinted icon dot.
- `.rates-table` → already light; `.green` stays success.
- `.page-header-band` → white, foreground text, `border-b`. Title DM Serif Display 40–48 px.

Keep `--c-navy*` tokens defined (marked deprecated) to avoid sweeping unrelated edits.

## 3. Homepage (`src/pages/Home.tsx`)

Desktop branch only — mobile untouched.

- Replace navy hero with light hero: RBA pill, serif H1 (clamp 40–64 px), muted sub.
- 4-column colorful calculator grid mirroring mobile (lift card array into `calcCategories.ts` so both pages share).
- Right rail at ≥ lg: light "At a glance" panel using recoloured `.hero-data-panel`.
- Keep trust bar, rates table, FAQ on white/surface.
- Container `max-w-[1200px] mx-auto`.

## 4. Calculator pages — `CalculatorPageShell`

- `PageHeader` becomes light per §2.
- Add `category` prop forwarded as CSS vars on a wrapping div, so children read `--cat-fg` / `--cat-bg`.
- Wrap `{children}` in `lg:grid lg:grid-cols-[1fr_380px] lg:gap-10` for desktop inputs-left / results-right.
- Trust strip under H1 reusing `<LastReviewed />` and `<RateFreshnessBadge />`.

Mobile shell unchanged.

## 5. Result card colour coding

a) New `src/components/CategoryResultCard.tsx` wrapping existing `ResultCard` with a left accent border in `--cat-fg` + faint `--cat-bg` tint. Each calculator's primary result swaps to this.

b) Per-metric semantic colour utility classes:
- accent / category fg → primary number
- `--success` → savings / exemptions
- `--destructive` → costs / total interest
- `--warning` → LMI / warnings
- `text-muted-foreground` → secondary

Files: `MortgageCalculatorRedesign.tsx`, `StampDuty.tsx`, `BorrowingPower.tsx`, `Lmi.tsx`, `LoanComparison.tsx`, `RentVsBuy.tsx`, `Refinance.tsx`, `ExtraRepayments.tsx`, `HecsBorrowingPower.tsx`. JSX-only edits — no math, no inputs.

## 6. Footer

`.footer-navy` → `bg-surface` + `border-t border-border`, foreground text, accent links. Copy verbatim.

## 7. Header

- Remove `filter: brightness(0) invert(1)` from desktop logo `<img>`.
- `.site-nav-redesign` light per §2 — no JSX restructure.

## 8. Inherited pages (no per-file edits)

8 state stamp-duty, 8 FHB grant, all guides, 150 city programmatic, 600 suburb, About/Contact/Privacy/Terms — all flow through `PageHeader` / shells and inherit the new light styles. Quick audit pass to swap any hard-coded `bg-[var(--c-navy)]` / `text-white` strings to semantic tokens.

## 9. Tests

- Refresh `src/test/home-visual.snapshot.test.tsx`.
- `seo-regression`, `state-faq-jsonld`, sitemap tests untouched (URLs/JSON-LD don't change).
- Add light-theme assertion: header lacks dark bg class.

## 10. Hard gates

1. `bunx vitest` — all green.
2. `npm run build` + prerender — 787 files.
3. Sitemap counts: 37 / 150 / 600 / 3 children.
4. `validate-seo.mjs` + `validate-city-seo.mjs` — green.
5. Spot-check `/`, `/mortgage-calculator`, `/stamp-duty-calculator`, `/suburbs/mortgage-calculator-parramatta`, `/guides/mortgage-calculator-sydney`.
6. Mobile regressions: cookie banner, 44 px term-year, `inputmode="decimal"`, OG image.
7. Screenshots — 4 desktop @ 1440 (`/`, `/mortgage-calculator`, `/stamp-duty-calculator/nsw`, `/guides/mortgage-calculator-sydney`) + 2 mobile @ 390 (`/`, `/mortgage-calculator`).

## Out of scope

No formulas, no routing, no sitemap, no bottom-nav rework, no new content, no `MobileHomepage` / `MobileCalcHeader` / `MobileBottomNav` edits.

## File-touch summary

Edited: `src/index.css`, `src/pages/Home.tsx`, `src/pages/CalculatorPageShell.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/PageHeader.tsx`, 9 calculator components, 9 calculator pages, snapshot test.

Created: `src/data/calcCategories.ts`, `src/components/CategoryResultCard.tsx`.

Deleted: none. Routes added: none. SQL: none.
