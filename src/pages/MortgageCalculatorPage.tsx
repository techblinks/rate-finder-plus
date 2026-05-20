import CalculatorPageShell from "./CalculatorPageShell";
import MortgageCalculatorRedesign from "@/components/calculators/MortgageCalculatorRedesign";
import NextStepsLinks from "@/components/NextStepsLinks";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const MortgageCalculatorPage = () => (
  <CalculatorPageShell
    title="Mortgage repayment calculator"
    metaTitle="Mortgage Repayment Calculator with Offset 2026 | Calcy"
    metaDescription="Australia's first mortgage calculator that models offset accounts like real lenders do. Live RBA rates, extra repayments, fortnightly options."
    canonical="/mortgage-calculator"
    faqs={FAQS.mortgage}
    seoFaqs={SEO_FAQS.mortgage}
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
            Enter your loan amount, interest rate, and loan term to see your repayments instantly.
            Use the frequency toggle to switch between weekly, fortnightly, and monthly
            repayments. Add extra repayments to see how much time and interest you can save. Save
            up to three scenarios to compare side-by-side, or share your calculation with your
            partner or broker via a unique URL.
          </p>
        ),
      },
      {
        heading: "Understanding your results",
        body: (
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Repayment amount</h3>
              <p>
                This is the minimum amount you need to pay each period to repay your loan in full
                by the end of your term. Your actual lender repayment may vary slightly based on
                fees and how your lender rounds figures.
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Total interest paid</h3>
              <p>
                The total amount of interest you'll pay over the life of the loan — in addition to
                repaying the original loan amount. For most 30-year loans, total interest exceeds
                the original loan amount. This is why extra repayments and a lower interest rate
                have such a significant impact.
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">The amortisation chart</h3>
              <p>
                The chart shows how each repayment is split between principal (reducing your loan
                balance) and interest (the cost of borrowing). In the early years, most of each
                repayment goes toward interest. As your balance reduces, more goes toward
                principal.
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Extra repayments</h3>
              <p>
                Even a small amount of extra repayment each month significantly reduces the total
                interest paid. Every extra dollar reduces your principal, which reduces the
                interest charged in every future period — the effect compounds over time.
              </p>
            </div>
          </div>
        ),
      },
      {
        heading: "Fortnightly vs monthly repayments",
        body: (
          <p>
            Choosing fortnightly repayments instead of monthly is one of the simplest ways to pay
            off your loan faster at no extra cost. Because there are 26 fortnights in a year, you
            make the equivalent of 13 monthly repayments per year rather than 12. On a $650,000
            loan at 6.39%, this saves approximately $45,000 in interest and cuts around 2.5 years
            off the loan.
          </p>
        ),
      },
      {
        heading: "How offset accounts work",
        body: (
          <div className="space-y-4">
            <p>
              An offset account is a transaction account linked directly to your home loan.
              The balance sitting in the offset is subtracted from your loan balance each day
              before interest is calculated. If you owe $650,000 and have $50,000 in your
              offset, you only pay interest on $600,000 — every single day. The repayment
              amount you make stays the same, but a larger share goes to principal, so the
              loan shrinks faster.
            </p>
            <p>
              Around 80% of Australian variable-rate mortgages include a 100% offset facility,
              usually free or for a small annual package fee. Brokers consistently recommend
              parking your emergency fund, salary, and even tax-set-aside money in the offset
              rather than a savings account. The reason is tax: interest "saved" through an
              offset is not income, so you don't pay tax on it. A 6% offset benefit can be
              worth roughly 9–10% in a taxed savings account for someone on the 37% bracket.
            </p>
            <p>
              Typical offset balances we see in broker conversations: ${"\u200B"}10k–$30k for
              single-income households under $90k, $40k–$80k for dual-income households around
              $150k combined, and $100k+ for high earners or investors who keep their tax
              provision in the offset. The break-even is small — even $10,000 sitting in
              offset on a $600,000 loan saves about $600/year in interest at 6%.
            </p>
            <p>
              The "Add an offset account" toggle on this calculator models exactly that
              dynamic month by month. Enter your starting balance and how much you can add
              each month from leftover income — the calculator will show the years shaved
              off your loan, the total interest saved, and the effective rate you're really
              paying once the offset is taken into account.
            </p>
          </div>
        ),
      },
      {
        heading: "Don't forget the upfront costs",
        body: (
          <>
            <p className="mb-4">
              Your monthly repayment is only part of the picture. Stamp duty, LMI, and your
              borrowing capacity together determine the loan amount you should plug into this
              calculator.
            </p>
            <NextStepsLinks
              items={[
                {
                  to: "/stamp-duty-calculator",
                  title: "Stamp duty calculator",
                  description:
                    "Calculate your exact state stamp duty plus first home buyer concessions before locking in a loan amount.",
                },
                {
                  to: "/lmi-calculator",
                  title: "LMI calculator",
                  description:
                    "If your deposit is below 20%, estimate Lenders Mortgage Insurance — often capitalised on top of your loan.",
                },
                {
                  to: "/borrowing-power-calculator",
                  title: "Borrowing power calculator",
                  description:
                    "See the maximum loan a lender is likely to approve based on your income and expenses.",
                },
                {
                  to: "/loan-comparison-calculator",
                  title: "Loan comparison calculator",
                  description:
                    "Compare two home loans side-by-side, including fees, to find the cheaper option.",
                },
              ]}
            />
          </>
        ),
      },
    ]}
  >
    <MortgageCalculatorRedesign />
  </CalculatorPageShell>
);

export default MortgageCalculatorPage;
