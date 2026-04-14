const year = new Date().getFullYear();

export const auLoanContent = {
  h1: `Australian Loan Calculator — Estimate Personal & Car Loan Repayments (${year})`,
  intro: `Use our free Australian loan calculator to estimate your monthly repayments for personal loans, car loans, and other fixed-rate credit products. Enter your loan amount in AUD, the annual interest rate, and repayment term to see an instant breakdown of monthly payments, total interest, and the full cost of borrowing. Compare offers from major Australian lenders and make informed borrowing decisions. Updated for ${year}.`,

  howItWorks: `Input the total loan amount in Australian dollars, the annual interest rate offered by your lender, and the repayment period in years. The calculator applies standard amortization to compute your fixed monthly repayment, total interest payable, and the complete cost over the loan's life. Review the repayment schedule to see how each payment is allocated between reducing the principal and covering interest charges. Adjust inputs to compare different offers — Australian lenders often provide comparison rates to help you evaluate.`,

  localInsights: `Australian personal loan rates in ${year} typically range from 5% to 20%, with the best rates reserved for borrowers with strong credit histories. The comparison rate — unique to Australia — includes fees and charges to give a more accurate picture of total cost. Car loans can be secured (using the vehicle as collateral for lower rates, typically 5–8%) or unsecured (higher rates, 8–15%). Buy Now Pay Later (BNPL) products like Afterpay and Zip are popular for smaller purchases but should be compared carefully against traditional loans for larger amounts. ASIC regulates lending practices, and the National Consumer Credit Protection Act requires lenders to assess your capacity to repay. Borrowers should also consider that comparison rates are calculated on a $30,000 loan over 5 years and may differ for your specific situation.`,

  tips: [
    "Always compare the 'comparison rate' not just the advertised rate — it includes fees and gives a true cost picture.",
    "Secured car loans offer lower rates than unsecured personal loans for vehicle purchases.",
    "Check for early repayment fees before signing — many Australian lenders charge exit fees on fixed-rate loans.",
    "Consider a shorter loan term even if repayments are higher — you'll save significantly on total interest.",
    "Online lenders and neobanks often offer lower rates than the Big 4 banks for personal loans.",
    "Avoid multiple loan applications in a short period — each inquiry affects your credit score with Equifax or illion.",
  ],

  keyTerms: [
    { term: "Comparison Rate", definition: "An Australian-specific rate that combines the interest rate with most fees, providing a more accurate cost comparison between lenders." },
    { term: "Secured Loan", definition: "A loan backed by an asset (e.g., a car). Offers lower rates because the lender can repossess the asset if you default." },
    { term: "Establishment Fee", definition: "A one-time fee charged by the lender when your loan is first set up, similar to an origination fee." },
    { term: "ASIC", definition: "The Australian Securities and Investments Commission — the regulator overseeing consumer credit and lending practices." },
    { term: "Balloon Payment", definition: "A large final payment at the end of a loan term, common in car financing, which reduces regular monthly repayments." },
  ],
};
