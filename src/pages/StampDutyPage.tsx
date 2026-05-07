import { Link } from "react-router-dom";
import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const STATE_LINKS = [
  { code: "NSW", slug: "nsw" },
  { code: "VIC", slug: "vic" },
  { code: "QLD", slug: "qld" },
  { code: "WA", slug: "wa" },
  { code: "SA", slug: "sa" },
  { code: "TAS", slug: "tas" },
  { code: "ACT", slug: "act" },
  { code: "NT", slug: "nt" },
];

const StateJumpLinks = () => (
  <div className="mb-6 rounded-xl border border-border bg-surface p-5">
    <p className="mb-3 text-[13px] font-medium text-foreground">Jump to your state:</p>
    <ul className="flex flex-wrap gap-2">
      {STATE_LINKS.map((s) => (
        <li key={s.slug}>
          <Link
            to={`/stamp-duty-calculator/${s.slug}`}
            className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-[13px] font-medium text-foreground transition-colors hover:border-accent hover:bg-accent-light hover:text-accent"
          >
            {s.code}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const StampDutyPage = () => (
  <CalculatorPageShell
    title="Stamp Duty Calculator"
    metaTitle="Stamp Duty Calculator Australia 2026 — All States | Calcy"
    metaDescription="Calculate stamp duty for every Australian state and territory. Includes first home buyer exemptions and concessions. Updated for 2026."
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
    <StateJumpLinks />
    <StampDuty />
  </CalculatorPageShell>
);

export default StampDutyPage;
