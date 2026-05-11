/**
 * Suburb programmatic guides — 200 suburbs × 3 calculator types = 600 pages.
 *
 * Mirrors the architecture of cityGuides.ts but emits guides at slug prefix
 * "suburbs/<topic>-<suburb>" so they live under /suburbs/* rather than
 * /guides/*. Routing wires this up in SuburbGuidePage + App.tsx.
 *
 * Generator produces:
 *   - mortgage-calculator   (monthly + fortnightly repayment, 80% LVR, 30y, 6.14%)
 *   - lmi-calculator        (LMI at 95/90/85% LVR)
 *   - stamp-duty-calculator (real state SD via lib/calc/stampDuty.ts)
 *
 * Each page links to: parent city guide, state stamp-duty page, two sibling
 * suburb calculators, one topic-matched editorial guide.
 */
import type { GuideMeta, GuideBlock, GuideSection } from "./guides";
import { SUBURB_CATALOGUE, type SuburbRecord } from "./suburbCatalogue";
import { calcStampDuty } from "@/lib/calc/stampDuty";

const RATE = 0.0614;
const TERM_YEARS = 30;
const LVR = 0.8;

// Stamp duty FHB caps used for narrative copy (matches countryCatalogue AU caps).
const FHB_CAPS: Record<SuburbRecord["state"], number> = {
  NSW: 800000,
  VIC: 600000,
  QLD: 800000,
  WA: 450000,
  SA: 650000,
  TAS: 750000,
  ACT: 1000000,
  NT: 650000,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const p = (text: string): GuideBlock => ({ type: "p", text });
const h3 = (text: string): GuideBlock => ({ type: "h3", text });
const ul = (...items: string[]): GuideBlock => ({ type: "list", items });

const monthlyRepayment = (principal: number) => {
  const r = RATE / 12;
  const n = TERM_YEARS * 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
};

const tuneDesc = (base: string, tails: string[]) => {
  let out = base.trim().replace(/\s+/g, " ");
  if (out.length > 160) return out.slice(0, 157).replace(/[\s,;:.\-—]+$/, "") + "…";
  for (const tail of tails) {
    if (out.length >= 150) break;
    const cand = (out + " " + tail.trim()).replace(/\s+/g, " ");
    if (cand.length <= 160) out = cand;
  }
  return out;
};

// Stable publish/modified dates — keep in sync with city guides.
const DATE_PUBLISHED = "2026-05-01";
const DATE_MODIFIED = "2026-05-11";

// Internal-link helper: produces the sibling suburb URL for the *other* two
// calculator topics. Used so each suburb page links to its two siblings.
const SIBLING = {
  "mortgage-calculator": ["lmi-calculator", "stamp-duty-calculator"] as const,
  "lmi-calculator": ["mortgage-calculator", "stamp-duty-calculator"] as const,
  "stamp-duty-calculator": ["mortgage-calculator", "lmi-calculator"] as const,
};

const TOPIC_LABEL: Record<string, string> = {
  "mortgage-calculator": "mortgage repayments",
  "lmi-calculator": "LMI",
  "stamp-duty-calculator": "stamp duty",
};

const EDITORIAL_GUIDE: Record<string, string> = {
  "mortgage-calculator": "fixed-vs-variable-rate",
  "lmi-calculator": "what-is-lmi",
  "stamp-duty-calculator": "stamp-duty-australia-2026",
};

// ─────────────── MORTGAGE ───────────────
function mortgageSuburbGuide(s: SuburbRecord): GuideMeta {
  const slug = `mortgage-calculator-${s.slug}`;
  const loan = s.median * LVR;
  const monthly = monthlyRepayment(loan);
  const fortnightly = (monthly * 12) / 26;
  const deposit20 = s.median * 0.2;
  const fhbCap = FHB_CAPS[s.state];

  const sections: GuideSection[] = [
    {
      h2: `${s.name} property market snapshot`,
      blocks: [
        p(`The median dwelling value in ${s.name} is approximately ${fmt(s.median)} (${s.state}). Located in ${s.parentCityName}'s growth corridor, ${s.name} sits within the broader ${s.parentCityName} property market and is subject to ${s.stateName} stamp duty rules and first home buyer concessions.`),
        p(`A 20% deposit on the ${s.name} median is ${fmt(deposit20)}. Buyers with a smaller deposit typically pay Lender's Mortgage Insurance (LMI) or qualify for the federal Home Guarantee Scheme.`),
      ],
    },
    {
      h2: `Typical mortgage repayments in ${s.name}`,
      blocks: [
        p(`Assuming an 80% LVR loan (${fmt(loan)}) over 30 years at the current average owner-occupier rate of ${(RATE * 100).toFixed(2)}%:`),
        ul(
          `Monthly repayment: ~${fmt(monthly)}`,
          `Fortnightly equivalent: ~${fmt(fortnightly)}`,
          `Total interest over 30 years: ~${fmt(monthly * 12 * 30 - loan)}`,
        ),
        h3("How rate moves change your repayment"),
        p(`Every 0.25% rate move shifts a ${fmt(loan)} loan by roughly ${fmt((loan * 0.0025) / 12)} per month. Stress-test at +3% above today's rate — that's APRA's serviceability buffer.`),
      ],
    },
    {
      h2: `${s.state} stamp duty and grants for ${s.name} buyers`,
      blocks: [
        p(`${s.stateName} offers a first home buyer stamp duty exemption up to ${fmt(fhbCap)}. On the ${s.name} median (${fmt(s.median)}), ${s.median <= fhbCap ? `eligible FHBs typically pay $0 in transfer duty` : `the median sits above the FHB cap, so partial concessions or full duty applies`}.`),
        p(`Use the ${s.stateName} stamp duty calculator to model your exact upfront cost, then combine it with the mortgage repayment estimate above for total cost of ownership.`),
      ],
    },
    {
      h2: `Linked calculators for ${s.name}`,
      blocks: [
        p(`Drill into the underlying numbers for ${s.name}:`),
        ul(
          `LMI calculator for ${s.name} — premium estimates at 95%, 90% and 85% LVR.`,
          `Stamp duty calculator for ${s.name} — exact ${s.state} duty for owner-occupiers, investors and FHBs.`,
          `${s.parentCityName} mortgage guide — wider market context for ${s.name}.`,
          `${s.state} stamp duty calculator — full state rule set.`,
        ),
      ],
    },
  ];

  return {
    slug,
    title: `Mortgage Calculator ${s.name} 2026`,
    metaTitle: `${s.name} Mortgage Calculator & Guide 2026 (${s.state}) | Calcy`,
    metaDescription: tuneDesc(
      `Calculate mortgage repayments in ${s.name} based on the ${fmt(s.median)} median. ${s.state} stamp duty, grants, and LMI explained.`,
      [
        `Free 2026 ${s.name} mortgage calculator.`,
        `Includes deposit, LMI and ${s.state} concession tips.`,
      ],
    ),
    category: `${s.name} mortgages`,
    readMins: 7,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    intro: `Everything ${s.name} home buyers need in 2026: typical repayments on the ${fmt(s.median)} median, ${s.state} stamp duty rules, grants, and how to size a deposit that works in this market.`,
    sections,
    keyTakeaways: [
      `${s.name} median dwelling value: ${fmt(s.median)}.`,
      `Monthly repayment at 80% LVR / 30y / ${(RATE * 100).toFixed(2)}%: ~${fmt(monthly)}.`,
      `Fortnightly equivalent: ~${fmt(fortnightly)}.`,
      `${s.state} FHB stamp duty exemption applies up to ${fmt(fhbCap)}.`,
    ],
    relatedCalculator: { to: "/mortgage-calculator", label: "Open the mortgage calculator" },
    relatedGuides: [
      `mortgage-calculator-${s.parentCitySlug}`,
      EDITORIAL_GUIDE["mortgage-calculator"],
      `lmi-calculator-${s.slug}`,
      `stamp-duty-calculator-${s.slug}`,
    ],
    faqs: [
      {
        question: `What is the average mortgage repayment in ${s.name}?`,
        answer: `On the ${s.name} median dwelling value (${fmt(s.median)}) with a 20% deposit and a 30-year loan at ${(RATE * 100).toFixed(2)}%, the monthly repayment is approximately ${fmt(monthly)}.`,
      },
      {
        question: `How much deposit do I need to buy in ${s.name}?`,
        answer: `A 20% deposit on the ${s.name} median is ${fmt(deposit20)}. First home buyers may qualify for the ${s.state} stamp duty exemption (up to ${fmt(fhbCap)}) and the federal Home Guarantee Scheme.`,
      },
      {
        question: `Is ${s.name} a good area to buy in 2026?`,
        answer: `${s.name} is part of ${s.parentCityName}'s broader market with a median around ${fmt(s.median)}. Suitability depends on personal circumstances, school catchments, commute, and long-term plans — this page is general information, not investment advice.`,
      },
    ],
  };
}

// ─────────────── LMI ───────────────
function lmiSuburbGuide(s: SuburbRecord): GuideMeta {
  const slug = `lmi-calculator-${s.slug}`;
  const lmi95 = Math.round(s.median * 0.95 * 0.038);
  const lmi90 = Math.round(s.median * 0.9 * 0.022);
  const lmi85 = Math.round(s.median * 0.85 * 0.011);

  const sections: GuideSection[] = [
    {
      h2: `Why LMI matters for ${s.name} buyers`,
      blocks: [
        p(`With ${s.name}'s median dwelling value at ${fmt(s.median)}, a 20% deposit means saving ${fmt(s.median * 0.2)} — out of reach for many buyers. Most ${s.name} purchases under 20% deposit attract Lender's Mortgage Insurance (LMI), a one-off premium added to the loan.`),
        p(`${s.name} sits inside ${s.parentCityName}'s market, so LMI premiums follow national lender pricing — but absolute dollar costs are determined by the local median.`),
      ],
    },
    {
      h2: `Estimated LMI cost in ${s.name}`,
      blocks: [
        p(`On the ${s.name} median (${fmt(s.median)}):`),
        ul(
          `5% deposit (95% LVR): LMI ≈ ${fmt(lmi95)}.`,
          `10% deposit (90% LVR): LMI ≈ ${fmt(lmi90)}.`,
          `15% deposit (85% LVR): LMI ≈ ${fmt(lmi85)}.`,
          `20%+ deposit: $0 LMI.`,
        ),
        p(`These are illustrative — exact LMI varies by lender (Helia/QBE), loan amount, and whether you are a first home buyer or investor.`),
      ],
    },
    {
      h2: `How to avoid LMI in ${s.name}`,
      blocks: [
        h3("Federal Home Guarantee Scheme"),
        p(`Eligible first home buyers can purchase in ${s.name} with a 5% deposit and have the government guarantee the gap — removing LMI entirely. ${s.state} property price caps apply each financial year.`),
        h3("Professional waivers"),
        p(`Doctors, lawyers, accountants and select other professions can borrow up to 90% LVR LMI-free with several lenders — useful in higher-priced ${s.parentCityName} suburbs.`),
        h3("Family guarantor loans"),
        p(`A parent can pledge equity in their ${s.state} property as additional security, allowing the buyer to settle a ${s.name} home with little or no LMI even at low deposit levels.`),
      ],
    },
  ];

  return {
    slug,
    title: `LMI Calculator ${s.name} 2026`,
    metaTitle: `LMI Calculator ${s.name} 2026 — Cost & How to Avoid It | Calcy`,
    metaDescription: tuneDesc(
      `LMI costs in ${s.name} on the ${fmt(s.median)} median. 5%, 10%, 15% deposit scenarios calculated.`,
      [
        `${s.state} Home Guarantee Scheme rules.`,
        `Free ${s.name} LMI calculator for 2026.`,
      ],
    ),
    category: `${s.name} LMI`,
    readMins: 6,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    intro: `Lender's Mortgage Insurance (LMI) is one of the largest hidden costs for ${s.name} buyers. Here's what LMI typically costs in ${s.name} and the legitimate ways to avoid it.`,
    sections,
    keyTakeaways: [
      `LMI on the ${s.name} median at 5% deposit: ~${fmt(lmi95)}.`,
      `At 10% deposit: ~${fmt(lmi90)}. At 15% deposit: ~${fmt(lmi85)}.`,
      `Federal Home Guarantee Scheme can remove LMI entirely for eligible ${s.name} FHBs.`,
      `Every 5% LVR you save cuts the premium meaningfully.`,
    ],
    relatedCalculator: { to: "/lmi-calculator", label: "Open the LMI calculator" },
    relatedGuides: [
      `lmi-calculator-${s.parentCitySlug}`,
      EDITORIAL_GUIDE["lmi-calculator"],
      `mortgage-calculator-${s.slug}`,
      `stamp-duty-calculator-${s.slug}`,
    ],
    faqs: [
      {
        question: `How much is LMI in ${s.name}?`,
        answer: `On the ${s.name} median (${fmt(s.median)}) with a 5% deposit, LMI is approximately ${fmt(lmi95)}. At 10% deposit it falls to roughly ${fmt(lmi90)}.`,
      },
      {
        question: `Can I avoid LMI buying in ${s.name}?`,
        answer: `Yes — the federal Home Guarantee Scheme lets eligible ${s.state} first home buyers purchase in ${s.name} with a 5% deposit and no LMI. Professional waivers and guarantor loans are also common.`,
      },
      {
        question: `Is LMI refundable in ${s.state}?`,
        answer: `LMI is generally non-refundable, but some lenders offer a partial refund if the loan is refinanced or paid out within the first 1–2 years. Check the specific policy with the lender at application.`,
      },
    ],
  };
}

// ─────────────── STAMP DUTY ───────────────
function stampDutySuburbGuide(s: SuburbRecord): GuideMeta {
  const slug = `stamp-duty-calculator-${s.slug}`;
  const owner = calcStampDuty(s.median, s.state, "owner");
  const fhb = calcStampDuty(s.median, s.state, "fhb");
  const fhbCap = FHB_CAPS[s.state];

  const sections: GuideSection[] = [
    {
      h2: `${s.state} stamp duty rules for ${s.name}`,
      blocks: [
        p(`Stamp duty (transfer duty) on a ${s.name} purchase is set by the ${s.stateName} government — not federal — and is one of the largest upfront costs of buying. On the ${s.name} median dwelling value (${fmt(s.median)}), an owner-occupier typically pays approximately ${fmt(owner.netDuty)} in transfer duty.`),
      ],
    },
    {
      h2: `First home buyer concessions in ${s.name}`,
      blocks: [
        p(`${s.stateName} offers concessions for first home buyers:`),
        ul(
          `Full exemption typically applies up to ${fmt(fhbCap)} (thresholds reviewed annually).`,
          `On the ${s.name} median, an eligible FHB pays approximately ${fmt(fhb.netDuty)} — saving ${fmt(owner.netDuty - fhb.netDuty)} versus the standard rate.`,
          `Off-the-plan and new-build purchases often attract additional discounts.`,
        ),
      ],
    },
    {
      h2: `Worked example for a ${s.name} purchase`,
      blocks: [
        p(`Buying a ${fmt(s.median)} home in ${s.name}:`),
        ul(
          `Standard owner-occupier duty: ~${fmt(owner.netDuty)}.`,
          `Eligible FHB duty: ~${fmt(fhb.netDuty)}.`,
          `Mortgage registration & transfer fees in ${s.state}: ~$300–$500.`,
          `Investor purchase: same as standard duty plus surcharge if foreign resident.`,
        ),
      ],
    },
    {
      h2: `When stamp duty is payable in ${s.state}`,
      blocks: [
        p(`In ${s.stateName}, stamp duty is generally payable within 30 days of settlement. Most ${s.name} buyers have their conveyancer remit duty directly via PEXA at settlement so the title transfers cleanly.`),
      ],
    },
  ];

  return {
    slug,
    title: `Stamp Duty Calculator ${s.name} 2026`,
    metaTitle: `Stamp Duty Calculator ${s.name} 2026 — ${s.state} Rates | Calcy`,
    metaDescription: tuneDesc(
      `Stamp duty on property in ${s.name}, ${s.state} in 2026. First home buyer exemptions and concessions included.`,
      [
        `Worked example on the ${fmt(s.median)} median.`,
        `Free ${s.state} stamp duty calculator.`,
      ],
    ),
    category: `${s.name} stamp duty`,
    readMins: 6,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    intro: `${s.stateName} stamp duty rules apply to every ${s.name} purchase. Here's how much owner-occupiers, first home buyers and investors typically pay in ${s.name} in 2026.`,
    sections,
    keyTakeaways: [
      `${s.name} owner-occupier duty on the median: ~${fmt(owner.netDuty)}.`,
      `Eligible FHB duty: ~${fmt(fhb.netDuty)} (saves ~${fmt(owner.netDuty - fhb.netDuty)}).`,
      `${s.state} FHB exemption typically applies up to ${fmt(fhbCap)}.`,
      `Duty is generally payable within 30 days of ${s.state} settlement.`,
    ],
    relatedCalculator: {
      to: `/stamp-duty-calculator/${s.state.toLowerCase()}`,
      label: `${s.state} stamp duty calculator`,
    },
    relatedGuides: [
      `stamp-duty-calculator-${s.parentCitySlug}`,
      EDITORIAL_GUIDE["stamp-duty-calculator"],
      `mortgage-calculator-${s.slug}`,
      `lmi-calculator-${s.slug}`,
    ],
    faqs: [
      {
        question: `How much stamp duty in ${s.name}, ${s.state}?`,
        answer: `On the ${s.name} median (${fmt(s.median)}), a standard owner-occupier pays approximately ${fmt(owner.netDuty)} in ${s.state} transfer duty.`,
      },
      {
        question: `Do first home buyers pay stamp duty in ${s.name}?`,
        answer: `Eligible first home buyers under the ${s.state} threshold of ${fmt(fhbCap)} typically pay ${fhb.netDuty === 0 ? "$0" : `approximately ${fmt(fhb.netDuty)}`} on a ${s.name} purchase, with phased concessions just above that cap.`,
      },
      {
        question: `When do you pay stamp duty in ${s.state}?`,
        answer: `${s.stateName} requires stamp duty to be paid within 30 days of settlement. Your conveyancer normally arranges this through PEXA at settlement so the title transfers cleanly.`,
      },
    ],
  };
}

// ─────────────── BUILD ALL ───────────────
export const SUBURB_GUIDES: GuideMeta[] = SUBURB_CATALOGUE.flatMap((s) => [
  mortgageSuburbGuide(s),
  lmiSuburbGuide(s),
  stampDutySuburbGuide(s),
]);

export const SUBURB_GUIDE_BY_SLUG: Record<string, GuideMeta> = Object.fromEntries(
  SUBURB_GUIDES.map((g) => [g.slug, g]),
);
