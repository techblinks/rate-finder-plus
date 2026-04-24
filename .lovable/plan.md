
## Implementation Plan: ZuneCalculator.com Premium Redesign

### Goal
Transform the current CalcVault React/Vite app into a polished **Zune Calculator** mortgage-focused experience for `zunecalculator.com`, using the supplied bank-grade visual direction while preserving the existing calculator logic where possible.

Because this project is a React app rather than a single static HTML file, I will adapt the prompt into the existing component architecture instead of outputting one standalone HTML file.

---

## 1. Rebrand CalcVault to Zune Calculator

### Update branding everywhere
- Replace visible `CalcVault` / `ZuneCalculator.com` variants with:
  - Header logo: `Zune`
  - Footer brand: `Zune Calculator`
  - Domain references: `zunecalculator.com`
- Remove calculator/emoji logo styling from the header and use a pure text logo.
- Add desktop-only header tagline: `Mortgage Calculator`.
- Update footer copyright:
  - `© 2025 zunecalculator.com — For illustrative purposes only. Not financial advice.`

### SEO/meta updates
- Update `index.html` title, description, canonical, OG, Twitter, PWA title, and theme color to match the Zune prompt.
- Update generated SEO metadata defaults so route-level SEO no longer references CalcVault.
- Keep dynamic country/calculator page metadata working.

---

## 2. Update country model to match the prompt

### Countries
Current app uses:
- `us`
- `au`
- `ca`
- `uk`

Prompt requests:
- `AU`
- `US`
- `CA`
- `GB`

I will:
- Use lowercase route codes for web consistency: `/au`, `/us`, `/ca`, `/gb`.
- Rename the current `uk` country config to `gb`.
- Add a redirect from `/uk` and `/uk/:calculator` to `/gb` and `/gb/:calculator` so existing links do not break.
- Update flags, labels, metadata, hreflang, and footer links accordingly.

---

## 3. Align calculators/tabs with the requested Zune product

### Requested six tabs
The prompt requests these six tabs:
1. Repayment
2. Borrowing
3. Stamp Duty
4. Extra
5. Insurance
6. Compare

Current app has:
- Mortgage
- Borrowing Power metadata only
- Stamp Duty metadata only
- Extra Repayments metadata only
- Loan Comparison metadata only
- Loan
- Interest

I will change the primary calculator navigation to the six requested mortgage tabs:

```text
Repayment     -> mortgage-calculator
Borrowing     -> borrowing-power-calculator
Stamp Duty    -> stamp-duty-calculator
Extra         -> extra-repayments-calculator
Insurance     -> mortgage-insurance-calculator
Compare       -> loan-comparison-calculator
```

### New calculator components
Build missing calculator components so routes do not redirect away:
- `BorrowingPowerCalculator`
- `StampDutyCalculator`
- `ExtraRepaymentsCalculator`
- `MortgageInsuranceCalculator`
- `LoanComparisonCalculator`

The existing `MortgageCalculator` logic will be preserved and restyled for the Repayment tab.

### Supplementary tools
The existing `loan-calculator` and `interest-calculator` can remain indexable but will be moved out of the main six-tab mortgage navigation.

---

## 4. Implement Zune design system

### Fonts
Replace current display font with:

```css
Instrument Serif
DM Sans
```

Apply:
- `Instrument Serif` to logo, headings, hero values, large result numbers.
- `DM Sans` to body text, labels, nav, inputs, buttons.

### Color system
Replace the current CalcVault navy/gold system with the Zune palette:
- Deep navy: `#0C1A2E`
- Brand blue: `#1B56CC`
- Pale blue: `#EEF3FD`
- Gold accent: `#B8912A`
- Off-white background: `#F8FAFB`
- Clean borders and neutral text hierarchy.

Because Tailwind currently consumes HSL CSS variables, I will update the existing semantic tokens to equivalent HSL values and add readable Zune aliases where useful.

### Global styling
- Add dot-grid page background.
- Add mobile tap-highlight removal.
- Add native-feeling scrolling.
- Add page-enter animation.
- Keep accessibility-friendly focus states.

---

## 5. Redesign layout shell

### Header
Replace the current header with a Zune-specific bank-grade header:
- Sticky white header.
- Text logo only: `Zune`.
- Desktop tagline under logo.
- Desktop tab nav with active underline.
- Country selector styled as a compact bank UI control.
- Mobile country selector with clean dropdown/sheet behavior.

### Footer
Redesign footer as a solid navy section:
- Centered `Zune Calculator` text brand.
- Tagline: `Mortgage Calculator · Australia · USA · Canada · UK`
- Legal disclaimer and links:
  - Privacy Policy
  - Terms of Use
  - zunecalculator.com

### Mobile bottom navigation
Update bottom nav to:
- Show the six requested tabs.
- Use frosted-glass backdrop blur.
- Use active top border and blue active color.
- Add safe-area padding so it does not overlap content.

---

## 6. Redesign calculator pages

### Page structure
For calculator routes, move toward the requested premium layout:
- Mobile/tablet: single column.
- Desktop: structured content with sticky result area and ad slots.
- Keep SEO content, FAQ, disclaimers, and internal links intact.

### Hero result card
Update `HeroResultCard`:
- Solid navy background.
- White primary number instead of gold.
- Subtle decorative circle and faint horizontal line.
- `LIVE` badge in uppercase.
- Add route/tab variants:
  - Stamp Duty: `navy-2`
  - Extra Repayments: very dark green-navy tint

### Input cards
Restyle all calculator form cards:
- White surface.
- Subtle border.
- Minimal shadow.
- No playful lift effects.
- Clean labels and spacing.

### Sliders
Update `PremiumSlider` and/or calculator slider usage:
- Thin 5px track.
- Blue gradient fill to thumb.
- White thumb with blue border.
- Instrument Serif current value.
- DM Sans labels and min/max values.

### Frequency toggle
Use the existing `FrequencyToggle` component as the base and restyle it to match the requested segmented-control design.

### Result cards
Update secondary result cards:
- Left-aligned.
- White cards.
- Uppercase muted labels.
- Instrument Serif values.
- Savings/positive results get subtle success left border.

### Amortisation chart
Update chart styling:
- Principal: blue.
- Interest: muted gold.
- Clean card container.
- Left-aligned legend.

---

## 7. Build requested mortgage calculators

### Repayment tab
Use the existing mortgage formula and state logic, restyled with:
- Hero monthly repayment.
- Total interest.
- Total cost.
- Loan amount.
- Amortisation chart/table.

### Borrowing tab
Add borrowing capacity estimate using:
- Gross income.
- Expenses.
- Existing debts.
- Interest buffer/stress rate.
- Term.
- Country defaults.

Also add:
- Pre-approval roadmap.
- Document checklist.
- Borrowing capacity hero value.

### Stamp Duty tab
Add country-aware upfront cost calculator:
- AU state selector and first-home-buyer toggle.
- US/CA/GB transfer-tax/stamp-duty approximations.
- Styled select.
- Pill toggle for first-home-buyer status.
- Hero label: `TOTAL UPFRONT COST`.

### Extra tab
Compare standard mortgage schedule vs extra repayments:
- Extra monthly payment.
- Interest saved.
- Time saved.
- New payoff period.
- Hero label: `INTEREST YOU COULD SAVE`.

### Insurance tab
Add mortgage insurance estimate:
- AU: LMI-style estimate.
- US: PMI-style estimate.
- CA: CMHC-style estimate.
- GB: mortgage protection/illustrative insurance estimate.
- Clear disclaimer that it is only an estimate.

### Compare tab
Compare two loan scenarios:
- Scenario A and B cards.
- Loan amount, rate, term, fees.
- Monthly payment.
- Total interest.
- Total cost.
- Winner badge using gold.
- Comparison table with progress bars.

---

## 8. Ads, CTA, and monetization blocks

### Ad slots
Restyle ad placeholders as integrated white cards:
- Subtle diagonal stripe.
- Tiny uppercase ad label.
- Proper spacing.
- No dashed borders.

### CTA section
Update affiliate CTA copy:
- Label: `INDEPENDENT CALCULATOR TOOL`
- Title: `Find Your Best Rate`
- Sub: `Compare rates from 30+ lenders. Free. No credit check.`
- Button: `Compare Rates →`
- Solid navy background.
- No gradient.

### Legal disclaimer
Keep mandatory disclaimer on calculator pages and footer.

---

## 9. Defensive rendering and loading polish

Build on the existing CountryHome safety work:
- Keep skeleton placeholders for calculator cards.
- Ensure missing metadata, icons, or components never crash rendering.
- Add fallbacks for any calculator metadata not yet resolved.
- Use safe redirects only where a route is genuinely invalid.

---

## 10. Testing/verification after implementation

After edits, I will verify:
- App compiles without TypeScript/runtime errors.
- `/`, `/au`, `/us`, `/ca`, `/gb` load.
- `/uk` redirects safely to `/gb`.
- All six primary calculator routes render.
- Mobile viewport around `384x647` does not have bottom-nav overlap.
- Header, footer, card skeletons, country selector, CTA, and ad slots render with Zune branding.
- Calculator formulas still produce results.
- No `undefined` component render errors return.

