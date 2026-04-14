const year = new Date().getFullYear();

export const usMortgageContent = {
  h1: `USA Mortgage Calculator — Estimate Your Monthly Home Loan Payment (${year})`,
  intro: `Our free USA mortgage calculator helps you estimate monthly home loan payments based on your property price, down payment, interest rate, and loan term. Whether you're buying your first home in New York, refinancing in California, or comparing 15-year vs 30-year fixed rates, this tool gives you an instant breakdown of principal, interest, and total cost. All calculations are performed in USD using standard US amortization methods. Updated for ${year} with current market rate defaults.`,

  howItWorks: `Enter the total home price and your planned down payment to determine the loan principal. Then input the annual interest rate (APR) and choose a loan term — typically 15 or 30 years in the United States. The calculator applies the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n – 1], where P is the principal, r is the monthly rate, and n is total payments. You'll see your fixed monthly payment, total interest paid over the life of the loan, and a full month-by-month amortization schedule. You can also add extra monthly payments to see how they reduce your total interest and payoff timeline.`,

  localInsights: `In ${year}, US mortgage rates are influenced by the Federal Reserve's monetary policy and broader economic conditions. The 30-year fixed-rate mortgage remains the most popular product, accounting for over 80% of new originations. FHA loans allow down payments as low as 3.5% but require mortgage insurance (MIP). Conventional loans with less than 20% down require Private Mortgage Insurance (PMI), which typically costs 0.5–1% of the loan annually. The Consumer Financial Protection Bureau (CFPB) recommends comparing at least three lender offers before committing. Jumbo loans — those exceeding the conforming limit of $766,550 in most areas — typically carry higher rates. VA loans offer zero-down options for eligible veterans.`,

  tips: [
    "Put at least 20% down to eliminate PMI and secure the best rates from US lenders.",
    "Compare offers from at least 3 lenders — rates can vary by 0.5% or more for the same borrower.",
    "Lock your rate once you find a good offer — rates can change daily based on Treasury yields.",
    "Consider a 15-year fixed mortgage to save over 50% on total interest vs a 30-year term.",
    "Factor in property taxes, homeowner's insurance, and HOA fees — they're not included in P&I calculations.",
    "Use the extra payment feature to see how even $100/month extra can shave years off your mortgage.",
  ],

  keyTerms: [
    { term: "APR (Annual Percentage Rate)", definition: "The total annual cost of the mortgage including interest and lender fees, expressed as a percentage." },
    { term: "PMI (Private Mortgage Insurance)", definition: "Insurance required by lenders when you put down less than 20%. Typically 0.5–1% of loan value annually." },
    { term: "FHA Loan", definition: "Government-backed mortgage allowing 3.5% down payments. Popular with first-time buyers but requires mortgage insurance." },
    { term: "Amortization Schedule", definition: "A table showing how each monthly payment is split between principal reduction and interest charges." },
    { term: "Conforming Loan", definition: "A mortgage that meets Fannie Mae/Freddie Mac guidelines, including the loan limit of $766,550 in most US counties." },
    { term: "Escrow", definition: "An account held by your lender to pay property taxes and insurance on your behalf, funded through your monthly payment." },
  ],
};
