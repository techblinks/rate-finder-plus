const year = new Date().getFullYear();

export const caMortgageContent = {
  h1: `Canadian Mortgage Calculator — Estimate Monthly Payments & Amortization (${year})`,
  intro: `Our free Canadian mortgage calculator estimates your monthly mortgage payments in CAD. Enter your home price, down payment, interest rate, and amortization period to see detailed payment breakdowns and a full amortization schedule. Whether you're a first-time buyer in Toronto, purchasing in Vancouver, or exploring options in Calgary, this tool accounts for Canadian mortgage conventions including the stress test and CMHC insurance. Updated for ${year}.`,

  howItWorks: `Enter your home purchase price and down payment to determine the mortgage principal. In Canada, down payments below 20% require CMHC mortgage default insurance, which this calculator factors into your costs. Select your interest rate and amortization period — Canadian mortgages are typically amortized over 25 years (maximum for insured mortgages), though uninsured mortgages can go to 30 years. The calculator uses semi-annual compounding as required by Canadian mortgage regulations, giving you accurate monthly payment figures, total interest costs, and a complete amortization table.`,

  localInsights: `The Bank of Canada's (BoC) overnight rate sets the baseline for variable mortgage rates across the country. In ${year}, Canadian borrowers must qualify at the higher of the contract rate plus 2% or the BoC qualifying rate (stress test), regardless of whether they choose fixed or variable. The Canada Mortgage and Housing Corporation (CMHC) insures mortgages with down payments between 5% and 19.99%, with premiums ranging from 2.8% to 4% of the mortgage amount. The First Home Savings Account (FHSA) allows first-time buyers to save up to $8,000/year (lifetime max $40,000) tax-free for a home purchase. Canadian mortgages have terms (typically 1–5 years) within the amortization period, meaning you renegotiate rates at each renewal.`,

  tips: [
    "Put at least 20% down to avoid CMHC insurance premiums, which add 2.8–4% to your mortgage.",
    "Open a First Home Savings Account (FHSA) early — tax-deductible contributions and tax-free withdrawals.",
    "Get a mortgage pre-approval to lock in a rate for 90–120 days while you shop for a home.",
    "Consider a shorter term (2–3 years) if you expect rates to drop, or lock in 5 years for payment certainty.",
    "Use the 25-year amortization maximum for insured mortgages — uninsured buyers can choose up to 30 years.",
    "Factor in land transfer tax, legal fees, and home inspection costs when budgeting for your purchase.",
  ],

  keyTerms: [
    { term: "CMHC Insurance", definition: "Mortgage default insurance required for down payments under 20%. Premiums are added to the mortgage principal." },
    { term: "Stress Test", definition: "Federal requirement to qualify at a rate higher than your contract rate, ensuring you can handle rate increases." },
    { term: "Amortization Period", definition: "The total time to pay off the mortgage — 25 years max for insured, 30 years for uninsured mortgages in Canada." },
    { term: "Mortgage Term", definition: "The period your current rate and conditions are locked (typically 1–5 years), after which you renew." },
    { term: "FHSA (First Home Savings Account)", definition: "A registered plan letting first-time buyers save up to $40,000 tax-free for a home purchase." },
    { term: "Land Transfer Tax", definition: "A provincial tax paid when purchasing property, calculated as a percentage of the purchase price." },
  ],
};
