# Fix Rent vs Buy layout — user-first, ads later

## The problem

At your current viewport (1101 px) three columns are competing for space:

```
[ Inputs (cramped) | Verdict panel | Ad sidebar (empty placeholder) ]
```

The page shell adds a sticky 300 px ad sidebar, and the calculator itself already has a 2-column inputs/verdict layout. The inputs column collapses to ~240 px, fields wrap onto 6+ lines, the deposit value gets clipped, and the ad column is empty space stealing the user's working area.

This violates the user-first principle: a tool the visitor came to use is being squeezed by an ad slot that may never even render.

## The strategy

**Priority order for above-the-fold space on calculator pages:**
1. The calculator inputs and the verdict panel
2. The break-even chart (the "aha" moment)
3. Sensitivity / year-by-year detail
4. SEO content
5. Ads (header banner + inline + sticky mobile only — no desktop sidebar squeezing the tool)

The desktop sticky sidebar ad gets removed from the calculator content area and replaced with an inline ad block placed **between the calculator and the SEO content**, where it is naturally seen during reading without competing with the tool itself. Header banner, inline ad-after-calculator, and mobile sticky ad all stay — they don't fight for the calculator's working width.

## Layout changes

### CalculatorPageShell
- Remove the desktop `lg:grid-cols-[1fr_300px]` split. Calculator children render full-width.
- Keep the top header banner (`AdSlot slot="header"`).
- Keep one inline `AdSlot slot="inline"` placed *after* the calculator output, *before* SEO sections.
- Keep `interleaveAdsEvery` inside SEO sections (where it belongs — readers, not tool users).
- Mobile sticky ad (`StickyMobileAd`) unchanged.

Result: the calculator now has the full content column to breathe.

### RentVsBuy component
- Inputs/verdict grid breakpoint moved from `md` (768 px) to `lg` (1024 px), so on screens 768–1023 px (and the cramped 1101 px shell case) inputs render full-width above the verdict instead of squeezed beside it.
- Verdict aside width tightened: `lg:grid-cols-[minmax(0,1fr)_360px]` (was 320–420 px), giving the inputs more room when side-by-side.
- "If you buy" and "If you rent" cards keep their internal `sm:grid-cols-2` so price/deposit/rate fields stay on one row at any reasonable width.
- Sticky verdict panel keeps `lg:sticky lg:top-24` so it scrolls along on desktop.

### Mobile/tablet flow (≤1023 px)
```
[ Verdict summary card ]      ← appears first so users see the answer
[ "If you buy" inputs ]
[ "If you rent" inputs ]
[ Net-worth chart ]
[ Sensitivity table ]
```

The verdict panel re-orders to render *first* on small screens (CSS order), so on mobile users see the answer immediately and scroll to refine inputs. On desktop the visual order remains inputs-left, verdict-right.

## Files to edit

- `src/pages/CalculatorPageShell.tsx` — drop the lg sidebar grid; place inline ad slot after `children`, before SEO sections.
- `src/components/calculators/RentVsBuy.tsx` — switch grid breakpoint to `lg`, tighten aside width, add `order-first lg:order-none` to the verdict aside so mobile shows it first.

## What stays the same

- All calculation logic, persistence, share/reset, sensitivity grid, chart, SEO sections, FAQs.
- `AdSlot` component, ad config, AdSense compliance work.
- Mobile sticky ad and header banner ad.

## What does NOT change

I am not removing ad capability — only relocating ads so they don't compete with the tool's working area. Revenue impact should be neutral-to-positive: a usable calculator drives more sessions, scroll depth, and inline-ad views than a cramped one with a sidebar nobody looks at.