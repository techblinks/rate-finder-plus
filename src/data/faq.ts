import { CalculatorType } from "./countries";

export interface FAQItem {
  question: string;
  answer: string;
}

const mortgageFAQs: Record<string, FAQItem[]> = {
  us: [
    { question: "How is my monthly mortgage payment calculated?", answer: "Your monthly payment is calculated using the amortization formula: M = P[r(1+r)^n]/[(1+r)^n – 1], where P is the loan principal, r is the monthly interest rate, and n is total payments. This gives you the fixed monthly amount covering principal and interest." },
    { question: "What is PMI and when do I need it?", answer: "Private Mortgage Insurance (PMI) is required when your down payment is less than 20% of the home price. It typically costs 0.5–1% of the loan amount annually and protects the lender if you default. Once you reach 20% equity, you can request PMI removal." },
    { question: "Should I choose a 15-year or 30-year mortgage?", answer: "A 15-year mortgage has higher monthly payments but saves over 50% on total interest. A 30-year mortgage offers lower payments for better cash flow. Use our calculator to compare both scenarios with your specific numbers." },
    { question: "What is the difference between APR and interest rate?", answer: "The interest rate is the cost of borrowing the principal. APR includes the interest rate plus lender fees, points, and closing costs, giving you the true annual cost. Always compare APR when shopping lenders." },
    { question: "How do extra payments reduce my mortgage?", answer: "Extra payments go directly toward principal reduction, which reduces the total interest charged over the life of the loan. Even $100/month extra on a $350,000 mortgage can save over $30,000 in interest and cut years off the term." },
    { question: "What credit score do I need for the best mortgage rates?", answer: "A FICO score of 740+ typically qualifies for the best conventional mortgage rates. Scores of 620–739 still qualify but at higher rates. FHA loans accept scores as low as 580 with 3.5% down." },
  ],
  au: [
    { question: "How are Australian mortgage repayments calculated?", answer: "Australian mortgage repayments use the standard amortization formula with monthly compounding. Enter your loan amount, interest rate, and term (typically 25–30 years) to calculate your fixed monthly repayment including principal and interest." },
    { question: "What is LMI and how much does it cost?", answer: "Lender's Mortgage Insurance (LMI) is required when your deposit is less than 20% (LVR above 80%). LMI is a one-off premium ranging from $10,000 to $40,000+ depending on the loan size and LVR. It protects the lender, not you." },
    { question: "How does the RBA cash rate affect my mortgage?", answer: "The RBA cash rate is the baseline for variable home loan rates. When the RBA raises or lowers the rate, banks typically pass the change to variable rate borrowers. Fixed rates are influenced by bond market expectations." },
    { question: "What is an offset account and how does it save money?", answer: "An offset account is a transaction account linked to your mortgage. The balance offsets your loan principal for interest calculations. For example, $50,000 in your offset on a $500,000 mortgage means you only pay interest on $450,000." },
    { question: "Can I access the First Home Super Saver Scheme?", answer: "The FHSS scheme lets first home buyers withdraw voluntary super contributions (up to $15,000/year, $50,000 total) for a home deposit. Contributions receive concessional tax treatment, making it a tax-effective way to save." },
    { question: "Should I choose a fixed or variable rate in Australia?", answer: "Variable rates move with the RBA and offer flexibility (offset, redraw, extra repayments). Fixed rates provide payment certainty for 1–5 years but may have restrictions. Many Australian borrowers split their loan between fixed and variable portions." },
  ],
  ca: [
    { question: "How are Canadian mortgage payments calculated?", answer: "Canadian mortgages use semi-annual compounding (not monthly), as required by law. The calculator converts the annual rate to an effective monthly rate using this convention, giving you accurate monthly payment figures." },
    { question: "What is the CMHC mortgage insurance premium?", answer: "CMHC insurance is required for down payments between 5% and 19.99%. Premiums range from 2.8% to 4% of the mortgage amount, added to the principal. For a $500,000 mortgage with 5% down, the premium is approximately $19,000." },
    { question: "How does the Canadian mortgage stress test work?", answer: "All borrowers must qualify at the higher of their contract rate plus 2% or the Bank of Canada's qualifying rate. This ensures you can handle rate increases. It affects your maximum borrowing amount, not your actual payment." },
    { question: "What is the difference between mortgage term and amortization?", answer: "The amortization period is the total time to pay off the mortgage (typically 25 years). The mortgage term is how long your current rate is locked (usually 1–5 years). At term end, you renew at the current rate." },
    { question: "Should I make a 20% down payment in Canada?", answer: "A 20% down payment eliminates CMHC insurance (saving 2.8–4% of the mortgage) and allows up to 30-year amortization. However, 5% down is the legal minimum for homes under $500,000. Between $500,000 and $999,999, 10% is required on the portion above $500,000." },
    { question: "What is the First Home Savings Account (FHSA)?", answer: "The FHSA lets first-time Canadian home buyers save up to $8,000/year ($40,000 lifetime) with tax-deductible contributions and tax-free withdrawals for a home purchase. It combines the best features of RRSP and TFSA for housing savings." },
  ],
};

const loanFAQs: Record<string, FAQItem[]> = {
  us: [
    { question: "How do I calculate my monthly loan payment?", answer: "Enter your loan amount, annual interest rate (APR), and term in years. The calculator applies the amortization formula to determine your fixed monthly payment, including both principal and interest portions." },
    { question: "What types of loans can I calculate?", answer: "This calculator works for personal loans, auto loans, student loans, home improvement loans, and any fixed-rate installment loan. Enter the borrowed amount, rate, and term for instant results." },
    { question: "What is a good personal loan rate in the US?", answer: "Excellent credit (750+) typically qualifies for rates of 6–10%. Good credit (670–749) sees 10–15%. Fair credit (580–669) may face 15–25%. Rates also depend on the lender, loan amount, and term." },
    { question: "Should I choose a shorter or longer loan term?", answer: "Shorter terms mean higher monthly payments but significantly less total interest. A $20,000 loan at 8%: 3-year term costs $2,518 in interest vs $4,332 for 5 years. Choose the shortest term you can comfortably afford." },
    { question: "What is the difference between secured and unsecured loans?", answer: "Secured loans are backed by collateral (car, home equity) and offer lower rates. Unsecured loans (personal loans) rely on creditworthiness and have higher rates but don't risk asset seizure." },
    { question: "Can I pay off my loan early without penalties?", answer: "Many US lenders allow early payoff without penalties, but some charge prepayment fees. Check your loan agreement. Federal student loans never have prepayment penalties. Always ask before signing." },
  ],
  au: [
    { question: "How are Australian loan repayments calculated?", answer: "Loan repayments are calculated using standard amortization. Enter the loan amount in AUD, the annual interest rate, and the term. The calculator computes your fixed monthly repayment, total interest, and full cost." },
    { question: "What is a comparison rate in Australia?", answer: "The comparison rate includes the interest rate plus most fees and charges, calculated on a $30,000 loan over 5 years. It gives a more accurate picture of total cost but may differ for your specific loan amount and term." },
    { question: "Should I get a secured or unsecured car loan?", answer: "Secured car loans (using the vehicle as security) offer lower rates — typically 5–8% vs 8–15% for unsecured. However, the lender can repossess the car if you default. Consider your financial stability." },
    { question: "What credit score do I need for a personal loan in Australia?", answer: "A credit score above 700 (Equifax) gives access to the best rates. Scores of 500–699 still qualify with most lenders but at higher rates. Below 500, options are limited to specialist lenders." },
    { question: "Can I make extra repayments on my personal loan?", answer: "Most variable-rate personal loans allow unlimited extra repayments. Some fixed-rate loans charge early repayment fees. Check with your lender — extra payments can save significant interest." },
    { question: "How do I compare loan offers from different Australian lenders?", answer: "Compare the comparison rate (not just the advertised rate), total cost of the loan, fees (establishment, monthly, early exit), and loan features. Use this calculator with each offer's specific numbers." },
  ],
  ca: [
    { question: "How are Canadian loan payments calculated?", answer: "Canadian personal and auto loan payments use monthly compounding (unlike mortgages which use semi-annual). Enter the loan amount in CAD, interest rate, and term to see your fixed monthly payment and total cost." },
    { question: "What are typical personal loan rates in Canada?", answer: "Canadian personal loan rates in 2025 range from 6% to 30% depending on creditworthiness. Banks offer 7–12% for good credit, while online lenders may offer 6–36%. Credit unions often provide competitive rates." },
    { question: "Should I get a car loan from a dealer or bank?", answer: "Bank or credit union pre-approval gives you negotiating power. Dealer financing may offer promotional rates (even 0%) but often includes costly add-ons. Compare the total cost, not just the monthly payment." },
    { question: "Can I pay off my loan early in Canada?", answer: "Most Canadian personal loans allow early payoff, but some charge a prepayment penalty (typically 1–3 months' interest). Check your loan agreement. Early payoff saves interest but confirm there are no fees." },
    { question: "How does my credit score affect loan rates in Canada?", answer: "Equifax and TransUnion Canada provide credit scores from 300–900. Scores above 750 get the best rates. 650–749 is considered good. Below 650, expect higher rates or may need a co-signer." },
    { question: "What is the total cost of borrowing disclosure?", answer: "Canadian law requires lenders to disclose the total cost of borrowing — the sum of all interest and fees over the loan term. This makes it easy to compare offers on a true cost basis." },
  ],
};

const interestFAQs: Record<string, FAQItem[]> = {
  us: [
    { question: "What is compound interest and how does it work?", answer: "Compound interest is calculated on your initial principal plus all previously earned interest. This creates exponential growth — your interest earns interest. The formula is A = P(1 + r/n)^(nt)." },
    { question: "How does compounding frequency affect my returns?", answer: "More frequent compounding produces higher returns. $10,000 at 5% for 10 years yields: $16,289 (annual), $16,386 (monthly), $16,487 (daily). The difference is modest but meaningful over long periods." },
    { question: "What are the best savings rates in the US right now?", answer: "High-yield savings accounts currently offer 4–5% APY, significantly more than traditional banks (0.01–0.5%). Online banks and credit unions typically offer the highest rates. CDs may offer even higher fixed rates." },
    { question: "How does the Rule of 72 work?", answer: "Divide 72 by your annual interest rate to estimate doubling time. At 6% your money doubles in 12 years. At 8% it doubles in 9 years. At 12% it doubles in 6 years. It's a quick mental estimation tool." },
    { question: "What is the difference between APR and APY?", answer: "APR is the stated annual rate without compounding. APY includes the effect of compounding frequency. A 5% APR compounded monthly yields 5.12% APY. Always compare APY for savings products." },
    { question: "Should I invest or save in a high-yield account?", answer: "For short-term goals (under 3–5 years) or emergency funds, high-yield savings offers safety with FDIC protection. For long-term wealth building, investments typically outperform savings despite higher volatility." },
  ],
  au: [
    { question: "How does compound interest work on Australian savings?", answer: "Compound interest calculates returns on your principal plus accumulated interest. Australian savings accounts and term deposits typically compound daily or monthly, maximizing growth compared to annual compounding." },
    { question: "What are the best term deposit rates in Australia?", answer: "Australian term deposit rates in 2025 range from 4% to 5.5% depending on the term length and institution. Credit unions and online banks often offer higher rates than the Big 4 banks." },
    { question: "How does superannuation use compound interest?", answer: "Super contributions compound over decades of working life. Historical returns of 7–9% annually, combined with employer contributions of 11.5%, mean compounding turns modest contributions into substantial retirement balances." },
    { question: "Is my savings protected in Australian banks?", answer: "The Financial Claims Scheme (FCS) protects deposits up to $250,000 per person per Authorised Deposit-taking Institution. This covers banks, building societies, and credit unions regulated by APRA." },
    { question: "What is a bonus saver account?", answer: "Bonus saver accounts offer a higher rate when monthly conditions are met (e.g., deposit $200, make no withdrawals). The base rate is low, but the bonus rate can reach 5%+. Check conditions carefully." },
    { question: "How are interest earnings taxed in Australia?", answer: "Interest income is added to your taxable income and taxed at your marginal rate. You must declare all interest to the ATO. A Tax File Number (TFN) declaration to your bank prevents withholding at the highest rate." },
  ],
  ca: [
    { question: "How does compound interest work on Canadian savings?", answer: "Compound interest grows your savings by calculating returns on your principal plus all previously earned interest. Canadian GICs and savings accounts typically compound daily or monthly." },
    { question: "What are the best GIC rates in Canada?", answer: "Canadian GIC rates in 2025 range from 3.5% to 5.5% depending on term length. Online banks, credit unions, and smaller institutions typically offer the highest rates. CDIC coverage applies up to $100,000." },
    { question: "How does a TFSA benefit from compound interest?", answer: "All growth inside a TFSA — interest, dividends, capital gains — is completely tax-free. This means 100% of your compound interest earnings stay in your account, unlike taxable accounts where you lose a portion each year." },
    { question: "What is the TFSA contribution limit?", answer: "The 2025 TFSA contribution limit is $7,000, with cumulative unused room from previous years. If you were 18+ in 2009, total lifetime room is $95,000. Contributions are not tax-deductible, but all growth is tax-free." },
    { question: "Should I use a GIC or savings account?", answer: "GICs offer guaranteed higher rates for a locked term (typically 1–5 years). Savings accounts offer lower rates but full liquidity. Use GICs for money you won't need, savings accounts for emergency funds." },
    { question: "How is interest income taxed in Canada?", answer: "Interest income is taxed at your full marginal rate — the highest-taxed investment income type. That's why sheltering interest-bearing investments inside TFSAs and RRSPs is so tax-efficient." },
  ],
};

export const getFAQs = (calcType: CalculatorType, countryCode: string): FAQItem[] => {
  const faqMap: Partial<Record<CalculatorType, Record<string, FAQItem[]>>> = {
    "mortgage-calculator": mortgageFAQs,
    "loan-calculator": loanFAQs,
    "interest-calculator": interestFAQs,
  };
  return faqMap[calcType]?.[countryCode] || [];
};
