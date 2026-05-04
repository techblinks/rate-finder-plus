import CalculatorPageShell from "./CalculatorPageShell";
import MortgageRepayment from "@/components/calculators/MortgageRepayment";
import { FAQS } from "@/data/faqs";

const MortgageCalculatorPage = () => (
  <CalculatorPageShell
    title="Mortgage Repayment Calculator"
    metaTitle="Mortgage Calculator Australia 2026 | Zune Calculator"
    metaDescription="Free Australian mortgage repayment calculator. See monthly and fortnightly repayments, total interest, and full amortisation schedule. Updated for 2026."
    canonical="/mortgage-calculator"
    faqs={FAQS.mortgage}
    related={[
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/extra-repayments-calculator", label: "Extra Repayments Calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter your loan amount, interest rate, and loan term, then choose how often you plan to
            repay. The calculator returns your repayment for each frequency, total interest paid,
            and a yearly amortisation schedule. Adding an optional extra monthly repayment shows
            how much faster the loan is paid off.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            Repayments use the standard amortisation formula with monthly compounding, the default
            method used by Australian lenders. Fortnightly repayments are calculated as monthly ÷
            2, and weekly repayments as monthly ÷ (52/12). Extra repayments reduce the principal
            each month, shortening the term and reducing total interest.
          </p>
        ),
      },
    ]}
  >
    <MortgageRepayment />
  </CalculatorPageShell>
);

export default MortgageCalculatorPage;
