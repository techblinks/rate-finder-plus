const year = new Date().getFullYear();

export const caInterestContent = {
  h1: `Canadian Interest Calculator — Compound Interest & Savings Calculator (${year})`,
  intro: `Our free Canadian interest calculator projects how your savings and investments grow over time in CAD. Calculate compound interest on GICs, TFSAs, RRSPs, savings accounts, and investment portfolios. Enter your principal, interest rate, compounding frequency, and regular contributions for detailed growth projections. Compare rates from Canadian banks and credit unions to maximize your returns. Updated for ${year}.`,

  howItWorks: `Enter your initial investment amount in Canadian dollars, the annual interest rate, and your investment horizon. Select the compounding frequency — Canadian GICs and savings accounts typically compound daily or monthly. Add optional regular monthly contributions to see how consistent saving accelerates wealth growth. The calculator generates a full projection including total interest earned, final balance, and year-by-year growth. Toggle between simple and compound interest to visualize the power of compounding in your Canadian savings strategy.`,

  localInsights: `In ${year}, Canadian GIC (Guaranteed Investment Certificate) rates range from 3.5% to 5.5% depending on term length, with 1-year GICs offering the best rates in a declining rate environment. High-interest savings accounts at digital banks offer 3–5%, while the big five banks typically offer lower promotional rates. The Tax-Free Savings Account (TFSA) — with a ${year} contribution limit of $7,000 — allows completely tax-free growth and withdrawals. RRSPs provide tax-deferred growth with a contribution limit of 18% of earned income. The First Home Savings Account (FHSA) offers tax-deductible contributions and tax-free withdrawals for first home purchases. CDIC (Canada Deposit Insurance Corporation) protects eligible deposits up to $100,000 per category per member institution.`,

  tips: [
    "Maximize your TFSA room first — all growth is completely tax-free, including interest, dividends, and capital gains.",
    "Compare GIC rates from credit unions and online banks — they often beat the Big 5 banks by 0.5–1%.",
    "Use a TFSA ladder with multiple GIC terms (1–5 years) to balance rate and liquidity.",
    "Contribute to your RRSP to get the tax deduction, then invest the refund in your TFSA for maximum growth.",
    "Open an FHSA if you're a first-time buyer — $8,000/year contribution room with both a deduction and tax-free growth.",
    "Ensure your deposits are CDIC-insured — protection covers up to $100,000 per eligible category.",
  ],

  keyTerms: [
    { term: "GIC (Guaranteed Investment Certificate)", definition: "A Canadian fixed-term investment offering a guaranteed interest rate. Principal is protected. Available from banks and credit unions." },
    { term: "TFSA (Tax-Free Savings Account)", definition: "A registered account where all investment growth and withdrawals are completely tax-free. Contribution room accumulates annually." },
    { term: "RRSP (Registered Retirement Savings Plan)", definition: "A tax-deferred retirement savings account. Contributions are tax-deductible, but withdrawals are taxed as income." },
    { term: "FHSA (First Home Savings Account)", definition: "A registered plan for first-time home buyers offering tax-deductible contributions and tax-free withdrawals for a home purchase." },
    { term: "CDIC (Canada Deposit Insurance Corporation)", definition: "Federal corporation protecting eligible deposits up to $100,000 per category at member institutions." },
  ],
};
