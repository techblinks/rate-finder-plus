import CalculatorPageShell from "./CalculatorPageShell";
import Lmi from "@/components/calculators/Lmi";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const LmiPage = () => (
  <CalculatorPageShell
    title="LMI calculator — Lender's Mortgage Insurance estimate"
    subheading="Find out if LMI applies to your loan, how much it costs, and how to avoid it"
    metaTitle="LMI Calculator Australia 2026 — Lender's Mortgage Insurance Estimate | Calcy"
    metaDescription="Calculate your LMI cost instantly. See if LMI applies to your loan, compare paying upfront vs adding to your loan, and find out if you qualify for government schemes that eliminate LMI entirely. Free, no sign-up."
    canonical="/lmi-calculator"
    faqs={SEO_FAQS.lmi}
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
            Enter your property value and deposit amount. The calculator instantly shows your LVR
            (Loan to Value Ratio), whether LMI applies, and the estimated premium. Use the "Pay now
            vs wait" section to model whether buying now with LMI or waiting to save a larger
            deposit makes more financial sense for your situation.
          </p>
        ),
      },
      {
        heading: "What is LMI and who does it protect?",
        body: (
          <>
            <p>
              Lender's Mortgage Insurance is one of the most misunderstood costs in the Australian
              home buying process. Despite the name, LMI protects the lender — not you. If you
              default on your loan and the property is sold for less than the outstanding balance,
              LMI covers the lender's loss. You, as the borrower, may still be pursued for any
              remaining shortfall even after an LMI claim.
            </p>
            <p className="mt-3">
              LMI applies when your LVR exceeds 80% — in other words, when your deposit is less
              than 20% of the property's value. The premium is a one-off cost charged at
              settlement, and can either be paid upfront in cash or capitalised (added) into your
              home loan.
            </p>
          </>
        ),
      },
      {
        heading: "How LMI is calculated in Australia",
        body: (
          <>
            <p>
              LMI is calculated as a percentage of your loan amount, not the property value. The
              percentage rate depends on your LVR band — the higher your LVR, the higher the rate
              applied. Australian LMI is primarily underwritten by two insurers: Helia (formerly
              Genworth) and QBE. Your lender will choose which insurer they use — you cannot choose
              or compare insurers yourself.
            </p>
            <p className="mt-3">Approximate 2026 LMI rate bands for owner-occupiers:</p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>LVR 80.01–85%: approximately 0.66% of loan amount</li>
              <li>LVR 85.01–90%: approximately 1.19% of loan amount</li>
              <li>LVR 90.01–95%: approximately 1.96% of loan amount</li>
              <li>LVR above 95%: approximately 3.10% of loan amount</li>
            </ul>
            <p className="mt-3">
              A stamp duty surcharge of approximately 10% is applied to the LMI premium in most
              states. These rates are indicative — your lender's actual premium may differ.
            </p>
          </>
        ),
      },
      {
        heading: "Should you pay LMI now or wait to save more deposit?",
        body: (
          <>
            <p>
              This is the most common dilemma for buyers with deposits under 20%. The answer
              depends on how quickly property prices are rising in your target area relative to
              your saving rate.
            </p>
            <p className="mt-3">
              In a rising market, waiting to save a larger deposit can cost more than the LMI
              itself. If property prices grow by 5% per year and you wait 18 months, a $700,000
              property becomes approximately $752,000 — an increase of $52,000. The LMI you would
              have paid to buy now might have been only $7,500.
            </p>
            <p className="mt-3">
              In a flat or falling market, waiting is almost always the better financial outcome.
              Use the "Pay now vs wait" comparison above to model your specific situation.
            </p>
          </>
        ),
      },
      {
        heading: "Four ways to avoid LMI in Australia",
        body: (
          <>
            <h3 className="text-[16px] font-semibold text-foreground">1. Save a 20% deposit</h3>
            <p className="mt-1">
              The most straightforward approach. At 80% LVR or below, LMI does not apply. The
              trade-off is the time required to save — and whether property prices rise faster than
              your saving rate during that period.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">2. First Home Guarantee</h3>
            <p className="mt-1">
              The Australian government's First Home Guarantee allows eligible first home buyers to
              purchase with a 5% deposit and no LMI. The government guarantees up to 15% of the
              property value, so lenders treat the loan as having a 20% deposit. Up to 35,000
              places are available each financial year, and income caps and property price limits
              apply. Check Housing Australia's website for current eligibility criteria and
              participating lenders.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">3. Guarantor loan</h3>
            <p className="mt-1">
              A family guarantee (guarantor loan) allows a family member — typically a parent — to
              use equity in their own property to guarantee part of your loan. This can effectively
              reduce your LVR to 80% without you needing additional cash savings. The guarantor's
              property is at risk if you default, so this arrangement should be entered carefully
              with independent legal advice for all parties.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">4. Profession-based LMI waiver</h3>
            <p className="mt-1">
              Some lenders offer LMI waivers for specific high-income professionals, including
              medical doctors, dentists, lawyers, and qualified accountants. Eligible professionals
              may be able to borrow up to 90% or 95% LVR without paying LMI, subject to minimum
              income thresholds and maximum loan amounts. Ask your lender or mortgage broker
              whether your profession qualifies.
            </p>
          </>
        ),
      },
    ]}
  >
    <Lmi />
  </CalculatorPageShell>
);

export default LmiPage;
