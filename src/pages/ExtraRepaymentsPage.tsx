import CalculatorPageShell from "./CalculatorPageShell";
import ExtraRepayments from "@/components/calculators/ExtraRepayments";
import { FAQS } from "@/data/faqs";

const ExtraRepaymentsPage = () => (
  <CalculatorPageShell
    title="Extra repayments calculator — see how much you can save"
    subheading="Find out exactly how extra repayments cut years off your loan and save you thousands in interest"
    metaTitle="Extra Repayments Calculator Australia — Save Years & Thousands | Calcy"
    metaDescription="See exactly how much extra repayments save on your Australian home loan. Enter your loan balance, interest rate, and extra amount — instantly see interest saved, years cut, and your new payoff date. Includes lump sum calculator and amortisation chart. Free, no sign-up."
    canonical="/extra-repayments-calculator"
    faqs={FAQS.extraRepayments}
    interleaveAdsEvery={2}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/loan-comparison-calculator", label: "Loan Comparison Calculator" },
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How extra repayments work",
        body: (
          <p>
            Every dollar you pay above your minimum scheduled repayment goes directly to reducing
            your loan principal. Because Australian home loan interest is calculated daily on your
            outstanding balance, reducing the principal immediately reduces the interest charged in
            every future period. This effect compounds over time — the earlier you make extra
            repayments, the greater the total saving.
          </p>
        ),
      },
      {
        heading: "How much can you save?",
        body: (
          <>
            <p>
              The savings from extra repayments can be substantial. On a $500,000 loan at 5.5%
              interest with 25 years remaining, the total interest payable with no extra repayments
              is approximately $421,000 — nearly as much as the loan itself. Paying just $500 extra
              per month reduces total interest to approximately $302,000 — a saving of $119,000 —
              and pays the loan off more than 6 years early.
            </p>
            <p className="mt-3">
              Small, consistent extra repayments have a disproportionately large long-term impact
              because of compound interest. A $500/month extra repayment costs $6,000 per year but
              saves $119,000 over the life of the loan.
            </p>
          </>
        ),
      },
      {
        heading: "Lump sum repayments",
        body: (
          <p>
            A one-off lump sum repayment — from a tax return, work bonus, or inheritance — can make
            a significant difference. The best time is as early as possible, when the outstanding
            balance is highest. A $20,000 lump sum in year 1 of a $500,000 loan at 5.5% saves
            approximately $38,000 in total interest. The same lump sum in year 15 saves only about
            $12,000.
          </p>
        ),
      },
      {
        heading: "Fortnightly vs monthly repayments",
        body: (
          <p>
            Switching from monthly to fortnightly repayments is one of the most overlooked
            interest-saving strategies. Because there are 26 fortnights but only 12 months, you
            effectively make 13 monthly repayments per year. On a $500,000 loan at 5.5%, this alone
            saves approximately $38,000 in interest and cuts ~2.5 years off the loan term — at no
            extra cash cost.
          </p>
        ),
      },
      {
        heading: "Extra repayments vs offset account",
        body: (
          <p>
            Both reduce the interest you pay. Extra repayments permanently reduce your balance —
            the money is not easily accessible again. An offset account holds funds separately
            while offsetting your loan balance for interest calculation, keeping cash fully
            accessible. For most borrowers the interest saving is identical; the choice comes down
            to flexibility versus discipline.
          </p>
        ),
      },
      {
        heading: "Fixed rate loans and extra repayments",
        body: (
          <p>
            Most Australian fixed rate loans allow extra repayments up to $10,000–$20,000 per year.
            Repayments above that limit may trigger early repayment costs or break fees. Always
            check your loan contract before making large extra repayments on a fixed product.
            Variable rate loans almost always allow unlimited extra repayments.
          </p>
        ),
      },
    ]}
  >
    <ExtraRepayments />
  </CalculatorPageShell>
);

export default ExtraRepaymentsPage;
