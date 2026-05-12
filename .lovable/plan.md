## Goal
Apply the uploaded CSS polish patch to the mortgage calculator (and sitewide where the rules generically match) — pure CSS overrides, no JSX/HTML or content changes.

## Changes

### 1. Add the CSS file
Copy the uploaded patch verbatim to `src/styles/calculator-patch.css` (all 12 sections: brand-blue sliders, chart min-height, bottom-nav padding, savings box typography, share/print row, quick-adjust chips, repayment hero, advanced badge, data sources, touch targets, transitions, bottom nav frosted glass).

### 2. Wire it up globally
Add a single import at the bottom of `src/index.css`:
```css
@import "./styles/calculator-patch.css";
```
This ensures it loads after Tailwind + existing `polish.css` so `!important` overrides stick.

### 3. Guardrails / minor adjustments to avoid regressions
The patch's broad selectors (e.g. `button { min-height: 44px }`, `main { padding-bottom: 100px !important }`) could affect the admin dashboard and small icon buttons. Two safe scoping tweaks before saving:

- Scope the global `button, [role="button"], a { min-height: 44px }` rule to **exclude admin** (`:not(.admin-shell *)`) and exclude small icon-only buttons used in the header search (`:not([aria-label="Search"])`). Keeps native feel on public pages, doesn't break admin sliders/toggles.
- Scope the `main { padding-bottom: 100px }` rule to mobile only via `@media (max-width: 767px)` — desktop doesn't have the fixed bottom nav, so 100px of dead space at the bottom would be wasted.

Everything else (sliders, chart heights, savings box, chips, transitions, bottom nav blur) is safe sitewide as-written.

### 4. Verify
- Run vitest (831 tests should still pass — pure CSS, no logic).
- Visually sanity-check mortgage calculator and admin in the preview.

## Out of scope
No JSX edits, no copy changes, no SEO/schema changes, no design-token refactor.