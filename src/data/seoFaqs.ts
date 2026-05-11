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
      answer: "The RBA cash rate is 4.35% as of May 2026, following the 25bps hike on 5 May 2026.",
    },
    {
      question: "What is an offset account and how does it work?",
      answer:
        "A 100% offset account is a transaction account linked to your home loan. Each day, the balance in the offset is subtracted from your loan balance before interest is calculated. If you owe $650,000 and have $50,000 in offset, you only pay interest on $600,000 — your repayment stays the same, but more of it goes to principal. The savings are mathematically identical to paying that $50,000 directly off the loan, but the money stays fully accessible. Around 80% of Australian variable-rate mortgages include a 100% offset facility.",
    },
    {
      question: "How much interest can an offset account save on a $650,000 mortgage?",
      answer:
        "On a $650,000 mortgage at 6.14% p.a. over 30 years, a $50,000 starting offset balance saves around $150,000 in interest and shaves roughly 4 years off the loan term. Adding $1,500 per month into the offset on top of that lifts total savings to approximately $250,000 and 7+ years off the term. Calcy's offset modeller runs a month-by-month simulation against the same engine the repayment calculator uses, so the savings figure matches what a major-bank broker would quote.",
    },
    {
      question: "Should I put my savings in an offset account or pay down the loan directly?",
      answer:
        "For most variable-rate borrowers the offset wins. The interest savings are mathematically identical — $1 in offset reduces interest the same as $1 paid off principal — but the offset keeps your money fully accessible if you lose your job, have a baby, or face an emergency. Money paid directly onto the loan typically requires a redraw request, which can be slow, capped, or restricted by the lender. The implicit return on offset money is also tax-free (you're avoiding interest, not earning income), so it usually beats a high-interest savings account on an after-tax basis.",
    },
    {
      question: "Does an offset account change my monthly repayment?",
      answer:
        "No. Your contractual monthly principal-and-interest repayment stays the same. The offset balance reduces the interest portion of each repayment, so more of every dollar goes to principal — that is why the loan is paid off sooner. The 'effective rate' shown in Calcy's offset card is your headline rate weighted by the average offset position over the life of the loan.",
    },
    {
      question: "Is an offset account the same as redraw?",
      answer:
        "No. With redraw, extra repayments reduce your loan balance and you have to ask the lender to release the money back — access can be slow, capped, or restricted, and lenders can change the rules. An offset account is a separate everyday transaction account that you control like any other bank account. The dollar-for-dollar interest-saving effect is identical, but offset is more flexible. Offset is also clearly preferable when the property may later become an investment, because redrawn funds can complicate the tax-deductibility of the loan interest.",
    },
    {
      question: "Do I need a 100% offset or is a partial offset enough?",
      answer:
        "Aim for a 100% offset. Partial offset accounts only offset a percentage of the balance (commonly 40–80%) or only offset against a portion of the loan, which materially reduces the saving. The vast majority of mainstream Australian variable-rate products offer a 100% offset either included or for a small annual package fee — usually $300–$400 per year, which is recouped by an average offset balance of about $7,000 at a 6% rate.",
    },
  ],
  stampDuty: [
    {
      question: "How much is stamp duty on a $700,000 property in NSW?",
      answer:
        "Stamp duty on a $700,000 property in New South Wales is approximately $26,707 for an owner-occupier. First home buyers purchasing under $800,000 pay $0 stamp duty in NSW — a saving of $26,707. Use Calcy's stamp duty calculator for exact figures based on your property value and buyer status.",
    },
    {
      question: "Do first home buyers pay stamp duty in Australia?",
      answer:
        "It depends on the state and property value. In NSW, first home buyers are fully exempt on properties up to $800,000. In Victoria, the exemption applies up to $600,000. In Queensland, the concession applies up to $500,000. In WA, the exemption applies up to $430,000. The ACT offers a full exemption through its Home Buyer Concession Scheme. SA and NT do not offer stamp duty exemptions for first home buyers, though grants are available on new homes.",
    },
    {
      question: "What is the First Home Owner Grant in each state?",
      answer:
        "The First Home Owner Grant (FHOG) is a one-off payment available to eligible first home buyers purchasing or building a new home. As of 2026: NSW $10,000, VIC $10,000, QLD $30,000, WA $10,000, SA $15,000, TAS $30,000, NT $10,000. The ACT does not have a FHOG but offers stamp duty exemptions. The FHOG is only available on new homes — not established properties.",
    },
    {
      question: "When do you pay stamp duty in Australia?",
      answer:
        "Stamp duty must be paid at or before settlement in most Australian states — typically within 30 days of signing the contract. Your conveyancer or solicitor arranges the payment as part of the settlement process. Stamp duty is generally paid from your own savings rather than your home loan, which is why it is important to budget for it as part of your upfront costs.",
    },
    {
      question: "Which Australian state has the lowest stamp duty?",
      answer:
        "Stamp duty varies significantly by state and property value. For a $700,000 property in 2026, the ACT typically has among the lowest rates for eligible buyers due to its Home Buyer Concession Scheme. Queensland and Western Australia also tend to have lower stamp duty than NSW and Victoria at mid-range prices. Use Calcy's 'Compare all states' feature to see the exact stamp duty for your property value across all 8 states simultaneously.",
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
        "The APRA serviceability buffer requires Australian lenders to assess your ability to repay a loan at 3% above the actual interest rate. If your loan rate is 6.39%, you are assessed at 9.39%. This means your borrowing power is calculated based on the higher repayment amount, even though you will never actually pay it. The buffer was introduced to protect borrowers from overleveraging.",
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
      answer: "The RBA cash rate is 4.35% as of May 2026, following the 25bps hike on 5 May 2026.",
    },
  ],
  lmi: [
    {
      question: "What is Lender's Mortgage Insurance (LMI)?",
      answer:
        "Lender's Mortgage Insurance (LMI) is a one-off insurance premium charged by your lender when your deposit is less than 20% of the property value — meaning your LVR (Loan to Value Ratio) is above 80%. LMI protects the lender, not you, if you default on the loan. Despite protecting the lender, you pay the premium. LMI can be paid upfront or added to your home loan.",
    },
    {
      question: "How much does LMI cost in Australia?",
      answer:
        "LMI costs depend on your loan amount and LVR. On a $700,000 property with a 10% deposit ($70,000), LMI is approximately $7,500–$8,500. On a 5% deposit, LMI can exceed $20,000. LMI is calculated as a percentage of the loan amount — the higher your LVR, the higher the rate applied. Use Calcy's LMI calculator for a precise estimate based on your property value and deposit.",
    },
    {
      question: "Can I avoid paying LMI?",
      answer:
        "Yes. There are four main ways to avoid LMI in Australia: (1) Save a 20% deposit so your LVR is 80% or below. (2) Use the First Home Guarantee — eligible first home buyers can purchase with a 5% deposit with no LMI, as the government guarantees the remaining 15%. (3) Use a guarantor loan where a family member's property equity covers part of your deposit. (4) Some lenders offer LMI waivers for certain professions including doctors, lawyers, and accountants, even above 80% LVR.",
    },
    {
      question: "Is it better to pay LMI upfront or add it to the loan?",
      answer:
        "Paying LMI upfront is always cheaper in total dollar terms. When LMI is added to your loan, you pay interest on the LMI premium for the life of the loan. On a $7,500 LMI premium at 6.39% over 30 years, adding it to the loan costs approximately $14,800 in total — roughly double the upfront cost. However, if you don't have $7,500 available at settlement, capitalising LMI into the loan is a valid option that avoids the need for additional cash savings.",
    },
    {
      question: "Does LMI get refunded if I sell my property?",
      answer:
        "No. LMI premiums are non-refundable once your loan settles. If you sell the property, refinance to a new lender, or pay off the loan early, you do not receive any refund of the LMI premium. If you refinance to a new lender while your LVR is still above 80%, you may need to pay a new LMI premium with the new lender — this is an important consideration when deciding whether to refinance.",
    },
    {
      question: "What is the First Home Guarantee and how does it avoid LMI?",
      answer:
        "The First Home Guarantee (formerly the First Home Loan Deposit Scheme) is an Australian government program administered by Housing Australia. Eligible first home buyers can purchase a property with as little as a 5% deposit without paying LMI. The government guarantees up to 15% of the property value, so the lender treats the loan as if the buyer has a 20% deposit. Up to 35,000 places are available each financial year. Income caps and property price limits apply.",
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
