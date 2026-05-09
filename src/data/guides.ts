/**
 * Guide article catalogue. Each entry is the single source of truth for the
 * guide's metadata, body content, FAQs, and cross-links. Used by:
 *  - src/data/routes.ts (sitemap, prerender, SEO validator)
 *  - src/pages/GuidesIndex.tsx (hub listing)
 *  - src/pages/GuidePage.tsx (article shell)
 */
import type { FaqItem } from "./faqs";

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string };

export interface GuideSection {
  h2: string;
  blocks: GuideBlock[];
}

export interface GuideMeta {
  slug: string;
  title: string; // H1
  metaTitle: string;
  metaDescription: string;
  category: string;
  readMins: number;
  datePublished: string; // ISO date
  dateModified: string; // ISO date
  intro: string;
  sections: GuideSection[];
  keyTakeaways: string[];
  relatedCalculator: { to: string; label: string };
  relatedGuides: string[]; // slugs
  faqs: FaqItem[];
}

const p = (text: string): GuideBlock => ({ type: "p", text });
const h3 = (text: string): GuideBlock => ({ type: "h3", text });
const ul = (...items: string[]): GuideBlock => ({ type: "list", items });

export const GUIDES: GuideMeta[] = [
  // 1. STAMP DUTY
  {
    slug: "stamp-duty-australia-2026",
    title: "Stamp duty in every Australian state: 2026 complete guide",
    metaTitle: "Stamp Duty Calculator Australia 2026 — Rates for Every State | Calcy",
    metaDescription:
      "See exact stamp duty costs for every Australian state and territory in 2026. Includes first home buyer exemptions, concessions, and a free stamp duty calculator.",
    category: "Stamp duty",
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro:
      "Stamp duty is one of the biggest upfront costs when buying property in Australia — and it varies dramatically depending on where you buy, how much you pay, and whether you qualify for any exemptions. On a $650,000 home, stamp duty could cost you anywhere from $0 (if you're a first home buyer in certain states) to over $24,000. This 2026 guide covers stamp duty rates for every Australian state and territory, including first home buyer exemptions, concessions, and how to calculate your exact liability.",
    sections: [
      {
        h2: "What is stamp duty?",
        blocks: [
          p("Stamp duty (formally called transfer duty in most states) is a government tax applied when ownership of a property is transferred from a seller to a buyer. It is charged by state and territory governments — not the federal government — which is why rates differ so significantly across Australia."),
          p("The tax is calculated as a percentage of either the purchase price or the market value of the property, whichever is higher. On most residential purchases, you pay stamp duty on the purchase price."),
          p("Stamp duty applies to:"),
          ul(
            "Established homes",
            "New homes and off-the-plan purchases",
            "Vacant land",
            "Investment properties",
            "Some commercial properties",
          ),
        ],
      },
      {
        h2: "How stamp duty is calculated",
        blocks: [
          p("Most states use a tiered or progressive rate structure — similar to income tax. You pay a lower rate on the first portion of the property's value and a higher rate as the value increases."),
          p("For example, rather than paying a flat 4% on a $700,000 property, you might pay 1.4% on the first $100,000, 2.4% on the next $100,000, and so on up through the brackets."),
          p("This is why a simple percentage calculation will give you the wrong number — you need to apply the correct brackets for your specific state and property value. That's exactly what Calcy's stamp duty calculator does automatically."),
        ],
      },
      {
        h2: "Stamp duty rates by state — 2026",
        blocks: [
          h3("New South Wales"),
          p("NSW uses a progressive rate structure. For a property purchased for between $300,001 and $1,000,000, the duty is $8,990 plus $4.50 for every $100 over $300,000."),
          p("As a rough guide, a $650,000 home in NSW attracts approximately $24,457 in stamp duty for a non-first-home buyer."),
          p("NSW also offers an annual property tax (land tax) option for eligible buyers as an alternative to paying stamp duty upfront. This was introduced to improve affordability, particularly for first home buyers."),
          p("First home buyers in NSW are exempt from stamp duty on properties up to $800,000, and receive a concessional rate on properties between $800,000 and $1,000,000."),
          h3("Victoria"),
          p("Victoria's stamp duty rates are tiered and depend on the property value and whether it is your primary residence or an investment."),
          p("For a property valued between $130,001 and $960,000, the rate is $2,870 plus 6% of the value above $130,000. This makes Victoria one of the higher stamp duty states for mid-range and high-value properties."),
          p("First home buyers in Victoria receive a full exemption on properties up to $600,000, and a concession on properties valued between $600,001 and $750,000."),
          p("Victoria also offers a 50% stamp duty concession for eligible off-the-plan purchases of new homes."),
          h3("Queensland"),
          p("Queensland uses a straightforward tiered system. For properties between $540,001 and $1,000,000, the rate is $17,325 plus $4.50 for every $100 over $540,000."),
          p("On a $650,000 purchase in QLD, a standard buyer would pay approximately $22,275 in stamp duty."),
          p("First home buyers in Queensland receive a full concession on homes up to $500,000 and a partial concession on properties between $500,000 and $550,000. The home must be owner-occupied."),
          h3("South Australia"),
          p("South Australia calculates stamp duty using a tiered structure. For properties between $500,001 and $1,000,000, the rate is $21,330 plus $5.50 for every $100 over $500,000."),
          p("SA does not currently offer a blanket stamp duty exemption for first home buyers, but the First Home Owner Grant of $15,000 is available on new homes."),
          h3("Western Australia"),
          p("Western Australia offers some of the more favourable stamp duty rates for mid-range properties. For properties between $360,001 and $725,000, the duty is $11,090 plus $4.75 for every $100 over $360,000."),
          p("First home buyers in WA are exempt from stamp duty on properties up to $430,000 and receive a concession on properties between $430,001 and $530,000."),
          h3("Tasmania"),
          p("Tasmania's rates are lower than most eastern states. The rate for properties between $375,001 and $725,000 is $10,050 plus $3.50 for every $100 over $375,000."),
          p("First home buyers may be eligible for a 50% concession on stamp duty for established homes."),
          h3("Australian Capital Territory"),
          p("The ACT has moved to a progressive conveyance duty system based on the unimproved value of land. The ACT is phasing out stamp duty over 20 years as part of its tax reform agenda, replacing it with increased land tax."),
          p("For most residential transactions, the ACT's effective rate is lower than NSW and Victoria for comparable properties."),
          p("First home buyers in the ACT may be eligible for a full stamp duty concession under the Home Buyer Concession Scheme, subject to income caps."),
          h3("Northern Territory"),
          p("The Northern Territory has relatively lower property values compared to other states, and stamp duty rates reflect this. The NT also offers a First Home Owner Discount of up to $23,928.50 on eligible purchases."),
        ],
      },
      {
        h2: "First home buyer exemptions and concessions — 2026 summary",
        blocks: [
          {
            type: "table",
            headers: ["State/Territory", "Full exemption up to", "Concession up to", "Grant (new homes)"],
            rows: [
              ["NSW", "$800,000", "$1,000,000", "$10,000"],
              ["VIC", "$600,000", "$750,000", "$10,000"],
              ["QLD", "$500,000", "$550,000", "$30,000"],
              ["SA", "No exemption", "No exemption", "$15,000"],
              ["WA", "$430,000", "$530,000", "$10,000"],
              ["TAS", "50% concession", "—", "$30,000"],
              ["ACT", "Income-tested", "—", "—"],
              ["NT", "Up to $23,928.50 discount", "—", "$10,000"],
            ],
            caption: "Figures are indicative and subject to change. Always verify current thresholds with your state revenue office.",
          },
        ],
      },
      {
        h2: "When is stamp duty paid?",
        blocks: [
          p("In most states, stamp duty must be paid within 30 days of settlement. Your conveyancer or solicitor will typically arrange this as part of the settlement process. The funds are usually drawn from your own savings rather than your home loan — which is why it's important to budget for this upfront cost separately."),
          p("In some states, such as NSW and Victoria, you may be able to defer or waive stamp duty under specific programs. Your solicitor can advise whether you qualify."),
        ],
      },
      {
        h2: "Can stamp duty be added to your loan?",
        blocks: [
          p("In most cases, no. Stamp duty is an upfront government charge that must be paid at or before settlement, and lenders generally do not allow it to be capitalised into your home loan. This is why stamp duty is treated as part of your total deposit and upfront cost savings."),
          p("The exception is if you have enough equity or a high enough loan-to-value ratio that the lender considers the full transaction — in some cases, a guarantor loan or equity release from another property can cover upfront costs including stamp duty. This is worth discussing with a mortgage broker if you're short on cash savings."),
        ],
      },
    ],
    keyTakeaways: [
      "Stamp duty is a state-based tax — rates and exemptions vary significantly across Australia",
      "First home buyers can save tens of thousands through state-based exemptions and concessions",
      "On a $650,000 home, stamp duty can range from $0 (for eligible first home buyers in NSW or VIC) to $24,000+",
      "Stamp duty must typically be paid at settlement from your own funds — it generally cannot be added to your home loan",
      "Use Calcy's free stamp duty calculator to get an exact figure for your state and purchase price",
    ],
    relatedCalculator: { to: "/stamp-duty-calculator", label: "Try our Stamp Duty Calculator" },
    relatedGuides: ["first-home-buyer-grants-2026", "borrowing-power-australia"],
    faqs: [
      {
        question: "Do I pay stamp duty on a new home?",
        answer:
          "Yes, stamp duty applies to new homes as well as established properties. However, some states offer additional concessions or reduced rates on new construction and off-the-plan purchases.",
      },
      {
        question: "Does stamp duty apply if I'm buying with a partner?",
        answer:
          "Yes. Stamp duty is calculated on the full purchase price regardless of how many buyers are on the title. However, if one buyer is a first home buyer and the other is not, your eligibility for first home buyer exemptions may be affected — this varies by state.",
      },
      {
        question: "Is stamp duty tax deductible?",
        answer:
          "For owner-occupiers, stamp duty is not tax deductible. For investment properties, stamp duty is added to the cost base of the property and may reduce your capital gains tax liability when you eventually sell, rather than being deducted in the year of purchase.",
      },
      {
        question: "What happens if I don't pay stamp duty on time?",
        answer:
          "Late payment of stamp duty attracts interest and penalties. In most states, you have 30 days from settlement to pay. Your conveyancer will typically ensure this is handled on time as part of the settlement process.",
      },
      {
        question: "Can I get a refund on stamp duty?",
        answer:
          "In limited circumstances, yes. If a property contract is rescinded (cancelled) before settlement, you may be entitled to a refund. Some states also offer refunds if you discover you were eligible for a first home buyer exemption that wasn't applied. Contact your state revenue office for specific advice.",
      },
    ],
  },

  // 2. LMI
  {
    slug: "what-is-lmi",
    title: "What is LMI and how do you avoid it?",
    metaTitle: "What is LMI? Lender's Mortgage Insurance Explained (Australia) | Calcy",
    metaDescription:
      "LMI can add thousands to your home loan. Learn what Lender's Mortgage Insurance is, when it applies, and 4 strategies to avoid paying it in Australia.",
    category: "LMI",
    readMins: 6,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro:
      "Lender's Mortgage Insurance — commonly called LMI — is one of the most misunderstood costs in the Australian home buying process. Many first home buyers are surprised to discover it can add anywhere from $5,000 to $35,000 or more to the cost of their loan. The short answer: LMI protects the lender, not you. But understanding exactly how it works, when it applies, and how to avoid it can save you a significant amount of money.",
    sections: [
      {
        h2: "What is LMI?",
        blocks: [
          p("Lender's Mortgage Insurance is an insurance policy taken out by your lender — at your expense — when you borrow more than 80% of a property's value. In other words, when your deposit is less than 20%."),
          p("LMI is a one-off premium charged at the time your loan is approved. It is not an ongoing monthly cost, but it is a significant upfront expense that can come as a shock if you're not expecting it."),
          p("The two main LMI providers in Australia are Helia (formerly Genworth) and QBE. Your lender will choose which insurer they use — you have no say in this, and you cannot shop around for LMI the way you might compare building insurance."),
        ],
      },
      {
        h2: "Who does LMI protect?",
        blocks: [
          p("This is the most important thing to understand about LMI: it protects the lender, not you."),
          p("If you default on your loan and the bank repossesses and sells your property for less than the outstanding loan balance, LMI covers the lender's loss. You, as the borrower, remain liable for any shortfall even after an LMI claim is paid — the insurer may still pursue you for the difference."),
          p("Despite this, you pay the premium. This is simply the cost of borrowing with a deposit below 20%."),
        ],
      },
      {
        h2: "When does LMI apply?",
        blocks: [
          p("LMI is triggered when your Loan to Value Ratio (LVR) exceeds 80%. Your LVR is calculated as:"),
          p("LVR = Loan amount ÷ Property value × 100"),
          p("So if you're buying a $700,000 home and borrowing $595,000, your LVR is 85% — and LMI will apply."),
          p("The exact LMI premium increases the higher your LVR goes. Borrowing at 85% LVR costs significantly less in LMI than borrowing at 95% LVR."),
          p("Most lenders will lend up to a maximum of 95% LVR (meaning a 5% deposit), but some specialised products allow borrowing above this with additional requirements."),
        ],
      },
      {
        h2: "How much does LMI cost?",
        blocks: [
          p("LMI is not a fixed fee — it varies based on:"),
          ul(
            "Your loan amount",
            "Your LVR (the higher the LVR, the higher the LMI)",
            "The lender and insurer they use",
            "Whether you are an owner-occupier or investor",
          ),
          p("As a rough guide for owner-occupiers:"),
          {
            type: "table",
            headers: ["Property value", "Deposit", "LVR", "Approx. LMI premium"],
            rows: [
              ["$600,000", "$60,000 (10%)", "90%", "~$11,400"],
              ["$600,000", "$72,000 (12%)", "88%", "~$8,200"],
              ["$700,000", "$70,000 (10%)", "90%", "~$13,300"],
              ["$700,000", "$105,000 (15%)", "85%", "~$6,800"],
              ["$800,000", "$80,000 (10%)", "90%", "~$15,200"],
            ],
            caption: "Estimates only. Use Calcy's LMI calculator for an accurate figure based on your exact loan details.",
          },
        ],
      },
      {
        h2: "How LMI is calculated — real examples",
        blocks: [
          p("LMI premiums are calculated using a percentage rate applied to the loan amount. The rate depends on the LVR bracket."),
          h3("Example 1: $650,000 property, 10% deposit"),
          ul(
            "Deposit: $65,000",
            "Loan amount: $585,000",
            "LVR: 90%",
            "Approximate LMI rate: ~2.0% of loan amount",
            "Estimated LMI premium: ~$11,700",
          ),
          h3("Example 2: $650,000 property, 15% deposit"),
          ul(
            "Deposit: $97,500",
            "Loan amount: $552,500",
            "LVR: 85%",
            "Approximate LMI rate: ~1.2% of loan amount",
            "Estimated LMI premium: ~$6,630",
          ),
          p("The difference between saving a 10% deposit and a 15% deposit in this example is around $5,000 in LMI savings — plus you'd be borrowing less overall and paying less interest over the life of the loan."),
        ],
      },
      {
        h2: "Can LMI be added to your loan?",
        blocks: [
          p("Yes — in most cases, lenders allow you to capitalise LMI into your home loan rather than paying it upfront. This is called \"capitalising\" or \"adding LMI to your loan.\""),
          p("While this means you don't need to pay the premium in cash at settlement, it does increase your total loan balance and the total interest you'll pay over the life of the loan. A $12,000 LMI premium capitalised into a 30-year loan at 6% will cost you significantly more than $12,000 by the time the loan is paid off."),
        ],
      },
      {
        h2: "Four strategies to avoid LMI",
        blocks: [
          h3("1. Save a 20% deposit"),
          p("The most straightforward way to avoid LMI is to save until your deposit reaches 20% of the property's purchase price. At this point, your LVR is 80% and LMI no longer applies."),
          p("The trade-off is time. Saving a 20% deposit on a $700,000 home ($140,000) takes considerably longer than a 10% deposit ($70,000), and property prices may rise in the interim."),
          h3("2. Use a guarantor loan"),
          p("A family guarantee (also called a guarantor loan) allows a family member — usually a parent — to use equity in their own property to guarantee part of your loan. This can effectively reduce your LVR below 80% without you needing to save the full 20% deposit."),
          p("For example, if you have a 10% deposit but a parent guarantees 10% of the property value using their home equity, the lender may treat your effective LVR as 80% and waive LMI."),
          p("Guarantor loans carry risks for the guarantor — if you default, the lender can pursue their property. This arrangement should be entered into carefully and with independent legal advice for all parties."),
          h3("3. Use a profession-based LMI waiver"),
          p("Some lenders offer LMI waivers for certain high-income professions, even when the LVR exceeds 80%. Eligible professions typically include:"),
          ul(
            "Medical doctors and specialists",
            "Dentists and other healthcare professionals",
            "Lawyers and barristers",
            "Accountants (CPA/CA qualified)",
            "Some engineers and architects",
          ),
          p("Eligibility criteria, maximum loan amounts, and LVR limits vary by lender. If you work in one of these fields, it's worth specifically asking your lender or broker whether you qualify."),
          h3("4. Access government schemes"),
          p("The Australian government's Home Guarantee Scheme allows eligible buyers to purchase a home with as little as a 5% deposit without paying LMI. The government guarantees the remaining portion of the deposit (up to 15%) through Housing Australia."),
          p("Key programs within the scheme include:"),
          ul(
            "First Home Guarantee (for first home buyers, up to 35,000 places per year)",
            "Regional First Home Buyer Guarantee (for buyers in regional areas)",
            "Family Home Guarantee (for eligible single parents with as little as 2% deposit)",
          ),
          p("Places are limited and allocated each financial year. Eligibility requirements apply including income caps and property price limits that vary by location."),
        ],
      },
      {
        h2: "Is LMI ever worth paying?",
        blocks: [
          p("In some situations, paying LMI makes financial sense rather than waiting to save a larger deposit. Consider the following scenarios:"),
          p("Rising property market: If property prices in your target area are rising faster than you can save, waiting to avoid LMI may cost you more in additional property price appreciation than the LMI premium itself. In a market where prices rise 8% per year, a $700,000 home becomes $756,000 in twelve months."),
          p("Opportunity cost of savings: If you are currently paying high rent and the cost of LMI is less than the additional rent you would pay while waiting to save, entering the market sooner may be the better financial decision."),
          p("Stable market with fast saving: If you can save quickly and the market is flat, waiting to hit 20% is almost always the better financial outcome."),
          p("There is no universal answer — the right choice depends on your personal savings rate, local market conditions, and your timeline."),
        ],
      },
    ],
    keyTakeaways: [
      "LMI protects the lender, not you — but you pay the premium",
      "LMI applies when your deposit is less than 20% (LVR above 80%)",
      "LMI costs typically range from $6,000 to $35,000+ depending on loan size and LVR",
      "LMI can usually be added to your loan rather than paid upfront",
      "Four main ways to avoid LMI: 20% deposit, guarantor loan, profession waiver, or government scheme",
      "In some market conditions, paying LMI and buying sooner can be the smarter financial decision",
    ],
    relatedCalculator: { to: "/lmi-calculator", label: "Estimate your LMI now" },
    relatedGuides: ["borrowing-power-australia", "first-home-buyer-grants-2026"],
    faqs: [
      {
        question: "Is LMI the same as mortgage protection insurance?",
        answer:
          "No. These are two completely different products. LMI protects the lender if you default. Mortgage protection insurance is an optional product that protects you — the borrower — by covering your repayments if you lose your income due to illness, injury, or redundancy.",
      },
      {
        question: "Do I get my LMI refunded if I sell the property?",
        answer:
          "Generally, no. LMI premiums are non-refundable once your loan is settled. Some older policies had partial refund provisions, but most current LMI products do not offer refunds regardless of when you sell or refinance.",
      },
      {
        question: "Does LMI transfer to a new lender if I refinance?",
        answer:
          "No. LMI is not transferable. If you refinance to a new lender and your LVR is still above 80%, you may be required to pay a new LMI premium with the new lender.",
      },
      {
        question: "Can I claim LMI as a tax deduction?",
        answer:
          "For investment properties, LMI may be tax deductible — but it is typically deducted over the shorter of 5 years or the loan term, not in a single year. For owner-occupied properties, LMI is not tax deductible.",
      },
      {
        question: "What happens to LMI if I pay down my loan below 80% LVR?",
        answer:
          "Nothing — you do not receive a refund, but you also do not pay any additional LMI. Once paid, the LMI obligation is complete regardless of how much you subsequently pay off your loan.",
      },
    ],
  },

  // 3. BORROWING POWER
  {
    slug: "borrowing-power-australia",
    title: "How much can I borrow? Understanding borrowing power in Australia",
    metaTitle: "How Much Can I Borrow? Borrowing Power Explained Australia 2026 | Calcy",
    metaDescription:
      "Find out how Australian lenders calculate borrowing power, what factors affect it, and how to maximise yours. Includes free borrowing power calculator.",
    category: "Borrowing",
    readMins: 7,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro:
      "\"How much can I borrow?\" is the first question most Australians ask when they start thinking about buying a home. The frustrating reality is that borrowing power isn't a single fixed number. It varies between lenders, changes with interest rates, and shifts based on dozens of factors. This guide explains exactly how Australian lenders calculate borrowing power, what factors increase or decrease it, and practical steps you can take to maximise your limit before applying.",
    sections: [
      {
        h2: "What is borrowing power?",
        blocks: [
          p("Borrowing power (also called borrowing capacity or serviceability) is the maximum amount a lender is willing to lend you based on your financial situation. It is not a reflection of how much you can afford in a broader sense — it is specifically what a lender has assessed they are comfortable lending you under current responsible lending guidelines."),
          p("Your borrowing power determines your price ceiling. If a lender assesses your borrowing power at $550,000 and you have a $100,000 deposit, your maximum purchase price is approximately $650,000 (before accounting for stamp duty and purchase costs)."),
          p("Understanding borrowing power before you start your property search is one of the most important steps in the home buying process."),
        ],
      },
      {
        h2: "How lenders calculate your borrowing limit",
        blocks: [
          p("Australian lenders use a serviceability assessment to calculate your borrowing power. The core question is: can you comfortably afford the repayments on this loan at a stressed interest rate?"),
          p("The lender looks at your gross income, deducts your committed expenses and living costs, and determines what monthly repayment you can sustain. They then work backwards from that repayment to calculate the maximum loan amount."),
          p("The formula in simplified terms:"),
          ul(
            "Calculate your net monthly income (after tax)",
            "Deduct your monthly committed expenses (existing debts, credit card limits, living costs)",
            "The remaining figure is your assessed repayment capacity",
            "Calculate the maximum loan where repayments fit within that capacity — at the stressed rate, not the actual rate",
          ),
          p("This is why your borrowing power can be lower than you expect even when you have a healthy income. Large existing debts, high credit card limits, or significant living expenses all reduce the amount left over for new loan repayments."),
        ],
      },
      {
        h2: "The serviceability buffer — what it is and why it matters",
        blocks: [
          p("Since 2021, APRA (the Australian Prudential Regulation Authority) requires banks to assess whether borrowers can afford their loan repayments at their actual interest rate plus a 3% buffer."),
          p("This means if the actual loan rate is 6.00%, the lender assesses you at 9.00%."),
          p("At the time of writing with rates around 6.0–6.5%, this puts the assessment rate at approximately 9.0–9.5%. This is significantly higher than the actual repayment you'll make, which is why many borrowers find their assessed borrowing power lower than expected."),
          p("The buffer exists to protect borrowers from being overleveraged if rates rise in the future."),
          p("Practical impact: On a $600,000 loan at a 6% actual rate, your repayment is approximately $3,597 per month. At the 9% assessment rate, the lender models your repayment at approximately $4,828 per month. Your borrowing capacity is calculated against the higher figure."),
        ],
      },
      {
        h2: "Key factors that affect your borrowing power",
        blocks: [
          h3("Income"),
          p("Gross income is the starting point. Higher income means higher capacity. The type of income also matters — lenders treat different income sources differently."),
          h3("Existing debts"),
          p("Every existing debt reduces your borrowing power. A $20,000 car loan, a $15,000 personal loan, and a $10,000 credit card balance all have minimum repayments that consume part of your assessed repayment capacity. Clearing these before applying meaningfully increases your borrowing power."),
          h3("Credit card limits"),
          p("This is one of the most overlooked factors. Lenders assess you on your credit card limit, not your current balance. A $20,000 credit card limit is treated as a potential liability even if the balance is $0. A single unused credit card with a $20,000 limit can reduce your borrowing power by $100,000 or more."),
          h3("Number of dependants"),
          p("Each dependant (child) reduces your assessed borrowing power. Lenders use the Household Expenditure Measure (HEM) as a benchmark for living costs, and this figure increases with each dependant."),
          h3("Employment type"),
          p("Full-time permanent employment is treated most favourably. Casual, contract, and self-employed income is assessed more conservatively — typically requiring 2 years of tax returns and potentially only using a lower average of those years."),
          h3("Interest rate environment"),
          p("When rates rise, borrowing power falls — even if your income and expenses stay the same. The higher the assessment rate (actual rate + 3% buffer), the lower the maximum loan the lender will approve."),
        ],
      },
      {
        h2: "What lenders include as income",
        blocks: [
          p("Most lenders will include the following income types:"),
          ul(
            "Base salary (100%)",
            "Regular overtime (usually 80% of the average over 2 years)",
            "Shift allowances and regular penalty rates (usually 80%)",
            "Bonuses (usually 80% of the 2-year average, if demonstrably consistent)",
            "Rental income from investment properties (usually 80% of gross rental)",
            "Government payments such as Family Tax Benefit Part A and B (100%)",
            "Dividends and investment income (if consistent and evidenced)",
            "Self-employment income (averaged over 2 years using tax returns)",
          ),
          p("What lenders generally do not include:"),
          ul(
            "Overtime that is not regular and consistent",
            "One-off bonuses",
            "Gifts or inheritances",
            "Gambling winnings",
            "Income that cannot be verified with documentation",
          ),
        ],
      },
      {
        h2: "What lenders include as expenses",
        blocks: [
          p("Lenders assess your committed monthly expenses against benchmarks. They will typically use the higher of your declared expenses or the Household Expenditure Measure (HEM) benchmark for your situation."),
          p("Committed expenses that directly reduce your borrowing power include:"),
          ul(
            "Existing loan repayments (home loans, car loans, personal loans)",
            "Minimum repayments on all credit cards and buy-now-pay-later accounts",
            "HECS/HELP debt repayments (calculated as a % of your income based on current ATO thresholds)",
            "Child support and maintenance payments",
            "Ongoing rental payments if applicable",
          ),
          p("Living expense benchmarks used by lenders are based on your household type and are regularly updated. If your declared expenses are below the HEM benchmark, the lender will use the benchmark."),
        ],
      },
      {
        h2: "How to increase your borrowing power",
        blocks: [
          h3("Pay down or close existing debts"),
          p("Every dollar of existing debt reduces your borrowing capacity. Prioritise paying off personal loans, car loans, and credit cards before applying for a home loan."),
          h3("Reduce or cancel unused credit cards"),
          p("Cancel credit cards you don't use and reduce limits on cards you do use before applying. A credit card limit reduction the month before your application can meaningfully increase your assessed borrowing power."),
          h3("Pay off or manage your HECS debt"),
          p("HECS repayments are compulsory once your income exceeds the minimum repayment threshold, and lenders factor these into your serviceability assessment."),
          h3("Increase your income"),
          p("If you're due for a salary review, negotiating a pay increase before applying (and having it reflected in at least one payslip) increases your assessed income."),
          h3("Apply with a partner"),
          p("Two incomes are assessed together in a joint application. Applying jointly with a partner — assuming both incomes are stable — can significantly increase your combined borrowing power compared to applying individually."),
          h3("Avoid major financial changes before applying"),
          p("Changing jobs, making large purchases on credit, or taking on new debts in the months before applying can negatively affect your application."),
          h3("Choose the right lender"),
          p("Borrowing power calculations vary between lenders — sometimes significantly. The difference between lenders can sometimes be $50,000–$150,000 on the same financial profile."),
        ],
      },
      {
        h2: "Borrowing power vs deposit — which limits you?",
        blocks: [
          p("Both can limit your maximum purchase price, but in different ways."),
          p("Your borrowing power sets the ceiling on your loan amount. Your deposit sets the minimum you need to bring to the table. Together, they define your price range."),
          p("For example: with a borrowing power of $550,000 and a deposit of $80,000, your maximum purchase price is approximately $630,000 (before upfront costs)."),
          p("In most cases for first home buyers, the deposit is the binding constraint in affordable markets and borrowing power becomes the constraint in higher-value markets."),
        ],
      },
    ],
    keyTakeaways: [
      "Borrowing power is calculated based on your income, expenses, existing debts, and a 3% serviceability buffer above the actual rate",
      "Credit card limits — not balances — reduce your borrowing power significantly",
      "Closing unused credit cards and paying down debts are the fastest ways to increase your limit",
      "HECS debt is factored into assessments and reduces your capacity",
      "Borrowing power varies between lenders — a broker can find the most favourable assessment for your profile",
      "Use Calcy's free borrowing power calculator to get an estimate based on your actual numbers",
    ],
    relatedCalculator: {
      to: "/borrowing-power-calculator",
      label: "Calculate your borrowing power",
    },
    relatedGuides: ["fixed-vs-variable-rate", "what-is-lmi"],
    faqs: [
      {
        question: "Does getting pre-approval affect my credit score?",
        answer:
          "A formal pre-approval involves a credit check which creates an enquiry on your credit file. Multiple enquiries in a short period can slightly reduce your credit score. A pre-qualification or indicative assessment from a broker may be done without a formal credit check.",
      },
      {
        question: "How long does a borrowing power assessment take?",
        answer:
          "An online indicative estimate takes seconds using a calculator like Calcy's. A formal pre-approval from a lender typically takes 3–5 business days depending on the lender and the complexity of your application.",
      },
      {
        question: "Does my borrowing power change if interest rates change?",
        answer:
          "Yes — borrowing power and interest rates move in opposite directions. When the RBA raises rates, borrowing power decreases. When rates fall, borrowing power increases.",
      },
      {
        question: "Can I borrow more by using an offset account?",
        answer:
          "An offset account reduces the interest you pay on your loan but does not increase your assessed borrowing power. Lenders calculate your capacity based on the full loan amount, not the effective balance after offset.",
      },
      {
        question: "What if my borrowing power is less than I need?",
        answer:
          "Save a larger deposit; reduce existing debts to improve serviceability; apply with a co-borrower; target a lower purchase price; or wait for rates to fall (which increases borrowing power). A mortgage broker can help you identify which approach is most effective.",
      },
    ],
  },

  // 4. FHB GRANTS
  {
    slug: "first-home-buyer-grants-2026",
    title: "First home buyer grants and exemptions by state in 2026",
    metaTitle: "First Home Buyer Grants Australia 2026 — Every State Explained | Calcy",
    metaDescription:
      "Complete guide to first home buyer grants, stamp duty exemptions, and government schemes in every Australian state and territory in 2026.",
    category: "First home buyers",
    readMins: 9,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro:
      "Buying your first home in Australia comes with a genuine financial advantage that many buyers don't fully understand. Across Australia, first home buyers have access to a range of grants, stamp duty exemptions, concessions, and federal government schemes that can collectively save tens of thousands of dollars. This guide brings it all together — a complete, state-by-state breakdown of every first home buyer benefit available in 2026.",
    sections: [
      {
        h2: "Federal government schemes — available nationally",
        blocks: [
          p("Before looking at state-based grants, it's important to understand the federal schemes available to all eligible Australians regardless of which state they buy in."),
          h3("Home Guarantee Scheme"),
          p("Administered by Housing Australia, the Home Guarantee Scheme has three components."),
          p("First Home Guarantee — Allows eligible first home buyers to purchase with as little as a 5% deposit without paying Lender's Mortgage Insurance (LMI). The government guarantees up to 15% of the property value, bringing the effective LVR to 80% from the lender's perspective. Up to 35,000 places are available per financial year. Income caps apply: $125,000 for individuals and $200,000 for couples."),
          p("Regional First Home Buyer Guarantee — Similar to the First Home Guarantee but specifically for buyers purchasing in regional Australia. Up to 10,000 places per year. You must have lived in the regional area you're buying in for at least 12 months."),
          p("Family Home Guarantee — Allows eligible single parents and single legal guardians (with at least one dependent child) to purchase with as little as a 2% deposit without paying LMI. Income cap of $125,000. Up to 5,000 places per year."),
          h3("First Home Super Saver Scheme (FHSSS)"),
          p("The FHSSS allows first home buyers to make voluntary contributions to their superannuation and later withdraw those contributions (plus associated earnings) to use as a home deposit."),
          p("You can contribute up to $15,000 per financial year and withdraw a maximum of $50,000 in total. Contributions are taxed at the concessional superannuation rate of 15% rather than your marginal tax rate."),
        ],
      },
      {
        h2: "New South Wales",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul(
            "Amount: $10,000",
            "Available for: New homes only (including substantially renovated homes)",
            "Property value cap: $600,000 for new homes; $750,000 for owner-builder or contract to build",
          ),
          p("The NSW FHOG is not available for established (existing) homes. If you're buying an established property, you don't receive the grant — but you may still receive stamp duty relief."),
          h3("Stamp duty exemption and concession"),
          ul(
            "Full exemption: Properties up to $800,000 (new and established)",
            "Concessional rate: Properties between $800,001 and $1,000,000",
          ),
          p("This is one of the most generous first home buyer stamp duty exemptions in the country. On an $800,000 purchase, a first home buyer in NSW pays $0 stamp duty — saving approximately $31,335 compared to a standard buyer."),
          h3("Property Tax option"),
          p("NSW offers eligible first home buyers the choice between paying stamp duty upfront or opting into an annual property tax instead. The property tax is based on the unimproved land value and is significantly lower than stamp duty for most buyers in the short term."),
        ],
      },
      {
        h2: "Victoria",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul("Amount: $10,000", "Available for: New homes only", "Property value cap: $750,000"),
          p("Like NSW, Victoria's FHOG applies only to new homes, not established properties."),
          h3("Stamp duty exemption and concession"),
          ul(
            "Full exemption: Properties up to $600,000",
            "Concessional rate: Properties between $600,001 and $750,000 (duty reduces on a sliding scale)",
          ),
          p("The concessional rate calculation: Duty = Full stamp duty × (($750,000 − Purchase price) ÷ $150,000)."),
          p("At $700,000, a first home buyer in Victoria pays significantly reduced duty — saving approximately $19,000 compared to a non-first-home buyer."),
          h3("Off-the-plan concession"),
          p("First home buyers purchasing off-the-plan may be eligible for an additional duty reduction, calculated on the dutiable value of the property excluding the construction component."),
        ],
      },
      {
        h2: "Queensland",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul("Amount: $30,000", "Available for: New homes only (including owner-builder)", "Property value cap: $750,000"),
          p("Queensland's FHOG is the most generous of all Australian states at $30,000."),
          h3("Stamp duty concession"),
          ul(
            "Full concession: Principal place of residence up to $500,000",
            "Partial concession: Properties between $500,001 and $550,000",
          ),
          p("The Queensland first home concession applies to both new and established homes as long as the property will be your principal place of residence. On a $500,000 purchase, you pay $0 stamp duty — saving approximately $15,925 compared to a standard buyer."),
        ],
      },
      {
        h2: "South Australia",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul("Amount: $15,000", "Available for: New homes only", "Property value cap: No cap (as of 2026)"),
          p("South Australia removed the property value cap on its FHOG in 2023, making it available regardless of the purchase price — though it applies only to new construction."),
          h3("Stamp duty"),
          p("South Australia does not offer a first home buyer stamp duty exemption. Standard stamp duty rates apply to all purchases regardless of whether you are a first home buyer."),
          h3("Household goods loan"),
          p("SA offers an interest-free loan of up to $10,000 to eligible first home buyers for the purchase of essential household goods. This is accessed through the HomeStart Finance low deposit loan program."),
        ],
      },
      {
        h2: "Western Australia",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul(
            "Amount: $10,000",
            "Available for: New homes only",
            "Property value cap: $750,000 (south of the 26th parallel) / $1,000,000 (north of the 26th parallel)",
          ),
          h3("Stamp duty exemption and concession"),
          ul(
            "Full exemption: Properties up to $430,000",
            "Concessional rate: Properties between $430,001 and $530,000",
          ),
          p("On a $430,000 purchase, a first home buyer in WA pays $0 stamp duty — saving approximately $14,440 compared to a standard buyer."),
          p("WA also offers a first home buyer duty concession for vacant land under $300,000 (full exemption) and between $300,001 and $400,000 (partial concession)."),
        ],
      },
      {
        h2: "Tasmania",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul("Amount: $30,000", "Available for: New homes only", "Property value cap: No cap"),
          p("Tasmania matched Queensland's $30,000 grant, making it one of the more generous states for first home buyers purchasing new construction."),
          h3("Stamp duty concession"),
          p("Tasmania offers a 50% stamp duty concession for first home buyers purchasing established homes."),
        ],
      },
      {
        h2: "Australian Capital Territory",
        blocks: [
          p("The ACT does not have a First Home Owner Grant. Instead, the territory focuses its support through the Home Buyer Concession Scheme."),
          h3("Home Buyer Concession Scheme"),
          p("Eligible buyers pay no stamp duty (conveyance duty) on their purchase. This applies to both new and established homes."),
          p("Eligibility is income-tested:"),
          ul(
            "Single buyers: Income cap of approximately $160,000 (indexed annually)",
            "Couples: Income cap of approximately $215,000",
          ),
          p("The ACT's concession scheme is unusually broad compared to other states because it is not restricted to first home buyers — it is available to any eligible low-to-moderate income buyer who will occupy the home."),
        ],
      },
      {
        h2: "Northern Territory",
        blocks: [
          h3("First Home Owner Grant (FHOG)"),
          ul("Amount: $10,000", "Available for: New homes only"),
          h3("Territory Home Owner Discount"),
          p("The NT's Territory Home Owner Discount provides a stamp duty concession of up to $18,601 for eligible buyers purchasing a home to use as their principal place of residence."),
          h3("BuildBonus grant"),
          p("The NT offers an additional $20,000 grant for buyers who build or purchase a new home, providing a combined benefit of up to $30,000 for eligible first home buyers purchasing new construction in the NT."),
        ],
      },
      {
        h2: "How to apply — general process",
        blocks: [
          p("The application process varies by state, but the general approach is:"),
          ul(
            "Confirm eligibility before signing a contract — check income caps, property value caps, and residency requirements for your state",
            "Complete the FHOG application — usually done through your lender or conveyancer at settlement, not directly with the state revenue office",
            "Submit supporting documents — typically including your contract of sale, proof of identity, and evidence of Australian citizenship or permanent residency",
            "Grant is paid at settlement — for new homes, the grant is typically paid at the first drawdown of your construction loan or at settlement",
          ),
          p("For federal schemes (Home Guarantee Scheme, FHSSS), applications are made separately through participating lenders or the ATO respectively."),
        ],
      },
      {
        h2: "Common mistakes that cost first home buyers their entitlements",
        blocks: [
          p("Buying an established home when you intended to claim a grant: The FHOG in all states applies only to new homes. Many first home buyers assume the grant applies to all purchases. It does not."),
          p("Exceeding the property value cap: Grants and stamp duty exemptions have strict property value caps. Buying even $1 above the cap in some states eliminates your eligibility entirely."),
          p("Not meeting the residency requirement: Most grants and concessions require you to move into the property and live there within a specified timeframe (usually 12 months) and remain there for a minimum period."),
          p("Applying too late: Some states require the FHOG application to be lodged within 12 months of settlement."),
          p("Previous property ownership: If you or your co-buyer have ever owned residential property in Australia previously, you are not eligible for the FHOG — even if it was decades ago."),
        ],
      },
    ],
    keyTakeaways: [
      "Queensland and Tasmania offer the most generous First Home Owner Grants at $30,000",
      "NSW offers the most generous stamp duty exemption — up to $800,000 for first home buyers",
      "The federal First Home Guarantee Scheme allows a 5% deposit with no LMI across all states",
      "All state FHOGs apply to new homes only — established home buyers rely on stamp duty concessions",
      "The ACT Home Buyer Concession Scheme is income-tested and available to all owner-occupiers, not just first home buyers",
      "Apply for grants through your lender or conveyancer at settlement — not directly with the revenue office",
    ],
    relatedCalculator: {
      to: "/stamp-duty-calculator",
      label: "Calculate your first home stamp duty",
    },
    relatedGuides: ["stamp-duty-australia-2026", "what-is-lmi"],
    faqs: [
      {
        question: "Can my partner and I both claim the First Home Owner Grant?",
        answer:
          "No. The FHOG is paid once per transaction, not per person. If you're buying jointly, you receive one grant between you — not one each.",
      },
      {
        question: "What if one of us has owned property before?",
        answer:
          "If either buyer on the title has previously owned residential property in Australia, neither buyer is eligible for the FHOG. This applies regardless of the state where the previous property was owned.",
      },
      {
        question: "Do I have to be an Australian citizen to claim?",
        answer:
          "Most grants require at least one applicant to be an Australian citizen or permanent resident. Temporary visa holders are generally not eligible. Some states allow New Zealand citizens on a Special Category Visa to apply.",
      },
      {
        question: "What counts as a \"new home\" for the grant?",
        answer:
          "A new home is a property that has not been previously occupied or sold as a place of residence. This includes newly built homes, substantially renovated homes, and off-the-plan purchases where you are the first occupant.",
      },
      {
        question: "Can I use the grant as part of my deposit?",
        answer:
          "In some states, yes. The grant can be applied at settlement and counted toward your upfront funds. However, many lenders require you to have genuine savings of a certain amount independently of the grant.",
      },
    ],
  },

  // 5. FIXED VS VARIABLE
  {
    slug: "fixed-vs-variable-rate",
    title: "Fixed vs variable rate home loans: what the numbers actually show",
    metaTitle: "Fixed vs Variable Rate Home Loan Australia — Which Is Better? | Calcy",
    metaDescription:
      "Fixed or variable? We run the actual numbers across multiple scenarios to help Australian borrowers make a data-driven home loan decision.",
    category: "Home loans",
    readMins: 7,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro:
      "Fixed or variable? It's the question every Australian borrower faces when taking out a home loan, and the answer genuinely matters — over 30 years, the difference between making the right or wrong call can be tens of thousands of dollars. This guide explains how each loan type works, then shows you real calculations across multiple scenarios so you can make a genuinely informed decision for your situation.",
    sections: [
      {
        h2: "How fixed rate home loans work",
        blocks: [
          p("A fixed rate home loan locks your interest rate for a set period — typically 1, 2, 3, or 5 years in Australia. During that fixed term, your repayment amount stays exactly the same regardless of what happens to the RBA cash rate or market interest rates."),
          p("At the end of the fixed term, the loan rolls over to the lender's standard variable rate (sometimes called the revert rate) unless you proactively refinance or fix again. Many borrowers are surprised to find their revert rate is higher than competitive variable rates."),
          h3("What's typically included with a fixed rate loan"),
          ul(
            "Certainty of repayments for the fixed period",
            "Protection from rate rises during the term",
            "Some lenders allow limited extra repayments (usually up to $10,000–$20,000 per year)",
          ),
          h3("What's typically not included"),
          ul(
            "Offset accounts (most fixed loans don't offer full offset — though some lenders now offer partial offset on fixed rate products)",
            "Unlimited extra repayments",
            "Redraw on extra repayments made during the fixed term",
            "The ability to exit without break costs",
          ),
        ],
      },
      {
        h2: "How variable rate home loans work",
        blocks: [
          p("A variable rate home loan has an interest rate that moves with market conditions — primarily the RBA cash rate and each lender's own funding costs. When the RBA raises rates, variable rate borrowers pay more. When the RBA cuts rates, variable rate borrowers benefit immediately."),
          h3("What's typically included with a variable rate loan"),
          ul(
            "Full offset account (can significantly reduce interest paid over the life of the loan)",
            "Unlimited extra repayments",
            "Redraw facility",
            "Flexibility to refinance or sell without significant break costs",
            "Rate reductions when the RBA cuts",
          ),
          h3("What's not guaranteed"),
          ul(
            "Rate stability — your repayments can increase at any time",
            "That your lender will pass on RBA cuts in full — they don't always",
          ),
        ],
      },
      {
        h2: "The key differences — a direct comparison",
        blocks: [
          {
            type: "table",
            headers: ["Feature", "Fixed rate", "Variable rate"],
            rows: [
              ["Rate certainty", "Yes — for the fixed term", "No"],
              ["Repayment certainty", "Yes — for the fixed term", "No"],
              ["Offset account", "Rarely (limited on some products)", "Yes (most lenders)"],
              ["Extra repayments", "Limited (usually $10–20k/year)", "Unlimited"],
              ["Redraw", "Not usually during fixed period", "Yes"],
              ["Break costs", "Yes — can be significant", "No (or minimal)"],
              ["Benefits from rate cuts", "No", "Yes — immediately"],
              ["Protection from rate rises", "Yes", "No"],
              ["Flexibility to refinance", "Low during fixed term", "High"],
            ],
          },
        ],
      },
      {
        h2: "Running the numbers — three real scenarios",
        blocks: [
          p("Let's look at three realistic Australian borrower scenarios. Assumptions: $600,000 loan, 30-year term, 2-year fixed rate of 6.14%, variable rate of 6.39%."),
          h3("Scenario 1: You fix for 2 years, then go variable"),
          p("Fixed for years 1–2: Monthly repayment $3,641. Total paid in 2 years: $87,384. Loan balance after 2 years: approximately $577,400."),
          p("Variable for years 3–30 (at 6.39%): Monthly repayment on remaining balance approximately $3,820. Total paid over remaining 28 years: approximately $1,283,520."),
          p("Total cost (fixed then variable): approximately $1,370,904."),
          p("Fully variable for all 30 years (at 6.39%): Monthly repayment $3,741. Total paid over 30 years: approximately $1,346,760."),
          p("Comparison: In this stable-rate scenario, the variable rate option costs approximately $24,144 less over the full 30-year term because the variable rate started lower. The fixed rate provided certainty but at a slight premium."),
          h3("Scenario 2: Rates rise 1% during your fixed term"),
          p("This is the scenario where fixing pays off. Assume rates rise to 7.14% variable during your 2-year fixed period."),
          p("Fixed rate borrower (years 1–2): Repayment $3,549/month (unchanged). Saving vs variable at 7.14% ($4,047/month): $498/month = $11,952 over 2 years."),
          p("Variable rate borrower (years 1–2): Repayment rises to $4,047/month after rate rise. Additional cost compared to fixed: $11,952 over 2 years."),
          p("After the fixed period expires, both borrowers are on the same variable rate and the difference is the $11,952 saved (or not saved) during the fixed window."),
          h3("Scenario 3: You sell or refinance within 2 years — and you're fixed"),
          p("If you sell your property or refinance within your fixed term, your lender will charge a break cost. This is calculated based on the difference between your fixed rate and current wholesale market rates, multiplied by your remaining loan balance and time left in the fixed term."),
          p("In a falling rate environment, break costs can be extremely high — sometimes $20,000–$50,000 on a $600,000 loan with 18 months remaining."),
          p("Example: Loan $600,000 fixed at 5.89% for 2 years. You sell after 14 months — 10 months remaining. Current market rate has fallen to 5.39%. Approximate break cost: $600,000 × (5.89% − 5.39%) × (10/12) = approximately $25,000."),
        ],
      },
      {
        h2: "The risk of getting it wrong — break costs explained",
        blocks: [
          p("Break costs (also called economic costs or early repayment costs) apply when you exit a fixed rate loan before the fixed term ends. This includes:"),
          ul(
            "Selling the property",
            "Refinancing to a different lender",
            "Switching from fixed to variable with the same lender",
            "Paying off the loan entirely",
          ),
          p("Break costs are calculated by the lender based on the difference between your contracted fixed rate and the current wholesale funding rate for the remaining term. If rates have fallen since you fixed, your break cost will be significant. If rates have risen since you fixed, your break cost may be zero or minimal."),
          p("Always ask your lender for a break cost quote before deciding to exit a fixed loan."),
        ],
      },
      {
        h2: "Split loans — the middle ground",
        blocks: [
          p("A split loan divides your borrowing between fixed and variable components. For example, on a $600,000 loan you might fix $400,000 and keep $200,000 variable."),
          p("This approach gives you:"),
          ul(
            "Certainty on the fixed portion (known repayment amount)",
            "Flexibility on the variable portion (offset account, extra repayments)",
            "Reduced exposure to break costs if you need to exit or refinance",
            "Partial protection from rate rises and partial benefit from rate cuts",
          ),
          p("Split loans are popular in Australia precisely because they offer a compromise when the rate outlook is uncertain. The split ratio is up to you — 50/50, 60/40, and 70/30 are common structures."),
        ],
      },
      {
        h2: "What the current rate environment means for your decision",
        blocks: [
          p("As of May 2026, the RBA cash rate is 4.10% following two cuts in February and March 2026. Variable home loan rates are sitting broadly in the 5.9%–6.5% range depending on lender and loan type. Fixed rates for 2–3 year terms are priced in the 5.6%–6.2% range from most major lenders."),
          p("When fixed rates are lower than variable rates — which is the case in some segments of the current market — fixing locks in the cheaper rate for the short term. However, the premium or discount of fixed vs variable rates reflects the market's expectation of where rates are heading."),
          p("Key considerations in the current environment:"),
          ul(
            "The RBA has cut twice and commentary suggests further cuts are possible",
            "If rates continue falling, variable rate borrowers benefit immediately; fixed rate borrowers do not",
            "Fixed rates below current variable rates are priced to account for expected further cuts",
            "Locking in now protects against the scenario where cuts don't materialise or reverse",
          ),
        ],
      },
      {
        h2: "Which type suits which borrower?",
        blocks: [
          h3("Consider a fixed rate if"),
          ul(
            "You are on a tight budget and need certainty about your monthly repayments",
            "You believe rates are likely to rise during your ownership period",
            "You won't need to sell, refinance, or make large extra repayments within the fixed term",
            "You don't use or don't value an offset account",
          ),
          h3("Consider a variable rate if"),
          ul(
            "You have a significant savings buffer or plan to use an offset account actively",
            "You want the flexibility to sell or refinance without break costs",
            "You want to make unlimited extra repayments to pay down your loan faster",
            "You believe rates are likely to fall or stay flat",
          ),
          h3("Consider a split loan if"),
          ul(
            "You want certainty on part of your repayments but flexibility on the rest",
            "You have significant savings that would benefit from an offset account",
            "You're unsure about the rate direction and want to hedge your exposure",
          ),
        ],
      },
    ],
    keyTakeaways: [
      "Fixed rates offer repayment certainty but sacrifice flexibility — offset accounts, unlimited extra repayments, and break-cost-free exits are generally not available",
      "Variable rates offer flexibility but expose you to repayment increases if rates rise",
      "In a falling rate environment, variable rate borrowers benefit immediately; fixed rate borrowers do not",
      "Break costs when exiting a fixed loan in a falling rate environment can be significant — sometimes $20,000–$50,000",
      "Split loans offer a genuine middle ground and are worth considering if you want both certainty and flexibility",
      "There is no universally \"right\" answer — the best choice depends on your budget certainty needs, flexibility requirements, and view on rate direction",
    ],
    relatedCalculator: { to: "/loan-comparison-calculator", label: "Compare fixed vs variable" },
    relatedGuides: ["borrowing-power-australia", "what-is-lmi"],
    faqs: [
      {
        question: "What happens to my fixed rate loan when the RBA changes rates?",
        answer:
          "Nothing changes during your fixed term. Your rate and repayments remain exactly the same regardless of RBA decisions. This is the key feature of fixing — and the key limitation.",
      },
      {
        question: "Can I make extra repayments on a fixed rate loan?",
        answer:
          "Most fixed rate loans allow some extra repayments — typically up to $10,000–$20,000 per year. Making repayments above this limit may trigger break costs.",
      },
      {
        question: "What is a comparison rate and should I use it to compare fixed and variable loans?",
        answer:
          "A comparison rate includes fees and charges in addition to the interest rate, giving you a more complete picture. It's useful for comparing like-for-like loans but has limitations because it uses a 25-year loan term and $150,000 loan size as its base.",
      },
      {
        question: "Should I fix my rate when rates are falling?",
        answer:
          "Fixing when rates are falling locks in today's rate and protects against scenarios where cuts don't continue. But if rates fall further, you miss the benefit. Generally, the closer you believe rates are to their floor, the more attractive fixing becomes.",
      },
      {
        question: "How do I know what break cost I'll face if I exit my fixed loan?",
        answer:
          "Your lender can provide a break cost estimate upon request. This is calculated daily based on current wholesale market rates and your remaining loan balance and term.",
      },
      {
        question: "Is it better to fix for 1, 2, 3, or 5 years?",
        answer:
          "Shorter fixed terms give you more flexibility to reassess sooner. Longer fixed terms provide certainty for longer but lock you in. In Australia, 2-year and 3-year fixed terms are the most popular.",
      },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
