import { CalculatorType } from "./countries";

export interface FAQItem {
  question: string;
  answer: string;
}

export const getFAQs = (calcType: CalculatorType, countryName: string): FAQItem[] => {
  const faqs: Record<CalculatorType, FAQItem[]> = {
    "mortgage-calculator": [
      {
        question: `How is my monthly mortgage payment calculated in ${countryName}?`,
        answer: `Your monthly mortgage payment is calculated using the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n – 1], where P is the loan principal, r is the monthly interest rate, and n is the total number of monthly payments. This calculator uses current ${countryName} market conditions as defaults.`,
      },
      {
        question: "What is included in a mortgage payment?",
        answer: "A mortgage payment typically includes principal (the loan amount you're paying down), interest (the cost of borrowing), property taxes, and homeowner's insurance. This calculator focuses on principal and interest — the two largest components.",
      },
      {
        question: `What is a good mortgage rate in ${countryName}?`,
        answer: `Mortgage rates in ${countryName} fluctuate based on central bank policy, inflation, and economic conditions. A 'good' rate is typically at or below the national average. Use this calculator to compare how different rates affect your monthly payment and total interest paid.`,
      },
      {
        question: "How does the amortization schedule work?",
        answer: "An amortization schedule shows how each monthly payment is split between principal and interest over the life of the loan. Early payments are mostly interest, while later payments go primarily toward principal. Our calculator generates a full month-by-month breakdown.",
      },
      {
        question: "Should I choose a 15-year or 30-year mortgage?",
        answer: "A 15-year mortgage has higher monthly payments but significantly less total interest paid. A 30-year mortgage offers lower monthly payments but costs more overall. Use the comparison feature to see the difference for your specific situation.",
      },
      {
        question: "How much can I save by making extra payments?",
        answer: "Even small extra monthly payments can save thousands in interest and shorten your loan term by years. Enter an extra payment amount in our calculator to see the exact impact on your mortgage payoff timeline.",
      },
    ],
    "loan-calculator": [
      {
        question: `How do I calculate my loan payment in ${countryName}?`,
        answer: `Loan payments in ${countryName} are calculated using the same amortization formula as mortgages. Enter your loan amount, interest rate, and term to get your exact monthly payment, total interest, and total cost of the loan.`,
      },
      {
        question: "What types of loans can I calculate?",
        answer: "This calculator works for personal loans, auto loans, student loans, and any fixed-rate installment loan. Simply enter the loan amount, annual interest rate, and repayment term.",
      },
      {
        question: "How does the interest rate affect my total loan cost?",
        answer: "Even a small difference in interest rate can significantly affect your total cost. For example, on a $20,000 loan over 5 years, a 1% rate increase could add over $500 in total interest. Use the comparison feature to see the impact.",
      },
      {
        question: "What is the difference between APR and interest rate?",
        answer: "The interest rate is the cost of borrowing the principal. APR (Annual Percentage Rate) includes the interest rate plus any fees or additional costs, giving you a more complete picture of the loan's total cost.",
      },
      {
        question: `What are typical personal loan rates in ${countryName}?`,
        answer: `Personal loan rates in ${countryName} vary by credit score, lender, and loan amount. Rates typically range from 5% to 36%. Borrowers with excellent credit usually qualify for the lowest rates.`,
      },
    ],
    "interest-calculator": [
      {
        question: "What is the difference between simple and compound interest?",
        answer: "Simple interest is calculated only on the initial principal. Compound interest is calculated on the principal plus any previously earned interest. Over time, compound interest grows significantly faster — this is the power of compounding.",
      },
      {
        question: "How often is interest compounded?",
        answer: "Interest can be compounded annually, semi-annually, quarterly, monthly, or daily. More frequent compounding results in higher returns. Most savings accounts compound daily, while many investments compound monthly or quarterly.",
      },
      {
        question: `What are current savings rates in ${countryName}?`,
        answer: `Savings account rates in ${countryName} vary by institution. High-yield savings accounts typically offer better rates than traditional banks. Use this calculator to compare how different rates affect your savings growth over time.`,
      },
      {
        question: "How does the Rule of 72 work?",
        answer: "The Rule of 72 is a quick way to estimate how long it takes to double your money. Divide 72 by your annual interest rate. For example, at 6% interest, your money doubles in approximately 12 years (72 ÷ 6 = 12).",
      },
      {
        question: "How do regular contributions affect compound interest?",
        answer: "Regular contributions dramatically accelerate wealth building through compound interest. Even modest monthly contributions, combined with compounding, can grow into substantial sums over decades.",
      },
    ],
  };

  return faqs[calcType] || [];
};
