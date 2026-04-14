const year = new Date().getFullYear();

export const caLoanContent = {
  h1: `Canadian Loan Calculator — Estimate Personal & Auto Loan Payments (${year})`,
  intro: `Our free Canadian loan calculator helps you estimate monthly payments for personal loans, car loans, and other fixed-rate installment credit in CAD. Enter your borrowing amount, interest rate, and repayment term to see an accurate breakdown of monthly payments, total interest, and the full cost of the loan. Compare offers from Canadian banks, credit unions, and online lenders. Updated for ${year} with Canadian market rates.`,

  howItWorks: `Enter the total loan amount in Canadian dollars, the annual interest rate from your lender, and the repayment term. The calculator uses standard monthly amortization to determine your fixed payment amount. You'll receive a detailed breakdown showing total interest charges, the overall cost of borrowing, and a payment schedule illustrating how each installment is split between principal and interest. Try different scenarios to compare offers — even a small rate difference saves hundreds over the loan's life.`,

  localInsights: `In ${year}, Canadian personal loan rates range from approximately 6% to 30%, heavily influenced by the Bank of Canada's overnight rate and individual credit profiles. The big five banks — RBC, TD, BMO, Scotiabank, and CIBC — dominate the market, but credit unions and online lenders often offer competitive alternatives. The cost of borrowing disclosure required under the Bank Act ensures all fees and interest charges are transparent. Auto loans in Canada average 5–8% for new vehicles, with dealer financing sometimes offering promotional 0% rates. Canadian borrowers should note that loan interest is generally not tax-deductible for personal loans, unlike certain business or investment loans. Provincial regulations also affect lending practices, with Quebec having distinct consumer protection rules.`,

  tips: [
    "Compare the total cost of borrowing, not just the interest rate — Canadian law requires lenders to disclose this figure.",
    "Check credit union rates — they frequently undercut the big banks by 1–2% on personal loans.",
    "Avoid dealer financing add-ons — extended warranties and insurance products significantly increase total costs.",
    "Shorten your auto loan term to 4–5 years maximum — longer terms mean paying interest on a depreciating asset.",
    "Request a pre-approval from your bank before visiting car dealerships to strengthen your negotiating position.",
    "Review your credit score through Equifax or TransUnion Canada before applying to ensure accuracy.",
  ],

  keyTerms: [
    { term: "Cost of Borrowing", definition: "The total amount you pay in interest and fees over the life of the loan — Canadian law requires lenders to disclose this clearly." },
    { term: "Prime Rate", definition: "The base lending rate set by major Canadian banks, directly influenced by the Bank of Canada's overnight rate." },
    { term: "Fixed vs Variable Rate", definition: "Fixed rates stay constant for the loan term. Variable rates fluctuate with the prime rate, offering lower initial rates but more risk." },
    { term: "Dealer Financing", definition: "Loan arrangements offered through a car dealership, sometimes with promotional rates but often with added products." },
    { term: "Credit Bureau", definition: "Organizations like Equifax and TransUnion Canada that track your credit history and generate credit scores used by lenders." },
  ],
};
