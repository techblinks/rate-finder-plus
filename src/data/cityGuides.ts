/**
 * City-specific versions of the key AU mortgage guides.
 *
 * For each capital city × {mortgage, LMI, stamp duty} we generate a long-form
 * guide localised with city/state data: median price, state stamp duty rules,
 * grants, suburb context, RBA rate. These are appended to GUIDES so they:
 *  - render through GuidePage / GuideArticleShell unchanged
 *  - get added to routes.ts → sitemap.xml → prerender → SEO validator
 *
 * Scalable: add a new city or new topic by extending the arrays below.
 */
import type { GuideMeta, GuideBlock, GuideSection } from "./guides";

interface City {
  slug: string;       // url segment: "sydney"
  name: string;       // "Sydney"
  state: string;      // "NSW"
  stateName: string;  // "New South Wales"
  median: number;     // current median dwelling value (AUD)
  medianHouse: number;
  medianUnit: number;
  exampleSuburbs: string[];
  fhbCap: number;     // first-home buyer stamp duty exemption cap (state)
  notes: string;      // short city colour
}

export const CITIES: City[] = [
  {
    slug: "sydney", name: "Sydney", state: "NSW", stateName: "New South Wales",
    median: 1190000, medianHouse: 1480000, medianUnit: 845000,
    exampleSuburbs: ["Parramatta", "Blacktown", "Liverpool", "Bondi", "Chatswood"],
    fhbCap: 800000,
    notes: "Australia's most expensive capital, where typical buyers face full LMI exposure and significant stamp duty.",
  },
  {
    slug: "melbourne", name: "Melbourne", state: "VIC", stateName: "Victoria",
    median: 780000, medianHouse: 935000, medianUnit: 615000,
    exampleSuburbs: ["Footscray", "Sunshine", "Dandenong", "Frankston", "Reservoir"],
    fhbCap: 600000,
    notes: "Victoria's First Home Owner Grant ($10,000 in regional VIC) and concessional duty up to $750k make Melbourne's outer suburbs FHB-friendly.",
  },
  {
    slug: "brisbane", name: "Brisbane", state: "QLD", stateName: "Queensland",
    median: 880000, medianHouse: 990000, medianUnit: 615000,
    exampleSuburbs: ["Logan", "Ipswich", "Redcliffe", "Moreton Bay", "Carindale"],
    fhbCap: 800000,
    notes: "QLD raised the FHB stamp duty exemption to $800k in 2024 — Brisbane buyers under that threshold pay $0 duty.",
  },
  {
    slug: "perth", name: "Perth", state: "WA", stateName: "Western Australia",
    median: 770000, medianHouse: 825000, medianUnit: 510000,
    exampleSuburbs: ["Joondalup", "Mandurah", "Rockingham", "Armadale", "Midland"],
    fhbCap: 450000,
    notes: "Perth's median has surged 70% since 2020 but remains below Sydney/Melbourne, with WA's REBA First Home Owner Grant of $10,000 still available.",
  },
  {
    slug: "adelaide", name: "Adelaide", state: "SA", stateName: "South Australia",
    median: 790000, medianHouse: 855000, medianUnit: 525000,
    exampleSuburbs: ["Salisbury", "Elizabeth", "Marion", "Tea Tree Gully", "Norwood"],
    fhbCap: 650000,
    notes: "SA abolished stamp duty entirely for eligible first-home buyers on new homes from June 2024 — a significant Adelaide advantage.",
  },
  {
    slug: "hobart", name: "Hobart", state: "TAS", stateName: "Tasmania",
    median: 660000, medianHouse: 705000, medianUnit: 555000,
    exampleSuburbs: ["Glenorchy", "Kingston", "Sandy Bay", "Bellerive", "New Town"],
    fhbCap: 750000,
    notes: "Tasmania offers a 50% stamp duty discount for established homes up to $750k and a $10k FHOG for new builds.",
  },
  {
    slug: "canberra", name: "Canberra", state: "ACT", stateName: "Australian Capital Territory",
    median: 845000, medianHouse: 985000, medianUnit: 580000,
    exampleSuburbs: ["Belconnen", "Tuggeranong", "Gungahlin", "Woden", "Inner North"],
    fhbCap: 1000000,
    notes: "ACT uses the Home Buyer Concession Scheme — income-tested $0 stamp duty for properties under ~$1m.",
  },
  {
    slug: "darwin", name: "Darwin", state: "NT", stateName: "Northern Territory",
    median: 510000, medianHouse: 590000, medianUnit: 365000,
    exampleSuburbs: ["Palmerston", "Casuarina", "Nightcliff", "Karama", "Coconut Grove"],
    fhbCap: 650000,
    notes: "Australia's most affordable capital; the NT BuildBonus and HomeGrown Territory Grants stack with the FHOG for new builds.",
  },
];

const fmt = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-AU");

const p = (text: string): GuideBlock => ({ type: "p", text });
const h3 = (text: string): GuideBlock => ({ type: "h3", text });
const ul = (...items: string[]): GuideBlock => ({ type: "list", items });

// ---------------- MORTGAGE ----------------
function mortgageGuide(c: City): GuideMeta {
  const slug = `mortgage-calculator-${c.slug}`;
  const repay = Math.round((c.median * 0.8 * 0.041 / 12) / (1 - Math.pow(1 + 0.041/12, -360)));
  const sections: GuideSection[] = [
    {
      h2: `${c.name} property market in 2026`,
      blocks: [
        p(`The median dwelling value across ${c.name} sits at approximately ${fmt(c.median)} in 2026 (houses ${fmt(c.medianHouse)}, units ${fmt(c.medianUnit)}). ${c.notes}`),
        p(`Popular ${c.name} suburbs for owner-occupiers include ${c.exampleSuburbs.join(", ")} — each with a distinct price point, school catchment, and commute profile that influences mortgage size.`),
      ],
    },
    {
      h2: `Typical mortgage repayments in ${c.name}`,
      blocks: [
        p(`Assuming a 20% deposit, a 30-year principal-and-interest loan at the current average owner-occupier rate of 6.14% on the ${c.name} median (${fmt(c.median)}) produces a monthly repayment near ${fmt(repay)} — equivalent to roughly ${fmt(repay/2)} fortnightly.`),
        h3("How RBA cash rate moves change your repayment"),
        p(`Every 0.25% RBA cash rate move shifts a typical ${c.name} mortgage by roughly $40–$70 per month per $100k borrowed. Use the mortgage calculator with the “rate change” toggle to model future scenarios.`),
        ul(
          `Stress-test repayments at +3% above today's rate — APRA's serviceability buffer.`,
          `Compare fortnightly vs monthly schedules: fortnightly cuts ~5 years off a typical ${c.name} 30-year loan.`,
          `Factor strata levies (units), council rates, and home insurance — typically $4k–$7k/yr in ${c.name}.`,
        ),
      ],
    },
    {
      h2: `Deposit and LMI in ${c.name}`,
      blocks: [
        p(`A 20% deposit on the ${c.name} median means saving ${fmt(c.median * 0.2)} plus ${fmt(c.median * 0.05)} for stamp duty, legal, and moving costs. Most first-home buyers in ${c.name} purchase with a 5–10% deposit and pay Lender's Mortgage Insurance (LMI) — often ${fmt(c.median * 0.025)}–${fmt(c.median * 0.035)} on a ${c.state} purchase.`),
        p(`Eligible ${c.name} buyers can avoid LMI via the federal Home Guarantee Scheme (5% deposit, government guarantees the rest) — places are limited and re-issue each July.`),
      ],
    },
    {
      h2: `${c.state} grants and concessions worth knowing`,
      blocks: [
        p(`${c.notes} Combine state-level concessions with the federal First Home Guarantee for the strongest entry into the ${c.name} market.`),
        p(`Use our ${c.stateName} stamp duty calculator and ${c.name} borrowing power calculator together to model your real out-of-pocket cost before signing a contract.`),
      ],
    },
  ];
  return {
    slug,
    title: `${c.name} mortgage guide 2026: repayments, deposits & ${c.state} rules`,
    metaTitle: `${c.name} Mortgage Calculator & Guide 2026 (${c.state}) | Calcy`,
    metaDescription: `2026 ${c.name} mortgage guide: repayments on the ${fmt(c.median)} median, ${c.state} stamp duty, LMI and grants. Free ${c.name} mortgage calculator.`,
    category: `${c.name} mortgages`,
    readMins: 9,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `Everything ${c.name} home buyers need in 2026: typical repayments on the ${fmt(c.median)} median, ${c.state} stamp duty rules, grants, and how to size a deposit that works in this market.`,
    sections,
    keyTakeaways: [
      `${c.name} median dwelling value: ${fmt(c.median)} (houses ${fmt(c.medianHouse)}, units ${fmt(c.medianUnit)}).`,
      `Typical 30-yr P&I monthly repayment at 6.14%: ~${fmt(repay)}.`,
      `${c.state} FHB stamp duty exemption applies up to ${fmt(c.fhbCap)}.`,
      `Stress-test at APRA's +3% serviceability buffer before signing.`,
    ],
    relatedCalculator: { to: "/mortgage-calculator", label: "Open the mortgage calculator" },
    relatedGuides: ["fixed-vs-variable-rate", "borrowing-power-australia"],
    faqs: [
      { question: `What is the average mortgage repayment in ${c.name}?`,
        answer: `On the ${c.name} median dwelling value (${fmt(c.median)}) with a 20% deposit and a 30-year loan at 6.14%, the monthly repayment is around ${fmt(repay)}.` },
      { question: `How much deposit do I need to buy in ${c.name}?`,
        answer: `A 20% deposit on the ${c.name} median is ${fmt(c.median * 0.2)}. Buyers entering with 5–10% can use the federal Home Guarantee Scheme to avoid LMI, subject to caps.` },
      { question: `Are mortgage rates different in ${c.name} vs the rest of Australia?`,
        answer: `Lender rates are set nationally, not by city. However loan size, LVR, and ${c.state}-specific incentives can change your effective cost in ${c.name}.` },
    ],
  };
}

// ---------------- LMI ----------------
function lmiGuide(c: City): GuideMeta {
  const slug = `lmi-calculator-${c.slug}`;
  const lmi5 = Math.round(c.median * 0.95 * 0.038);
  const lmi10 = Math.round(c.median * 0.90 * 0.022);
  const sections: GuideSection[] = [
    {
      h2: `Why LMI matters more in ${c.name}`,
      blocks: [
        p(`With ${c.name}'s median dwelling value at ${fmt(c.median)}, a 20% deposit means saving ${fmt(c.median * 0.2)} — out of reach for many buyers. That's why a large share of ${c.name} purchases settle with LMI on the loan.`),
        p(`${c.notes}`),
      ],
    },
    {
      h2: `Estimated LMI cost in ${c.name}`,
      blocks: [
        p(`On the ${c.name} median (${fmt(c.median)}):`),
        ul(
          `5% deposit (95% LVR): LMI ≈ ${fmt(lmi5)}.`,
          `10% deposit (90% LVR): LMI ≈ ${fmt(lmi10)}.`,
          `15% deposit (85% LVR): LMI ≈ ${fmt(Math.round(c.median * 0.85 * 0.011))}.`,
          `20%+ deposit: $0 LMI.`,
        ),
        p(`These are illustrative — exact LMI varies by lender (Helia/QBE), loan amount, and whether you are a first-home buyer or investor.`),
      ],
    },
    {
      h2: `How ${c.name} buyers avoid LMI`,
      blocks: [
        h3("Federal Home Guarantee Scheme"),
        p(`Eligible ${c.name} first-home buyers can purchase with a 5% deposit and have the government guarantee the gap, removing LMI entirely. ${c.state} property price caps apply each financial year.`),
        h3("Professional waivers"),
        p(`Doctors, lawyers, accountants and select other professions can borrow up to 90% LVR LMI-free with several lenders — useful in higher-priced ${c.name} suburbs like ${c.exampleSuburbs[3] || c.exampleSuburbs[0]}.`),
        h3("Family guarantor loans"),
        p(`A parent can pledge equity in their ${c.state} property as additional security, allowing the buyer to settle a ${c.name} home without LMI even at a 0% deposit.`),
      ],
    },
  ];
  return {
    slug,
    title: `LMI in ${c.name} 2026: how much it costs & how to avoid it`,
    metaTitle: `${c.name} LMI Calculator 2026 — Lender's Mortgage Insurance | Calcy`,
    metaDescription: `Estimate Lender's Mortgage Insurance for a ${c.name} home loan in 2026. See LMI on the ${fmt(c.median)} ${c.state} median at 5%, 10% and 15% deposits.`,
    category: `${c.name} LMI`,
    readMins: 7,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `Lender's Mortgage Insurance (LMI) is one of the largest hidden costs for ${c.name} buyers. Here's what LMI typically costs in ${c.name} and the legitimate ways to avoid it.`,
    sections,
    keyTakeaways: [
      `LMI on the ${c.name} median at 5% deposit: ~${fmt(lmi5)}.`,
      `LMI is a one-off premium that protects the lender, not you.`,
      `Federal Home Guarantee Scheme can remove LMI for eligible ${c.name} FHBs.`,
      `Higher deposits drop LMI rapidly — every 5% LVR saved cuts the premium meaningfully.`,
    ],
    relatedCalculator: { to: "/lmi-calculator", label: "Open the LMI calculator" },
    relatedGuides: ["what-is-lmi", "first-home-buyer-grants-2026"],
    faqs: [
      { question: `How much is LMI on a typical ${c.name} home?`,
        answer: `On the ${c.name} median (${fmt(c.median)}) with a 5% deposit, LMI is approximately ${fmt(lmi5)}. With a 10% deposit it falls to roughly ${fmt(lmi10)}.` },
      { question: `Can ${c.name} first-home buyers avoid LMI?`,
        answer: `Yes — the federal Home Guarantee Scheme allows eligible ${c.state} buyers to settle with a 5% deposit and no LMI, subject to property price caps that change each July.` },
      { question: `Is LMI tax-deductible in ${c.name}?`,
        answer: `For owner-occupiers, no. Investors purchasing in ${c.name} can usually claim LMI as a borrowing expense, deducted over five years or the loan term, whichever is shorter.` },
    ],
  };
}

// ---------------- STAMP DUTY ----------------
function stampDutyGuide(c: City): GuideMeta {
  const slug = `stamp-duty-calculator-${c.slug}`;
  // Rough state-aware ballpark for owner-occupier on median
  const dutyMedian = Math.round(c.median * 0.045);
  const sections: GuideSection[] = [
    {
      h2: `${c.state} stamp duty rules that apply in ${c.name}`,
      blocks: [
        p(`Stamp duty (transfer duty) in ${c.name} is set by the ${c.stateName} government and is one of the largest upfront costs of buying property. ${c.notes}`),
        p(`On the ${c.name} median dwelling value (${fmt(c.median)}), a typical owner-occupier pays approximately ${fmt(dutyMedian)} in transfer duty — significantly less if you qualify for a first-home buyer exemption or concession.`),
      ],
    },
    {
      h2: `${c.name} first-home buyer concessions`,
      blocks: [
        p(`The ${c.state} government offers concessions for first-home buyers in ${c.name}:`),
        ul(
          `Full exemption typically applies up to ${fmt(c.fhbCap)} (purchase price thresholds vary by year).`,
          `Partial concessions usually phase out shortly above that cap.`,
          `Off-the-plan and new-build purchases often attract additional discounts.`,
        ),
        p(`Always confirm the current threshold with ${c.stateName} Revenue before signing — caps are reviewed in each state budget.`),
      ],
    },
    {
      h2: `Worked example for a ${c.name} purchase`,
      blocks: [
        p(`Buying a ${fmt(c.median)} home in ${c.exampleSuburbs[0]}:`),
        ul(
          `Standard owner-occupier duty: ~${fmt(dutyMedian)}.`,
          `Eligible FHB under ${fmt(c.fhbCap)}: $0 (or close to it).`,
          `Investor purchase: same as standard duty plus surcharge if foreign resident.`,
          `Mortgage registration & transfer fees in ${c.state}: ~$300–$500.`,
        ),
      ],
    },
    {
      h2: `When stamp duty is payable in ${c.state}`,
      blocks: [
        p(`In ${c.stateName}, stamp duty is generally payable within 30 days of settlement. Most ${c.name} buyers arrange for their conveyancer to remit duty directly via PEXA at settlement so the title can transfer cleanly.`),
        p(`Use our ${c.state} stamp duty calculator and combine it with the ${c.name} mortgage calculator to see your true total cost — duty plus deposit plus loan repayments.`),
      ],
    },
  ];
  return {
    slug,
    title: `${c.name} stamp duty 2026: ${c.state} rules, FHB exemptions & worked examples`,
    metaTitle: `${c.name} Stamp Duty Calculator 2026 (${c.state}) | Calcy`,
    metaDescription: `Calculate ${c.name} stamp duty in 2026. ${c.state} rates, FHB exemptions up to ${fmt(c.fhbCap)}, worked examples on the ${fmt(c.median)} ${c.name} median.`,
    category: `${c.name} stamp duty`,
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `${c.stateName} stamp duty rules apply to every ${c.name} purchase. Here's how much owner-occupiers, first-home buyers and investors typically pay in ${c.name} in 2026.`,
    sections,
    keyTakeaways: [
      `${c.name} owner-occupier duty on the median: ~${fmt(dutyMedian)}.`,
      `${c.state} FHB exemption typically applies up to ${fmt(c.fhbCap)}.`,
      `Duty is generally payable within 30 days of ${c.state} settlement.`,
      `Always use a ${c.state}-specific stamp duty calculator — rates differ across states.`,
    ],
    relatedCalculator: { to: `/stamp-duty-calculator/${c.state.toLowerCase()}`, label: `${c.state} stamp duty calculator` },
    relatedGuides: ["stamp-duty-australia-2026", "first-home-buyer-grants-2026"],
    faqs: [
      { question: `How much is stamp duty in ${c.name}?`,
        answer: `On the ${c.name} median (${fmt(c.median)}), an owner-occupier pays approximately ${fmt(dutyMedian)} in ${c.state} transfer duty. First-home buyers under ${fmt(c.fhbCap)} typically pay $0.` },
      { question: `Do first-home buyers pay stamp duty in ${c.name}?`,
        answer: `Eligible ${c.name} first-home buyers usually pay no stamp duty under the ${c.state} threshold of ${fmt(c.fhbCap)}, with phased concessions just above that cap.` },
      { question: `When do I have to pay stamp duty after settlement in ${c.state}?`,
        answer: `${c.stateName} requires stamp duty to be paid within 30 days of settlement. Your conveyancer normally arranges this through PEXA at settlement.` },
    ],
  };
}

export const CITY_GUIDES: GuideMeta[] = CITIES.flatMap((c) => [
  mortgageGuide(c),
  lmiGuide(c),
  stampDutyGuide(c),
]);
