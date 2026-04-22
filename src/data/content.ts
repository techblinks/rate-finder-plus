import { CalculatorType, CountryConfig } from "./countries";

export const getPageContent = (calcType: CalculatorType, country: CountryConfig) => {
  const content: Partial<Record<CalculatorType, {
    h1: string;
    intro: string;
    howItWorks: string;
    whyUse: string;
    tips: string[];
    keyTerms: { term: string; definition: string }[];
  }>> = {
    "mortgage-calculator": {
      h1: `${country.name} Mortgage Calculator`,
      intro: `Use our free ${country.name} mortgage calculator to estimate your monthly home loan payments. Enter your property price, down payment, interest rate, and loan term to get an instant breakdown of your mortgage costs including principal, interest, and a full amortization schedule. Whether you're a first-time homebuyer or refinancing, this tool helps you make informed decisions about your ${country.name} property purchase.`,
      howItWorks: `Our mortgage calculator uses the standard amortization formula to compute your monthly payment. It factors in the loan principal (property price minus down payment), annual interest rate, and loan term. The calculator then generates a month-by-month amortization schedule showing exactly how much of each payment goes to principal versus interest. All calculations use ${country.name}-standard conventions for rate compounding.`,
      whyUse: `Understanding your mortgage obligations before committing to a home purchase is critical. In ${country.name}, the average home costs around ${country.currencySymbol}${country.defaultAmount.toLocaleString()}, and even a 0.25% rate difference can mean tens of thousands in extra interest over the life of a loan. Our calculator helps you compare scenarios, plan your budget, and negotiate with lenders from a position of knowledge.`,
      tips: [
        "Aim for a 20% down payment to avoid mortgage insurance and secure better rates.",
        "Compare 15-year vs 30-year terms — shorter terms cost more monthly but save significantly on interest.",
        "Factor in property taxes, insurance, and maintenance costs beyond your monthly payment.",
        `Check current ${country.name} central bank rates as they directly influence mortgage pricing.`,
        "Consider making bi-weekly payments to pay off your mortgage faster.",
      ],
      keyTerms: [
        { term: "Principal", definition: "The original loan amount borrowed, excluding interest." },
        { term: "Amortization", definition: "The process of spreading loan repayment over a fixed schedule of regular payments." },
        { term: "Down Payment", definition: "The upfront cash payment made when purchasing a property, typically 5-20% of the price." },
        { term: "Fixed Rate", definition: "An interest rate that remains constant for the entire loan term." },
        { term: "Variable Rate", definition: "An interest rate that can change periodically based on market conditions." },
      ],
    },
    "loan-calculator": {
      h1: `${country.name} Loan Calculator`,
      intro: `Calculate your loan repayments instantly with our free ${country.name} loan calculator. Whether it's a personal loan, auto loan, or any fixed-rate installment loan, enter your details to see monthly payments, total interest, and the full cost of borrowing in ${country.currency}. Make smarter borrowing decisions with clear, detailed calculations.`,
      howItWorks: `This loan calculator applies the standard fixed-rate amortization formula to determine your monthly payment amount. Enter the total loan amount in ${country.currency}, annual interest rate, and repayment term in years. The calculator instantly computes your monthly payment, total interest charges, and the complete cost of the loan over its full term.`,
      whyUse: `Before taking on debt in ${country.name}, it's essential to understand the true cost of borrowing. A ${country.currencySymbol}20,000 personal loan at 8% over 5 years costs over ${country.currencySymbol}4,300 in interest alone. Our calculator shows you exactly what you'll pay, helping you compare offers from different lenders and choose the most affordable option.`,
      tips: [
        "Shop around — even a 1% rate difference saves hundreds over the loan term.",
        "Choose the shortest term you can afford to minimize total interest paid.",
        "Check for prepayment penalties before making extra payments.",
        "Improve your credit score before applying to qualify for lower rates.",
        `Compare offers from banks, credit unions, and online lenders in ${country.name}.`,
      ],
      keyTerms: [
        { term: "APR", definition: "Annual Percentage Rate — the total yearly cost of borrowing including fees." },
        { term: "Term", definition: "The length of time over which the loan must be fully repaid." },
        { term: "Installment", definition: "A fixed regular payment that includes both principal and interest." },
        { term: "Prepayment", definition: "Paying off part or all of a loan before the scheduled end date." },
      ],
    },
    "interest-calculator": {
      h1: `${country.name} Interest Calculator`,
      intro: `Calculate simple and compound interest on your savings, investments, or deposits with our free ${country.name} interest calculator. See how your money grows over time with different rates, compounding frequencies, and regular contributions. Perfect for planning savings goals, comparing investment returns, and understanding the power of compounding in ${country.currency}.`,
      howItWorks: `This calculator supports both simple interest (A = P(1 + rt)) and compound interest (A = P(1 + r/n)^(nt)) calculations. For compound interest, choose from annual, semi-annual, quarterly, monthly, or daily compounding. Add optional regular contributions to see how consistent saving accelerates your wealth growth over time.`,
      whyUse: `Understanding compound interest is key to building wealth in ${country.name}. ${country.currencySymbol}10,000 invested at 7% compounded monthly grows to over ${country.currencySymbol}20,000 in just 10 years — without any additional contributions. Our calculator helps you visualize this growth, set realistic savings targets, and compare options from different ${country.name} financial institutions.`,
      tips: [
        "Start saving early — compounding rewards time more than amount.",
        "Look for high-yield savings accounts with daily compounding.",
        "Automate regular contributions to maximize the compounding effect.",
        "Reinvest dividends and interest to keep the compounding cycle going.",
        `Compare term deposit rates across ${country.name} banks for the best returns.`,
      ],
      keyTerms: [
        { term: "Compound Interest", definition: "Interest calculated on both the initial principal and accumulated interest." },
        { term: "Simple Interest", definition: "Interest calculated only on the original principal amount." },
        { term: "Compounding Frequency", definition: "How often interest is calculated and added to the principal (daily, monthly, yearly)." },
        { term: "APY", definition: "Annual Percentage Yield — the effective rate of return accounting for compounding." },
      ],
    },
  };

  return content[calcType];
};
