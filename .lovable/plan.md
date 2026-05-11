## Mobile calculator: native premium experience

Your project already has a strong mobile foundation that I want to **build on, not replace**: `CalculatorPageShell` branches on `useIsMobile()` and renders a dedicated mobile tree (no breadcrumbs, no SEO sections, no related links), plus `MobileCalcHeader`, `MobileBottomNav`, `MobileStickyResultBar` (wired via `usePublishMobileResult`), `MobileRelatedSections`, `MobileRestoreChip`, `MobileHomepage`. Many "fixes" in the doc are already shipped — replacing them with global `[class*=…]` `!important` selectors would fight Tailwind and the React mobile branch.

Below is what's already done, what's a real gap, and exactly what I'll change. Desktop is not touched.

### Already done — no work needed
- Mobile bottom tabs (`MobileBottomNav`, 4 tabs, sticky, safe-area inset).
- Sticky result bar above tabs (`MobileStickyResultBar` + `usePublishMobileResult`, already used in mortgage/borrowing-power/etc.).
- Mobile calc header with back + share + title (`MobileCalcHeader`).
- Breadcrumbs hidden on mobile (shell renders different tree).
- SEO sections / FAQs / related calcs replaced with `MobileRelatedSections` on mobile.
- Welcome-back / restore moved to `MobileRestoreChip`.
- 16px font on inputs preventing iOS zoom — already in place.

### Real gaps to fix

1. **Hamburger drawer in global header.** Desktop nav exposes all 8 calculators; on mobile the global header collapses but there's no in-header menu — users on a deep page can only reach 3 calcs via bottom tabs. Add a mobile-only hamburger that slides in a drawer listing all 8 calculators + Guides + RBA chip.
2. **Two-column grids inside individual calculators.** Some calculators (`BorrowingPower`, `Refinance`, `RentVsBuy`, `Lmi`) use `md:grid-cols-[…]`; mobile already gets a single column from Tailwind, but the **result panel renders below the inputs**. On mobile, the result panel should come **first** (users see the answer immediately). Move the navy result block above inputs on mobile via `order-first md:order-none` (no DOM swap, just flex ordering wrapped in a flex container at `<md`).
3. **Native input + segmented control polish on mobile only.** Bump number inputs to 52px height with DM Mono numerals; thicken slider track, enlarge thumb; full-width segmented `[role="tablist"]` with 44px tab height and navy active fill — all scoped to `@media (max-width: 767px)` against existing semantic classes (`.field-input`, `[role="tablist"]`, `input[type="range"]`).
4. **Compact mobile result panel.** When `.result-panel-navy` renders at `<md`, make it full-bleed (edge-to-edge), drop border radius, scale the primary value to 44–48px, force stat cards into a 2-col grid.
5. **Cookie banner top-anchor and overflow-x guards.** Anchor the cookie banner under the mobile header, and add `overflow-x: hidden` on `html, body` at `<md` to prevent any rogue horizontal scroll.
6. **Hide noisy desktop-only affordances on mobile.** "Print result", Twitter/WhatsApp share intents, and the empty "Advertisement" label are clutter on mobile — hide via CSS.

### Implementation

**File: `src/components/layout/Header.tsx`**
- Add a mobile-only hamburger button (visible at `<md`, hidden at `≥md`).
- New state-driven slide-in drawer (Radix `Sheet` or local state + fixed panel) listing: Mortgage, Stamp Duty, Borrowing Power, LMI, Compare Loans, Rent vs Buy, Refinance, Extra Repayments, Guides. Footer of drawer shows the RBA cash rate chip.
- Do not change desktop nav markup.

**File: each calculator with a 2-col `md:grid-cols-[…]` (BorrowingPower, Refinance, RentVsBuy, Lmi)**
- Wrap the inputs + result divs in a `flex flex-col md:grid md:grid-cols-[…]` and add `order-first md:order-none` to the result panel div. No logic touched — just ordering classes.

**File: `src/index.css` (new `@media (max-width: 767px)` block, scoped)**
- `.field-input` → 52px height, 18–20px DM Mono value, focus ring navy at 8% alpha.
- `input[type="range"]` → 6px track, 28px navy thumb with white ring.
- `[role="tablist"]` → 100% width flex, 44px tabs; selected tab keeps the navy fill we already set on desktop.
- `.result-panel-navy` → full-bleed (`margin-inline: calc(50% - 50vw)`, `border-radius: 0`, 24/20/28 padding); primary value `clamp(40px, 11vw, 48px)`; stat cards `grid-template-columns: 1fr 1fr; gap: 8px`.
- `[role="dialog"][aria-label*="ookie" i]` → `top: 56px; bottom: auto; border-radius: 0`.
- `html, body { overflow-x: hidden; max-width: 100vw; }`
- Hide on mobile: `button[aria-label*="Print" i]`, `a[href*="twitter.com/intent"]`, `a[href*="wa.me"]`, the empty "Advertisement" label inside `AdSlot` when no ad is loaded (already handled — verify).

### What I will NOT do
- No global `[class*="…"]` `!important` selectors fighting Tailwind. CSS targets semantic hooks already in the codebase (`.field-input`, `.result-panel-navy`, `[role="tablist"]`, `[role="dialog"]`).
- No rip-and-replace of `MobileBottomNav`, `MobileStickyResultBar`, or `MobileCalcHeader` — they already match the doc's intent.
- No changes to calculator logic, SEO content, schemas, FAQs, related guides, or Supabase code.
- No desktop changes.

### Testing
- Visual sweep at 390px (iPhone 14), 375px (SE), and 360px (Android) for each calculator: result on top, no horizontal scroll, sticky bottom result bar visible, tabs accessible, drawer opens/closes.
- Verify navy result panel still renders correctly at `≥768px`.

Say "go" and I'll ship this in one pass.