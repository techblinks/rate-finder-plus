import CalculatorPageShell from "./CalculatorPageShell";
import RentVsBuy from "@/components/calculators/RentVsBuy";
import { FAQS } from "@/data/faqs";

const RentVsBuyPage = () => (
  <CalculatorPageShell
    title="Rent vs buy calculator — which is better for you?"
    subheading="Compare the true long-term cost of renting vs buying in Australia and find your break-even year"
    metaTitle="Rent vs Buy Calculator Australia 2026 — Should You Buy or Keep Renting? | Calcy"
    metaDescription="Compare the true long-term cost of renting vs buying a home in Australia. Find your break-even year, compare 10-year net worth, and see how assumptions change the result. Free, no sign-up required."
    canonical="/rent-vs-buy-calculator"
    faqs={FAQS.rentVsBuy}
    interleaveAdsEvery={2}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How this calculator works",
        body: (
          <>
            <p>
              This calculator compares two scenarios over your chosen time period. In the
              buying scenario, it calculates your property equity each year — the property's
              estimated value minus your remaining loan balance. In the renting scenario, it
              calculates the value of an investment portfolio — starting with what you would
              have spent on a deposit and upfront buying costs, growing at your assumed
              investment return rate, with monthly contributions of any amount you save by
              renting versus buying.
            </p>
            <p className="mt-3">
              The break-even year is when the buyer's net worth (equity) exceeds the renter's
              net worth (investment portfolio). Before this point, renting and investing has
              produced a higher net worth. After it, buying has.
            </p>
          </>
        ),
      },
      {
        heading: "Why the result is so sensitive to assumptions",
        body: (
          <>
            <p>
              The rent vs buy comparison is more sensitive to assumptions than almost any other
              personal finance calculation. Small changes in assumed property growth or
              investment returns can shift the break-even year by several years. This is not a
              flaw in the calculator — it reflects the genuine uncertainty of predicting future
              asset prices.
            </p>
            <p className="mt-3">
              Historical Australian property price growth has averaged approximately 6–7% per
              year nationally since 1990, though this masks enormous variation between cities,
              suburbs, and time periods. The Australian share market (ASX All Ordinaries) has
              returned approximately 9–10% per year including dividends over the same period.
              Neither of these historical returns is guaranteed to repeat.
            </p>
          </>
        ),
      },
      {
        heading: "What the calculator does not account for",
        body: (
          <>
            <p>
              This comparison focuses on financial outcomes — net worth after a given period.
              It does not capture several important non-financial factors that often matter as
              much or more in the rent vs buy decision.
            </p>
            <p className="mt-3">
              <strong>Security and stability.</strong> Homeowners cannot be asked to vacate by
              a landlord. For families with school-age children or those who value community
              roots, this security has real value that is not measured in dollars.
            </p>
            <p className="mt-3">
              <strong>Flexibility.</strong> Renters can relocate quickly for career
              opportunities, relationship changes, or lifestyle preferences. Breaking a lease
              costs weeks of rent; selling a property costs months of time and tens of
              thousands in agent fees, stamp duty, and legal costs.
            </p>
            <p className="mt-3">
              <strong>Forced saving.</strong> For many Australians, mortgage repayments
              function as a disciplined form of forced saving. Renters who invest the
              difference need genuine savings discipline to achieve the same outcome.
            </p>
            <p className="mt-3">
              <strong>Renovation and personalisation.</strong> Owners can renovate, decorate,
              and modify their home. Renters generally cannot.
            </p>
          </>
        ),
      },
      {
        heading: "The renting and investing argument",
        body: (
          <>
            <p>
              The renting scenario in this calculator assumes you invest the difference between
              renting costs and buying costs each month. This is the only valid comparison —
              renting only makes financial sense as an alternative to buying if you invest the
              capital and cash flow differences, not if you spend them.
            </p>
            <p className="mt-3">
              In practice, many renters do not consistently invest the difference. This
              behavioural reality often makes buying the better outcome even when the pure
              numbers suggest renting could win, because homeownership provides a structured,
              automatic form of forced saving through mortgage repayments.
            </p>
          </>
        ),
      },
      {
        heading: "Costs included in the buying scenario",
        body: (
          <>
            <p>
              Buying a home in Australia involves significant upfront and ongoing costs that
              this calculator includes in full. Upfront: stamp duty (calculated for your
              selected state, with first home buyer concessions where applicable), LMI
              (automatically added if your deposit is below 20% of the property value),
              conveyancing (estimated at $2,000) and a building and pest inspection (estimated
              at $600). Ongoing: mortgage principal and interest, council rates, home
              insurance, optional strata, and maintenance and repairs at a default of 1% of the
              property value per year.
            </p>
            <p className="mt-3">
              Selling costs (agent commission, marketing, capital gains tax) are not modelled —
              the calculator assumes you continue to hold the property at the end of the
              analysis period. If you intend to sell, real-world net worth will be lower than
              shown.
            </p>
          </>
        ),
      },
      {
        heading: "How long should you compare?",
        body: (
          <p>
            The analysis period dramatically changes the conclusion. Buying typically
            underperforms renting over short periods because of high upfront costs (stamp duty,
            LMI, conveyancing) which take years to recover through property growth and
            principal reduction. Over longer periods, the buyer benefits from leveraged capital
            gains and a falling mortgage balance, while the renter loses some of their
            advantage as rents rise. Use 5 years if you might sell soon, 10 years for a typical
            mid-term comparison, and 20–30 years for a true long-term lifecycle view.
          </p>
        ),
      },
    ]}
  >
    <RentVsBuy />
  </CalculatorPageShell>
);

export default RentVsBuyPage;
