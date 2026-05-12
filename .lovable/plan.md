## Goal

Elevate the entire site to a premium fintech feel by tightening **only** the global design system. Every page inherits the upgrade automatically. No content, route, schema, calculator, or SEO change.

## Non-negotiables (verified safe)

- No edits to: routes, page shells, FAQs, JSON-LD, headings/copy, ad slots, calculators' logic.
- No font swap that hurts CWV: new fonts loaded via `font-display: swap` with `preconnect` + `<link rel="preload">` for the two weights actually used. Self-hosted fallback metrics tuned to avoid CLS.
- All color tokens stay HSL and keep current navy + Calcy-blue identity — only refined.

## What changes

### 1. Typography system → Inter Display + Söhne-style stack
- Headings: **Inter Display** (700/600) with tightened tracking (`-0.022em` h1, `-0.015em` h2).
- Body / UI: **Inter** variable (400/500/600), 15px/1.65 base.
- Numbers: keep `tabular-nums` everywhere via `.tnum` + extend on result classes.
- Retire DM Serif as default; keep one optional `.font-editorial` (Fraunces fallback → Georgia) for the existing italic accent word in heroes so current visual rhythm is preserved.
- Update `tailwind.config.ts` `fontFamily` + `src/index.css` `@layer base` only. No JSX edits required because pages use semantic tags / utilities.

### 2. Color & surface tokens (refine, don't replace)
- Tighten neutrals: introduce `--surface`, `--surface-2`, `--surface-elevated` with cooler off-white (`220 30% 99%` / `222 24% 97%`).
- Border scale: `--border` softer (`222 18% 92%`), add `--border-strong` and `--hairline` (1px @ `222 16% 90%`) for tables.
- Navy/accent unchanged in hue; only L/S nudged for AA contrast on new surfaces.
- Add `--ring` focus token at `accent / 35%` with 3px halo — consistent across inputs/buttons.
- Add `--shadow-xs/sm/md/lg` premium scale (low-spread, high-blur) replacing ad-hoc shadows.

### 3. Radius, spacing & elevation rhythm
- Standardise radii: `--radius-sm 8px`, `--radius-md 12px`, `--radius-lg 16px`, `--radius-xl 20px`. Cards default to 16px, inputs 10px, pills 999px.
- Introduce `--space-*` 4px scale tokens used by recipes below.

### 4. Primitive recipe polish (no API changes)
Files touched: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/input.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/table.tsx`, `src/components/ui/accordion.tsx`.
- **Button**: refine sizes (h-10/h-11/h-12), add subtle gradient on `default`, crisper `outline`, premium `ghost` hover. Same variants/props.
- **Input**: 1.5px border, 10px radius, focus ring uses new `--ring`, taller hit area on mobile (min-h 48px), tabular-nums by default.
- **Card**: softer border + new shadow-xs, 16px radius, consistent inner padding scale.
- **Badge**: pill, semantic color variants tied to success/warning/destructive tokens.
- **Table**: hairline rows, zebra off, sticky header style, tabular numerics.
- **Accordion**: cleaner chevron motion, better spacing.

### 5. Global base polish
- Body `font-feature-settings: "ss01","cv11","tnum"`.
- Smooth scroll, refined selection color, focus-visible ring across all interactive elements.
- Slightly warmer link color on hover; underline offset 3px.
- `prefers-reduced-motion` respected for any new transitions.

### 6. Ads & sticky bars (visual only)
- AdSlot wrapper gets a labelled hairline frame + `min-height` reservation token to remove CLS without changing placement or logic.
- MobileStickyResultBar: refined glass blur, hairline top border, tabular numbers — same content/structure.

## What does NOT change

- No JSX in pages or calculators.
- No copy, headings, FAQs, JSON-LD, breadcrumbs, sitemaps, robots, canonicals, internal links.
- No new dependencies beyond optional self-hosted Inter via `@fontsource-variable/inter` (≈ 30KB woff2 subset, brotli) — net CWV positive vs current Google Fonts request.

## File list (estimate)

```text
tailwind.config.ts               (fontFamily, radius, shadow scale)
src/index.css                    (tokens, base, typography utilities)
src/styles/polish.css            (recipe refinements)
src/components/ui/button.tsx     (variant polish)
src/components/ui/card.tsx
src/components/ui/input.tsx
src/components/ui/badge.tsx
src/components/ui/table.tsx
src/components/ui/accordion.tsx
src/components/AdSlot.tsx        (frame + min-height only)
src/components/mobile/MobileStickyResultBar.tsx (visual only)
index.html                       (font preconnect/preload)
```

## Phased delivery

1. **Phase 1 — Tokens & typography** (`tailwind.config.ts`, `index.css`, `index.html`, font install). Visible immediately, zero structural risk. Run build + visual QA on home, mortgage calc, stamp duty, guide page, both viewports.
2. **Phase 2 — Primitive recipes** (button/card/input/badge/table/accordion + polish.css). QA same pages + calculator results, sticky bar, ads.
3. **Phase 3 — Final polish** (AdSlot frame, MobileStickyResultBar refinements, focus rings audit, micro-motion). QA + Lighthouse delta check (target: no CLS regression, LCP ≤ current).

## Acceptance checks per phase

- `bun run test` (831 tests) passes.
- TypeScript clean.
- Visual diff on: `/`, `/mortgage-calculator`, `/stamp-duty-calculator`, `/borrowing-power-calculator`, `/guides/what-is-lmi` at 390px and 1280px.
- JSON-LD untouched (grep confirms no edits in `seo/` or page shells).
- Lighthouse mobile: CLS ≤ 0.02 delta, LCP within ±100ms.

Approve and I'll start with Phase 1.