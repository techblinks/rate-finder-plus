import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const StampDutyPage = () => (
  <CalculatorPageShell
    title="Stamp duty calculator — all Australian states 2026"
    subheading="Calculate your exact stamp duty, first home buyer exemptions, and total upfront costs"
    metaTitle="Stamp Duty Calculator Australia 2026 — All States & First Home Buyers | Calcy"
    metaDescription="Calculate stamp duty for every Australian state and territory in 2026. Includes first home buyer exemptions, FHOG grants, and total upfront cost estimate. Compare stamp duty across all states instantly. Free, no sign-up."
    canonical="/stamp-duty-calculator"
    faqs={FAQS.stampDuty}
    seoFaqs={SEO_FAQS.stampDuty}
    interleaveAdsEvery={2}
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
            Select your state using the quick-access pill buttons, enter your property value, and
            choose your buyer type. If you are a first home buyer, select “Yes” to see your
            concessional rate and any applicable First Home Owner Grant. Use the “Compare all
            states” mode to see stamp duty across all 8 states for the same property value — useful
            if you are considering buying interstate.
          </p>
        ),
      },
      {
        heading: "How stamp duty is calculated in Australia",
        body: (
          <>
            <p>
              Stamp duty (formally called transfer duty in most states) is a state government tax
              charged when property ownership is transferred from seller to buyer. Each state and
              territory sets its own rates and thresholds independently, which is why stamp duty
              varies so significantly across Australia.
            </p>
            <p className="mt-3">
              Most states use a progressive (tiered) rate structure — similar to income tax
              brackets. You pay a lower percentage on the first portion of the property's value and
              a higher rate on the amount above each threshold. This is why a simple percentage
              calculation gives the wrong answer — the tiers must be applied correctly.
            </p>
          </>
        ),
      },
      {
        heading: "First home buyer stamp duty exemptions — 2026",
        body: (
          <>
            <p>
              Every Australian state and territory offers some form of stamp duty relief for first
              home buyers, though the thresholds, amounts, and conditions vary considerably.
            </p>
            <p className="mt-3">
              New South Wales offers the most generous exemption — first home buyers pay no stamp
              duty on properties up to $800,000, with a concessional rate up to $1,000,000.
              Victoria exempts first home buyers on properties up to $600,000. Queensland applies
              a full concession on homes up to $500,000. Western Australia exempts buyers up to
              $430,000.
            </p>
            <p className="mt-3">
              South Australia does not offer a stamp duty exemption for first home buyers, but
              provides a $15,000 First Home Owner Grant on new homes. The ACT offers a full
              exemption through its income-tested Home Buyer Concession Scheme, which is available
              to all eligible owner-occupiers — not just first home buyers.
            </p>
          </>
        ),
      },
      {
        heading: "The First Home Owner Grant — how it works",
        body: (
          <>
            <p>
              The First Home Owner Grant (FHOG) is a federal initiative administered by each
              state. It provides a one-off cash payment to eligible first home buyers who purchase
              or build a <strong>new home</strong>. Crucially, the FHOG is not available on
              established (previously occupied) properties.
            </p>
            <p className="mt-3">
              As of 2026, the FHOG is $30,000 in Queensland and Tasmania, $15,000 in South
              Australia, and $10,000 in New South Wales, Victoria, Western Australia, and the
              Northern Territory. The ACT does not have a FHOG.
            </p>
            <p className="mt-3">
              The grant is typically paid through your lender at settlement and does not need to
              be repaid, provided you occupy the property as your primary residence for at least
              12 months after settlement.
            </p>
          </>
        ),
      },
      {
        heading: "Total upfront costs when buying a property",
        body: (
          <>
            <p>
              Stamp duty is the largest upfront cost beyond your deposit, but it is not the only
              one. Budget for the following when calculating how much cash you need at settlement:
            </p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>Stamp duty (calculated by this tool)</li>
              <li>Legal and conveyancing fees: approximately $1,500–$3,000</li>
              <li>Building and pest inspection: approximately $400–$800 combined</li>
              <li>Loan establishment fees: varies by lender, often $0–$600</li>
              <li>Lender's Mortgage Insurance (if deposit is less than 20%)</li>
              <li>Moving costs and connection fees</li>
            </ul>
            <p className="mt-3">
              Use the total upfront cost estimate above — including your deposit — to understand
              the full cash requirement on settlement day.
            </p>
          </>
        ),
      },
      {
        heading: "Stamp duty vs annual property tax in NSW",
        body: (
          <>
            <p>
              Since 2023, eligible buyers in New South Wales have had the option to pay an annual
              property tax instead of stamp duty upfront. The annual tax is based on the
              unimproved land value and is significantly lower than stamp duty in the short term —
              but it is an ongoing obligation rather than a one-time cost.
            </p>
            <p className="mt-3">
              The annual property tax option may be financially advantageous for buyers who plan
              to sell or upgrade within a shorter timeframe, as they avoid a large upfront stamp
              duty payment. For buyers planning to hold long term, the cumulative annual tax may
              eventually exceed the upfront stamp duty amount. This calculator shows the upfront
              figure — consult a financial adviser to compare the two options for your situation.
            </p>
          </>
        ),
      },
    ]}
  >
    <StampDuty />
  </CalculatorPageShell>
);

export default StampDutyPage;
