import CalculatorPageShell from "./CalculatorPageShell";
import Lmi from "@/components/calculators/Lmi";
import { FAQS } from "@/data/faqs";

const LmiPage = () => (
  <CalculatorPageShell
    title="LMI Calculator"
    metaTitle="LMI Calculator Australia 2026 | Lender's Mortgage Insurance | Calcy"
    metaDescription="Calculate Lender's Mortgage Insurance (LMI) costs in Australia. Find out your LVR, whether you need LMI, and how much it costs."
    canonical="/lmi-calculator"
    faqs={FAQS.lmi}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter the property value and your deposit. The calculator works out your loan-to-value
            ratio (LVR) and shows whether LMI is required, the estimated premium, and your
            repayment if the LMI is capitalised into the loan.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            LMI applies when LVR exceeds 80%. The premium is estimated as a percentage of the loan
            amount based on indicative 2026 LMI bands: 0.66% for LVR up to 85%, 1.19% up to 90%,
            1.96% up to 95%, and 3.10% above 95%. These rates are approximate — your lender's
            insurer (typically Helia or QBE) will provide the exact premium.
          </p>
        ),
      },
    ]}
  >
    <Lmi />
  </CalculatorPageShell>
);

export default LmiPage;
