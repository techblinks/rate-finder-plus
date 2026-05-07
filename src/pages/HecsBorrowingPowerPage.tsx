import CalculatorPageShell from "./CalculatorPageShell";
import HecsBorrowingPower from "@/components/calculators/HecsBorrowingPower";
import type { FaqItem } from "@/data/faqs";

const faqs: FaqItem[] = [
  {
    question: "How does HECS reduce my borrowing power?",
    answer:
      "Lenders treat your compulsory HECS/HELP repayment as a fixed monthly commitment. That reduces your assessable net income, which in turn reduces how much you can borrow. The exact impact depends on your income bracket and the lender's policy.",
  },
  {
    question: "What HECS thresholds are used here?",
    answer:
      "We use the official 2025-26 ATO compulsory repayment table, starting at 1% above $54,435 and reaching 4.5% at $84,108 and above.",
  },
  {
    question: "What is the APRA serviceability buffer?",
    answer:
      "APRA requires Australian lenders to assess your loan at your interest rate plus a 3% buffer to ensure you can still afford repayments if rates rise. We apply that buffer automatically.",
  },
  {
    question: "Should I pay off HECS before applying for a home loan?",
    answer:
      "If your HECS balance is small and you're close to applying, paying it off can meaningfully boost your borrowing capacity. For larger balances, the maths is more nuanced — speak to a broker.",
  },
];

const seoFaqs: FaqItem[] = [
  {
    question: "How is the HECS repayment calculated?",
    answer:
      "Your gross annual income is multiplied by the 2025-26 ATO repayment rate for your income bracket (0% under $54,435, rising to 4.5% above $84,108).",
  },
  {
    question: "How is borrowing power calculated?",
    answer:
      "Borrowing power = (net monthly income × 30%) ÷ monthly repayment factor, where the factor uses a 30-year term at your rate plus a 3% APRA serviceability buffer.",
  },
  {
    question: "Does this include tax?",
    answer:
      "Yes — we estimate PAYG tax using 2025-26 resident brackets, then subtract HECS to derive your net monthly income.",
  },
  {
    question: "Is this accurate?",
    answer:
      "It's an indicative estimate. Each lender treats HECS and living expenses differently. Confirm with a mortgage broker before relying on the figure.",
  },
];

const HecsBorrowingPowerPage = () => (
  <CalculatorPageShell
    title="HECS & Borrowing Power Calculator"
    metaTitle="HECS & Borrowing Power Calculator Australia 2026 | Calcy"
    metaDescription="See exactly how your HECS/HELP debt reduces your home loan borrowing power. Uses 2025-26 ATO thresholds and APRA's 3% serviceability buffer. Free, no sign-up."
    canonical="/hecs-borrowing-power"
    faqs={faqs}
    seoFaqs={seoFaqs}
    related={[
      { to: "/borrowing-power-calculator", label: "Borrowing Power Calculator" },
      { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
      { to: "/lmi-calculator", label: "LMI Calculator" },
    ]}
    sections={[
      {
        heading: "How to use this calculator",
        body: (
          <p>
            Enter your gross annual income, your current HECS/HELP balance, and the interest rate
            you'd expect on a home loan. The calculator applies the official 2025-26 ATO HECS
            repayment thresholds, estimates your tax, and shows how much you could borrow over a
            30-year term with APRA's mandatory 3% serviceability buffer applied. It also shows
            how much extra you'd be able to borrow if your HECS were paid off.
          </p>
        ),
      },
      {
        heading: "How it's calculated",
        body: (
          <div className="space-y-3">
            <p>
              <strong>HECS annual repayment</strong> = gross income × repayment rate from the
              2025-26 ATO table (0% under $54,435, 1% to 4.5% across eight brackets, capping at
              4.5% above $84,108).
            </p>
            <p>
              <strong>Net monthly income</strong> = (gross income − PAYG tax − HECS) ÷ 12.
            </p>
            <p>
              <strong>Borrowing power</strong> = (net monthly income × 30%) ÷ monthly repayment
              factor, where the factor = r/12 × (1+r/12)<sup>360</sup> ÷ ((1+r/12)<sup>360</sup>{" "}
              − 1) and r = your rate + 3% APRA buffer.
            </p>
          </div>
        ),
      },
      {
        heading: "Why HECS matters more than people realise",
        body: (
          <p>
            For a typical Australian on $90,000 with a $30,000 HECS balance, the 4.5% compulsory
            repayment alone reduces borrowing capacity by tens of thousands of dollars. Because
            lenders treat HECS as a fixed liability rather than a tax, even a small balance close
            to being cleared can shrink your maximum loan. If your HECS will be paid off within a
            year, some lenders will exclude it from serviceability — always ask.
          </p>
        ),
      },
    ]}
  >
    <HecsBorrowingPower />
  </CalculatorPageShell>
);

export default HecsBorrowingPowerPage;
