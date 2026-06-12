import CalculatorPageShell from "./CalculatorPageShell";
import MortgageCalculatorRedesign from "@/components/calculators/MortgageCalculatorRedesign";
import DownloadableToolsSection from "@/components/DownloadableToolsSection";
import NextStepsLinks from "@/components/NextStepsLinks";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";
import { Link } from "react-router-dom";

const scenarioCards = [
  {
    title: "Mortgage with offset",
    body: "Model how money in an offset account can reduce interest while your repayment stays on track.",
    to: "/mortgage-calculator/with-offset",
    cta: "Read offset scenario",
  },
  {
    title: "Extra repayments",
    body: "See how additional weekly, fortnightly, or monthly payments can reduce total interest and shorten the loan.",
    to: "/mortgage-calculator/extra-repayments",
    cta: "Read extra repayment scenario",
  },
  {
    title: "Interest rate rise",
    body: "Stress-test repayments by changing the rate in the calculator before committing to a loan size.",
    to: "/mortgage-calculator",
    cta: "Stress-test this loan",
  },
  {
    title: "$700k mortgage repayments",
    body: "Review how rate, term, frequency, deposit, LMI, and upfront costs affect a $700k loan estimate.",
    to: "/mortgage-calculator/700k-mortgage-repayments",
    cta: "Read $700k scenario",
  },
  {
    title: "Queensland mortgage planning",
    body: "Estimate repayments alongside Queensland stamp duty awareness, LMI, borrowing power, and upfront costs.",
    to: "/mortgage-calculator/qld",
    cta: "Read QLD scenario",
  },
  {
    title: "NSW mortgage planning",
    body: "Estimate repayments alongside NSW stamp duty awareness, LMI, borrowing power, and upfront costs.",
    to: "/mortgage-calculator/nsw",
    cta: "Read NSW scenario",
  },
  {
    title: "Victorian mortgage planning",
    body: "Estimate repayments alongside Victorian stamp duty awareness, LMI, borrowing power, and first-home buyer considerations.",
    to: "/mortgage-calculator/vic",
    cta: "Read VIC scenario",
  },
  {
    title: "Brisbane mortgage planning",
    body: "Estimate repayments alongside Queensland upfront-cost awareness, deposit planning, LMI, and borrowing power.",
    to: "/mortgage-calculator/brisbane",
    cta: "Read Brisbane scenario",
  },
  {
    title: "Sydney mortgage planning",
    body: "Estimate repayments alongside NSW upfront-cost awareness, deposit pressure, LMI, and borrowing power.",
    to: "/mortgage-calculator/sydney",
    cta: "Read Sydney scenario",
  },
  {
    title: "First home buyer",
    body: "Estimate repayments alongside stamp duty, grants, deposit size, and upfront costs.",
    to: "/mortgage-calculator/first-home-buyer",
    cta: "Read first home buyer scenario",
  },
  {
    title: "Investment property",
    body: "Compare repayments, LMI exposure, and cash-flow assumptions before treating a loan as affordable.",
    to: null,
    cta: "Coming soon",
  },
  {
    title: "Refinance comparison",
    body: "Compare your current repayment with a possible new loan, including fees and break-even timing.",
    to: "/refinance-calculator",
    cta: "Compare refinance",
  },
  {
    title: "HECS impact",
    body: "Check how HECS or HELP repayments may reduce borrowing capacity before finalising loan size.",
    to: "/mortgage-calculator/with-hecs",
    cta: "Read HECS scenario",
  },
  {
    title: "Stamp duty and upfront costs",
    body: "Calculate the cash needed at settlement before deciding how much you actually need to borrow.",
    to: "/stamp-duty-calculator",
    cta: "Calculate stamp duty",
  },
];

const toolLinks = [
  {
    to: "/borrowing-power-calculator",
    title: "Borrowing power calculator",
    description: "Estimate how much a lender may let you borrow before you choose a repayment target.",
  },
  {
    to: "/stamp-duty-calculator",
    title: "Stamp duty calculator",
    description: "Estimate duty, concessions, and upfront costs for Australian property purchases.",
  },
  {
    to: "/lmi-calculator",
    title: "LMI calculator",
    description: "Check whether a low deposit could add Lenders Mortgage Insurance to the loan.",
  },
  {
    to: "/extra-repayments-calculator",
    title: "Extra repayment calculator",
    description: "Estimate the interest and time saved by paying more than the minimum repayment.",
  },
  {
    to: "/refinance-calculator",
    title: "Refinance calculator",
    description: "Compare a current loan with a new offer, including fees and break-even timing.",
  },
  {
    to: "/rent-vs-buy-calculator",
    title: "Rent vs buy calculator",
    description: "Compare long-term renting and buying outcomes before committing to a purchase.",
  },
  {
    to: "/loan-comparison-calculator",
    title: "Loan comparison calculator",
    description: "Compare two home loans side-by-side using repayments, interest, and fees.",
  },
  {
    to: "/hecs-borrowing-power",
    title: "HECS and borrowing power calculator",
    description: "See how HECS or HELP repayments may affect home loan borrowing capacity.",
  },
];

const ScenarioCard = ({
  title,
  body,
  to,
  cta,
}: {
  title: string;
  body: string;
  to: string | null;
  cta: string;
}) => (
  <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
    <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    {to ? (
      <Link
        to={to}
        className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {cta}
      </Link>
    ) : (
      <span className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        {cta}
      </span>
    )}
  </div>
);

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
        heading: "What this mortgage calculator helps you understand",
        body: (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Your repayment rhythm",
                text: "Compare weekly, fortnightly, and monthly repayments so the loan fits how you actually budget.",
              },
              {
                title: "The cost of interest",
                text: "See how much interest builds over the life of the loan and how rate changes affect repayments.",
              },
              {
                title: "Your next decision",
                text: "Move from repayment estimate to borrowing power, stamp duty, LMI, refinance, or extra repayment planning.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-muted/30 p-4">
                <h3 className="text-[15px] font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6">{item.text}</p>
              </div>
            ))}
          </div>
        ),
      },
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
        heading: "Key repayment insights",
        body: (
          <div className="space-y-4">
            <p>
              Mortgage repayments are useful only when they are connected to the full buying
              decision. Use the repayment estimate as the centre point, then check whether the loan
              amount is realistic, whether upfront costs fit your savings, and whether a different
              loan structure changes the long-term result.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-4">
                <h3 className="text-[15px] font-semibold text-foreground">Small rate changes matter</h3>
                <p className="mt-2 text-sm leading-6">
                  A higher rate increases each repayment and total interest. A lower rate can
                  improve cash flow, but fees and loan features still need to be compared.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <h3 className="text-[15px] font-semibold text-foreground">Frequency changes behaviour</h3>
                <p className="mt-2 text-sm leading-6">
                  Weekly and fortnightly repayments can be easier to align with pay cycles. Always
                  compare the actual annual amount paid, not just the smaller per-period number.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <h3 className="text-[15px] font-semibold text-foreground">Extra repayments compound</h3>
                <p className="mt-2 text-sm leading-6">
                  Extra repayments reduce principal earlier, so future interest is charged on a
                  smaller balance. Use the dedicated extra repayment calculator for deeper planning.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <h3 className="text-[15px] font-semibold text-foreground">Upfront costs change the loan</h3>
                <p className="mt-2 text-sm leading-6">
                  Stamp duty, LMI, conveyancing, and inspections can change how much cash is left
                  for deposit and how much you need to borrow.
                </p>
              </div>
            </div>
          </div>
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
        heading: "Compare common mortgage scenarios",
        body: (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {scenarioCards.map((card) => (
              <ScenarioCard key={card.title} {...card} />
            ))}
          </div>
        ),
      },
      {
        heading: "Next steps after calculating your repayment",
        body: (
          <div className="space-y-4">
            <p>
              Once you know the repayment, work through the next decisions in order: borrowing
              capacity, upfront costs, deposit risk, loan comparison, and whether buying still beats
              renting for your situation.
            </p>
            <NextStepsLinks
              items={[
                {
                  to: "/borrowing-power-calculator",
                  title: "Check your borrowing power",
                  description: "Estimate whether the loan amount is realistic for your income, expenses, and commitments.",
                },
                {
                  to: "/stamp-duty-calculator",
                  title: "Estimate stamp duty and upfront costs",
                  description: "Understand the cash needed at settlement before locking in your loan size.",
                },
                {
                  to: "/lmi-calculator",
                  title: "Check if LMI applies",
                  description: "See whether a smaller deposit could add Lenders Mortgage Insurance to the loan.",
                },
                {
                  to: "/loan-comparison-calculator",
                  title: "Compare two home loans",
                  description: "Compare repayments, interest, and fees before choosing a lender or product.",
                },
              ]}
            />
          </div>
        ),
      },
      {
        heading: "Related Calcy tools",
        body: <NextStepsLinks items={toolLinks} />,
      },
      {
        heading: "Downloadable mortgage planning tools",
        body: <DownloadableToolsSection />,
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
        heading: "How Calcy calculates repayments",
        body: (
          <div className="space-y-4">
            <p>
              Calcy uses the standard amortising loan approach: the loan amount, interest rate,
              loan term, repayment frequency, and any extra repayments are combined to estimate the
              repayment required to reduce the balance over time.
            </p>
            <p>
              In plain English, each repayment is split into interest and principal. Interest is
              the cost of borrowing for that period. Principal is the part that reduces the loan
              balance. As the balance falls, less interest is charged and more of each repayment
              goes toward principal.
            </p>
            <p>
              Offset and extra repayment options are modelled as repayment scenarios inside the
              calculator. They are estimates for planning, not lender quotes or financial advice.
            </p>
          </div>
        ),
      },
      {
        heading: "Important assumptions",
        body: (
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <ul className="space-y-3 text-sm leading-6">
              <li>Results are general estimates for Australian home loan planning.</li>
              <li>Actual lender repayments may vary because of fees, rounding, package discounts, and product rules.</li>
              <li>Rates, grants, taxes, concessions, and lender policies can change.</li>
              <li>Calcy does not replace personal financial, tax, legal, or credit advice.</li>
              <li>Finance fact replacements from the internal registry remain behind manual review and are not applied in this phase.</li>
            </ul>
          </div>
        ),
      },
      {
        heading: "Updated and reviewed",
        body: (
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#EEF4FF] p-5">
            <h3 className="text-[16px] font-semibold text-[#003680]">Built for ongoing review</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This mortgage calculator page keeps its existing metadata, canonical URL, FAQ schema,
              and calculator logic. Public finance facts are not replaced from the internal registry
              until they pass manual review. Use the reviewed indicator below this page for the
              current page-level freshness signal.
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
