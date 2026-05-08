import CalculatorPageShell from "./CalculatorPageShell";
import Refinance from "@/components/calculators/Refinance";
import { FAQS } from "@/data/faqs";

const RefinancePage = () => (
  <CalculatorPageShell
    title="Refinance calculator — see how much you could save"
    subheading="Find out if refinancing your home loan is worth it — including switching costs and break-even months"
    metaTitle="Refinance Calculator Australia 2026 — Is Refinancing Your Home Loan Worth It? | Calcy"
    metaDescription="Calculate how much you could save by refinancing your home loan. See your monthly saving, break-even month, 5-year saving, and total interest saved. Includes fixed rate break cost warning and LMI check. Free, no sign-up."
    canonical="/refinance-calculator"
    faqs={FAQS.refinance}
    interleaveAdsEvery={2}
    related={[
      { to: "/loan-comparison-calculator", label: "Loan Comparison Calculator" },
      { to: "/extra-repayments-calculator", label: "Extra Repayments Calculator" },
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter your current loan balance, interest rate, and remaining term in the left
            column. Then enter the details of the loan you are considering switching to — the new
            rate, any setup fees, and any cashback offered. The calculator instantly shows your
            monthly saving, annual saving, break-even month, and total interest saved over the
            remaining loan term.
          </p>
        ),
      },
      {
        heading: "When does refinancing make sense?",
        body: (
          <>
            <p>
              Refinancing is worth considering when your current interest rate is significantly
              higher than what other lenders are offering. The rule of thumb is that a rate
              difference of 0.5% or more on a loan balance of $300,000 or more typically generates
              meaningful savings. On a $500,000 loan, a 0.5% rate reduction saves approximately
              $150/month and $56,000 over 25 years.
            </p>
            <p className="mt-3">
              The break-even period is the key metric. If your total switching costs will be
              recovered within 12–18 months of monthly savings, refinancing is almost always
              worthwhile. If the break-even is more than 36 months, the decision depends on how
              long you plan to hold the loan.
            </p>
          </>
        ),
      },
      {
        heading: "Fixed rate loans — the break cost risk",
        body: (
          <>
            <p>
              Breaking a fixed rate home loan before the fixed term expires triggers a break cost —
              sometimes called an economic cost or early repayment cost. This is calculated by
              your lender based on the difference between your contracted fixed rate and current
              wholesale funding rates for the remaining term.
            </p>
            <p className="mt-3">
              In a falling rate environment — when the RBA is cutting rates — break costs can be
              very high, because your lender is receiving a higher fixed rate from you than they
              could get from reinvesting those funds at current market rates. In a rising rate
              environment, break costs may be zero or minimal. Never estimate your break cost —
              always request an exact quote from your lender before making any refinancing
              decision on a fixed rate loan.
            </p>
          </>
        ),
      },
      {
        heading: "LMI and refinancing",
        body: (
          <>
            <p>
              LMI (Lender's Mortgage Insurance) is not transferable between lenders. If your
              current LVR (loan balance divided by property value) is above 80%, refinancing to a
              new lender may require you to pay a new LMI premium. This can cost $5,000–$20,000
              and significantly extends the break-even period or makes refinancing unviable.
            </p>
            <p className="mt-3">
              Check your current LVR before exploring refinancing. If you are close to 80% LVR,
              it may be worth making extra repayments to cross the 80% threshold before
              refinancing, which would avoid the LMI cost entirely.
            </p>
          </>
        ),
      },
      {
        heading: "Cashback offers — read the fine print",
        body: (
          <p>
            Many Australian lenders offer cashback incentives of $2,000–$4,000 to attract
            refinancing customers. While these can meaningfully reduce the net switching cost,
            they sometimes come with conditions such as keeping the loan for a minimum period
            (commonly 2–3 years) before you can switch again. Refinancing again within the
            minimum period may require repaying the cashback. Factor cashback into your
            calculation — it is included here — but check the fine print before committing.
          </p>
        ),
      },
      {
        heading: "How often should you review your home loan?",
        body: (
          <>
            <p>
              Most mortgage brokers recommend reviewing your home loan rate at least once per
              year, and always after a significant RBA rate change. Lenders typically offer their
              best rates to new customers rather than loyal existing customers. Australians who
              have been with the same lender for 3–5 years without reviewing their rate are often
              paying significantly above the market rate.
            </p>
            <p className="mt-3">
              The term "mortgage prisoner" refers to borrowers who cannot easily refinance because
              their LVR is above 80% or their financial circumstances have changed since they took
              out the loan. If you are in this situation, focus on extra repayments to reduce your
              LVR and improve your refinancing options.
            </p>
          </>
        ),
      },
    ]}
  >
    <Refinance />
  </CalculatorPageShell>
);

export default RefinancePage;
