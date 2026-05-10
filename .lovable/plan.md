# Plan: native-app feel for mobile

Based on the annotated screenshot, three distinct issues + one feature request.

## 1. Remove duplicate "Calcy" row on mobile home

`src/components/mobile/MobileHomepage.tsx` currently renders its own sticky header (`🧮 Calcy` + `RBA 4.35%` pill). Since the global `Header` now renders the uploaded logo on mobile too, this row is a duplicate. Remove the entire inner `<header>` block and move the RBA pill inline above the calculator grid (small chip, right-aligned) so the rate signal stays visible.

## 2. Remove hamburger menu on mobile (looks like a website)

In `src/components/layout/Header.tsx`, the mobile menu button + slide-down nav are redundant — `MobileBottomNav` already provides primary navigation (Home / Calculate / Guides / Compare). On viewports `< md`, hide the hamburger button and the mobile dropdown nav entirely. Desktop nav stays untouched. Result: mobile header shows only the logo, like a native app's top bar.

## 3. Native-style "Related calculators" + "Latest guides" under each calculator (mobile only)

Today the mobile branch of `CalculatorPageShell.tsx` returns only the calculator + a swipe-progress dots row. We'll add two new sections **below the calculator** for engagement and internal-linking:

### A. Related calculators — horizontal snap scroller
- Reuse the existing `related` prop already passed to the shell.
- Render as a horizontally-scrolling row of pill cards with icon + label, `snap-x snap-mandatory`, `active:scale-[0.97]`. No webview-style list — feels like an iOS "You might also like" rail.

### B. Related guides & latest news — vertical card stack
- Reuse `RelatedGuides`'s mapping logic (`CALCULATOR_TO_GUIDES` keyed by canonical) to pick 3 contextual guide cards.
- Render as full-width rounded cards (`rounded-2xl`, soft border, subtle shadow) with: small category chip, bold title (2-line clamp), 2-line description, "Read more →". No grid — single column stacked, mimicking native news feeds (e.g. Apple News).
- Header: "Latest guides & insights" with small "View all →" link to `/guides`.

Both sections only render on mobile (already inside the `if (isMobile)` branch). Bottom padding adjusts so the sticky result bar doesn't cover the last card.

## Files touched

- `src/components/mobile/MobileHomepage.tsx` — remove inner header, relocate RBA chip.
- `src/components/layout/Header.tsx` — hide hamburger + mobile dropdown on `<md`.
- `src/pages/CalculatorPageShell.tsx` — add related-calculators rail + related-guides stack inside the mobile branch.
- (No new file strictly required, but I may extract a small `MobileRelatedRail.tsx` if the JSX gets long — purely organisational.)

## Out of scope

- No data/business-logic changes.
- No new "news" data source — "latest news" is sourced from the existing `GUIDES` dataset, which is what the rest of the site treats as editorial content. If you want a separate live RSS/news feed later, that's a follow-up.

## Visual reference

```text
┌─────────────────────────────┐
│  [logo]                     │  ← mobile header: logo only
├─────────────────────────────┤
│  Mortgage Calculator        │
│  ...inputs / results...     │
│  • • • • ● • • •            │  swipe dots
│                             │
│  Try next ▸                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ →     │  horizontal snap rail
│  │SD│ │BP│ │LMI│ │RvB│      │
│  └──┘ └──┘ └──┘ └──┘        │
│                             │
│  Latest guides & insights   │
│  ┌─────────────────────┐    │
│  │ STAMP DUTY          │    │  card 1
│  │ Stamp duty 2026...  │    │
│  │ Description text…   │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ FIRST HOME BUYER    │    │  card 2
│  └─────────────────────┘    │
└─────────────────────────────┘
│ Home  Calc  Guides  Compare │  bottom nav (unchanged)
```

Approve and I'll implement.
