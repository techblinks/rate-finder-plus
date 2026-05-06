export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: Record<string, FaqItem[]> = {
  mortgage: [
    {
      question: "What is the average mortgage repayment in Australia in 2026?",
      answer:
        "The average Australian home loan is $736,257 with an average interest rate of 5.50% p.a., resulting in a monthly repayment of approximately $4,189 over 30 years. Your repayment will vary based on your loan amount, interest rate, and loan term.",
    },
    {
      question: "What is the current RBA cash rate in Australia?",
      answer:
        "The RBA cash rate is 4.10% as of March 2026. The cash rate influences variable home loan interest rates. The average owner-occupier rate is currently 5.66% p.a.",
    },
    {
      question: "What is the difference between monthly and fortnightly repayments?",
      answer:
        "Fortnightly repayments (half your monthly amount, paid every two weeks) result in 26 half-payments per year — equivalent to 13 monthly payments. This extra payment each year reduces your balance faster and can save tens of thousands in interest over a 30-year loan.",
    },
    {
      question: "What is LMI and when do I need to pay it?",
      answer:
        "Lender's Mortgage Insurance (LMI) protects the lender if you default. It is required when your deposit is less than 20% of the property value (LVR above 80%). LMI can add thousands to your upfront costs but allows you to buy with a smaller deposit.",
    },
    {
      question: "Can I make extra repayments on my Australian home loan?",
      answer:
        "Most variable rate home loans allow unlimited extra repayments without penalty. Fixed rate loans typically cap extra repayments at $10,000–$20,000 per year. Making extra repayments reduces your principal faster, cutting years off your loan.",
    },
    {
      question: "What does an amortisation schedule show?",
      answer:
        "An amortisation schedule shows how each repayment is split between interest and principal over the life of your loan. In the early years, most of each repayment is interest. By the final years, nearly all of it reduces your principal.",
    },
    {
      question: "How long does it take to pay off a $650,000 mortgage?",
      answer:
        "A $650,000 mortgage at 5.50% p.a. over a standard 30-year term will be fully paid off in 30 years. Making fortnightly instead of monthly repayments can cut approximately 3–4 years off the term. Adding extra repayments reduces this further.",
    },
  ],
  stampDuty: [
    {
      question: "How much is stamp duty on a $700,000 property in NSW?",
      answer:
        "Stamp duty on a $700,000 property in NSW is approximately $26,857 for an owner-occupier. First home buyers purchasing under $800,000 are exempt from stamp duty in NSW.",
    },
    {
      question: "Do first home buyers pay stamp duty in Australia?",
      answer:
        "First home buyer stamp duty concessions vary by state. NSW: exempt up to $800k. VIC: exempt up to $600k. QLD: exempt up to $500k. WA: exempt up to $430k. Always confirm current thresholds with your state revenue office.",
    },
    {
      question: "When do you pay stamp duty in Australia?",
      answer:
        "Stamp duty is paid at settlement — typically 30–90 days after signing the contract of sale. Your conveyancer or solicitor will organise payment on your behalf. You must have the funds available before settlement.",
    },
    {
      question: "Is stamp duty the same in every Australian state?",
      answer:
        "No. Stamp duty rates and thresholds vary significantly between states and territories. NSW and VIC have the highest rates. QLD and WA have lower rates for most price ranges. This calculator shows the correct rate for each state.",
    },
    {
      question: "Can stamp duty be added to my home loan?",
      answer:
        "In most cases, no. Stamp duty must be paid in cash at settlement and cannot be added to your mortgage. This is why it is important to budget for stamp duty as a separate upfront cost when saving your deposit.",
    },
  ],
  borrowingPower: [
    {
      question: "How much can I borrow on a $100,000 salary in Australia?",
      answer:
        "On a $100,000 gross salary with typical living expenses and no other debts, you may be able to borrow approximately $450,000–$550,000. Lenders assess your borrowing capacity at a rate 3% above your loan rate (the APRA serviceability buffer). Use this calculator for a personalised estimate.",
    },
    {
      question: "What is the APRA serviceability buffer?",
      answer:
        "APRA requires all Australian lenders to assess your ability to repay a mortgage at least 3% above the loan's interest rate. For example, if your loan rate is 5.50%, the lender tests you at 8.50%. This reduces your maximum borrowing capacity but protects you from rate rises.",
    },
    {
      question: "Do both incomes count when applying for a joint home loan?",
      answer:
        "Yes. Most lenders include both applicants' incomes in a joint application. However, they will also assess both applicants' liabilities and living expenses. This calculator allows you to enter a second income.",
    },
    {
      question: "How does a credit card affect my borrowing power?",
      answer:
        "Lenders assess your credit card limit — not just your balance — as a potential liability. APRA guidelines require lenders to assume you could draw the full limit and repay it at 3.8% per month. A $10,000 credit card limit can reduce your borrowing power by approximately $40,000–$50,000.",
    },
  ],
  extraRepayments: [
    {
      question: "How much do extra repayments save on a mortgage?",
      answer:
        "On a $500,000 loan at 5.50% over 30 years, an extra $500 per month saves approximately $114,000 in interest and cuts the loan term by around 8 years. The earlier you make extra repayments, the greater the saving.",
    },
    {
      question: "Can I make extra repayments on a fixed rate loan?",
      answer:
        "Most fixed rate loans limit extra repayments to $10,000–$20,000 per year without a break fee. Variable rate loans typically allow unlimited extra repayments. Check your loan contract before making large additional payments on a fixed loan.",
    },
    {
      question: "What is a mortgage offset account?",
      answer:
        "An offset account is a savings account linked to your mortgage. The balance in the offset account reduces the principal on which interest is calculated. For example, a $50,000 offset on a $500,000 loan means you only pay interest on $450,000. Offset accounts achieve a similar result to extra repayments without reducing your loan flexibility.",
    },
  ],
  lmi: [
    {
      question: "What is Lender's Mortgage Insurance (LMI)?",
      answer:
        "LMI is insurance that protects the lender (not you) if you default on your loan. It is typically required when your deposit is less than 20% of the property value — i.e. your LVR (Loan to Value Ratio) is above 80%. LMI is a one-time cost, usually capitalised into the loan.",
    },
    {
      question: "How much does LMI cost in Australia?",
      answer:
        "LMI costs depend on your loan size and LVR. For a $650,000 loan at 90% LVR, LMI is typically $7,000–$12,000. At 95% LVR, it can be $15,000–$20,000. The cost is paid once at settlement and is usually added to your loan balance.",
    },
    {
      question: "Can I avoid paying LMI?",
      answer:
        "Yes — save a 20% deposit to bring your LVR to 80% or below. Alternatively, some lenders offer LMI waivers for certain professions (doctors, lawyers, accountants). First home buyers in some states may also qualify for government guarantee schemes that allow borrowing above 80% LVR without LMI.",
    },
    {
      question: "Who provides LMI in Australia?",
      answer:
        "LMI in Australia is provided by two main insurers: Helia (formerly Genworth) and QBE. Your lender selects which insurer they use — you do not choose. The cost varies slightly between insurers.",
    },
  ],
  loanComparison: [
    {
      question: "What should I compare when choosing a home loan?",
      answer:
        "Compare the interest rate, comparison rate (which includes fees), loan term, repayment flexibility, offset account availability, and any ongoing fees. A loan with a lower rate but high fees can cost more than a slightly higher rate with no fees.",
    },
    {
      question: "What is a comparison rate?",
      answer:
        "A comparison rate combines the interest rate and most fees into a single percentage to help you compare loans. It is calculated on a $150,000 loan over 25 years. Always check the comparison rate alongside the advertised rate.",
    },
  ],
};
