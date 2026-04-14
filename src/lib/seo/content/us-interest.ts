const year = new Date().getFullYear();

export const usInterestContent = {
  h1: `USA Interest Calculator — Compound & Simple Interest Calculator (${year})`,
  intro: `Calculate compound and simple interest on your savings, investments, and deposits with our free USA interest calculator. See how your money grows over time with different rates, compounding frequencies, and regular monthly contributions. Whether you're evaluating a high-yield savings account, CD rates, or long-term investment returns, this tool gives you precise projections in USD. Updated for ${year}.`,

  howItWorks: `Enter your initial principal (starting amount), annual interest rate, investment period in years, and compounding frequency. Choose from annual, semi-annual, quarterly, monthly, or daily compounding. The calculator uses the compound interest formula A = P(1 + r/n)^(nt) for compound interest, or A = P(1 + rt) for simple interest. Add optional monthly contributions to see how regular saving accelerates wealth growth. You'll see the final balance, total interest earned, and a year-by-year growth projection.`,

  localInsights: `In ${year}, high-yield savings accounts in the US typically offer 4–5% APY, significantly higher than the 0.01–0.5% at traditional big banks. Certificates of Deposit (CDs) offer fixed rates for terms of 3 months to 5 years, with longer terms generally yielding higher rates. The Federal Deposit Insurance Corporation (FDIC) insures deposits up to $250,000 per depositor per bank. For longer-term investing, the S&P 500 has historically returned approximately 10% annually before inflation. Roth IRAs and 401(k)s offer tax-advantaged growth — a crucial factor in long-term compounding. Series I Bonds provide inflation-protected returns set by the US Treasury. Money market accounts offer higher rates than standard savings with some check-writing privileges.`,

  tips: [
    "Choose high-yield savings accounts over traditional banks — the rate difference is massive (5% vs 0.01%).",
    "Start investing early — thanks to compounding, $10,000 at age 25 is worth more than $30,000 invested at age 45.",
    "Use the Rule of 72: divide 72 by your interest rate to estimate how many years it takes to double your money.",
    "Maximize tax-advantaged accounts (Roth IRA, 401k) before taxable investing — tax-free compounding is powerful.",
    "Set up automatic monthly contributions — consistency matters more than amount in long-term wealth building.",
    "Compare APY (not APR) for savings products — APY accounts for compounding frequency.",
  ],

  keyTerms: [
    { term: "Compound Interest", definition: "Interest calculated on the principal plus all previously accumulated interest — the driving force behind exponential wealth growth." },
    { term: "APY (Annual Percentage Yield)", definition: "The effective annual return accounting for compounding frequency. Higher compounding frequency = higher APY." },
    { term: "Rule of 72", definition: "A quick estimation tool: divide 72 by the annual rate to find how many years it takes to double your money." },
    { term: "FDIC Insurance", definition: "Federal Deposit Insurance Corporation protection covering up to $250,000 per depositor per bank." },
    { term: "Time Value of Money", definition: "The concept that money available today is worth more than the same amount in the future due to its earning potential." },
  ],
};
