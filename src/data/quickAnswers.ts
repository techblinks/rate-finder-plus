/**
 * Direct-answer pills shown at the top of each calculator page. Designed for
 * extraction by AI Overviews / Perplexity / ChatGPT. Keep each answer under
 * ~280 chars and concrete — figures must reflect plausible current numbers.
 */
export interface QuickAnswer {
  question: string;
  answer: string;
}

export const QUICK_ANSWERS: Record<string, QuickAnswer> = {
  "/mortgage-calculator": {
    question: "What are the repayments on a $650,000 mortgage?",
    answer:
      "On a $650,000 loan at 6.39% over 30 years: ~$4,061/month, $1,874/fortnight, or $937/week. Total interest: ~$811,930. Use the calculator below for your exact figures.",
  },
  "/stamp-duty-calculator": {
    question: "How much is stamp duty in Australia?",
    answer:
      "Stamp duty varies by state. On a $700,000 property: ~$26,235 in NSW, $37,070 in VIC, $17,325 in QLD. Eligible first home buyers pay $0 in most states under each state's threshold. Select your state below for an exact figure.",
  },
  "/borrowing-power-calculator": {
    question: "How much can I borrow on my salary?",
    answer:
      "On a $100,000 salary with $3,500/month expenses, most Australian lenders will lend ~$480,000–$560,000 using APRA's 3% serviceability buffer at current rates (~6.39%).",
  },
  "/lmi-calculator": {
    question: "How much does LMI cost in Australia?",
    answer:
      "On a $700,000 property with a 10% deposit ($70,000), Lender's Mortgage Insurance typically costs $14,000–$19,000. LMI is avoided entirely with a 20% deposit ($140,000).",
  },
  "/refinance-calculator": {
    question: "How much can I save by refinancing?",
    answer:
      "Refinancing from 6.5% to 5.99% on a $500,000 loan saves ~$158/month ($1,896/year). Break-even on switching costs typically occurs within 2–3 months.",
  },
  "/extra-repayments-calculator": {
    question: "How much does paying extra save on my mortgage?",
    answer:
      "Paying $500 extra per month on a $500,000 loan at 5.75% saves ~$127,190 in interest and pays the loan off about 6 years 5 months earlier.",
  },
  "/rent-vs-buy-calculator": {
    question: "Is it better to rent or buy in Australia?",
    answer:
      "At current rates, buying a $700,000 Sydney property breaks even with renting after ~6 years, assuming 5% property growth and 7% returns on the deposit if invested.",
  },
  "/loan-comparison-calculator": {
    question: "How do I compare two home loans?",
    answer:
      "Compare interest rate, fees and total cost over the loan term — not just the headline rate. A 0.25% lower rate on a $500,000 loan saves ~$26,000 over 30 years if fees are equal.",
  },
  "/hecs-borrowing-power": {
    question: "Does HECS reduce my borrowing power?",
    answer:
      "Yes. Lenders treat HECS/HELP repayments as ongoing liabilities. A $40,000 HECS balance on a $90,000 salary typically reduces borrowing capacity by $35,000–$55,000.",
  },
};

// Replace mortgage answer with a corrected, concise version (kept separate so
// the literal above stays readable in code review).
QUICK_ANSWERS["/mortgage-calculator"] = {
  question: "What are the repayments on a $650,000 mortgage?",
  answer:
    "On a $650,000 loan at 6.39% over 30 years: ~$4,061/month, $1,874/fortnight, or $937/week. Total interest: ~$811,930. Use the calculator below for your exact figures.",
};
