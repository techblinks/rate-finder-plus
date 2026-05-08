import type { FaqItem } from "./faqs";
import type { StateCode } from "@/lib/calc/stampDuty";

export interface StampDutyStateContent {
  code: StateCode;
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  fhbThreshold: string;
  fhog: string;
  /** Each section ~120-200 words. Combined ~900-1100 words. */
  sections: { heading: string; body: string }[];
  faqs: FaqItem[];
}

const common = (state: string) =>
  `Settlement in ${state} is the day legal ownership transfers. Your conveyancer or solicitor lodges the transfer with the state revenue office, pays stamp duty from cleared funds, and registers the title in your name. Because stamp duty is paid in cash at settlement — not financed into your home loan — it must sit alongside your deposit, lender fees, legal costs, and inspections in your upfront budget.`;

export const STAMP_DUTY_STATE_CONTENT: Record<string, StampDutyStateContent> = {
  nsw: {
    code: "NSW",
    slug: "nsw",
    name: "New South Wales",
    metaTitle: "NSW Stamp Duty Calculator 2026 — First Home Buyer & FHOG | Calcy",
    metaDescription:
      "Calculate NSW stamp duty for 2026. Includes first home buyer exemption to $800k, concession to $1m, and $10,000 FHOG on new homes. Free, no sign-up.",
    h1: "NSW Stamp Duty Calculator 2026",
    subheading:
      "Calculate transfer duty for any New South Wales property purchase, including first home buyer exemptions, concessions, and the $10,000 FHOG on new builds.",
    fhbThreshold: "$800,000 (full exemption), $800k–$1m (sliding concession)",
    fhog: "$10,000 on new homes up to $750,000",
    sections: [
      {
        heading: "How NSW stamp duty is calculated in 2026",
        body: `New South Wales applies progressive transfer duty administered by Revenue NSW. Brackets start at $1.25 per $100 below $16,000 and step up through six tiers, peaking at $7.00 per $100 for premium property duty above $3,505,000. A typical owner-occupier purchase of $700,000 incurs approximately $26,235 in duty, while $1,000,000 attracts roughly $40,055. Investors pay the same base scale as owner-occupiers — there is no separate investor surcharge for Australian residents — but foreign buyers pay an additional 9% surcharge purchaser duty on top of the standard amount. NSW indexes its first home buyer thresholds annually with CPI, but the underlying brackets have been broadly stable since 2019, making NSW's duty among the highest of any Australian state at mid-range price points.`,
      },
      {
        heading: "First home buyer concessions in NSW",
        body: `NSW offers one of the most generous first home buyer schemes in Australia. Eligible first home buyers pay $0 stamp duty on properties up to $800,000 and receive a sliding concession between $800,000 and $1,000,000. The concession reduces linearly: at $900,000 you pay roughly half the standard duty, and at $1,000,000 the concession phases out entirely. To qualify, at least one applicant must be 18+, an Australian citizen or permanent resident, and must occupy the home as their principal place of residence for a continuous 12-month period within the first 12 months of settlement. The First Home Owner Grant (FHOG) of $10,000 is separately available for newly built homes valued up to $750,000 — it is not paid on established home purchases.`,
      },
      {
        heading: "Worked example — $700,000 first home in Sydney",
        body: `Consider a first home buyer purchasing an established apartment in Western Sydney for $700,000 with a 10% deposit. Standard duty on this purchase is $26,235. Because the price is below the $800,000 first home buyer threshold, the duty is reduced to $0 — a saving of $26,235. The buyer would still pay legal/conveyancing fees (~$2,000), building and pest inspections (~$1,000), and Lender's Mortgage Insurance because their deposit is below 20%. Total upfront cash required at settlement, excluding the deposit, is approximately $3,000 — a dramatic improvement on the $29,000+ that an investor or non-FHB owner-occupier would face on the same purchase.`,
      },
      {
        heading: "When NSW stamp duty is paid",
        body: `NSW stamp duty must be paid within three months of contract exchange, or before settlement — whichever comes first. ${common("NSW")} If you exchange contracts on a property to be settled six months later (common for off-the-plan purchases), the three-month deadline still applies and your conveyancer arranges payment in the interim. Late payment attracts interest charged daily at the Revenue NSW market rate, currently around 11% p.a., so it is critical to confirm the timing with your solicitor immediately after exchange.`,
      },
      {
        heading: "Comparing NSW with other states",
        body: `On a $700,000 owner-occupier purchase, NSW duty (~$26,235) sits between Victoria's ~$37,070 and Queensland's ~$24,525. NSW's first home buyer threshold of $800,000 is the highest in mainland Australia, making it particularly favourable for FHBs in metro Sydney where median prices exceed every other capital. However, for non-FHB buyers, NSW remains expensive and is often a key factor pushing buyers toward Queensland or interstate investment markets. Use Calcy's Compare All States feature on the main stamp duty calculator to see the exact duty payable for your purchase price across every state and territory.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in NSW on a $700,000 property?",
        answer:
          "Stamp duty in NSW on a $700,000 owner-occupier purchase is approximately $26,235 in 2026. First home buyers under $800,000 pay $0 — a saving of $26,235. Add roughly $3,000 in legal and inspection costs to estimate your total upfront cash.",
      },
      {
        question: "What is the NSW first home buyer threshold for stamp duty?",
        answer:
          "Eligible NSW first home buyers pay $0 stamp duty on properties up to $800,000 and receive a sliding concession between $800,000 and $1,000,000. Above $1,000,000 the standard rates apply with no concession.",
      },
      {
        question: "Do NSW investors pay extra stamp duty?",
        answer:
          "Australian-resident investors pay the same scale as owner-occupiers in NSW. Foreign buyers pay an additional 9% surcharge purchaser duty on top of the standard amount, applied to the dutiable value of residential property.",
      },
      {
        question: "When is stamp duty paid in NSW?",
        answer:
          "NSW stamp duty must be paid within three months of contract exchange or at settlement, whichever comes first. Your conveyancer arranges payment to Revenue NSW. Late payment attracts daily interest, currently around 11% p.a.",
      },
      {
        question: "Can I get the $10,000 FHOG on an established home in NSW?",
        answer:
          "No. The NSW $10,000 First Home Owner Grant is only available on newly built homes valued up to $750,000 — including off-the-plan and house-and-land packages. Established home purchases do not qualify, although first home buyer stamp duty exemptions still apply.",
      },
    ],
  },
  vic: {
    code: "VIC",
    slug: "vic",
    name: "Victoria",
    metaTitle: "VIC Stamp Duty Calculator 2026 — First Home Buyer & PPR | Calcy",
    metaDescription:
      "Calculate Victoria stamp duty for 2026. First home buyer exemption to $600k, concession to $750k, PPR concession, and $10,000 FHOG. Free, no sign-up.",
    h1: "Victoria Stamp Duty Calculator 2026",
    subheading:
      "Estimate Victorian transfer duty including the first home buyer exemption to $600,000, sliding concession to $750,000, principal place of residence (PPR) concession, and the $10,000 FHOG on new homes.",
    fhbThreshold: "$600,000 (full exemption), $600k–$750k (sliding concession)",
    fhog: "$10,000 on new homes; $20,000 in regional Victoria (selected)",
    sections: [
      {
        heading: "Victoria's stamp duty brackets in 2026",
        body: `The State Revenue Office Victoria administers transfer duty using four progressive brackets. Duty starts at 1.4% below $25,000 and rises to a flat 6.5% above $2,000,000 — among the steepest top brackets in Australia. A $700,000 owner-occupier purchase incurs approximately $37,070 in stamp duty, materially higher than NSW (~$26,235) or Queensland (~$24,525) at the same price. Victoria has not indexed its underlying brackets since 2008, so bracket creep has steadily increased duty as Melbourne property prices rose. The 2026 rates remain unchanged from 2024–25, although the first home buyer thresholds and the principal place of residence (PPR) concession continue to apply for eligible buyers.`,
      },
      {
        heading: "First home buyer exemptions and concessions",
        body: `Victorian first home buyers pay $0 stamp duty on properties up to $600,000 and receive a sliding concession from $600,001 to $750,000. The concession reduces linearly with price — at $675,000 you pay approximately half the standard duty. To qualify, applicants must be Australian citizens or permanent residents, must occupy the property as their principal place of residence for at least 12 continuous months within the first 12 months after settlement, and must be 18 years or older. The First Home Owner Grant of $10,000 is available on newly built homes valued up to $750,000, with a doubled $20,000 grant for new homes built in selected regional Victorian areas.`,
      },
      {
        heading: "PPR concession for owner-occupiers (non-FHB)",
        body: `Victoria offers a separate Principal Place of Residence (PPR) concession that benefits non-first-home-buyer owner-occupiers. For purchases between $130,000 and $550,000 used as your primary home, duty is calculated using a discounted scale that can save up to $3,100 compared with the standard investor rate. The PPR concession is automatic — your conveyancer applies it at lodgement provided you sign the SRO declaration confirming you will occupy the property within 12 months and live there continuously for 12 months. This makes Victoria one of the few states with a meaningful concession for repeat homebuyers, not just FHBs.`,
      },
      {
        heading: "When and how Victorian stamp duty is paid",
        body: `Stamp duty in Victoria must be paid within 30 days of settlement. ${common("Victoria")} The SRO accepts electronic conveyancing payments through PEXA, which has been mandatory for most Victorian property transfers since 2018. Late payment incurs penalty tax and interest, calculated daily. Off-the-plan purchases benefit from a separate dutiable-value reduction: duty is calculated on the land value at contract date plus the construction work completed, not the final sale price — potentially saving tens of thousands on apartments contracted before construction begins.`,
      },
      {
        heading: "Foreign buyers and additional duty in Victoria",
        body: `Non-Australian residents purchasing residential property in Victoria pay an Additional Duty surcharge of 8% on top of the standard amount. On a $700,000 purchase, this adds approximately $56,000 to the foreign buyer's bill. The surcharge applies to permanent visa holders only after they meet residency requirements, and to discretionary trusts whose beneficiaries include foreign persons. The Australian Taxation Office's FIRB approval is also required for most foreign-resident residential purchases, with separate fees ranging from $14,700 to over $1m depending on purchase price.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in Victoria on a $700,000 property?",
        answer:
          "Victorian stamp duty on a $700,000 owner-occupier purchase is approximately $37,070 in 2026, before any concessions. First home buyers between $600,001 and $750,000 receive a sliding concession; below $600,000 the duty is $0.",
      },
      {
        question: "What is the Victorian first home buyer stamp duty threshold?",
        answer:
          "Eligible first home buyers in Victoria pay $0 stamp duty up to $600,000 and a sliding concession between $600,001 and $750,000. Above $750,000 the standard rates apply with no FHB discount.",
      },
      {
        question: "What is the Victorian PPR concession?",
        answer:
          "The Principal Place of Residence (PPR) concession reduces stamp duty for owner-occupiers (including non-FHBs) buying between $130,000 and $550,000. It can save up to $3,100. You must occupy the property within 12 months and live there continuously for 12 months.",
      },
      {
        question: "Is the FHOG higher in regional Victoria?",
        answer:
          "Yes. The standard $10,000 First Home Owner Grant is doubled to $20,000 for eligible new home purchases in selected regional Victorian local government areas. The grant applies only to newly built homes, not established properties.",
      },
      {
        question: "When do you pay stamp duty in Victoria?",
        answer:
          "Victorian stamp duty must be paid within 30 days of settlement. Your conveyancer arranges payment through PEXA as part of the electronic conveyancing process. Late payment attracts penalty tax and daily interest.",
      },
    ],
  },
  qld: {
    code: "QLD",
    slug: "qld",
    name: "Queensland",
    metaTitle: "QLD Stamp Duty Calculator 2026 — Home Concession & FHOG | Calcy",
    metaDescription:
      "Calculate Queensland transfer duty for 2026. Includes home concession, first home concession to $550k, $30,000 FHOG on new homes, and investor rates. Free.",
    h1: "Queensland Stamp Duty Calculator 2026",
    subheading:
      "Calculate Queensland transfer duty including the Home Concession for owner-occupiers, First Home Concession up to $550,000, and the $30,000 First Home Owner Grant on new builds.",
    fhbThreshold: "$500,000 (full exemption), $500k–$550k (sliding concession)",
    fhog: "$30,000 on new homes up to $750,000 (one of Australia's highest grants)",
    sections: [
      {
        heading: "How Queensland transfer duty works in 2026",
        body: `Queensland Revenue Office administers transfer duty using a five-bracket progressive scale, starting at $0 below $5,000 and rising to $5.75 per $100 above $1,000,000. Critically, Queensland applies a separate Home Concession scale to all owner-occupiers — even those who are not first home buyers. This scale charges a flat $1 per $100 on the first $350,000 of dutiable value, materially reducing duty for all primary residences. A $700,000 owner-occupier purchase using the Home Concession incurs approximately $24,525 in duty, compared with roughly $17,325 if the entire amount could be discounted (it cannot — only the first $350,000 receives the home rate). Investors pay the standard scale without the Home Concession.`,
      },
      {
        heading: "First Home Concession and FHOG",
        body: `Queensland's First Home Concession is fully exempt up to $500,000 and tapers between $500,001 and $550,000. Above $550,000, eligible first home buyers default back to the Home Concession scale. To qualify you must be at least 18, never have held an interest in residential land in Australia, and occupy the property within 12 months of settlement, continuously, for at least 12 months. Queensland also offers Australia's largest First Home Owner Grant — $30,000 for newly built homes valued up to $750,000 — and has separately abolished stamp duty on new builds for FHBs up to $700,000 since 2024. The Vacant Land Concession exempts duty on land below $250,000 if you build a home and occupy it within two years.`,
      },
      {
        heading: "Worked example — $600,000 home in Brisbane",
        body: `Consider a Queensland first home buyer purchasing an established home in Brisbane for $600,000 with a 10% deposit. The price exceeds the $550,000 First Home Concession cap, so the buyer falls back to the Home Concession scale. Duty under the Home Concession is approximately $12,850 — significantly less than the $20,025 a Victorian buyer would pay on the same price. Add legal/conveyancing (~$2,000) and inspections (~$1,000), and total upfront costs (excluding deposit) are approximately $15,850. If the same buyer instead purchased a new $600,000 home, they would receive the $30,000 FHOG, fully offsetting stamp duty and most upfront costs combined.`,
      },
      {
        heading: "Foreign buyers and additional foreign acquirer duty",
        body: `Queensland charges an Additional Foreign Acquirer Duty (AFAD) of 8% for foreign individuals, corporations, or trusts purchasing residential property. ${common("Queensland")} Stamp duty must be lodged within 30 days of settlement, and the Queensland Revenue Office requires the standard transfer documents plus a duty self-assessment via QRO Online. Penalties for late lodgement begin at 5% of duty owed plus interest at the prevailing market rate.`,
      },
      {
        heading: "Why Queensland is attractive to investors and FHBs",
        body: `Queensland combines below-average duty rates, the Home Concession for any primary residence, the $30,000 FHOG for new builds, and (since 2024) full stamp duty exemption on new homes for FHBs up to $700,000 — collectively making QLD one of Australia's most affordable states for first home buyers entering new construction. For investors, Queensland's lower base duty rate compared with NSW or VIC at sub-$1m price points has driven significant interstate investment, particularly into Brisbane, Gold Coast, and Sunshine Coast markets. The trade-off is QLD's higher land tax for non-Queensland-resident investors.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in QLD on a $700,000 home?",
        answer:
          "Queensland stamp duty on a $700,000 owner-occupier purchase using the Home Concession is approximately $17,325 in 2026. Investors without the concession pay approximately $24,525 on the same price.",
      },
      {
        question: "What is the QLD First Home Concession?",
        answer:
          "QLD first home buyers pay $0 stamp duty up to $500,000 and a sliding concession between $500,001 and $550,000. Above $550,000, the Home Concession applies. Since 2024, FHBs purchasing new homes up to $700,000 also pay zero duty.",
      },
      {
        question: "How big is the Queensland First Home Owner Grant?",
        answer:
          "Queensland offers a $30,000 First Home Owner Grant on newly built homes valued up to $750,000 — one of the largest grants in Australia. The grant applies to off-the-plan apartments, house-and-land packages, and substantially renovated homes.",
      },
      {
        question: "Do owner-occupiers get a stamp duty discount in QLD even if not first home buyers?",
        answer:
          "Yes. Queensland's Home Concession applies to any owner-occupier purchasing their principal place of residence. It charges $1 per $100 on the first $350,000 of property value, saving approximately $7,200 compared with the investor rate.",
      },
      {
        question: "When is stamp duty paid in Queensland?",
        answer:
          "QLD transfer duty must be lodged and paid within 30 days of settlement. Your solicitor or conveyancer manages payment via the Queensland Revenue Office. Late lodgement incurs a 5% penalty plus interest at market rates.",
      },
    ],
  },
  wa: {
    code: "WA",
    slug: "wa",
    name: "Western Australia",
    metaTitle: "WA Stamp Duty Calculator 2026 — First Home Buyer & FHOG | Calcy",
    metaDescription:
      "Calculate WA transfer duty for 2026. First home buyer exemption to $430k, concession to $530k, $10,000 FHOG on new homes. Free, no sign-up.",
    h1: "WA Stamp Duty Calculator 2026",
    subheading:
      "Calculate Western Australian transfer duty including first home buyer exemptions, concessions, and the $10,000 FHOG on new homes.",
    fhbThreshold: "$430,000 (full exemption), $430k–$530k (sliding concession)",
    fhog: "$10,000 on new homes up to $750,000 (Perth metro) / $1,000,000 (north of 26th parallel)",
    sections: [
      {
        heading: "WA transfer duty rates in 2026",
        body: `RevenueWA administers transfer duty using a six-bracket progressive scale. Duty starts at 1.9% below $120,000 and reaches 5.15% above $725,000, with a top bracket of 6% above $1.5m. A $700,000 owner-occupier purchase incurs approximately $25,585 in duty — slightly less than NSW at the same price. Western Australia uses a single scale for both owner-occupiers and investors (Australian residents), with no separate concession for non-FHB owner-occupiers. The state also indexes its bracket thresholds infrequently, so bracket creep applies similarly to other states.`,
      },
      {
        heading: "First home buyer concessions in WA",
        body: `Western Australian first home buyers pay $0 transfer duty on properties up to $430,000, with a sliding concession from $430,001 to $530,000. The concession is calculated linearly: at $480,000, duty is approximately half the standard scale; at $530,000 the concession phases out entirely. To qualify, you must be 18+, an Australian citizen or permanent resident, never have owned residential property in Australia, and occupy the property as your primary home for at least 12 continuous months. Vacant land used to build a first home receives a separate exemption up to $300,000 with a concession to $400,000. The WA First Home Owner Grant of $10,000 applies to newly built homes valued up to $750,000 in Perth metro and up to $1 million north of the 26th parallel (covering the Pilbara, Kimberley, and Mid West regions).`,
      },
      {
        heading: "Foreign buyer surcharge",
        body: `Western Australia applies a Foreign Buyer Duty surcharge of 7% on top of standard transfer duty for foreign individuals, corporations, and trusts purchasing residential property. ${common("Western Australia")} Settlement in WA typically occurs 30–45 days after offer acceptance, faster than the eastern states' 60–90 day norm — a key consideration for buyers needing time to organise finance approvals.`,
      },
      {
        heading: "Worked example — $500,000 home in Perth",
        body: `A WA first home buyer purchasing an established home in Perth for $500,000 with a 10% deposit falls within the FHB sliding concession ($430k–$530k). At $500,000, the FHB concession reduces standard duty of approximately $16,200 to roughly $11,340 — a saving of $4,860. If the same buyer purchased a new home at the same price, they would also receive the $10,000 FHOG. Total cash at settlement (excluding the deposit) — including duty, FHOG offset, legal, and inspections — would be approximately $4,300. By contrast, a non-FHB owner-occupier would face approximately $19,200 including the same costs.`,
      },
      {
        heading: "Why WA's mining-belt grants matter",
        body: `Western Australia is the only state offering a higher FHOG threshold for new homes built in remote areas. New homes north of the 26th parallel — including Karratha, Port Hedland, Broome, and Geraldton — qualify for the $10,000 FHOG up to a $1 million purchase price, compared with $750,000 in Perth metro. This reflects the higher cost of new construction in remote mining regions. Combined with WA's relatively affordable median house prices, this makes regional WA one of Australia's most achievable markets for new-home FHBs.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in WA on a $700,000 home?",
        answer:
          "WA transfer duty on a $700,000 owner-occupier purchase is approximately $25,585 in 2026. First home buyers under $430,000 pay $0 and receive a sliding concession between $430,000 and $530,000.",
      },
      {
        question: "What is the WA first home buyer threshold?",
        answer:
          "WA first home buyers pay no transfer duty on properties up to $430,000, with a sliding concession to $530,000. Above $530,000 the standard rates apply. Vacant land FHBs receive an exemption to $300,000 and concession to $400,000.",
      },
      {
        question: "Is the WA First Home Owner Grant higher in remote areas?",
        answer:
          "Yes. The $10,000 FHOG applies to new homes up to $750,000 in Perth metro, but rises to a $1,000,000 cap for new homes built north of the 26th parallel — covering the Pilbara, Kimberley, and Mid West mining regions.",
      },
      {
        question: "Do investors pay extra stamp duty in WA?",
        answer:
          "Australian-resident investors pay the same scale as owner-occupiers in WA. Foreign buyers (individuals, companies, trusts) pay an additional 7% Foreign Buyer Duty surcharge on top of the standard transfer duty.",
      },
      {
        question: "When is WA transfer duty paid?",
        answer:
          "WA transfer duty must be paid within 30 days of contract date or at settlement, whichever is earlier. Your settlement agent or solicitor lodges payment to RevenueWA. WA settlements typically complete 30–45 days after offer acceptance.",
      },
    ],
  },
  sa: {
    code: "SA",
    slug: "sa",
    name: "South Australia",
    metaTitle: "SA Stamp Duty Calculator 2026 — FHB Exemption & FHOG | Calcy",
    metaDescription:
      "Calculate South Australian stamp duty for 2026. Includes the FHB new-home exemption (no value cap), $15,000 FHOG, and full progressive rates. Free.",
    h1: "SA Stamp Duty Calculator 2026",
    subheading:
      "Calculate South Australian conveyance duty for 2026, including the first home buyer new-home exemption (uncapped), $15,000 FHOG, and standard progressive rates for established homes and investors.",
    fhbThreshold: "Full exemption on new homes / off-the-plan (no property value cap)",
    fhog: "$15,000 on new homes up to $650,000 contract price",
    sections: [
      {
        heading: "South Australian conveyance duty in 2026",
        body: `RevenueSA administers conveyance duty (the legal name for stamp duty in SA) using an eight-bracket progressive scale, the most granular of any Australian state. Duty starts at $1 per $100 below $12,000 and reaches $5.50 per $100 above $500,000. A $500,000 owner-occupier purchase incurs approximately $21,330 in duty, while $700,000 attracts roughly $32,330. Unlike most other states, SA has no general first home buyer concession for established homes — the standard scale applies regardless of whether the buyer has owned property before.`,
      },
      {
        heading: "SA's uncapped FHB new-home exemption",
        body: `Since June 2024, South Australia has fully exempted eligible first home buyers from conveyance duty when purchasing or building a new home — with no property value cap. This is the most generous first home buyer scheme in Australia for high-value new construction: a FHB purchasing a $1.2 million new home in SA pays $0 duty, compared with roughly $52,000 in NSW, $66,000 in VIC, or $42,000 in QLD. To qualify, applicants must be Australian citizens or permanent residents, must not have previously held an interest in residential land in Australia, and must occupy the home as their principal residence for at least six continuous months within the first 12 months after settlement.`,
      },
      {
        heading: "First Home Owner Grant in SA",
        body: `The South Australian FHOG provides $15,000 for newly built homes valued up to $650,000. The grant can be claimed at settlement (for spec-built or off-the-plan purchases) or progressively during construction (for owner-builders and house-and-land packages). The FHOG is paid in addition to the new-home stamp duty exemption — meaning a FHB building a new home below $650,000 receives both benefits simultaneously, often saving $25,000–$40,000 in upfront costs. Established home FHBs receive neither benefit and pay the full standard scale.`,
      },
      {
        heading: "When and how SA duty is paid",
        body: `${common("South Australia")} Conveyance duty must be lodged with RevenueSA within two months of settlement, with payment due at lodgement. Most SA conveyancers lodge electronically through PEXA, automating the duty assessment. Late lodgement attracts penalty interest. SA's standard contract-to-settlement timeframe is 30–60 days, with electronic conveyancing now compulsory for most transactions.`,
      },
      {
        heading: "Foreign buyer surcharge in SA",
        body: `South Australia applies a Foreign Ownership Surcharge of 7% on top of standard duty for residential property purchases by foreign individuals, corporations, and trusts. The surcharge is in addition to the standard scale and the federal FIRB application fee. SA also charges an Emergency Services Levy on residential land annually, which non-resident owners typically pay at a higher rate.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in SA on a $500,000 home?",
        answer:
          "South Australian conveyance duty on a $500,000 owner-occupier purchase is approximately $21,330 in 2026. First home buyers purchasing a new home are fully exempt regardless of value, but established home FHBs pay the full duty.",
      },
      {
        question: "Is there a first home buyer stamp duty exemption in SA?",
        answer:
          "Yes — but only for new homes. Since June 2024, eligible SA first home buyers pay $0 duty on new builds and off-the-plan purchases with no property value cap. Established homes are not exempt and FHBs pay full duty on those.",
      },
      {
        question: "How much is the SA First Home Owner Grant?",
        answer:
          "The SA FHOG is $15,000 for newly built homes valued up to $650,000. It can be claimed alongside the FHB new-home stamp duty exemption, allowing eligible buyers to save up to ~$40,000 in combined upfront costs.",
      },
      {
        question: "Do investors pay extra duty in South Australia?",
        answer:
          "Australian-resident investors pay the standard SA scale. Foreign individuals, companies, and trusts pay an additional 7% Foreign Ownership Surcharge on top of the standard conveyance duty when purchasing residential property.",
      },
      {
        question: "When is conveyance duty paid in SA?",
        answer:
          "South Australian conveyance duty must be lodged with RevenueSA within two months of settlement, with payment due at lodgement. Your conveyancer typically lodges electronically through PEXA. Late lodgement attracts penalty interest.",
      },
    ],
  },
  tas: {
    code: "TAS",
    slug: "tas",
    name: "Tasmania",
    metaTitle: "Tasmania Stamp Duty Calculator 2026 — FHB 50% Concession | Calcy",
    metaDescription:
      "Calculate Tasmanian stamp duty for 2026. Includes 50% FHB concession on established homes to $750k and $30,000 FHOG on new builds. Free, no sign-up.",
    h1: "Tasmania Stamp Duty Calculator 2026",
    subheading:
      "Calculate Tasmanian transfer duty for 2026, including the 50% first home buyer concession on established homes up to $750,000 and the $30,000 FHOG for newly built properties.",
    fhbThreshold: "50% concession on established homes up to $750,000",
    fhog: "$30,000 on new homes up to $600,000 — extended through 2026",
    sections: [
      {
        heading: "Tasmania's transfer duty rates",
        body: `The State Revenue Office of Tasmania administers transfer duty using seven progressive brackets. A flat $50 minimum applies below $3,000, then rates rise from 1.75% to a top bracket of 4.5% above $725,000. A $500,000 owner-occupier purchase incurs approximately $16,560 in duty, while $700,000 attracts roughly $24,560. Tasmania's brackets have been gradually adjusted upward since 2018 in response to rapid Hobart property price growth, but mid-tier brackets remain among the lower in Australia.`,
      },
      {
        heading: "Tasmania's 50% FHB established-home concession",
        body: `Tasmania is unique among Australian states in offering a 50% stamp duty concession specifically for first home buyers purchasing established homes up to $750,000. This concession halves the duty payable rather than fully exempting it. On a $500,000 established home purchase, the FHB pays approximately $8,280 instead of $16,560 — a saving of $8,280. The concession requires applicants to be 18+, Australian citizens or permanent residents, never to have owned residential property in Australia, and to occupy the home for at least six continuous months within the first 12 months after settlement.`,
      },
      {
        heading: "Tasmania's $30,000 FHOG (extended through 2026)",
        body: `Tasmania currently offers Australia's equal-largest First Home Owner Grant — $30,000 for newly built homes valued up to $600,000. The grant has been extended several times and is currently in place through 30 June 2026. Eligible buyers can claim both the $30,000 FHOG on new homes and the 50% established-home concession in the future when upgrading. ${common("Tasmania")} Settlement typically occurs 30–60 days after contract signing, with most conveyancers using PEXA for electronic lodgement.`,
      },
      {
        heading: "Pensioner downsizing concession",
        body: `Tasmania offers a separate Pensioner Downsizing Stamp Duty Concession of 50% for eligible pensioners aged 60+ who sell their existing home and purchase a smaller residence. The concession applies to homes valued up to $600,000. The pensioner must have lived in the previous home as their principal residence for at least 10 years and the new home must also become their principal residence. This is one of the few state-level concessions that explicitly supports retirees downsizing into more manageable properties.`,
      },
      {
        heading: "Foreign buyers and additional duty",
        body: `Tasmania applies a Foreign Investor Duty Surcharge of 8% for foreign individuals and entities purchasing residential property. The surcharge is added to standard transfer duty. On a $500,000 purchase, the foreign buyer pays approximately $56,560 in total duty, compared with $16,560 for an Australian resident. FIRB approval is also required for most foreign-buyer residential purchases, with separate federal application fees.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in Tasmania on a $500,000 home?",
        answer:
          "Tasmanian transfer duty on a $500,000 owner-occupier purchase is approximately $16,560 in 2026. First home buyers purchasing established homes receive a 50% concession, paying approximately $8,280 — a saving of $8,280.",
      },
      {
        question: "What FHB concessions does Tasmania offer?",
        answer:
          "Tasmania offers a 50% stamp duty concession for first home buyers purchasing established homes up to $750,000. New-home FHBs instead receive the $30,000 First Home Owner Grant on properties up to $600,000.",
      },
      {
        question: "Is the Tasmanian $30,000 FHOG ongoing?",
        answer:
          "The $30,000 First Home Owner Grant for new homes in Tasmania is currently extended through 30 June 2026. Eligible new homes must be valued at $600,000 or less. The grant has been extended multiple times and is widely expected to continue.",
      },
      {
        question: "Does Tasmania offer a pensioner stamp duty concession?",
        answer:
          "Yes. The Pensioner Downsizing Concession provides a 50% reduction in stamp duty for eligible pensioners aged 60+ downsizing to a home up to $600,000. The seller must have owned and lived in the previous home for at least 10 years.",
      },
      {
        question: "When is stamp duty paid in Tasmania?",
        answer:
          "Tasmanian stamp duty must be paid within three months of contract date or at settlement, whichever is earlier. Most conveyancers process payment electronically through PEXA. Late payment incurs penalty tax and interest charges.",
      },
    ],
  },
  act: {
    code: "ACT",
    slug: "act",
    name: "Australian Capital Territory",
    metaTitle: "ACT Stamp Duty Calculator 2026 — Home Buyer Concession Scheme | Calcy",
    metaDescription:
      "Calculate ACT stamp duty for 2026. Includes the income-tested Home Buyer Concession Scheme (HBCS) saving up to $34,790. Free, no sign-up.",
    h1: "ACT Stamp Duty Calculator 2026",
    subheading:
      "Calculate ACT conveyance duty for 2026, including the income-tested Home Buyer Concession Scheme (HBCS) which can fully exempt eligible buyers regardless of property value.",
    fhbThreshold: "Income-tested HBCS — full exemption up to $34,790 in duty",
    fhog: "No standalone FHOG in the ACT — HBCS replaces it",
    sections: [
      {
        heading: "How ACT conveyance duty is calculated",
        body: `The ACT Revenue Office administers conveyance duty using a continuous progressive formula combined with seven bracket thresholds. Duty starts at 2.06% below $200,000 and rises to 4.93% above $1.455 million. A $500,000 owner-occupier purchase incurs approximately $15,820 in duty, while $1,000,000 attracts roughly $40,345. The ACT has been gradually phasing out stamp duty since 2012 as part of a 20-year transition to higher rates land tax — duty rates have been incrementally reduced each year, although the policy direction was paused in 2023 pending review.`,
      },
      {
        heading: "Home Buyer Concession Scheme (HBCS)",
        body: `The ACT's Home Buyer Concession Scheme (HBCS) is unique in Australia. Unlike other states, it is income-tested rather than property-value-tested — meaning eligible buyers can purchase any value of property and still pay $0 duty, provided their household income falls below the threshold. The 2026 income cap is approximately $250,000 for households without children, with higher thresholds for families. The scheme can save up to $34,790 in duty depending on the property price and bracket. Applicants must be 18+, must not have owned property in Australia in the last two years, and must occupy the home for at least one year. The HBCS replaces the traditional FHOG in the ACT — there is no separate cash grant.`,
      },
      {
        heading: "Off-the-plan and unit duty concessions",
        body: `The ACT has progressively expanded duty concessions on off-the-plan unit purchases to support apartment construction in Canberra. Eligible owner-occupier off-the-plan purchases below $700,000 receive a full duty exemption, with sliding concessions above. ${common("ACT")} Settlement in the ACT typically completes 30–60 days after contract exchange, with all transactions processed electronically through PEXA since 2019.`,
      },
      {
        heading: "ACT's transition from stamp duty to land tax",
        body: `Since 2012, the ACT has been incrementally reducing stamp duty and increasing rates and land tax under a 20-year transition policy. The objective is to replace transaction-based taxation (stamp duty) with annual property taxation (rates), which economists generally consider more efficient. ACT homebuyers in 2026 pay materially less duty than they would have on the same property a decade ago — but pay higher annual rates as a result. The overall effective tax burden across a 10-year hold period is broadly similar.`,
      },
      {
        heading: "Foreign buyer duty in the ACT",
        body: `The ACT applies a Foreign Ownership Surcharge of 0.75% of the unimproved land value on residential property purchases by foreign persons, charged annually rather than as a one-off duty surcharge. This is structurally different from other states, which charge a percentage of the purchase price as additional upfront duty. Combined with the federal FIRB application fee, the total foreign-buyer cost burden in the ACT is typically lower than NSW or Victoria over a 5-year hold but higher over 10+ years.`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in the ACT on a $700,000 home?",
        answer:
          "ACT conveyance duty on a $700,000 owner-occupier purchase is approximately $25,621 in 2026. Eligible buyers under the income-tested Home Buyer Concession Scheme (HBCS) may receive a full exemption regardless of property value.",
      },
      {
        question: "What is the ACT Home Buyer Concession Scheme?",
        answer:
          "The HBCS is income-tested rather than property-value-tested. Eligible buyers earning below the household income threshold (approximately $250,000 in 2026) pay $0 stamp duty regardless of property price, saving up to $34,790.",
      },
      {
        question: "Does the ACT have a First Home Owner Grant?",
        answer:
          "No. The ACT does not offer a standalone First Home Owner Grant. Instead, the Home Buyer Concession Scheme provides equivalent or greater benefit by removing stamp duty entirely for income-eligible buyers.",
      },
      {
        question: "Is the ACT abolishing stamp duty?",
        answer:
          "The ACT has been incrementally reducing stamp duty since 2012 under a 20-year transition to higher rates and land tax. Rates remain elevated but full abolition of duty has been paused pending review. Current 2026 rates remain materially lower than 2012 levels.",
      },
      {
        question: "When is stamp duty paid in the ACT?",
        answer:
          "ACT conveyance duty must be paid within 14 days of settlement. Your conveyancer lodges payment to the ACT Revenue Office, typically through PEXA. Late lodgement incurs penalty tax and interest charged daily until paid.",
      },
    ],
  },
  nt: {
    code: "NT",
    slug: "nt",
    name: "Northern Territory",
    metaTitle: "NT Stamp Duty Calculator 2026 — House & Land Exemption | Calcy",
    metaDescription:
      "Calculate Northern Territory stamp duty for 2026. Includes House and Land Package Exemption, BuildBonus grant, and $10,000 FHOG. Free, no sign-up.",
    h1: "NT Stamp Duty Calculator 2026",
    subheading:
      "Calculate Northern Territory stamp duty for 2026, including the House and Land Package Exemption, BuildBonus grant, and the $10,000 FHOG on new homes.",
    fhbThreshold: "Territory Home Owner Discount up to $18,601 (eligibility-based)",
    fhog: "$10,000 on new homes up to $750,000 + BuildBonus $20,000 (selected)",
    sections: [
      {
        heading: "Northern Territory stamp duty rates",
        body: `The Territory Revenue Office uses a continuous formula similar to the ACT for properties below $525,000: duty = (0.06571441 × V + 15) × V ÷ 1000, where V is the property value in thousands. Above $525,000, a flat 4.95% applies to the full property value. A $500,000 owner-occupier purchase incurs approximately $23,929 in duty, while $700,000 attracts $34,650. The NT has historically had higher stamp duty than other states relative to median income, partly offset by lower property prices in Darwin and Alice Springs.`,
      },
      {
        heading: "Territory Home Owner Discount",
        body: `The Territory Home Owner Discount (THOD) provides up to $18,601 off stamp duty for eligible buyers — including non-first-home buyers — purchasing or building a home as their principal residence. The discount is automatic for qualifying purchases and applies regardless of buyer history. The 2026 scheme has been continuously available since 2021 and continues with annual reviews. To qualify, buyers must occupy the home for at least six continuous months within the first 12 months after settlement.`,
      },
      {
        heading: "House and Land Package Exemption + BuildBonus",
        body: `The NT's House and Land Package Exemption fully exempts stamp duty for eligible buyers purchasing or building new homes. ${common("Northern Territory")} The BuildBonus grant provides up to $20,000 for eligible buyers building or purchasing newly constructed homes. Combined with the standard $10,000 FHOG, eligible new-home FHBs in the NT can access up to $30,000 in cash grants plus full duty exemption — among the most generous packages in Australia. The trade-off is that NT property tends to underperform other capital cities in long-term capital growth.`,
      },
      {
        heading: "First Home Owner Grant in the NT",
        body: `The NT FHOG of $10,000 applies to newly built homes valued up to $750,000. It is paid at settlement for spec-built homes and progressively during construction for owner-builders. The grant is in addition to the BuildBonus and the duty exemption — meaning a single new-home purchase can attract up to $30,000 in cash grants plus full stamp duty exemption. Established home FHBs do not receive cash grants but may still qualify for the Territory Home Owner Discount described above.`,
      },
      {
        heading: "Foreign buyer rules in the NT",
        body: `The Northern Territory does not currently apply a state-level foreign buyer surcharge — the only Australian state or territory not to do so. Foreign buyers still need FIRB approval and pay federal application fees, but they pay the standard NT scale rather than a surcharge on top. This makes the NT structurally more attractive to international investors than NSW (9% surcharge), VIC (8%), QLD (8%), WA (7%), SA (7%), TAS (8%), and the ACT (annual surcharge).`,
      },
    ],
    faqs: [
      {
        question: "How much is stamp duty in the NT on a $500,000 home?",
        answer:
          "NT stamp duty on a $500,000 owner-occupier purchase is approximately $23,929 in 2026. Eligible buyers receive up to $18,601 off via the Territory Home Owner Discount, reducing the net duty to roughly $5,328.",
      },
      {
        question: "What is the Territory Home Owner Discount?",
        answer:
          "The Territory Home Owner Discount (THOD) provides up to $18,601 off stamp duty for eligible NT homebuyers — including non-first-home buyers — purchasing or building their principal place of residence. The home must be occupied for six months within the first 12 months.",
      },
      {
        question: "What grants are available for new homes in the NT?",
        answer:
          "Eligible new-home buyers in the NT may access up to $30,000 in cash grants — a $10,000 First Home Owner Grant plus a $20,000 BuildBonus — plus full stamp duty exemption under the House and Land Package Exemption. This is among Australia's most generous packages.",
      },
      {
        question: "Do foreign buyers pay extra stamp duty in the NT?",
        answer:
          "No. The Northern Territory is the only Australian jurisdiction that does not charge a state-level foreign buyer surcharge. Foreign buyers still need FIRB approval and pay federal fees, but they are charged the standard NT duty scale.",
      },
      {
        question: "When is NT stamp duty paid?",
        answer:
          "NT stamp duty must be paid within 60 days of execution of the dutiable transaction or at settlement, whichever is earlier. Your conveyancer lodges payment to the Territory Revenue Office. Late lodgement incurs penalty tax and interest.",
      },
    ],
  },
};
