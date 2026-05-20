/**
 * Programmatic city-specific guides for every country in COUNTRIES.
 *
 * For each (country, city) we generate three articles: Mortgage, LMI, and
 * Stamp Duty (or country equivalent). Today this produces 50 cities × 3
 * topics = 150 AU guides. Adding a country to countryCatalogue.ts auto-
 * generates the same 150-page programmatic surface for that country.
 *
 * Slugs:
 *   - AU (default country): `/guides/<topic>-<city>`
 *   - Other countries:      `/guides/<topic>-<countryCode>-<city>`
 * This preserves existing AU URLs and reserves clean namespaces for future.
 */
import type { GuideMeta, GuideBlock, GuideSection } from "./guides";
import { COUNTRIES, type CountryRecord, type CityRecord } from "./countryCatalogue";

const p = (text: string): GuideBlock => ({ type: "p", text });
const h3 = (text: string): GuideBlock => ({ type: "h3", text });
const ul = (...items: string[]): GuideBlock => ({ type: "list", items });

const money = (country: CountryRecord, n: number) =>
  new Intl.NumberFormat(country.currencyLocale, {
    style: "currency",
    currency: country.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const slugBase = (country: CountryRecord, topic: string, city: CityRecord) =>
  country.code === "au"
    ? `${topic}-${city.slug}`
    : `${topic}-${country.code}-${city.slug}`;

/**
 * Ensure meta descriptions land in the 150–160 char SEO sweet spot.
 * Trims if too long, appends compact keyword-rich tails until in-range.
 */
function tuneDesc(base: string, tails: string[]): string {
  let out = base.trim().replace(/\s+/g, " ");
  if (out.length > 160) {
    return out.slice(0, 157).replace(/[\s,;:.\-—]+$/, "") + "…";
  }
  for (const tail of tails) {
    if (out.length >= 150) break;
    const candidate = (out + " " + tail.trim()).replace(/\s+/g, " ");
    if (candidate.length <= 160) out = candidate;
    else if (out.length < 150) {
      const room = 160 - out.length - 1;
      if (room > 8) out = out + " " + tail.slice(0, room).trim();
    }
  }
  return out;
}

// ---------------- MORTGAGE ----------------
function mortgageGuide(country: CountryRecord, c: CityRecord): GuideMeta {
  const slug = slugBase(country, "mortgage-calculator", c);
  const r = country.avgMortgageRate;
  const monthly = c.median * 0.8 * (r / 12) /
    (1 - Math.pow(1 + r / 12, -360));
  const repay = Math.round(monthly);
  const fhbCap = country.fhbCapByState[c.state] ?? 0;
  const fmt = (n: number) => money(country, n);

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
        p(`Assuming a 20% deposit, a 30-year principal-and-interest loan at the current average owner-occupier rate of ${(r * 100).toFixed(2)}% on the ${c.name} median (${fmt(c.median)}) produces a monthly repayment near ${fmt(repay)} — equivalent to roughly ${fmt(repay / 2)} fortnightly.`),
        h3(`How central-bank rate moves change your repayment`),
        p(`Every 0.25% policy rate move shifts a typical ${c.name} mortgage by roughly $40–$70 per month per $100k borrowed. Use the mortgage calculator with the “rate change” toggle to model future scenarios.`),
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
    metaTitle: `${c.name} Mortgage Calculator 2026 (${c.state})`,
    metaDescription: tuneDesc(
      `2026 ${c.name} mortgage guide: repayments on the ${fmt(c.median)} median, ${c.state} stamp duty, LMI and grants. Free ${c.name} mortgage calculator.`,
      [
        `Updated for current ${country.name} rates.`,
        `Includes deposit, repayment and serviceability tips for ${c.name} buyers.`,
        `See worked examples for ${c.exampleSuburbs[0]} and ${c.exampleSuburbs[1] || c.name}.`,
      ],
    ),
    category: `${c.name} mortgages`,
    readMins: 9,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `Everything ${c.name} home buyers need in 2026: typical repayments on the ${fmt(c.median)} median, ${c.state} stamp duty rules, grants, and how to size a deposit that works in this market.`,
    sections,
    keyTakeaways: [
      `${c.name} median dwelling value: ${fmt(c.median)} (houses ${fmt(c.medianHouse)}, units ${fmt(c.medianUnit)}).`,
      `Typical 30-yr P&I monthly repayment at ${(r * 100).toFixed(2)}%: ~${fmt(repay)}.`,
      `${c.state} FHB stamp duty exemption applies up to ${fmt(fhbCap)}.`,
      `Stress-test at +3% above today's rate before signing.`,
    ],
    relatedCalculator: { to: "/mortgage-calculator", label: "Open the mortgage calculator" },
    relatedGuides: ["fixed-vs-variable-rate", "borrowing-power-australia"],
    faqs: [
      { question: `What is the average mortgage repayment in ${c.name}?`,
        answer: `On the ${c.name} median dwelling value (${fmt(c.median)}) with a 20% deposit and a 30-year loan at ${(r * 100).toFixed(2)}%, the monthly repayment is around ${fmt(repay)}.` },
      { question: `How much deposit do I need to buy in ${c.name}?`,
        answer: `A 20% deposit on the ${c.name} median is ${fmt(c.median * 0.2)}. Buyers entering with 5–10% can use the federal Home Guarantee Scheme to avoid LMI, subject to caps.` },
      { question: `Are mortgage rates different in ${c.name} vs the rest of ${country.name}?`,
        answer: `Lender rates are set nationally, not by city. However loan size, LVR, and ${c.state}-specific incentives can change your effective cost in ${c.name}.` },
    ],
  };
}

// ---------------- LMI ----------------
function lmiGuide(country: CountryRecord, c: CityRecord): GuideMeta {
  const slug = slugBase(country, "lmi-calculator", c);
  const lmi5 = Math.round(c.median * 0.95 * 0.038);
  const lmi10 = Math.round(c.median * 0.90 * 0.022);
  const fmt = (n: number) => money(country, n);
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
    metaTitle: `${c.name} LMI Calculator 2026 (${c.state})`,
    metaDescription: tuneDesc(
      `Estimate Lender's Mortgage Insurance for a ${c.name} home loan in 2026. See LMI on the ${fmt(c.median)} ${c.state} median at 5%, 10% and 15% deposits.`,
      [
        `Includes ways ${c.name} first-home buyers can avoid LMI entirely.`,
        `Compare lender premiums for ${c.exampleSuburbs[0]} and ${c.exampleSuburbs[1] || c.name}.`,
        `Free ${c.name} LMI calculator updated for ${country.name} buyers.`,
      ],
    ),
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
function stampDutyGuide(country: CountryRecord, c: CityRecord): GuideMeta {
  const slug = slugBase(country, "stamp-duty-calculator", c);
  const fhbCap = country.fhbCapByState[c.state] ?? 0;
  const dutyMedian = Math.round(c.median * 0.045);
  const fmt = (n: number) => money(country, n);
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
          `Full exemption typically applies up to ${fmt(fhbCap)} (purchase price thresholds vary by year).`,
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
          `Eligible FHB under ${fmt(fhbCap)}: $0 (or close to it).`,
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
    metaTitle: `${c.name} Stamp Duty Calculator 2026 (${c.state})`,
    metaDescription: tuneDesc(
      `Calculate ${c.name} stamp duty in 2026. ${c.state} rates, FHB exemptions up to ${fmt(fhbCap)}, worked examples on the ${fmt(c.median)} ${c.name} median.`,
      [
        `Free ${c.name} stamp duty calculator for owner-occupiers and investors.`,
        `Includes ${c.exampleSuburbs[0]} pricing and ${c.state} concession rules.`,
        `Updated for ${country.name} buyers in 2026.`,
      ],
    ),
    category: `${c.name} stamp duty`,
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `${c.stateName} stamp duty rules apply to every ${c.name} purchase. Here's how much owner-occupiers, first-home buyers and investors typically pay in ${c.name} in 2026.`,
    sections,
    keyTakeaways: [
      `${c.name} owner-occupier duty on the median: ~${fmt(dutyMedian)}.`,
      `${c.state} FHB exemption typically applies up to ${fmt(fhbCap)}.`,
      `Duty is generally payable within 30 days of ${c.state} settlement.`,
      `Always use a ${c.state}-specific stamp duty calculator — rates differ across states.`,
    ],
    relatedCalculator: {
      to: `/stamp-duty-calculator/${c.state.toLowerCase()}`,
      label: `${c.state} stamp duty calculator`,
    },
    relatedGuides: ["stamp-duty-australia-2026", "first-home-buyer-grants-2026"],
    faqs: [
      { question: `How much is stamp duty in ${c.name}?`,
        answer: `On the ${c.name} median (${fmt(c.median)}), an owner-occupier pays approximately ${fmt(dutyMedian)} in ${c.state} transfer duty. First-home buyers under ${fmt(fhbCap)} typically pay $0.` },
      { question: `Do first-home buyers pay stamp duty in ${c.name}?`,
        answer: `Eligible ${c.name} first-home buyers usually pay no stamp duty under the ${c.state} threshold of ${fmt(fhbCap)}, with phased concessions just above that cap.` },
      { question: `When do I have to pay stamp duty after settlement in ${c.state}?`,
        answer: `${c.stateName} requires stamp duty to be paid within 30 days of settlement. Your conveyancer normally arranges this through PEXA at settlement.` },
    ],
  };
}

// Build the full city-guide catalogue for every country.
export const CITY_GUIDES: GuideMeta[] = COUNTRIES.flatMap((country) =>
  country.cities.flatMap((c) => [
    mortgageGuide(country, c),
    lmiGuide(country, c),
    stampDutyGuide(country, c),
  ]),
);

// Re-export for legacy callers (GuidesIndex.tsx).
export { COUNTRIES, type CityRecord as City } from "./countryCatalogue";
export const CITIES = COUNTRIES.flatMap((country) =>
  country.cities.map((c) => ({ ...c, country: country.code })),
);
