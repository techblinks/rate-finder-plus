import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import { FAQS } from "@/data/faqs";

const StampDutyPage = () => (
  <CalculatorPageShell
    title="Stamp Duty Calculator"
    metaTitle="Stamp Duty Calculator Australia 2026 — All States | Zune Calculator"
    metaDescription="Calculate stamp duty for every Australian state and territory. Includes first home buyer concessions. Updated for 2026."
    canonical="/stamp-duty-calculator"
    faqs={FAQS.stampDuty}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter the property's purchase price, choose the state or territory where you're
            buying, and select your buyer type. The calculator applies the relevant 2026 stamp
            duty brackets, including any first home buyer concessions, and adds typical
            conveyancing, building and pest inspection costs to give a total upfront estimate.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <p>
            Each state and territory uses its own progressive bracket system or formula. NSW, VIC,
            QLD, WA, SA and TAS apply tiered rates per $100 of property value over a threshold;
            ACT and NT use scaled formulas. First home buyer concessions phase out between defined
            thresholds and are subtracted from the base duty. Final figures should be confirmed
            with your state revenue office before settlement.
          </p>
        ),
      },
    ]}
  >
    <StampDuty />
  </CalculatorPageShell>
);

export default StampDutyPage;
