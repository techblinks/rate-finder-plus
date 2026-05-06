import CalculatorPageShell from "./CalculatorPageShell";
import BorrowingPower from "@/components/calculators/BorrowingPower";
import { FAQS } from "@/data/faqs";

const BorrowingPowerPage = () => (
  <CalculatorPageShell
    title="Borrowing Power Calculator"
    metaTitle="Borrowing Power Calculator Australia | How Much Can I Borrow? | Calcy"
    metaDescription="Estimate your home loan borrowing capacity based on income, expenses, and APRA's 3% serviceability buffer. Free Australian calculator."
    canonical="/borrowing-power-calculator"
    faqs={FAQS.borrowingPower}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter your annual gross income (and your partner's, if applicable), your typical
            monthly living expenses, any other monthly loan repayments, your total credit card
            limit, and the number of dependants. The calculator returns a maximum and a more
            conservative borrowing estimate, both assessed at the APRA 3% buffer over your chosen
            interest rate.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            The calculator estimates net monthly income at roughly 70% of gross (a simplified tax
            assumption), then subtracts living expenses, other repayments, dependant costs, and
            3.8% of your credit card limit per month — the APRA-assumed minimum credit obligation.
            The remaining surplus is treated as available repayment capacity at the assessment
            rate (your rate + 3%) to derive the maximum loan size.
          </p>
        ),
      },
    ]}
  >
    <BorrowingPower />
  </CalculatorPageShell>
);

export default BorrowingPowerPage;
