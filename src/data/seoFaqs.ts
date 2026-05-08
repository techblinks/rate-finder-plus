import type { FaqItem } from "./faqs";

/**
 * Concise 4-question FAQ sets used ONLY for FAQPage JSON-LD on calculator pages.
 * The visible on-page FAQ continues to use the richer FAQS export.
 */
export const SEO_FAQS: Record<string, FaqItem[]> = {
  mortgage: [
    {
      question: "How is my repayment calculated?",
      answer:
        "Using the standard amortisation formula: M = P[r(1+r)^n]/[(1+r)^n-1] where P=principal, r=monthly rate, n=total payments.",
    },
    {
      question: "Does this include fees?",
      answer: "No — this shows principal and interest only.",
    },
    {
      question: "Is this accurate?",
      answer: "Results are estimates. Always confirm with your lender.",
    },
    {
      question: "What is the current RBA rate?",
      answer: "The RBA cash rate is 4.10% as of May 2026.",
    },
  ],
  stampDuty: [
    {
      question: "How is stamp duty calculated?",
      answer:
        "Each Australian state applies its own progressive bracket system to the property's dutiable value. We use the official 2026 thresholds for NSW, VIC, QLD, WA, SA, TAS, ACT and NT.",
    },
    {
      question: "Does this include first home buyer concessions?",
      answer:
        "Yes. Select the first home buyer option to apply the relevant exemption or concession for your state, including phase-out thresholds.",
    },
    {
      question: "Is this accurate?",
      answer:
        "Results are estimates based on published 2026 rates. Always confirm the final figure with your conveyancer or state revenue office before settlement.",
    },
    {
      question: "When is stamp duty paid?",
      answer:
        "Stamp duty is paid at settlement — typically 30 to 90 days after signing the contract — and cannot usually be added to your mortgage.",
    },
  ],
  borrowingPower: [
    {
      question: "How much can I borrow on a $100,000 salary in Australia?",
      answer:
        "On a $100,000 gross salary with typical living expenses of $3,500/month and no existing debts, you may be able to borrow approximately $450,000–$550,000. Lenders assess you at your interest rate plus a 3% APRA serviceability buffer. Use Calcy's borrowing power calculator for a personalised estimate based on your actual income and expenses.",
    },
    {
      question: "What is the APRA serviceability buffer?",
      answer:
        "The APRA serviceability buffer requires Australian lenders to assess your ability to repay a loan at 3% above the actual interest rate. If your loan rate is 6.14%, you are assessed at 9.14%. This means your borrowing power is calculated based on the higher repayment amount, even though you will never actually pay it. The buffer was introduced to protect borrowers from overleveraging.",
    },
    {
      question: "How does a credit card limit affect my borrowing power?",
      answer:
        "Lenders assess your credit card limit — not your balance — as a potential monthly obligation. A $20,000 credit card limit with a $0 balance is still treated as if you could spend the full $20,000. As a rule of thumb, every $10,000 of credit card limit reduces your borrowing power by approximately $50,000. Cancelling unused credit cards before applying is one of the fastest ways to increase your borrowing limit.",
    },
    {
      question: "Do both incomes count when applying for a joint home loan?",
      answer:
        "Yes. When applying jointly, both incomes are assessed together, significantly increasing borrowing power. A second income of $70,000 per year can add approximately $200,000–$300,000 to your combined borrowing capacity, depending on the lender and each applicant's expenses and commitments.",
    },
    {
      question: "Why is my borrowing power lower than I expected?",
      answer:
        "Several factors commonly reduce borrowing power below expectations. The APRA 3% serviceability buffer adds significantly to the assessment rate. Credit card limits (even with $0 balance) reduce capacity. HECS/HELP repayments are deducted from assessed income. Existing loan repayments and living expenses all reduce the amount available for new loan repayments. Calcy's 'How to increase your limit' section shows you exactly which factors are reducing your capacity based on your specific inputs.",
    },
  ],
  extraRepayments: [
    {
      question: "How are extra repayment savings calculated?",
      answer:
        "We run two amortisation schedules in parallel — one with your standard repayment and one with the extra amount applied each period — then compare total interest paid and payoff dates.",
    },
    {
      question: "Does this include fees?",
      answer: "No — calculations cover principal and interest only.",
    },
    {
      question: "Is this accurate?",
      answer:
        "Results are estimates. Fixed-rate loans usually cap extra repayments at $10,000–$20,000 per year — confirm with your lender before making large additional payments.",
    },
    {
      question: "What is the current RBA rate?",
      answer: "The RBA cash rate is 4.10% as of May 2026.",
    },
  ],
  lmi: [
    {
      question: "How is LMI calculated?",
      answer:
        "LMI premiums are based on your loan amount and Loan-to-Value Ratio (LVR). We apply indicative 2026 LMI bands: 0.66% up to 85% LVR, 1.19% up to 90%, 1.96% up to 95% and 3.10% above 95%.",
    },
    {
      question: "Does this include fees?",
      answer:
        "The premium shown is the LMI cost only. Stamp duty on the LMI premium (charged in some states) and lender application fees are not included.",
    },
    {
      question: "Is this accurate?",
      answer:
        "Results are estimates. Your lender's insurer (typically Helia or QBE) will provide the exact premium when you apply.",
    },
    {
      question: "When is LMI required?",
      answer:
        "LMI is generally required when your deposit is less than 20% of the property value (LVR above 80%).",
    },
  ],
  loanComparison: [
    {
      question: "How is the comparison calculated?",
      answer:
        "Each loan runs through the standard monthly amortisation formula. We compare repayments, total interest and 'true cost' (total repaid plus upfront fees) over the loan term.",
    },
    {
      question: "Does this include fees?",
      answer:
        "Yes — upfront fees you enter for each loan are added to the true-cost figure. Ongoing monthly fees are not modelled separately.",
    },
    {
      question: "Is this accurate?",
      answer:
        "Results are estimates. Always confirm exact comparison rates and fees with each lender before deciding.",
    },
    {
      question: "What is a comparison rate?",
      answer:
        "A comparison rate combines the interest rate and most fees into a single percentage, calculated on a $150,000 loan over 25 years, to help you compare loans like-for-like.",
    },
  ],
};
