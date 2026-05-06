## Calcy v2 — Phase 1 Implementation Plan

Highest-SEO-ROI work, no calculator math changes.

### 1. State stamp-duty landing pages (8 routes)

Create `src/pages/StampDutyStatePage.tsx` — a thin wrapper around the existing `StampDuty` calculator that:
- Accepts a `state` prop (`NSW | VIC | QLD | WA | SA | TAS | ACT | NT`).
- Pre-selects and locks the state in the calculator (add an optional `lockedState` prop to `StampDuty.tsx`; renders state name + "Change state" link to `/stamp-duty-calculator` instead of the 8 pills).
- Sets unique `metaTitle`, `metaDescription`, canonical, H1, and a 200-word state-specific content section (rates + FHB threshold + practical buying notes).

Add 8 routes in `App.tsx`:
```
/stamp-duty-calculator/nsw
/stamp-duty-calculator/vic
/stamp-duty-calculator/qld
/stamp-duty-calculator/wa
/stamp-duty-calculator/sa
/stamp-duty-calculator/tas
/stamp-duty-calculator/act
/stamp-duty-calculator/nt
```

Cross-link: on national `/stamp-duty-calculator`, add a "Jump to your state" row of 8 pill links to the dedicated pages.

### 2. AI-discoverability + sitemap

- **`public/robots.txt`** — add explicit Allow blocks for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `anthropic-ai`, `cohere-ai`. Keep existing `User-agent: *` and Sitemap line.
- **`public/llms.txt`** — new file with the exact content from Part 16 (intro, About, list of 6 calculators with descriptions, data sources).
- **`public/sitemap.xml`** — extend from 7 entries to 15 by adding the 8 state pages at priority 0.7–0.8.

### 3. Data + token polish (minor visual fidelity)

- `src/data/rbaRates.ts` — update to `lastUpdated: "May 2026"`, add `cashRate: 4.10`, `averageLoanSize: 736257`.
- `src/index.css` — bump `h1` and `.text-h1` to weight 700, `.text-result-primary` and `.text-result-hero` to weight 700; widen scale (h1 44px, display 56px) per Part 3; tighten section paddings on Home to a strict `py-[72px]` everywhere (current hero/section-2 are 80/56).
- Add `.range-filled` runnable-track gradient using a `--fill-pct` CSS variable so slider tracks fill brand-blue up to thumb. Wire it from `RangeField.tsx` via inline `style={{ '--fill-pct': pct + '%' }}`.

### 4. Verification

- Search codebase for `Zune|zunecalculator|United States|Canada|United Kingdom` — must return zero matches.
- Confirm every nav link, homepage card, and the 8 new state pages resolve to a real route.
- Build passes.

### Out of scope for this phase

- GA4 wiring (needs your measurement ID — ask later)
- Pre-rendering pipeline (`vite-plugin-prerender`) — large engineering lift, defer
- Amortisation Monthly view + pagination — defer to phase 2
- Extracting `stampDutyRates.ts` into its own file (current inline location works fine)

### Files added

- `src/pages/StampDutyStatePage.tsx`
- `public/llms.txt`

### Files edited

- `src/App.tsx` (8 new routes)
- `src/components/calculators/StampDuty.tsx` (add optional `lockedState` prop)
- `src/pages/StampDutyPage.tsx` (add state-pill jump links)
- `src/data/rbaRates.ts`
- `src/index.css`
- `src/components/RangeField.tsx`
- `public/robots.txt`
- `public/sitemap.xml`

No calculator math, FAQ data, or existing route URLs change.
