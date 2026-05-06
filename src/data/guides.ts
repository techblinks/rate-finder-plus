/**
 * Guide article catalogue. Each entry is the single source of truth for the
 * guide's metadata, body content, FAQs, and cross-links. Used by:
 *  - src/data/routes.ts (sitemap, prerender, SEO validator)
 *  - src/pages/GuidesIndex.tsx (hub listing)
 *  - src/pages/GuidePage.tsx (article shell)
 */
import type { FaqItem } from "./faqs";

export interface GuideSection {
  h2: string;
  /** Plain-text paragraphs. Each becomes its own <p>. */
  paragraphs: string[];
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

export const GUIDES: GuideMeta[] = [
  {
    slug: "stamp-duty-australia-2026",
    title: "Stamp duty in every Australian state: 2026 complete guide",
    metaTitle: "Stamp Duty Calculator Australia 2026 — Rates for Every State | Calcy",
    metaDescription:
      "See exact stamp duty costs for every Australian state and territory in 2026. Includes first home buyer exemptions, concessions, and a free stamp duty calculator.",
    category: "Stamp duty",
    readMins: 9,
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
    intro:
      "Stamp duty is one of the largest upfront costs of buying property in Australia — and it varies dramatically between states. This 2026 guide breaks down what you'll actually pay in NSW, VIC, QLD, WA, SA, TAS, ACT and NT, and which first home buyer concessions you may qualify for.",
    sections: [
      {
        h2: "What is stamp duty in Australia?",
        paragraphs: [
          "Stamp duty (also called transfer duty) is a tax charged by each state and territory when property changes hands. It's calculated on the contract price (or market value if higher) and paid at settlement.",
          "Because each state sets its own rates, the same $700,000 home can attract anywhere from around $20,000 to over $35,000 in duty depending on where you buy.",
        ],
      },
      {
        h2: "2026 stamp duty rates by state",
        paragraphs: [
          "NSW uses sliding brackets up to 7% on the portion above $3.1 million. VIC's top bracket is 6.5%. QLD's standard rate tops out at 5.75%. WA, SA, TAS, ACT and NT all run their own scales — the calculator does the maths for each.",
          "All states reassess thresholds periodically. The figures in our calculator track the latest revenue office tables for 2026.",
        ],
      },
      {
        h2: "First home buyer concessions and exemptions",
        paragraphs: [
          "NSW exempts first home buyers up to $800,000 and offers a sliding concession to $1,000,000. VIC exempts to $600,000 with concessions to $750,000. QLD exempts to $500,000.",
          "WA, SA, TAS, ACT and NT each have their own first home buyer rules — see the state-specific calculator pages for the exact numbers.",
        ],
      },
      {
        h2: "Investor and foreign buyer surcharges",
        paragraphs: [
          "Most states add a foreign purchaser surcharge (typically 7–8%) on top of standard duty for non-residents. Investors don't qualify for first home buyer exemptions but otherwise pay the same scale as owner-occupiers.",
        ],
      },
      {
        h2: "When and how stamp duty is paid",
        paragraphs: [
          "Stamp duty is due at settlement — usually 30 to 90 days after exchange. Your conveyancer arranges payment. It cannot normally be added to your home loan, so you need the cash on hand alongside your deposit.",
        ],
      },
    ],
    keyTakeaways: [
      "Stamp duty rates and thresholds differ in every Australian state and territory.",
      "First home buyer exemptions can save tens of thousands — but only below the cap for your state.",
      "Stamp duty is payable at settlement, in cash, on top of your deposit.",
      "Use the stamp duty calculator to get the exact 2026 figure for your purchase price and state.",
    ],
    relatedCalculator: { to: "/stamp-duty-calculator", label: "Try our Stamp Duty Calculator" },
    relatedGuides: ["first-home-buyer-grants-2026", "borrowing-power-australia"],
    faqs: [
      {
        question: "Which Australian state has the lowest stamp duty?",
        answer:
          "Stamp duty depends on the price band. For owner-occupiers under $500,000, QLD typically charges the least. Above $1 million, ACT often comes out lower than NSW or VIC.",
      },
      {
        question: "Can I add stamp duty to my home loan?",
        answer:
          "In most cases, no. Stamp duty must be paid in cash at settlement. Some lenders allow a higher LVR to free up cash for duty, but this usually triggers LMI.",
      },
      {
        question: "Do first home buyers always get a stamp duty exemption?",
        answer:
          "Only if the purchase price is under your state's cap and you meet the residency and prior-ownership rules. Above the cap, a sliding concession may still apply.",
      },
      {
        question: "Is stamp duty tax deductible?",
        answer:
          "For owner-occupiers, no. For investors, stamp duty is added to the property's cost base and reduces capital gains tax when you sell — it isn't deductible upfront.",
      },
    ],
  },
  {
    slug: "what-is-lmi",
    title: "What is LMI and how do you avoid it?",
    metaTitle: "What is LMI? Lender's Mortgage Insurance Explained (Australia) | Calcy",
    metaDescription:
      "LMI can add thousands to your home loan. Learn what Lender's Mortgage Insurance is, when it applies, and 4 strategies to avoid paying it in Australia.",
    category: "Home loans",
    readMins: 7,
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
    intro:
      "Lender's Mortgage Insurance (LMI) can add $7,000 to $25,000 to the cost of buying a home in Australia. Here's what it actually covers, when you have to pay it, and four legitimate ways to avoid it.",
    sections: [
      {
        h2: "What LMI actually is",
        paragraphs: [
          "LMI is a one-off insurance premium that protects the lender — not you — if you default on your loan and the sale of the property doesn't recover the outstanding debt.",
          "It's almost always required when your deposit is less than 20% of the property value (LVR above 80%).",
        ],
      },
      {
        h2: "How much LMI costs",
        paragraphs: [
          "The premium scales with both loan size and LVR. On a $650,000 loan at 90% LVR, expect roughly $9,000–$12,000. Push to 95% LVR and the figure can pass $20,000.",
          "LMI is usually capitalised — added to your loan balance — so you also pay interest on it for the life of the loan.",
        ],
      },
      {
        h2: "Four ways to avoid LMI",
        paragraphs: [
          "1. Save a 20% deposit. The simplest and cheapest path. 2. Use a guarantor — typically a parent — who pledges equity in their property. 3. Qualify for a profession-based LMI waiver (doctors, dentists, lawyers, accountants are common). 4. Use a government scheme such as the First Home Guarantee that lets eligible buyers borrow up to 95% LVR without LMI.",
        ],
      },
      {
        h2: "When paying LMI is the smarter move",
        paragraphs: [
          "If property prices in your area are rising faster than you can save, paying LMI to enter the market sooner can outweigh the cost. Run both scenarios in the calculator before deciding.",
        ],
      },
    ],
    keyTakeaways: [
      "LMI protects the lender, not you, and is required at LVRs above 80%.",
      "Costs typically run $7,000–$25,000 depending on loan size and LVR.",
      "A 20% deposit, a guarantor, a profession waiver, or a government scheme can each remove LMI.",
      "Sometimes paying LMI to buy sooner beats waiting in a rising market.",
    ],
    relatedCalculator: { to: "/lmi-calculator", label: "Estimate your LMI now" },
    relatedGuides: ["borrowing-power-australia", "first-home-buyer-grants-2026"],
    faqs: [
      {
        question: "Is LMI refundable if I refinance?",
        answer:
          "Usually only if you refinance within the first 1–2 years, and even then only a small partial refund. Most LMI is non-refundable.",
      },
      {
        question: "Does LMI protect me as the borrower?",
        answer: "No. It protects the lender. You remain liable for any shortfall after a default.",
      },
      {
        question: "Can I pay LMI upfront instead of capitalising it?",
        answer:
          "Yes, most lenders allow either. Paying upfront avoids interest on the premium but uses cash you might prefer to keep for other costs.",
      },
    ],
  },
  {
    slug: "borrowing-power-australia",
    title: "How much can I borrow? Understanding borrowing power in Australia",
    metaTitle: "How Much Can I Borrow? Borrowing Power Explained Australia 2026 | Calcy",
    metaDescription:
      "Find out how Australian lenders calculate borrowing power, what factors affect it, and how to maximise yours. Includes free borrowing power calculator.",
    category: "Borrowing",
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
    intro:
      "Your borrowing power isn't a single number — it's an estimate of what an Australian lender will let you borrow once they've stress-tested your income, expenses, debts and the APRA serviceability buffer. This guide walks through every input.",
    sections: [
      {
        h2: "How lenders calculate borrowing power",
        paragraphs: [
          "Lenders take your gross income, subtract tax, then deduct living expenses (using HEM benchmarks if higher than what you declare), credit card limits, existing loans, and HECS. What's left is your monthly surplus.",
          "They then assess whether that surplus can service a hypothetical repayment at your loan rate plus the APRA 3% buffer. That assessment rate sets your maximum loan size.",
        ],
      },
      {
        h2: "The APRA serviceability buffer",
        paragraphs: [
          "Since 2021, APRA has required all Australian lenders to test borrowers at 3 percentage points above the actual loan rate. On a 5.50% loan, that's 8.50%. The buffer is designed to leave room for rate rises.",
        ],
      },
      {
        h2: "Factors that increase your borrowing power",
        paragraphs: [
          "Higher gross income, longer loan term, fewer dependents, lower living expenses, no credit card debt, and joint applications all push the number up.",
        ],
      },
      {
        h2: "Factors that reduce it",
        paragraphs: [
          "Credit card limits (assessed at 3.8% per month even if unused), personal loans, HECS repayments, novated leases, and high declared expenses all cut into your capacity.",
        ],
      },
      {
        h2: "How to maximise your borrowing power",
        paragraphs: [
          "Cancel unused credit cards, clear small consumer debts, consolidate buy-now-pay-later accounts, and ensure your declared expenses match your bank statements. Even small changes can shift your maximum loan by tens of thousands.",
        ],
      },
    ],
    keyTakeaways: [
      "Lenders calculate borrowing power on income minus stress-tested expenses and existing debts.",
      "The APRA 3% buffer means you're assessed at well above your actual loan rate.",
      "Credit card limits — even unused — cut your borrowing power significantly.",
      "Joint applications, longer terms, and lower expenses all increase your maximum loan.",
    ],
    relatedCalculator: {
      to: "/borrowing-power-calculator",
      label: "Calculate your borrowing power",
    },
    relatedGuides: ["fixed-vs-variable-rate", "what-is-lmi"],
    faqs: [
      {
        question: "Why is the bank's borrowing power lower than the broker's estimate?",
        answer:
          "Brokers often quote the most generous lender's number. Banks use their own expense benchmarks, which can be stricter, and their own buffer assumptions on top of APRA's 3%.",
      },
      {
        question: "Does HECS affect my borrowing power?",
        answer:
          "Yes. Your compulsory HECS repayment is treated as an ongoing liability and deducted from your serviceable income.",
      },
      {
        question: "Will pre-approval guarantee a loan?",
        answer:
          "No. Pre-approval is conditional. Final approval depends on a satisfactory property valuation and unchanged financial circumstances.",
      },
    ],
  },
  {
    slug: "first-home-buyer-grants-2026",
    title: "First home buyer grants and exemptions by state in 2026",
    metaTitle: "First Home Buyer Grants Australia 2026 — Every State Explained | Calcy",
    metaDescription:
      "Complete guide to first home buyer grants, stamp duty exemptions, and government schemes in every Australian state and territory in 2026.",
    category: "First home buyers",
    readMins: 10,
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
    intro:
      "Australian first home buyers in 2026 have access to two layers of help: state-level grants and stamp duty exemptions, plus federal schemes like the First Home Guarantee. Here's what's actually on offer in every state.",
    sections: [
      {
        h2: "Federal: the First Home Guarantee",
        paragraphs: [
          "The federal First Home Guarantee lets eligible buyers purchase with as little as a 5% deposit and no LMI. The government guarantees the gap to 20% on your behalf.",
          "Income caps apply ($125k single, $200k couple) and there are price caps that vary by city and region.",
        ],
      },
      {
        h2: "NSW",
        paragraphs: [
          "Full stamp duty exemption up to $800,000, sliding concession to $1,000,000. The $10,000 First Home Owner Grant applies to new builds up to $600,000 (or contracts up to $750,000).",
        ],
      },
      {
        h2: "Victoria",
        paragraphs: [
          "Full stamp duty exemption up to $600,000, concession to $750,000. $10,000 grant for new homes up to $750,000 ($20,000 in regional VIC).",
        ],
      },
      {
        h2: "Queensland",
        paragraphs: [
          "Full stamp duty exemption up to $500,000, concession to $550,000. The First Home Owner Grant is $30,000 for new builds (until 30 June 2026, currently legislated).",
        ],
      },
      {
        h2: "WA, SA, TAS, ACT, NT",
        paragraphs: [
          "WA: $10,000 grant + duty concessions to $530,000. SA: stamp duty relief on new homes + $15,000 grant. TAS: $10,000 grant for new builds. ACT: Home Buyer Concession Scheme (income-tested, no value cap). NT: HomeGrown Territory grant of $50,000 for new builds.",
        ],
      },
    ],
    keyTakeaways: [
      "Federal schemes stack on top of state-level grants and exemptions.",
      "The biggest savings come from stamp duty exemptions, not the headline grant amount.",
      "Most grants apply only to new builds — check before signing on an existing home.",
      "Caps and rules change yearly; confirm with your state revenue office before settlement.",
    ],
    relatedCalculator: {
      to: "/stamp-duty-calculator",
      label: "Calculate your first home stamp duty",
    },
    relatedGuides: ["stamp-duty-australia-2026", "what-is-lmi"],
    faqs: [
      {
        question: "Can I use the First Home Guarantee with a state grant?",
        answer:
          "Yes. Federal and state schemes are designed to stack. You can use the guarantee for the deposit and still claim a state grant or stamp duty concession.",
      },
      {
        question: "Do first home buyer grants apply to investment properties?",
        answer:
          "No. You must intend to live in the property as your principal place of residence, usually within 12 months of settlement.",
      },
      {
        question: "Are off-the-plan apartments eligible?",
        answer:
          "Generally yes, and many states offer additional off-the-plan stamp duty concessions. Check your state's revenue office for current thresholds.",
      },
    ],
  },
  {
    slug: "fixed-vs-variable-rate",
    title: "Fixed vs variable rate home loans: what the numbers actually show",
    metaTitle: "Fixed vs Variable Rate Home Loan Australia — Which Is Better? | Calcy",
    metaDescription:
      "Fixed or variable? We run the actual numbers across multiple scenarios to help Australian borrowers make a data-driven home loan decision.",
    category: "Home loans",
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
    intro:
      "Should you fix your home loan rate or stay variable? The honest answer depends on what happens to the RBA cash rate over the next few years — but the maths around break fees, flexibility and certainty can still tilt the decision.",
    sections: [
      {
        h2: "How each rate type works",
        paragraphs: [
          "Variable rates move when your lender adjusts — usually after RBA decisions. Fixed rates lock in for 1, 2, 3 or 5 years. After the fixed period ends, the loan reverts to a variable rate.",
        ],
      },
      {
        h2: "The cost of certainty",
        paragraphs: [
          "Fixed rates are typically 0.10–0.50% higher than the equivalent variable rate. You're paying a small premium in exchange for repayment certainty over the fixed term.",
        ],
      },
      {
        h2: "Flexibility trade-offs",
        paragraphs: [
          "Variable loans usually allow unlimited extra repayments and full offset accounts. Most fixed loans cap extra repayments at $10,000–$20,000 a year and don't offer a true offset.",
          "Break costs on a fixed loan can be tens of thousands if rates have fallen since you fixed.",
        ],
      },
      {
        h2: "Splitting the loan",
        paragraphs: [
          "Many Australian borrowers split — fixing part of the loan and leaving the rest variable. This caps your downside while preserving offset and extra-repayment flexibility on the variable portion.",
        ],
      },
      {
        h2: "Running the numbers",
        paragraphs: [
          "Use the loan comparison calculator to model fixed-vs-variable scenarios with your actual loan size and term. Even a 0.25% rate difference can swing total interest by tens of thousands over 30 years.",
        ],
      },
    ],
    keyTakeaways: [
      "Fixed rates buy certainty at a small premium over variable.",
      "Fixed loans usually restrict extra repayments and offset features.",
      "Break costs can be substantial if you exit a fixed loan early.",
      "Splitting the loan is a popular way to balance certainty and flexibility.",
    ],
    relatedCalculator: { to: "/loan-comparison-calculator", label: "Compare fixed vs variable" },
    relatedGuides: ["borrowing-power-australia", "what-is-lmi"],
    faqs: [
      {
        question: "Should I fix my rate now?",
        answer:
          "If you value certainty and your fixed-rate offer is close to the variable rate, fixing part of your loan is a reasonable hedge. Pure fixing only wins if rates rise more than the market expects.",
      },
      {
        question: "What happens at the end of a fixed term?",
        answer:
          "Your loan reverts to the lender's standard variable rate, which is often higher than competitive variable products. Plan to refinance or renegotiate before the fixed period ends.",
      },
      {
        question: "Are break costs the same as exit fees?",
        answer:
          "No. Exit fees on home loans were banned in 2011 for new loans. Break costs apply only to fixed loans and reflect the lender's economic loss when rates have moved.",
      },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
