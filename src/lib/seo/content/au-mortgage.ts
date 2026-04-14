const year = new Date().getFullYear();

export const auMortgageContent = {
  h1: `Australian Mortgage Calculator — Calculate Your Home Loan Repayments (${year})`,
  intro: `Use our free Australian mortgage calculator to estimate your monthly home loan repayments in AUD. Enter your property value, deposit, interest rate, and loan term to see exactly what you'll pay each month. Whether you're a first home buyer in Sydney, upgrading in Melbourne, or investing in Brisbane, this tool provides accurate repayment breakdowns, amortization schedules, and total interest calculations based on Australian lending standards. Updated for ${year}.`,

  howItWorks: `Input the property purchase price and your deposit amount to calculate the loan principal. Select your interest rate — you can use the default based on current Australian averages or enter a specific rate from your lender. Choose a loan term (typically 25 or 30 years in Australia). The calculator computes your monthly repayment using standard amortization, then generates a full repayment schedule showing principal and interest components for every month. Australian mortgages typically use monthly compounding, which this calculator reflects accurately.`,

  localInsights: `The Reserve Bank of Australia (RBA) cash rate directly influences home loan rates offered by the Big 4 banks — Commonwealth Bank, Westpac, ANZ, and NAB. In ${year}, Australian borrowers can choose between variable rates (which move with the RBA) and fixed rates (locked for 1–5 years). Lenders assess serviceability using a buffer rate typically 3% above the offered rate. Borrowers with a Loan-to-Value Ratio (LVR) above 80% must pay Lender's Mortgage Insurance (LMI), which can add $10,000–$40,000+ to the loan. The First Home Super Saver Scheme (FHSS) allows first buyers to withdraw voluntary super contributions for a deposit, and various state grants offer $10,000–$30,000 for eligible purchasers. Stamp duty varies by state and can be a significant upfront cost.`,

  tips: [
    "Aim for an LVR below 80% to avoid paying Lender's Mortgage Insurance (LMI).",
    "Compare rates from Big 4 banks, smaller banks, and online lenders — challenger banks often beat majors by 0.5%+.",
    "Consider an offset account — it reduces interest charges by offsetting your balance with savings.",
    "Check if you qualify for First Home Buyer grants or stamp duty concessions in your state.",
    "Use the FHSS scheme to save for your deposit through voluntary super contributions with tax benefits.",
    "Review your rate annually — refinancing can save thousands, especially if your LVR has improved.",
  ],

  keyTerms: [
    { term: "LVR (Loan-to-Value Ratio)", definition: "The loan amount as a percentage of the property value. An LVR above 80% typically triggers LMI requirements." },
    { term: "LMI (Lender's Mortgage Insurance)", definition: "Insurance protecting the lender if you default, required when your deposit is less than 20% of the property value." },
    { term: "Offset Account", definition: "A transaction account linked to your mortgage — the balance reduces the principal on which interest is calculated." },
    { term: "RBA Cash Rate", definition: "The interest rate set by the Reserve Bank of Australia that influences all variable home loan rates." },
    { term: "Redraw Facility", definition: "A feature allowing you to withdraw extra repayments you've made on your home loan." },
    { term: "Stamp Duty", definition: "A state government tax paid on property purchases, calculated as a percentage of the property value." },
  ],
};
