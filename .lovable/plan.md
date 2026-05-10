
# My take on the spec

The doc is solid and very prescriptive. The good news: roughly **half of it is already done** in this codebase — so we should not re-implement those parts, just polish them. The other half (homepage rebuild, sticky calc result bar at the *page* level, larger inputs, ad scaffolding, related-calc section on every calc page) is real work worth doing.

What is already in place:
- `MobileBottomNav` (Home / Calculate / Guides / Compare) — Part 1 Step 3 ✅
- Hamburger hidden on mobile, header shows logo only — Part 1 Step 1–2 ✅ (full slide-down menu exists for desktop only; we don't need a mobile slide-down because the bottom tabs cover it)
- `MobileHomepage` with calculator grid + RBA chip + last-result card — partial Part 2 ✅
- `MobileStickyResultBar` (sits above tab bar, already uses `env(safe-area-inset-bottom)`) — Part 3 Fix 3 ✅
- `MobileRelatedSections` under each calculator (related rail + guide cards) — Part 5 Fix 3 ✅
- `AdSlot` component + 16px input font (need to verify) and breadcrumb/FAQ JSON-LD on every calc page — Part 5 Fix 2 ✅

What's actually missing or worth changing — I disagree with a few items in the spec and will flag those.

# Plan

I'll do this in 3 batches so you can review after each. Everything is gated on `useIsMobile()` / `max-width: 767px` — desktop is not touched.

## Batch 1 — Homepage upgrades (highest impact)

Edit `src/components/mobile/MobileHomepage.tsx`:
1. Add a compact **hero** above the calculator grid: `H1 "Australian mortgage calculators"` + sub `"Free. Live RBA rates. All 8 states. No sign-up."` + the existing RBA chip. Gives us the H1 the SEO doc demands and an above-the-fold value prop.
2. Add **Live data strip** card: RBA cash rate, NSW FHB exemption ≤ $800k, QLD First Home Grant $30k, Min deposit (no LMI) 20%. Native-feeling list rows.
3. Add **Most used right now** (top 3: Stamp Duty, Mortgage, Borrowing Power) — internal linking for SEO.
4. Add **Common questions** accordion (4 FAQs) — feeds existing `FaqJsonLd` for schema.
5. Add **Free guides** quick-link list (4 items) pulling from existing `GUIDES` data, not hard-coded slugs.
6. Add 2 inline `<AdSlot slot="inline" />` placeholders (between sections only — never above the calculator grid). I will **not** ship a 3rd ad — the doc itself caps at 3 page-wide and our existing `StickyMobileAd` already counts.

What I'm intentionally **not** doing from Part 2:
- No "MiniMortgageCalculator" embedded in the hero — we don't have one and it doubles maintenance with the dedicated page. The grid jump-off is one tap.
- Trust bar — low value, kept off.

## Batch 2 — Calculator page polish

1. **Add a related-calculators section under every desktop calc page too** is out of scope (already exists). On mobile, `MobileRelatedSections` already renders — I'll just verify the snap rail and guide cards look right.
2. **Input ergonomics** in `src/index.css` (mobile only):
   - `input, select, textarea { font-size: 16px }` to kill iOS zoom-on-focus.
   - 44px min-height on inputs/buttons, larger range thumb.
3. **Hide empty `AdSlot` placeholders** on mobile so we don't render the "Advertisement" label until a real unit fills (`AdSlot` currently shows a dashed placeholder — gate it to dev-only on mobile, or hide when AdSense isn't initialized).
4. **Remove duplicate "Calcy" / hamburger leftover code** in `Header.tsx` — it's currently dead JSX (`hidden md:hidden`). Clean it up.

## Batch 3 — SEO + perf hygiene

1. Confirm `index.html` viewport tag includes `viewport-fit=cover` (likely already does — will check and only edit if missing).
2. Ensure all `<img>` below the fold use `loading="lazy"` on mobile homepage's new sections.
3. Reserve heights on `AdSlot` so CLS stays clean (`min-height: 100px` for banner, `200px` for native) — small CSS tweak.
4. Optional: `font-display: swap` is typically already set via Tailwind's font pipeline; will verify.

## What I'm explicitly skipping (and why)

- **The full slide-down hamburger menu on mobile.** The spec asks for both bottom tabs *and* a hamburger. Native apps don't ship both. Bottom tabs cover the 4 primary actions; the homepage grid covers the rest. Two nav systems = clutter. Happy to add the hamburger if you disagree.
- **Hard-coded AdSense `<ins>` markup.** The codebase already abstracts ads via `AdSlot`. Hard-coding would diverge. We keep using `AdSlot slot="..."` and you flip AdSense on once approved.
- **Pasting raw CSS classes** like `.mobile-calc-tile`, `.mobile-hero` from the doc. We use Tailwind + design tokens here — re-implementing the exact same visuals with `bg-background`, `text-foreground`, `rounded-2xl` etc. so it stays themable and matches the rest of the app.

## Files touched

```text
src/components/mobile/MobileHomepage.tsx        (rebuild — Batch 1)
src/components/mobile/MobileFaqAccordion.tsx    (new — Batch 1)
src/components/layout/Header.tsx                (delete dead mobile-menu JSX — Batch 2)
src/index.css                                   (input zoom + tap targets — Batch 2)
src/components/AdSlot.tsx                       (min-heights / hide-empty on mobile — Batch 2/3)
index.html                                      (viewport-fit if missing — Batch 3)
```

No data, no backend, no calculator logic, no admin panel changes.

## Open question

The spec hard-codes "RBA: 4.35%" everywhere but our live rate is 5.66% (owner-occupier) / 4.10% (cash rate) per `useRbaRates`. I'll bind every figure to live data — never hard-code rates, even in copy.

Approve and I'll start with Batch 1.
