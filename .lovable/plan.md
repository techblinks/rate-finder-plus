## Audit result

Reviewed the 508-line redesign spec against the current codebase. The vast majority is already shipped:

- Mortgage redesign component (two-column desktop / stacked mobile, sliders, quick-pill loan amounts, segmented term/frequency/loan-type, IO years, extra repayments with savings panel, LVR card, payoff year, scenarios with rename/delete, localStorage restore banner, URL query-param sync, Web Share API + clipboard fallback)
- Amortisation chart (`MortgageAmortChart`) and lazy-loaded table (`MortgageAmortTable`)
- Mobile fullscreen calculator mode with back arrow (`Layout.tsx` hides header/footer when `isMobile && inCalc`)
- `MobileBottomNav` (5 tabs, safe-area padding, hidden ≥768px)
- PWA: `public/manifest.json`, `public/sw.js`, registration in `src/main.tsx`, `<head>` meta in `index.html`
- `PwaInstallPrompt` (visit-counter gated)
- Haptics on slider snap / scenario save (`mortgageState.haptic`)
- SEO: page title/meta/canonical, FAQ + WebApplication JSON-LD via `CalculatorPageShell`, written content sections
- AUD `Intl.NumberFormat` formatting throughout

## Remaining gap

`StickyResultsBar` exists and is used by the legacy `MortgageRepayment.tsx`, but the route `/mortgage-calculator` actually renders `MortgageCalculatorRedesign.tsx`, which is missing the sticky bar. The spec (Part 1, Part 10, last bullet of Part 12) requires a fixed mobile bar showing the current-frequency repayment above the bottom tab nav, with `env(safe-area-inset-bottom)` padding.

## Change

Edit `src/components/calculators/MortgageCalculatorRedesign.tsx`:

1. Import `StickyResultsBar` and `useRef`.
2. Add a `resultsRef` attached to the results column wrapper.
3. Render `<StickyResultsBar watchRef={resultsRef} primary={`${fmt0(headline)} per ${freq}`} summary={`${fmt0(loan)} · ${rate.toFixed(2)}% · ${term}yr`} />` at the bottom of the component (it's already mobile-only and respects safe-area, per its current implementation).

No other files need changing. After this edit, every requirement in the uploaded prompt is satisfied.

## Out of scope (already done or intentionally divergent)

- Theme color `#1e3a8a` → already `#3348F4` to match the project's brand memory (`#003680` / `#0162E3` family). Will not change.
- Chart.js CDN — project already uses Recharts; functionally equivalent and consistent with rest of site. Will not swap libraries.
