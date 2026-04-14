const year = new Date().getFullYear();

export const auInterestContent = {
  h1: `Australian Interest Calculator — Compound Interest & Savings Calculator (${year})`,
  intro: `Use our free Australian interest calculator to project how your savings and investments grow over time. Calculate compound interest on term deposits, savings accounts, and investment portfolios in AUD. Enter your starting balance, interest rate, compounding frequency, and regular contributions to see detailed growth projections. Perfect for comparing rates from Australian banks and setting realistic savings targets. Updated for ${year}.`,

  howItWorks: `Input your initial deposit amount in AUD, the annual interest rate (use the rate from your bank or a target rate), the investment period, and how often interest compounds. Australian savings accounts and term deposits typically compound daily or monthly. The calculator applies the compound interest formula and factors in any regular monthly contributions. You'll see your final balance, total interest earned, and a growth chart showing year-by-year progress. Switch between simple and compound interest to understand the compounding advantage.`,

  localInsights: `In ${year}, Australian term deposit rates from major banks range from 4% to 5.5% for terms of 6–24 months, while high-interest savings accounts (often called bonus saver accounts) offer 4–5.5% when conditions are met. The RBA cash rate influences all savings rates across the market. Superannuation (super) — Australia's retirement savings system — has returned an average of 7–9% annually over the long term, with employer contributions of 11.5% mandatory. The government co-contribution scheme matches personal super contributions for low-income earners. First Home Super Saver Scheme (FHSS) allows tax-advantaged saving within super. Deposit protection under the Financial Claims Scheme covers up to $250,000 per person per ADI (Authorised Deposit-taking Institution).`,

  tips: [
    "Compare term deposit rates across Big 4 banks and neobanks — online banks like ING and UBank often offer higher rates.",
    "Meet bonus saver conditions each month (e.g., no withdrawals, minimum deposit) to earn the highest advertised rate.",
    "Maximize your super contributions — the 11.5% employer contribution plus salary sacrifice offers tax-effective compounding.",
    "Use the FHSS scheme to save for a first home inside super with pre-tax dollars.",
    "Reinvest term deposit interest rather than withdrawing — this maximizes the compounding effect.",
    "Check that your deposits are covered by the $250,000 Financial Claims Scheme protection.",
  ],

  keyTerms: [
    { term: "Term Deposit", definition: "A fixed-term investment with an Australian bank offering a guaranteed interest rate. Penalties may apply for early withdrawal." },
    { term: "Bonus Saver Account", definition: "A savings account offering higher interest when specific conditions are met each month, such as making a deposit or not withdrawing." },
    { term: "Superannuation (Super)", definition: "Australia's mandatory retirement savings system where employers contribute 11.5% of your salary." },
    { term: "RBA Cash Rate", definition: "The Reserve Bank of Australia's target interest rate, which influences savings and loan rates across all financial institutions." },
    { term: "Financial Claims Scheme", definition: "Government guarantee protecting deposits up to $250,000 per person per Authorised Deposit-taking Institution." },
  ],
};
