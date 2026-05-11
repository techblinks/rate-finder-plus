## Sprint Goal

Ship **Offset Account Modeling** on the mortgage calculator — a collapsible advanced section that simulates how an offset balance + monthly contributions reduce interest and shorten the loan. Mortgage calculator only. All other calculators untouched.

Existing component: `MortgageCalculatorRedesign.tsx`. Existing engine: `mortgageEngine.ts` / `mortgage.ts`. The "Extra repayments per month" input lives at line ~469; "Property value (optional, for LVR)" at ~505. The offset section goes between them.

---

## 1. Calculation engine — `src/lib/calc/offset.ts`

```ts
calculateWithOffset({
  loanAmount,
  annualRate,        // % e.g. 6.14
  termYears,
  monthlyPayment,    // baseline P&I payment from monthlyPayment()
  startingOffset,
  monthlyOffsetContribution,
}) => {
  interestSaved, yearsSaved, effectiveRate,
  payoffMonths, schedule: [{month, loanBalance, offsetBalance, interestPaid, principalPaid}]
}
```

Algorithm (month-by-month):
- `daysInMonth = 365 / 12` (≈30.4167) — tweak: spec says 30.4375; use **30.4167** for exact `annualRate/12` equivalence on the offset-free case, OR keep the spec's daily-accrual model with 30.4375. We will use `daily = annualRate/100/365`, `monthlyInterest = max(0, loanBal - offsetBal) * daily * (365/12)`. This is equivalent to `(loanBal - offsetBal) * annualRate/100/12` → matches baseline PMT exactly when offset = 0 (test #1 stays clean).
- `principalPart = min(monthlyPayment - monthlyInterest, loanBal)`; if negative (rare when rate=0), just `min(monthlyPayment, loanBal)`.
- `loanBal -= principalPart`; `offsetBal += monthlyOffsetContribution`; clamp `offsetBal` to never exceed `loanBal` for the *interest computation* (we keep the raw offset accumulator but use `effectiveOffset = min(offsetBal, loanBal)` when computing interest — this matches reality where offset money sits available but earns no benefit beyond loan).
- Stop when `loanBal <= 0.005`. Cap simulation at `termYears*12 + 600` months as a safety.
- Edge: if `startingOffset >= loanAmount` → loan cleared month 1 with `principalPart = loanAmount`, flag `clearedByOffsetAlone = true`.
- `effectiveRate = annualRate * (1 - avgOffset/avgLoanBal)` computed from schedule averages (more honest than using just starting values).
- Baseline (no offset) total interest computed by running same loop with offset = 0 (or reusing existing engine for consistency).

## 2. Tests — `src/lib/calc/offset.test.ts`

1. `offset=0, monthly=0` → totalInterest within 0.5% of `calcMortgage(...).totalInterest`.
2. `$50k, $0/mo` on $650k @ 6.14% / 30y → modest savings, yearsSaved ≥ 1.
3. `$50k, $1500/mo` on $650k @ 6.14% / 30y → interestSaved in [$150k, $250k], yearsSaved in [4, 8]. (Spec target: ~$180k–$220k, ~5–7yr.)
4. `startingOffset > loanAmount` → `payoffMonths === 1`, `interestSaved ≈ baselineInterest`, no negatives in schedule.
5. `rate=0` → interestSaved=0, yearsSaved=0, offset has no effect on payoff timing.

## 3. UI — `MortgageCalculatorRedesign.tsx`

Add state: `offsetOpen`, `offsetStart`, `offsetMonthly`. Defaults 0, collapsed.

Insert new section between "Extra repayments per month" (~line 479) and "Loan type" (~481). (Spec says "between extra repayments and Property value (optional)" — current order in code is Extra → Loan type → Property value. Place the offset block immediately after Extra repayments, before Loan type, to keep the advanced-stack together. Will note this minor reordering in commit.)

```tsx
<div className="rounded-xl border border-border">
  <button aria-expanded={offsetOpen} onClick={toggle} className="flex w-full items-center justify-between p-4 min-h-[44px]">
    <span className="flex items-center gap-2">
      <strong>Add an offset account</strong>
      <span className="text-muted-foreground text-[12px]">(advanced)</span>
      <InfoTooltip text="An offset account is a transaction account linked to your loan…"/>
    </span>
    <ChevronDown className={offsetOpen ? "rotate-180" : ""}/>
  </button>
  <p className="px-4 -mt-2 pb-3 text-[13px] text-muted-foreground">Model an offset account like 80% of Australian mortgages use.</p>
  {offsetOpen && (
    <div className="space-y-4 border-t border-border p-4">
      <CurrencyInput label="Starting offset balance" value={offsetStart} onChange={setOffsetStart} help="Current savings sitting in your offset account today" />
      <CurrencyInput label="Monthly contribution to offset" value={offsetMonthly} onChange={setOffsetMonthly} help="How much you'll add to the offset each month from leftover income" />
    </div>
  )}
</div>
```

- Reuse existing `CurrencyInput.tsx` (Sprint 3) with `inputMode="numeric"`.
- Tooltip: reuse existing `Tooltip.tsx`.
- Haptic light tap on collapse toggle.

## 4. Results — "WITH OFFSET ACCOUNT" card

When `offsetOpen && (offsetStart>0 || offsetMonthly>0)`:

Render new card below the existing savings card with 4 stats:
1. Interest saved (success green) — `fmt0(interestSaved)`
2. Years shaved off — `X.Y years` (green)
3. Effective rate — `5.42% vs 6.14% nominal` (accent)
4. Payoff year — `2051 (vs 2056 without offset)`

If `clearedByOffsetAlone`: show banner "Your offset balance alone would clear this loan in X years."

The existing **Payoff year stat card** continues to show no-offset value; the new card shows the with-offset comparison (per spec wording "New payoff year (replaces...)" — interpreted as: when offset is active, the offset card becomes the primary payoff narrative; the original stat stays for parity with no-offset).

## 5. Dual-line chart — `MortgageAmortChart.tsx`

Extend props: `schedule` (with offset or baseline), `baselineSchedule?` (for comparison). When `baselineSchedule` provided:
- Switch from stacked Area to LineChart with two lines: `closingBalance` with offset (solid `hsl(var(--accent))`) and `closingBalance` without (dashed `hsl(var(--muted-foreground))`, `strokeDasharray="4 4"`).
- Legend below: "With offset" / "Without offset".
- When no offset: render the current stacked Area exactly as today (no regression).

## 6. URL params

In the existing URL sync `useEffect` (~line 212), add:
```ts
if (offsetStart > 0) sp.set("offset_start", String(Math.round(offsetStart)));
if (offsetMonthly > 0) sp.set("offset_monthly", String(Math.round(offsetMonthly)));
```
In `readUrlParams()`, parse them. In `ShareResult` params payload, pass through. `saveLast`/`loadLast` get the two new fields (with safe defaults so old localStorage entries still load).

## 7. Content additions — `MortgageCalculatorPage.tsx`

- New `sections[]` entry: **"How offset accounts work"** — 3–4 paragraphs (mechanism, who benefits, typical balances by income $80k/$150k/$250k, tax angle).
- Add a new FAQ entry to `src/data/faqs.ts` under `mortgage`: *"Should I put my savings in an offset account or pay down the loan directly?"* with answer covering accessibility, tax (offset interest savings are not taxed; mortgage prepayment redraw similar; savings interest is taxed), effective-rate equivalence.
- Update meta:
  - `metaTitle="Mortgage Repayment Calculator with Offset Account 2026 | Calcy"`
  - `metaDescription="Australia's first mortgage calculator that models offset accounts like real lenders do. Live RBA rates, extra repayments, fortnightly options."`

## 8. Validation

Manually run $650k @ 6.14% / 30y, $50k offset, $1500/mo. Cross-check against InfoChoice or Bankwest public offset calculator; report both numbers in the post-deploy summary.

## 9. Hard gates checklist

1. `bunx vitest run` all green incl. 5 new offset tests
2. `bun run build` clean, 787 prerendered files
3. Sitemap counts 37 / 150 / 600 unchanged
4. Cross-check numbers reported
5. Cookie banner unaffected
6. CurrencyInput `inputMode` preserved on all currency fields (offset inputs use the same component)
7. URL round-trip: open `?offset_start=50000&offset_monthly=1500` → state restored → re-serialized identically
8. With offset collapsed/zero: calculator output byte-identical to current (regression test: snapshot the existing yearly schedule)
9. Mobile 390px: section collapses neatly, headers/spacing unchanged elsewhere
10. PWA: service worker + manifest unchanged; offline.html unaffected

## Files

**New**
- `src/lib/calc/offset.ts`
- `src/lib/calc/offset.test.ts`

**Edited**
- `src/components/calculators/MortgageCalculatorRedesign.tsx` (state, UI section, results card, URL params, share params)
- `src/components/MortgageAmortChart.tsx` (optional `baselineSchedule` prop + dual-line mode)
- `src/pages/MortgageCalculatorPage.tsx` (meta + new content section)
- `src/data/faqs.ts` (new offset FAQ)
- `src/lib/mortgageState.ts` (persist offset fields)

## Notes / decisions to flag

- **Section placement**: spec asks "between Extra repayments and Property value"; current code order is Extra → Loan type → Property value. Will place offset directly after Extra repayments, keeping Loan type and Property value below — closest match to spec intent (advanced stack grouped).
- **Day-count convention**: using `annualRate/12` monthly accrual (mathematically equivalent to daily×365/12) so test #1 (zero offset) matches baseline PMT exactly. Documented in `offset.ts`.
- **Effective rate**: computed from schedule averages, not just `1 - startingOffset/loanAmount`, since the offset grows over time when monthlyContribution > 0.
