import CalculatorPageShell from "./CalculatorPageShell";
import ExtraRepayments from "@/components/calculators/ExtraRepayments";
import { FAQS } from "@/data/faqs";

const ExtraRepaymentsPage = () => (
  <CalculatorPageShell
    title="Extra Repayments Calculator"
    metaTitle="Extra Repayments Calculator Australia | Save on Your Mortgage | Zune"
    metaDescription="See how extra mortgage repayments reduce your loan term and total interest. Find out exactly how much you could save."
    canonical="/extra-repayments-calculator"
    faqs={FAQS.extraRepayments}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/loan-comparison-calculator", label: "Loan Comparison Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter your current loan balance, interest rate, remaining term, and the extra amount
            you'd add each month. The calculator runs two amortisation schedules side-by-side —
            one with extra repayments and one without — so you can see the difference in payoff
            date and total interest paid.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            Each month, the standard scheduled repayment is calculated, interest on the remaining
            balance is applied, and the principal is reduced by (scheduled repayment − interest +
            extra). The simulation continues until the balance reaches zero. Time saved is the
            difference in months between the two payoff dates; interest saved is the difference
            in cumulative interest.
          </p>
        ),
      },
    ]}
  >
    <ExtraRepayments />
  </CalculatorPageShell>
);

export default ExtraRepaymentsPage;
