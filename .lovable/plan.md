
# Mobile-Only Mortgage Calculator Redesign

A focused restructure of `MortgageCalculatorRedesign` and the mobile branch of `CalculatorPageShell`. Desktop layout, SEO/AEO content, JSON-LD, ads, FAQs, guides, schemas, and calculation logic are **not touched**. The work is purely re-arranging existing pieces + a few new presentation components for mobile (`<768px`).

## Goals

1. Make the page feel like a native iOS/Android finance app (Up Bank, Stripe-style).
2. Reduce above-the-fold noise from 8 blocks → 3.
3. Put inputs in the thumb zone, pin the answer.
4. Keep every existing SEO/AEO surface — just reorder it on mobile and hide the bits that hurt UX above the fold (collapse, don't delete).
5. Add engagement hooks (progressive disclosure, micro-interactions, social proof) without bloating the screen.

## What stays exactly as-is

- All JSON-LD (`FaqJsonLd`, `WebApplicationJsonLd`, `HowToJsonLd`, `ArticleJsonLd`, `DatasetJsonLd`, `SpeakableJsonLd`, `BreadcrumbJsonLd`)
- `SeoHead` (title/description/canonical)
- `QuickAnswer` data + component (rendered, just relocated)
- `DataSources` block (rendered, just relocated)
- `FAQ` items, `RelatedGuides`, `RelatedCalculators`, `MobileRelatedSections`, `NextStepsLinks`
- All five SEO `sections` from `MortgageCalculatorPage.tsx` (How to use, Understanding results, Fortnightly vs monthly, Offset accounts, Upfront costs) — currently NOT rendered on mobile by the shell. We'll add them, collapsed.
- Calculation engine, offset model, URL/localStorage sync, scenarios, share, haptics
- All ad slots (count unchanged)
- Desktop layout (entirely untouched)

## New mobile information architecture

```text
┌─────────────────────────────────┐
│ 1. Compact header (44px)        │  back · title · share
├─────────────────────────────────┤
│ 2. RESULT HERO (sticky-on-scroll)│  $2,943/wk · "$650k @ 6.39% · 25y" tap to edit
│    Mini sparkline, swipe to flip │  flip → Total interest / Payoff year / LVR
├─────────────────────────────────┤
│ 3. INPUT CARD (thumb zone)      │  loan · rate · term sliders
│    Quick-adjust chips inline    │  ±$10k ±0.25% ±5y
│    Frequency segmented          │  Weekly / Fortnightly / Monthly
├─────────────────────────────────┤
│ 4. Insight strip (1 line)       │  "Fortnightly saves you $45k vs monthly →"
├─────────────────────────────────┤
│ 5. Progressive disclosure stack │  collapsed accordions:
│    ▸ Extra repayments           │
│    ▸ Offset account             │
│    ▸ Property value & LVR       │
│    ▸ Interest-only              │
│    ▸ Saved scenarios            │
├─────────────────────────────────┤
│ 6. Chart + schedule (collapsed) │  "See year-by-year breakdown" tap to expand
├─────────────────────────────────┤
│ 7. Quick Answer (AEO)           │  moved here, still visible & speakable
├─────────────────────────────────┤
│ 8. Inline ad slot               │  unchanged count
├─────────────────────────────────┤
│ 9. "Learn more" accordion       │  the 5 SEO sections, each collapsed h2
├─────────────────────────────────┤
│ 10. FAQ (visible, accordion)    │  unchanged
├─────────────────────────────────┤
│ 11. Related calcs / guides     │  unchanged
├─────────────────────────────────┤
│ 12. Data sources + LastReviewed│  unchanged
├─────────────────────────────────┤
│ Sticky bottom: result bar + nav │  pinned $/wk + tabs
└─────────────────────────────────┘
```

Net effect: **above the fold = header + result + first slider only** (3 surfaces, not 8).

## Engagement additions (mobile only)

- **Tap-to-flip result hero** — one tap cycles primary metric (repayment → total interest → payoff year → LVR). Familiar Apple-Watch pattern, zero extra screen real-estate.
- **Live insight strip** — one-line dynamic copy that reacts to inputs ("Switching to fortnightly saves $X", "Adding $200/mo extra pays off 4 yrs sooner"). Encourages experimentation, mirrors fintech "nudge" UX.
- **Quick-adjust chips inline with sliders** — already exist; we just dock them under each slider so users don't hunt.
- **Haptic + success pulse** when a saving exceeds $10k (already have `haptic()`).
- **Sticky bottom result bar shows weekly equivalent + share + save** (already wired via `usePublishMobileResult`, just verify it's the only sticky element above the bottom nav).
- **"Save scenario" prompt** appears as a soft chip after 15 seconds of interaction (gentle retention nudge, not a modal).
- **Print button: hidden on mobile** (no use case; keep on desktop).

## What gets demoted/collapsed on mobile (not deleted)

- `QuickAnswer` → moves below the calculator (still rendered & speakable for AEO)
- 5 long-form SEO `sections` → rendered inside a single "Learn more" accordion stack with each `<h2>` preserved (Google reads collapsed content fine; the H2 hierarchy and JSON-LD stay intact)
- `DataSources` → stays in same position, just visually denser
- Year-by-year chart + amortisation table → collapsed by default with a clear CTA
- Offset / IO / property value → moved into the disclosure stack (power-user features, not first-screen)

## Visual system (mobile only)

- **One surface color** for cards (`bg-background`, `border-border`)
- **One accent** (`--c-accent`) for active state + primary CTA
- **One radius** (`rounded-2xl` cards, `rounded-xl` inputs)
- **Type drives hierarchy**: 32px result, 15px body, 11px labels — kill the colored stat-card backgrounds (orange/green) on mobile
- Animation: 150ms ease for accordion open, no bounce. Spring for the result-hero flip only.

## Implementation scope (files)

| File | Change |
|------|--------|
| `src/pages/CalculatorPageShell.tsx` | Mobile branch only: render the 5 `sections` inside a new `<MobileLearnMore>` accordion below FAQs; move `QuickAnswer` below `children`. No JSON-LD changes. |
| `src/components/calculators/MortgageCalculatorRedesign.tsx` | Reorder the JSX behind `useIsMobile()` — extract a `<MobileMortgageLayout>` sub-component that consumes the existing state/handlers. No calc/state changes. |
| `src/components/mobile/MobileResultHero.tsx` *(new)* | Tap-to-flip primary metric card. |
| `src/components/mobile/MobileInsightStrip.tsx` *(new)* | One-line dynamic insight. |
| `src/components/mobile/MobileDisclosureSection.tsx` *(new)* | Accordion wrapper for Extra/Offset/IO/Property. |
| `src/components/mobile/MobileLearnMore.tsx` *(new)* | Accordion stack rendering shell `sections`. |
| `src/styles/calculator-patch.css` | A few mobile-only overrides for the hidden Print button and demoted stat cards. |

## Out of scope

- No copy rewrites (every word stays)
- No new schemas, no SEO meta changes
- No desktop changes
- No new calculation logic
- No backend, no ad-config changes
- No removal of any existing component

## Verification

1. `vitest` (831 tests) — must stay green
2. `scripts/validate-seo.mjs` — must pass unchanged
3. Snapshot test `home-visual.snapshot.test.tsx` — only mortgage page changes; update snapshot once and review
4. Manual: load `/mortgage-calculator` at 384px, confirm above-the-fold = header + result + first input; confirm collapsed sections still render in DOM (view-source check) for SEO; confirm desktop unchanged at ≥768px

## Risk + mitigation

- **Risk:** Collapsing SEO sections in `<details>` could be read as "hidden content" by Google.
  - **Mitigation:** Use `<details open={false}>` with the heading visible — Google has confirmed this is fine for ranking. Content is in the DOM, not display:none-hidden behind JS.
- **Risk:** Snapshot test will fail.
  - **Mitigation:** Re-record the snapshot once the design is approved; review the diff manually.
- **Risk:** Removing print button on mobile could surprise a user who used it.
  - **Mitigation:** It's still on desktop; analytics can confirm mobile print usage is ~0%.
