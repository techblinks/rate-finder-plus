import CalculatorPageShell from "./CalculatorPageShell";
import BorrowingPower from "@/components/calculators/BorrowingPower";
import { FAQS } from "@/data/faqs";
import { SEO_FAQS } from "@/data/seoFaqs";

const BorrowingPowerPage = () => (
  <CalculatorPageShell
    title="Borrowing power calculator"
    metaTitle="Borrowing Power Calculator Australia 2026 | How Much Can I Borrow? | Calcy"
    metaDescription="Calculate your borrowing power instantly — see how much you can borrow based on your income, expenses and deposit. Includes APRA buffer explanation and personalised tips to increase your limit. Free, no sign-up."
    canonical="/borrowing-power-calculator"
    faqs={FAQS.borrowingPower}
    seoFaqs={SEO_FAQS.borrowingPower}
    related={[
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/stamp-duty-calculator", label: "Stamp Duty Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <>
            <p>
              Enter your gross annual income, monthly living expenses, any existing loan repayments,
              and your total credit card limits. The calculator instantly shows your estimated
              borrowing power — how much an Australian lender is likely to approve for a home loan.
            </p>
            <p className="mt-3">
              Add your partner's income if you are applying jointly. Toggle between loan terms to
              see how a shorter term affects your limit.
            </p>
          </>
        ),
      },
      {
        heading: "How your borrowing power is calculated",
        body: (
          <>
            <p>
              Australian lenders assess borrowing power by calculating your net monthly income,
              deducting all committed monthly expenses and debt obligations, and determining what
              repayment you can sustainably afford. They then calculate the maximum loan where
              repayments fit within that capacity — but at a stressed rate, not your actual rate.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">The APRA serviceability buffer</h3>
            <p className="mt-2">
              Since October 2021, APRA requires all Australian banks to assess whether borrowers can
              afford their loan at their actual interest rate plus 3%. If your loan rate is 6.14%,
              your lender tests whether you can afford repayments at 9.14%. This is why many
              borrowers find their approved loan amount significantly lower than expected.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">Why credit card limits matter more than you think</h3>
            <p className="mt-2">
              Lenders do not look at your credit card balance. They look at your limit. A $20,000
              credit card with a $0 balance is assessed as if you could spend the full $20,000 at
              any time. Lenders apply a monthly minimum repayment obligation to your limit —
              typically around 3.8% per year — and deduct this from your available repayment
              capacity. In practical terms, each $10,000 of credit card limit reduces your borrowing
              power by approximately $50,000.
            </p>
            <h3 className="mt-4 text-[16px] font-semibold text-foreground">How living expenses are assessed</h3>
            <p className="mt-2">
              Lenders use the Household Expenditure Measure (HEM) as a benchmark for living costs,
              adjusted for household size. If your declared living expenses are below the HEM
              benchmark for your situation, the lender will use the HEM figure instead — declaring
              very low living expenses does not automatically increase your borrowing power.
            </p>
          </>
        ),
      },
      {
        heading: "How to increase your borrowing power",
        body: (
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Close or reduce unused credit cards.</strong> A $30,000 credit card limit
              across two cards could be reducing your limit by $150,000 or more.
            </li>
            <li>
              <strong>Pay down existing debts before applying.</strong> Each $500/month in existing
              loan repayments reduces your assessed repayment capacity.
            </li>
            <li>
              <strong>Include consistent overtime or bonus income.</strong> Lenders typically assess
              80% of your two-year average — this income is often overlooked.
            </li>
            <li>
              <strong>Apply jointly.</strong> Two incomes assessed together significantly increases
              capacity. Even a part-time income on a joint application can add $100,000–$200,000.
            </li>
            <li>
              <strong>Reduce your living expenses.</strong> Where lenders apply the HEM floor, this
              has no effect, but if your declared expenses are above HEM, reducing them increases
              your assessed surplus.
            </li>
            <li>
              <strong>Consider a longer loan term.</strong> A 30-year term has lower monthly
              repayments than a 25-year term for the same loan amount, which can increase the
              maximum loan you qualify for.
            </li>
          </ul>
        ),
      },
    ]}
  >
    <BorrowingPower />
  </CalculatorPageShell>
);

export default BorrowingPowerPage;
