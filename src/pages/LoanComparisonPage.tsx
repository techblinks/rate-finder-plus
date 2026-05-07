import CalculatorPageShell from "./CalculatorPageShell";
import LoanComparison from "@/components/calculators/LoanComparison";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const LoanComparisonPage = () => (
  <CalculatorPageShell
    title="Loan Comparison Calculator"
    metaTitle="Loan Comparison Calculator Australia | Compare Two Mortgages | Calcy"
    metaDescription="Compare two Australian home loans side-by-side. See which mortgage has lower repayments and saves you more in total interest."
    canonical="/loan-comparison-calculator"
    faqs={FAQS.loanComparison}
    seoFaqs={SEO_FAQS.loanComparison}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/extra-repayments-calculator", label: "Extra Repayments Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter the loan amount, interest rate, term, and any upfront fees for each scenario.
            The calculator shows monthly repayments, total interest, and "true cost" (total repaid
            plus fees) for both, then highlights the cheaper option.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            Each scenario runs through the standard monthly amortisation formula. True cost equals
            total repaid plus upfront fees. The winner is the scenario with the lower true cost
            over the loan term.
          </p>
        ),
      },
    ]}
  >
    <LoanComparison />
  </CalculatorPageShell>
);

export default LoanComparisonPage;
