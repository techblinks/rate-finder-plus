## Phase 1 — Mortgage calculator mobile UX (layout, hierarchy & micro-interactions)

Scope: `/mortgage-calculator` on viewports < 768px only. Desktop, SEO, formulas, schemas, routes, AdSense slots, and admin remain untouched. Typography stays on the existing `var(--font-display)` / `var(--font-body-redesign)` / `var(--font-data)` tokens — no new font loads.

### What you'll see on mobile

1. **Compact live result card** at the top, replacing today's large primary result panel:
   - Primary line: **Fortnightly repayment** in the existing data font, navy panel, white text, ~36px.
   - Secondary line: `Monthly · Weekly` on a single row, ~13px, 70% white.
   - A row of **three tappable edit chips** for Loan amount · Rate · Term. Each chip uses the white/8% translucent pill style, shows a tiny pencil icon, and on tap: smooth-scrolls the matching input into view, focuses it, pulses its border for 1.5s, and fires `haptic.medium()`.
2. **Inputs immediately below** the result card so the loan-amount slider is reachable in the first screen (no marketing/intro padding pushing it down on mobile).
3. **Sticky mobile bottom bar** (already exists as `MobileStickyResultBar`): show the monthly repayment + Edit / Compare / Share quick actions. Appears once the user scrolls past the inputs; respects `env(safe-area-inset-bottom)`. Wire its current values to live calculator state and hide its current "default" copy when results aren't ready.
4. **Collapsed-by-default advanced sections on mobile**: Loan type / IO / Property value (already wrapped in `MobileCollapse` — verify), plus Extra repayments and Offset get the same `MobileCollapse` treatment.
5. **Tighter mobile spacing**: reduce vertical padding on the result panel and intro band so the loan-amount slider sits within ~80px of scroll from the top of the calculator. Desktop padding unchanged via `md:` prefixes.
6. **Smooth number transitions**: when repayment values change (slider drag, pill tap), animate the displayed number with a 300ms ease-out count tween. Don't animate during initial mount or skeleton hand-off.
7. **Slider & pill haptics** using the existing `src/lib/haptic.ts`:
   - Loan-amount slider snap every $50k → `haptic.light()`
   - Rate slider snap every 0.25% → `haptic.light()`
   - Amount pill / frequency / term button tap → `haptic.medium()`
   - LVR crosses 80% (LMI threshold) → `haptic.success()` (one-shot, debounced per crossing)
   - All calls are no-ops on desktop (the helper already guards `navigator.vibrate`).

### Technical notes

- New file: `src/components/mobile/MobileResultCard.tsx` — the compact card + edit chips. Receives `{ fortnightly, monthly, weekly, loanAmount, rate, termYears, onEditField }` and renders the chips. Rendered on the mortgage page only, gated by `useIsMobile()`.
- New file: `src/hooks/useCountUp.ts` — tiny rAF-based count tween, returns the displayed string with `Intl.NumberFormat`. Skipped (`prefers-reduced-motion`) when the user opts out.
- Edits to `src/components/calculators/MortgageCalculatorRedesign.tsx`:
  - Stable `id`s on the three target inputs (`loan-amount-input`, `interest-rate-input`, `loan-term-input`) and a one-shot "pulse" class added via `setTimeout`.
  - On mobile, render `<MobileResultCard />` in place of (not in addition to) the existing `result-panel-navy` block; desktop keeps today's panel via the existing `isMobile` branch.
  - Wrap remaining advanced sections in `MobileCollapse` if not already.
  - Wire slider/pill handlers through the haptic helpers; gate LVR-threshold haptic with a `useRef` to fire once per crossing.
  - Mobile-only spacing tweaks via `md:` Tailwind prefixes — no shared layout files touched.
- Edits to `src/components/mobile/MobileStickyResultBar.tsx`: ensure it reads the latest monthly repayment from the same store/props the calculator uses, and that Edit scrolls to the inputs section. Share/Compare wiring already exists — only verify, don't redesign.
- No `index.css` colour additions; reuse `--c-navy`, `--accent`, existing border tokens. Any new utility classes live inside `MobileResultCard.tsx` via Tailwind.
- Verification: open the preview at 390×844 in the browser tool, drive the loan slider, confirm the count tween, chip-to-input scroll, sticky bar update, and that desktop (≥768px) is visually identical to today.

### Explicitly out of scope this phase

Contextual insight cards · skeleton loaders · offline rate fallback · custom number pad · gesture swipe + 8-dot indicator · safe-area sweep across the rest of the app · rolling the pattern to other calculators. Each is a clean follow-up phase.
