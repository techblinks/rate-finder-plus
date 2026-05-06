# Calcy Master Build — Implementation Plan

The codebase is already an AU-only, 7-route React + Vite + Tailwind app with helmet SEO, FAQ scaffolding, and a sitemap. The Calcy spec is ~95% aligned. This plan completes the remaining work without breaking calculator math.

## 1. Rebrand Zune → Calcy
- `index.html`: title/description/OG → Calcy + calcy.com.au.
- `Header.tsx`: logo "Calcy" (single word, 18px weight 600).
- `Footer.tsx`: © 2026 Calcy — calcy.com.au, link to `/terms-of-use`, updated disclaimer.
- `public/sitemap.xml` + `public/robots.txt`: zunecalculator.com → calcy.com.au.
- `SeoHead.tsx` and `JsonLd.tsx`: SITE constant → `https://calcy.com.au`; site_name "Calcy".
- All 9 page files (Home, About, Privacy, Terms, NotFound, 6 calculator pages): replace "Zune Calculator" / "Zune" in metaTitle/metaDescription/copy with "Calcy".
- `App.tsx`: rename route `/terms` → `/terms-of-use`; update `Terms.tsx` canonical.
- Repo verification: `rg -i "zune|zunecalculator"` returns zero matches.

## 2. Per-page SEO copy (Parts 8–14)
Update each page's `metaTitle` and `metaDescription` to the exact strings from the prompt (e.g. "Mortgage Calculator Australia 2026 | Calcy").

## 3. New data file
- `src/data/rbaRates.ts` — `{ lastUpdated: "March 2026", ownerOccupier: 5.66, investor: 6.12, source: "Reserve Bank of Australia" }`.
- `src/data/faqs.ts` — replace TODO scaffolding with the full Q&A copy from Part 5 across all six calculator keys.

## 4. Mortgage calculator upgrades (`MortgageRepayment.tsx`)
- Live recalculation (300ms debounce on numeric inputs); remove Calculate button; pre-populate results on mount.
- Add slider+number paired inputs (new `RangeField` component).
- RBA Rate Indicator card with "Use this rate →" links setting rate to 5.66 / 6.12.
- Owner-Occupier / Investor pill toggle (highlights the matching RBA row only — does not override the input).
- Collapsible extra repayments (closed by default).
- Interest shock line ("Interest = X% of total repayments", warning colour).
- Extra repayments savings block when extra > 0 (computes a second `calcMortgage` run).
- Amortisation table: collapsible with Annual / Monthly tab toggle, monthly view paginated 24 at a time.
- Sticky mini results bar via `IntersectionObserver` on the calculator card ref.

## 5. Stamp Duty page
Live recalc (no button); FHB green saving line; "Exempt!" badge when net = 0; existing 8-state brackets unchanged.

## 6. Borrowing Power page
Keep Calculate button (per spec). Verify existing `borrowingPower.ts` matches Part 6 formula.

## 7. Extra Repayments page
Live recalc; sliders for balance / rate / term / extra; side-by-side With/Without; one-time bar width animation on mount; summary sentence.

## 8. LMI page
Live recalc; deposit slider max bound to property value; LVR colour-coded (red >80%, green ≤80%); savings tip showing extra deposit needed for 20%.

## 9. Loan Comparison page
Live recalc; shared loan amount field above two columns; result table with Difference column; green "Loan X saves you $… over N years" winner banner.

## 10. Homepage (`Home.tsx`)
- Hero: eyebrow "CALCY.COM.AU", H1 "Free Australian Mortgage Calculators", subtext from Part 14.
- 6-card grid (3-col desktop / 1-col mobile) with the exact card copy from Part 14.
- "Why Calcy" 3-up section (icons + copy from Part 14, no card border).

## 11. Page-level content
For each calculator page, expand the "How to use" (120–150 words) and "How it works" (200–250 words with worked example) sections in `CalculatorPageShell` props.

## 12. Cleanup verification
`rg -i "zune|zunecalculator"` and a search for any leftover multi-country/programmatic SEO files. Existing previous-turn delete list looks complete; this is a verification pass.

## Technical notes
- `useDebouncedValue(value, 300)` hook in `src/hooks/`.
- `IntersectionObserver` for sticky mini bar.
- Bar chart: one-time width animation via `useEffect` setting CSS `width` from 0 → final on mount.
- No new dependencies. No backend. No tracking. No `_redirects`.

## Files added
- `src/data/rbaRates.ts`
- `src/components/RangeField.tsx`
- `src/components/RbaRateIndicator.tsx`
- `src/components/StickyResultsBar.tsx`
- `src/hooks/useDebouncedValue.ts`

## Files edited
- `index.html`
- `src/App.tsx`
- `src/components/layout/{Header,Footer}.tsx`
- `src/components/seo/{SeoHead,JsonLd}.tsx`
- `src/components/calculators/{MortgageRepayment,StampDuty,BorrowingPower,ExtraRepayments,Lmi,LoanComparison}.tsx`
- `src/pages/{Home,About,PrivacyPolicy,Terms,NotFound,MortgageCalculatorPage,StampDutyPage,BorrowingPowerPage,ExtraRepaymentsPage,LmiPage,LoanComparisonPage}.tsx`
- `src/data/faqs.ts`
- `public/{sitemap.xml,robots.txt}`

No existing calculator math is refactored — only UI shell, copy, live-recalc wiring, and rebrand strings.
