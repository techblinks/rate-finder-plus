export interface FaqLink {
  /** Substring inside `answer` to wrap with an internal link. First match wins. */
  text: string;
  /** Internal route (relative path). External links are not used here on purpose. */
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  /**
   * Internal links to inject into the rendered answer. JSON-LD still emits the
   * plain `answer` string so we don't pollute the schema with markup.
   */
  links?: FaqLink[];
}

export const FAQS: Record<string, FaqItem[]> = {
  home: [
    {
      question: "How accurate is the mortgage calculator?",
      answer:
        "Calcy's mortgage calculator uses your loan amount, interest rate, and loan term to calculate principal and interest repayments. Results are estimates — your actual repayments may vary based on your lender's fees and rate adjustments.",
      links: [{ text: "mortgage calculator", href: "/mortgage-calculator" }],
    },
    {
      question: "Does Calcy cover all Australian states?",
      answer:
        "Yes. Calcy supports all 8 Australian states and territories for stamp duty calculations, including state-specific first home buyer exemptions and concessions.",
      links: [{ text: "stamp duty calculations", href: "/stamp-duty-calculator" }],
    },
    {
      question: "Is Calcy free to use?",
      answer:
        "Yes, all Calcy calculators are completely free. No account, no email address, and no subscription required.",
    },
    {
      question: "What is the current RBA cash rate?",
      answer:
        "The current RBA cash rate is {{rbaCashRate}}% as of May 2026, following three consecutive hikes in February, March, and May 2026.",
    },
    {
      question: "What is LMI?",
      answer:
        "Lender's Mortgage Insurance (LMI) is a one-off insurance premium charged by lenders when your deposit is less than 20% of the property value. It protects the lender — not you — if you default on the loan.",
      links: [{ text: "Lender's Mortgage Insurance (LMI)", href: "/lmi-calculator" }],
    },
  ],
  mortgage: [
    {
      question: "What is the average mortgage repayment in Australia in 2026?",
      answer:
        "The average Australian home loan is $736,257 with an average interest rate of 5.50% p.a., resulting in a monthly repayment of approximately $4,189 over 30 years. Your repayment will vary based on your loan amount, interest rate, and loan term.",
      links: [{ text: "monthly repayment", href: "/mortgage-calculator" }],
    },
    {
      question: "What is the current RBA cash rate in Australia?",
      answer:
        "The RBA cash rate is {{rbaCashRate}}% as of May 2026, following the 25bps hike on 5 May 2026. The cash rate influences variable home loan interest rates. The average owner-occupier rate is currently around 6.39% p.a.",
      links: [{ text: "variable home loan", href: "/loan-comparison-calculator" }],
    },
    {
      question: "What is the difference between monthly and fortnightly repayments?",
      answer:
        "Fortnightly repayments (half your monthly amount, paid every two weeks) result in 26 half-payments per year — equivalent to 13 monthly payments. This extra payment each year reduces your balance faster and can save tens of thousands in interest over a 30-year loan.",
      links: [{ text: "extra payment", href: "/extra-repayments-calculator" }],
    },
    {
      question: "What is LMI and when do I need to pay it?",
      answer:
        "Lender's Mortgage Insurance (LMI) protects the lender if you default. It is required when your deposit is less than 20% of the property value (LVR above 80%). LMI can add thousands to your upfront costs but allows you to buy with a smaller deposit.",
      links: [{ text: "Lender's Mortgage Insurance (LMI)", href: "/lmi-calculator" }],
    },
    {
      question: "Can I make extra repayments on my Australian home loan?",
      answer:
        "Most variable rate home loans allow unlimited extra repayments without penalty. Fixed rate loans typically cap extra repayments at $10,000–$20,000 per year. Making extra repayments reduces your principal faster, cutting years off your loan.",
      links: [{ text: "extra repayments", href: "/extra-repayments-calculator" }],
    },
    {
      question: "What does an amortisation schedule show?",
      answer:
        "An amortisation schedule shows how each repayment is split between interest and principal over the life of your loan. In the early years, most of each repayment is interest. By the final years, nearly all of it reduces your principal.",
      links: [{ text: "amortisation schedule", href: "/mortgage-calculator" }],
    },
    {
      question: "How long does it take to pay off a $650,000 mortgage?",
      answer:
        "A $650,000 mortgage at 5.50% p.a. over a standard 30-year term will be fully paid off in 30 years. Making fortnightly instead of monthly repayments can cut approximately 3–4 years off the term. Adding extra repayments reduces this further.",
      links: [
        { text: "fortnightly instead of monthly repayments", href: "/mortgage-calculator" },
        { text: "extra repayments", href: "/extra-repayments-calculator" },
      ],
    },
    {
      question:
        "Should I put my savings in an offset account or pay down the loan directly?",
      answer:
        "For most variable-rate borrowers, the offset wins. The interest savings are mathematically identical — $1 in offset reduces interest the same as $1 paid off principal — but the offset keeps your money fully accessible if you lose your job, have a baby, or face an emergency. Money paid directly onto the loan typically requires a redraw request, which can be slow or restricted. Plus, the implicit return on offset money is tax-free (you're avoiding interest, not earning income), so it usually beats a high-interest savings account on an after-tax basis.",
      links: [{ text: "offset account modeling", href: "/mortgage-calculator" }],
    },
    {
      question:
        "How much can an offset account save on a $650,000 mortgage at 6.14%?",
      answer:
        "A $50,000 starting offset balance on a $650,000 loan at 6.14% over 30 years saves roughly $150,000 in interest and shaves about 4 years off the term. Adding $1,500/month into the offset alongside that pushes savings to around $250,000 and 7+ years off the loan. Calcy's offset modeller runs the same month-by-month simulation lenders use, so the figure matches what a Commonwealth Bank, Westpac, or Bankwest broker would quote.",
      links: [{ text: "offset modeller", href: "/mortgage-calculator" }],
    },
    {
      question: "Does an offset account change my monthly repayment?",
      answer:
        "No. Your contractual monthly P&I repayment stays the same. The offset reduces the interest portion of each repayment so a larger share goes to principal — that is why the loan is paid off sooner. The 'effective rate' figure shown next to the offset result is your headline rate weighted by the average offset position over the life of the loan.",
    },
    {
      question: "Is an offset account the same as a redraw facility?",
      answer:
        "No. Redraw lets you pull back extra repayments you've already made, but access can be slow, capped, or restricted by the lender — and the rules can change. An offset account is a separate everyday transaction account you control like any bank account. Dollar-for-dollar the interest saving is identical, but offset is more flexible, and it's clearly preferable if the property might later become an investment, because redrawn funds can complicate the tax-deductibility of the loan interest.",
    },
  ],
  stampDuty: [
    {
      question: "How much is stamp duty on a $700,000 property in NSW?",
      answer:
        "Stamp duty on a $700,000 property in NSW is approximately $26,857 for an owner-occupier. First home buyers purchasing under $800,000 are exempt from stamp duty in NSW.",
      links: [{ text: "stamp duty in NSW", href: "/stamp-duty-calculator/nsw" }],
    },
    {
      question: "Do first home buyers pay stamp duty in Australia?",
      answer:
        "First home buyer stamp duty concessions vary by state. NSW: exempt up to $800k. VIC: exempt up to $600k. QLD: exempt up to $500k. WA: exempt up to $430k. Always confirm current thresholds with your state revenue office.",
      links: [
        { text: "NSW", href: "/stamp-duty-calculator/nsw" },
        { text: "VIC", href: "/stamp-duty-calculator/vic" },
        { text: "QLD", href: "/stamp-duty-calculator/qld" },
        { text: "WA", href: "/stamp-duty-calculator/wa" },
      ],
    },
    {
      question: "When do you pay stamp duty in Australia?",
      answer:
        "Stamp duty is paid at settlement — typically 30–90 days after signing the contract of sale. Your conveyancer or solicitor will organise payment on your behalf. You must have the funds available before settlement.",
      links: [{ text: "Stamp duty", href: "/stamp-duty-calculator" }],
    },
    {
      question: "Is stamp duty the same in every Australian state?",
      answer:
        "No. Stamp duty rates and thresholds vary significantly between states and territories. NSW and VIC have the highest rates. QLD and WA have lower rates for most price ranges. This calculator shows the correct rate for each state.",
      links: [{ text: "calculator", href: "/stamp-duty-calculator" }],
    },
    {
      question: "Can stamp duty be added to my home loan?",
      answer:
        "In most cases, no. Stamp duty must be paid in cash at settlement and cannot be added to your mortgage. This is why it is important to budget for stamp duty as a separate upfront cost when saving your deposit.",
      links: [{ text: "added to your mortgage", href: "/borrowing-power-calculator" }],
    },
    {
      question: "How much is stamp duty in the ACT?",
      answer:
        "Eligible buyers in the ACT pay zero stamp duty regardless of property value through the Home Buyer Concession Scheme. The scheme is income-tested and available to any eligible buyer who will occupy the property as their principal place of residence, not just first home buyers.",
    },
    {
      question: "Do first home buyers pay stamp duty in the ACT?",
      answer:
        "First home buyers in the ACT do not pay stamp duty if they qualify for the Home Buyer Concession Scheme. Unlike other states, the ACT scheme is not limited to first home buyers — any eligible buyer can receive the full exemption, provided they meet income thresholds and occupancy requirements.",
    },
    {
      question: "What is the ACT Home Buyer Concession Scheme?",
      answer:
        "The ACT Home Buyer Concession Scheme is an income-tested program that provides a full stamp duty exemption on any property value for eligible buyers who will occupy the home as their principal place of residence. The ACT does not offer a First Home Owner Grant — the stamp duty exemption is the primary benefit.",
    },
    {
      question: "What are the income limits for the ACT stamp duty exemption?",
      answer:
        "The ACT Home Buyer Concession Scheme income caps are approximately $160,000 per year for single applicants and $215,000 per year for couples or joint applicants. These thresholds are indexed annually. Your total gross income must not exceed the relevant cap in the financial year before purchase.",
    },
  ],
  borrowingPower: [
    {
      question: "How much can I borrow on a $100,000 salary in Australia?",
      answer:
        "On a $100,000 gross salary with typical living expenses and no other debts, you may be able to borrow approximately $450,000–$550,000. Lenders assess your borrowing capacity at a rate 3% above your loan rate (the APRA serviceability buffer). Use this calculator for a personalised estimate.",
      links: [{ text: "this calculator", href: "/borrowing-power-calculator" }],
    },
    {
      question: "What is the APRA serviceability buffer?",
      answer:
        "APRA requires all Australian lenders to assess your ability to repay a mortgage at least 3% above the loan's interest rate. For example, if your loan rate is 5.50%, the lender tests you at 8.50%. This reduces your maximum borrowing capacity but protects you from rate rises.",
      links: [{ text: "ability to repay a mortgage", href: "/mortgage-calculator" }],
    },
    {
      question: "Do both incomes count when applying for a joint home loan?",
      answer:
        "Yes. Most lenders include both applicants' incomes in a joint application. However, they will also assess both applicants' liabilities and living expenses. This calculator allows you to enter a second income.",
      links: [{ text: "This calculator", href: "/borrowing-power-calculator" }],
    },
    {
      question: "How does a credit card affect my borrowing power?",
      answer:
        "Lenders assess your credit card limit — not just your balance — as a potential liability. APRA guidelines require lenders to assume you could draw the full limit and repay it at 3.8% per month. A $10,000 credit card limit can reduce your borrowing power by approximately $40,000–$50,000.",
      links: [{ text: "borrowing power", href: "/borrowing-power-calculator" }],
    },
  ],
  extraRepayments: [
    {
      question: "How much do extra repayments save on a mortgage?",
      answer:
        "On a $500,000 loan at 5.5% with 25 years remaining, paying an extra $500 per month saves approximately $119,000 in interest and cuts 6 years and 3 months off the loan term. The earlier you make extra repayments, the greater the total saving.",
      links: [{ text: "$500,000 loan", href: "/mortgage-calculator" }],
    },
    {
      question: "Is it better to make extra repayments weekly or monthly?",
      answer:
        "More frequent extra repayments save slightly more interest because the principal reduces sooner. However, the difference is modest — the AMOUNT of extra repayment matters far more than the frequency. Weekly $115 saves only marginally more than monthly $500.",
    },
    {
      question: "Can I make extra repayments on a fixed rate loan?",
      answer:
        "Most Australian fixed rate loans allow extra repayments up to $10,000–$20,000 per year. Above that limit, early repayment fees may apply. Variable rate loans typically allow unlimited extra repayments.",
      links: [{ text: "Variable rate loans", href: "/loan-comparison-calculator" }],
    },
    {
      question: "Should I put extra money into an offset account or make extra repayments?",
      answer:
        "Both reduce interest. Extra repayments permanently reduce the loan balance — funds aren't easily accessible again. An offset account holds savings separately while offsetting interest, keeping money accessible. If you need flexibility, an offset is generally better; if discipline is the priority, direct extra repayments work just as well.",
    },
    {
      question: "What is the effect of a lump sum repayment?",
      answer:
        "A one-off lump sum (tax return, bonus, inheritance) directly reduces principal. A $10,000 lump sum on a $500,000 loan at 5.5% with 25 years remaining saves approximately $18,000 in total interest and cuts ~9 months off the term — assuming no further extra repayments.",
    },
  ],
  lmi: [
    {
      question: "What is Lender's Mortgage Insurance (LMI)?",
      answer:
        "LMI is insurance that protects the lender (not you) if you default on your loan. It is typically required when your deposit is less than 20% of the property value — i.e. your LVR (Loan to Value Ratio) is above 80%. LMI is a one-time cost, usually capitalised into the loan.",
      links: [{ text: "capitalised into the loan", href: "/mortgage-calculator" }],
    },
    {
      question: "How much does LMI cost in Australia?",
      answer:
        "LMI costs depend on your loan size and LVR. For a $650,000 loan at 90% LVR, LMI is typically $7,000–$12,000. At 95% LVR, it can be $15,000–$20,000. The cost is paid once at settlement and is usually added to your loan balance.",
      links: [{ text: "loan size", href: "/borrowing-power-calculator" }],
    },
    {
      question: "Can I avoid paying LMI?",
      answer:
        "Yes — save a 20% deposit to bring your LVR to 80% or below. Alternatively, some lenders offer LMI waivers for certain professions (doctors, lawyers, accountants). First home buyers in some states may also qualify for government guarantee schemes that allow borrowing above 80% LVR without LMI.",
      links: [{ text: "20% deposit", href: "/borrowing-power-calculator" }],
    },
    {
      question: "Who provides LMI in Australia?",
      answer:
        "LMI in Australia is provided by two main insurers: Helia (formerly Genworth) and QBE. Your lender selects which insurer they use — you do not choose. The cost varies slightly between insurers.",
      links: [{ text: "LMI", href: "/lmi-calculator" }],
    },
  ],
  loanComparison: [
    {
      question: "What should I compare when choosing a home loan?",
      answer:
        "Compare the interest rate, comparison rate (which includes fees), loan term, repayment flexibility, offset account availability, and any ongoing fees. A loan with a lower rate but high fees can cost more than a slightly higher rate with no fees.",
      links: [
        { text: "repayment flexibility", href: "/extra-repayments-calculator" },
        { text: "loan", href: "/mortgage-calculator" },
      ],
    },
    {
      question: "What is a comparison rate?",
      answer:
        "A comparison rate combines the interest rate and most fees into a single percentage to help you compare loans. It is calculated on a $150,000 loan over 25 years. Always check the comparison rate alongside the advertised rate.",
      links: [{ text: "compare loans", href: "/loan-comparison-calculator" }],
    },
  ],
  rentVsBuy: [
    {
      question: "Is it better to rent or buy in Australia in 2026?",
      answer:
        "Whether it is better to rent or buy in Australia depends heavily on your local property market, how long you plan to stay, your available deposit, and what returns you could earn by investing instead. In markets with strong property price growth, buying tends to win over periods of 7–10 years or more. In markets with high property prices relative to rents, or when investment returns are high, renting and investing can generate comparable or better outcomes.",
      links: [{ text: "rent or buy", href: "/rent-vs-buy-calculator" }],
    },
    {
      question: "When does buying a home become cheaper than renting?",
      answer:
        "The break-even point — when buying becomes financially better than renting — varies depending on the property price, deposit size, interest rate, rent level, and assumed property growth. In typical Australian conditions (5% property growth, 7% investment returns, 6% mortgage rate), the break-even point is often between 7 and 12 years. Properties in high-growth areas break even sooner.",
      links: [{ text: "property price", href: "/stamp-duty-calculator" }],
    },
    {
      question: "What happens to my deposit if I keep renting?",
      answer:
        "Calcy's rent vs buy calculator models the renting scenario by assuming you invest your deposit (and the monthly difference between buying costs and rent) in a diversified investment portfolio earning your chosen return rate. This is the correct way to compare the two options — renting only makes financial sense if you invest the capital you would otherwise put into a property.",
      links: [{ text: "deposit", href: "/borrowing-power-calculator" }],
    },
    {
      question: "How much does property growth change the answer?",
      answer:
        "Property growth is the single largest input. Dropping the assumed annual growth rate from 5% to 3% can push the break-even point out by several years and, in some scenarios, mean renting and investing wins for the entire analysis period. Calcy's sensitivity table shows the break-even year across many combinations of growth and investment returns.",
    },
    {
      question: "Does this rent vs buy calculator include stamp duty and LMI?",
      answer:
        "Yes. Stamp duty is calculated for your selected Australian state (with first home buyer concessions where applicable) and LMI is automatically added if your deposit is below 20%. Conveyancing ($2,000) and a building inspection ($600) are also included in the upfront costs used in the comparison.",
      links: [
        { text: "stamp duty", href: "/stamp-duty-calculator" },
        { text: "LMI", href: "/lmi-calculator" },
      ],
    },
  ],
  refinance: [
    {
      question: "How much can I save by refinancing my home loan?",
      answer:
        "The saving depends on the difference between your current and new interest rate, your loan balance, and your remaining term. On a $500,000 loan with 25 years remaining, refinancing from 6.50% to 5.99% saves approximately $264 per month ($3,168 per year) and approximately $89,000 in total interest over the remaining term.",
      links: [{ text: "refinance calculator", href: "/refinance-calculator" }],
    },
    {
      question: "What are the costs of refinancing in Australia?",
      answer:
        "The main costs of refinancing in Australia include: discharge fee from your current lender ($150–$400), application or establishment fee at the new lender ($0–$600), property valuation fee ($0–$300), and potentially LMI if your LVR is above 80%. For fixed rate loans, break costs can be $5,000–$50,000+ depending on market conditions. Many lenders offer cashback incentives of $2,000–$4,000 to offset these costs.",
      links: [{ text: "LMI", href: "/lmi-calculator" }],
    },
    {
      question: "How do I know if refinancing is worth it?",
      answer:
        "Refinancing is generally worth it when your monthly saving is meaningful (at least $150–$200/month), the break-even period is under 24 months, you plan to hold the loan for at least 2–3 years after break-even, and LMI does not apply on the new loan. It is generally NOT worth it when you are on a fixed rate with significant break costs, your LVR is above 80% and LMI would apply, or you plan to sell within the break-even period.",
    },
    {
      question: "What is a refinance break-even period?",
      answer:
        "The refinance break-even period is the number of months it takes for your cumulative monthly savings to recover all the costs of switching loans. For example, if refinancing costs you $3,000 in fees and you save $264 per month, your break-even is approximately 12 months. Before that month you have spent more than you have saved; after it, every month is pure saving.",
    },
    {
      question: "Can I refinance a fixed rate home loan?",
      answer:
        "Yes, but you may face significant break costs. Australian lenders calculate break costs based on the difference between your contracted fixed rate and current wholesale market rates. If rates have fallen since you fixed, your break cost can be very high — sometimes $20,000 or more. If rates have risen since you fixed, break costs may be minimal or zero. Always request an exact break cost quote from your lender before deciding to refinance a fixed rate loan.",
      links: [{ text: "extra repayments", href: "/extra-repayments-calculator" }],
    },
  ],
};
