
# Mobile UX Enhancement Pass

Scope: improve the mobile experience only. Desktop layout, SEO content, schemas, routes, calculator logic, and branding tokens stay untouched. All work is gated by `useIsMobile()` or `md:hidden` so desktop renders unchanged.

## What stays exactly the same
- Desktop hero (`PageHeader`), desktop SEO sections, FAQ, related guides, AdSlots on desktop.
- All JSON-LD, meta, canonical, breadcrumbs, internal links.
- Calculator math in `src/lib/calc/*`. No formula changes.
- Color tokens, fonts, radii, shadows in `index.css` / `tailwind.config.ts`. Reuse existing semantic tokens only.

## Audit findings (mobile)
1. `MobileStickyResultBar` shows only one number; no weekly equivalent, no share/save.
2. No quick-tweak chips (±$10k, ±1yr, ±0.5%) — every change requires opening sliders.
3. `RangeField` value chip is narrow (44%) and sliders feel small for one-hand use.
4. `MortgageCalculatorRedesign` mobile screen has multiple parallel sections (offset, presets, scenarios) without strong progressive disclosure — heavy first paint.
5. Share works via system share text only; no branded share card image.
6. No trust strip on mobile (rate freshness exists but is desktop-only in shell).
7. Result card numbers good size, but secondary stats stack in 3-col grid that gets cramped under 380px.
8. `MobileCalcHeader` share button shares URL only — doesn't include current scenario in a friendly way.

## Changes

### 1. Sticky result bar v2 (`src/components/mobile/MobileStickyResultBar.tsx`)
- Add optional `weeklyEquivalent`, `onShare`, `onSave` to `MobileResult` type.
- Show primary value + small "= $X/wk" line + two icon buttons (Share, Save).
- Subtle slide-up on first publish (transform, no layout shift). Keep current height (56px) and offset above bottom nav.

### 2. Quick scenario chips (new `src/components/mobile/QuickAdjustChips.tsx`)
- Horizontal scroll row of chips: −$10k, +$10k, −1yr, +1yr, −0.25%, +0.25%.
- Rendered only on mobile, directly above the result card in `MortgageCalculatorRedesign` and `MortgageRepayment`.
- Each chip calls existing setters and clamps to current min/max. `haptic.light()` on tap.
- Active "just-tapped" pulse (200ms) using existing accent token.

### 3. Inputs polish (mobile only, scoped via media query in `index.css`)
- Bump `.range-slider` thumb to 28px on `(max-width: 768px)` for thumb-friendly drag.
- Widen `.range-value-chip` to 52% on mobile, larger 16px font to defeat iOS zoom.
- Ensure `inputMode="decimal"` / `numeric"` on the relevant inputs in `CurrencyInput` and `NumberInput` (verify, add if missing). No logic change.

### 4. Branded share card (new `src/components/mobile/ShareCardCanvas.tsx`)
- Renders an offscreen 1080×1350 canvas with brand navy header, monthly repayment, weekly equivalent, loan/rate/term, "Updated for Australia 2026", logo wordmark.
- `MobileCalcHeader` share handler: try `navigator.share({ files: [pngBlob] })`; fall back to current text+URL share. Generated lazily on tap (no first-paint cost).

### 5. Trust strip (new `src/components/mobile/MobileTrustStrip.tsx`)
- Tiny one-line row under the calculator on mobile: "Updated for Australia 2026 · No signup · Calculations match lender amortisation".
- Renders inside `CalculatorPageShell` mobile branch only.

### 6. Progressive disclosure tidy (`MortgageCalculatorRedesign.tsx`)
- On mobile only (`md:hidden` wrappers), collapse Offset, Saved scenarios, Saved offset presets into a single "Advanced" collapsible group, keeping all existing content and state intact. Desktop keeps current layout.

### 7. Result hierarchy on tiny widths
- Add `min-[360px]:grid-cols-3` / `grid-cols-1` fallback to the secondary stat grid where it currently forces 3 columns on <360px.

### 8. AdSlot UX (mobile)
- Reserve explicit min-height on mobile `AdSlot` to prevent CLS (using the existing slot sizes). No new ad placements, no removals.

## Files touched
- New: `src/components/mobile/QuickAdjustChips.tsx`, `src/components/mobile/ShareCardCanvas.tsx`, `src/components/mobile/MobileTrustStrip.tsx`.
- Edit (mobile branches / `md:hidden` / mobile media queries only):
  - `src/components/mobile/MobileStickyResultBar.tsx`
  - `src/components/mobile/MobileCalcHeader.tsx`
  - `src/lib/mobileResult.ts` (extend type, backward compatible)
  - `src/components/calculators/MortgageCalculatorRedesign.tsx`
  - `src/components/calculators/MortgageRepayment.tsx`
  - `src/pages/CalculatorPageShell.tsx` (mobile branch only)
  - `src/index.css` (mobile `@media (max-width: 767px)` rules)
  - `src/components/AdSlot.tsx` (mobile min-height only)

## Non-goals
- No new routes, no new content sections, no copy rewrites on desktop, no schema edits, no calculator math edits, no branding/token edits, no removal of any visible content or links.

## Verification
- Run vitest suite (existing 831+ tests must still pass).
- Visual check at 360, 390, 414 px widths.
- Confirm desktop screenshot test snapshot unchanged.
- Lighthouse mobile: CLS still <0.05 with new sticky bar + ad min-heights.
