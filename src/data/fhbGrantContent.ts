import type { FaqItem } from "./faqs";
import type { StateCode } from "@/lib/calc/stampDuty";

export interface FhbGrantContent {
  code: StateCode;
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  /** Single sentence highlighting the headline amount/threshold. */
  highlight: string;
  /** Headline grant amount (string for display). */
  grantAmount: string;
  /** Revenue authority hosting the grant. */
  revenueAuthority: string;
  /** Property-value cap for the grant. */
  propertyCap: string;
  /** Section bodies — combined ~700-900 words for ranking depth. */
  sections: { heading: string; body: string }[];
  faqs: FaqItem[];
}

const APPLY = (state: string, auth: string) =>
  `Your conveyancer or solicitor typically lodges the grant application on your behalf at settlement using the ${auth} portal. You can also apply directly within 12 months of settlement, but lodging through your lender is faster — most major Australian lenders are approved agents and pay the grant directly into your loan account on the day of settlement, reducing the cash you need to bring to the table. Keep a certified copy of the contract of sale, your ID, and proof of Australian residency on hand.`;

export const FHB_GRANT_CONTENT: Record<string, FhbGrantContent> = {
  nsw: {
    code: "NSW",
    slug: "nsw",
    name: "New South Wales",
    metaTitle: "First Home Owner Grant NSW 2026 — $10,000 + Stamp Duty Exemption | Calcy",
    metaDescription:
      "Full guide to the NSW First Home Owner Grant: $10,000 on new homes up to $750k, $0 stamp duty under $800k, and eligibility for the 2026 financial year.",
    h1: "First Home Owner Grant NSW 2026",
    subheading:
      "Everything a first home buyer in New South Wales needs: the $10,000 FHOG on new builds, full stamp duty exemption up to $800,000, and how the two stack to save tens of thousands at settlement.",
    highlight: "$10,000 FHOG + $0 stamp duty up to $800,000",
    grantAmount: "$10,000",
    revenueAuthority: "Revenue NSW",
    propertyCap: "$750,000 (new builds for FHOG); $1,000,000 (stamp duty concession)",
    sections: [
      {
        heading: "The NSW First Home Owner Grant explained",
        body: `The NSW First Home Owner Grant pays eligible first home buyers $10,000 toward a newly built home valued up to $750,000. Established homes do not qualify — only properties that have never been occupied as a place of residence, including off-the-plan apartments, house-and-land packages, and substantial renovations of a kind specified by Revenue NSW. The grant is administered by Revenue NSW and runs in parallel with the stamp duty first home buyer exemption, which independently saves up to $26,235 on a $700,000 purchase. Together these two schemes can deliver $36,000+ in combined upfront benefits — usually more than the largest single line item in a first home budget after the deposit itself. The grant is not means-tested on income, but property type and value caps are enforced strictly.`,
      },
      {
        heading: "Stamp duty exemption — the bigger saving",
        body: `For most NSW first home buyers, the stamp duty exemption is worth more than the $10,000 grant. Eligible first home buyers pay $0 stamp duty on properties up to $800,000, then receive a sliding concession up to $1,000,000. Above $1,000,000 the concession phases out entirely. On an $800,000 purchase, the exemption saves $31,335 — three times the FHOG itself. Crucially, the exemption applies to established homes as well as new builds, so buyers who don't qualify for the FHOG (because they're purchasing an existing home) still get the stamp duty saving. The combined effect makes a sub-$800,000 new home in Western Sydney or the Central Coast the most tax-efficient first purchase in Australia in 2026.`,
      },
      {
        heading: "Eligibility for the NSW FHOG in 2026",
        body: `To qualify, at least one applicant must be 18+, an Australian citizen or permanent resident, and neither applicant (nor their spouse) may have previously owned residential property in Australia or received a first home owner grant in any state. You must occupy the home as your principal place of residence for a continuous six-month period beginning within 12 months of settlement. Investment purchases, holiday homes, and family-trust acquisitions are excluded. Only one grant is payable per eligible transaction, regardless of the number of applicants on the title.`,
      },
      {
        heading: "Worked example — $720,000 new apartment in Parramatta",
        body: `A first home buyer purchases a brand-new $720,000 two-bedroom apartment in Parramatta with a 10% deposit ($72,000). Standard stamp duty would be $27,535, but the FHB exemption brings this to $0 (price is under $800,000). The buyer separately receives the $10,000 FHOG because the home is newly built and under $750,000. Total saving: $37,535. Because the deposit is below 20%, the buyer also pays Lenders Mortgage Insurance (~$13,500 on a $648,000 loan), usually capitalised onto the loan. Net upfront cash needed at settlement, excluding deposit, is approximately $5,000 — versus $42,000+ for an identical purchase by a non-FHB.`,
      },
      {
        heading: "How to apply for the NSW grant",
        body: APPLY("NSW", "Revenue NSW"),
      },
    ],
    faqs: [
      {
        question: "Do I get $10,000 FHOG and stamp duty exemption together in NSW?",
        answer:
          "Yes — they're separate schemes administered by Revenue NSW and you can claim both on the same purchase, provided the home is newly built (for the FHOG) and under the relevant value caps. Combined benefit on a $720,000 new build is typically $37,000+.",
      },
      {
        question: "Can I get the NSW FHOG on an established home?",
        answer:
          "No. The $10,000 FHOG is restricted to newly built or substantially renovated homes up to $750,000. Established home buyers can still claim the stamp duty first home buyer exemption (up to $800,000) and concession (up to $1,000,000), but not the cash grant.",
      },
      {
        question: "What if my partner has owned a home before?",
        answer:
          "Both applicants — and either applicant's spouse, even if not on the title — must meet the eligibility rules. If your partner has previously owned a home or received a first home grant, the application will be rejected.",
      },
      {
        question: "When is the NSW FHOG paid?",
        answer:
          "If you apply through an approved lender, the $10,000 is paid directly to your conveyancer at settlement. If you apply directly to Revenue NSW after settlement, payment usually takes 10–20 business days from approval.",
      },
    ],
  },
  vic: {
    code: "VIC",
    slug: "vic",
    name: "Victoria",
    metaTitle: "First Home Owner Grant VIC 2026 — $10,000 New Builds + Stamp Duty Exemption | Calcy",
    metaDescription:
      "Victorian First Home Owner Grant 2026: $10,000 on new homes up to $750k plus $0 stamp duty under $600k. Eligibility, regional bonus, and worked examples.",
    h1: "First Home Owner Grant Victoria 2026",
    subheading:
      "The Victorian FHOG, stamp duty exemption rules, and how the regional $20,000 bonus stacks on new builds outside metro Melbourne.",
    highlight: "$10,000 FHOG (metro) + $20,000 (regional) + $0 duty under $600k",
    grantAmount: "$10,000 (metro) / $20,000 (regional bonus through 30 June 2026)",
    revenueAuthority: "State Revenue Office Victoria",
    propertyCap: "$750,000 (FHOG); $750,000 (stamp duty exemption/concession)",
    sections: [
      {
        heading: "The Victorian First Home Owner Grant explained",
        body: `The Victorian First Home Owner Grant pays $10,000 to eligible first home buyers purchasing a newly built home valued up to $750,000. A separate Regional First Home Buyer Boost previously doubled this to $20,000 for new builds in regional Victoria — check current SRO Victoria guidance for the latest cut-off date as the regional top-up has been extended multiple times since 2020. Established home purchases never qualify for the cash grant in Victoria, but they do qualify for the more valuable first home buyer stamp duty concession. The grant is administered by the State Revenue Office Victoria and runs alongside the duty exemption, so a buyer of a sub-$600,000 new build typically captures both.`,
      },
      {
        heading: "Victoria's stamp duty exemption is the headline benefit",
        body: `Victoria offers full stamp duty exemption for first home buyers on properties up to $600,000 and a sliding concession up to $750,000. Above $750,000, no concession applies — Victoria's threshold is significantly lower than NSW's $1m cap, which is why the duty-saving headline is smaller in dollar terms. On a $600,000 purchase the exemption saves $31,070; on a $700,000 purchase the concession brings duty down to roughly $12,000 (versus the standard $37,070). The exemption applies to both new and established homes, making it the more flexible benefit. Pair it with the $10,000 FHOG only where the property is a new build under $750,000.`,
      },
      {
        heading: "Eligibility for the Victorian FHOG",
        body: `At least one applicant must be 18+, an Australian citizen or permanent resident, and neither applicant (nor their spouse) may have previously owned residential property in Australia. You must occupy the home as your principal place of residence for a continuous 12-month period within 12 months of settlement. Investment purchases, family trust arrangements, and homes purchased through a company are not eligible. Income is not means-tested, but the $750,000 cap is applied to the dutiable value, not the contract price — off-the-plan buyers should request the dutiable value calculation from the SRO before signing.`,
      },
      {
        heading: "Worked example — $620,000 new townhouse in Geelong",
        body: `A first home buyer purchases a brand-new $620,000 townhouse in Geelong with a 12% deposit ($74,400). Standard stamp duty would be approximately $32,070; the first home buyer concession reduces this to under $5,000. The buyer also receives the $10,000 FHOG (and may qualify for the $20,000 regional bonus if eligible by date). Combined direct saving on stamp duty + grant is in the region of $37,000–$47,000 depending on the regional bonus applying. Because the deposit is below 20%, LMI of approximately $11,500 is added — usually capitalised onto the loan. Total cash required at settlement, excluding deposit, is in the $3,000–$5,000 range.`,
      },
      {
        heading: "How to apply for the Victorian grant",
        body: APPLY("Victoria", "State Revenue Office Victoria"),
      },
    ],
    faqs: [
      {
        question: "Is there a $20,000 regional FHOG in Victoria for 2026?",
        answer:
          "The Regional First Home Buyer Boost increased the FHOG to $20,000 for new builds in regional Victoria. Check the State Revenue Office Victoria website for the current cut-off — the program has been extended multiple times.",
      },
      {
        question: "Can I claim the Victorian FHOG on an off-the-plan apartment?",
        answer:
          "Yes, provided the dutiable value is $750,000 or less. Off-the-plan concessions are calculated against the dutiable value (typically construction-phase land + works), not the final contract price.",
      },
      {
        question: "What if my deposit is below 20%?",
        answer:
          "You'll usually need to pay Lenders Mortgage Insurance, but you can still claim the FHOG and stamp duty exemption. Check whether the First Home Guarantee or Family Home Guarantee schemes can waive LMI on your purchase.",
      },
      {
        question: "Do I need to live in the home?",
        answer:
          "Yes. At least one applicant must occupy the property as their principal place of residence for a continuous 12 months, beginning within 12 months of settlement.",
      },
    ],
  },
  qld: {
    code: "QLD",
    slug: "qld",
    name: "Queensland",
    metaTitle: "First Home Owner Grant QLD 2026 — $30,000 New Builds + Stamp Duty Concession | Calcy",
    metaDescription:
      "Queensland First Home Owner Grant 2026: $30,000 on new builds under $750k, plus first home concession on stamp duty. Full eligibility and examples.",
    h1: "First Home Owner Grant Queensland 2026",
    subheading:
      "The $30,000 Queensland FHOG on new homes — the most generous cash grant in Australia — plus stamp duty concessions on established and new builds.",
    highlight: "$30,000 FHOG on new builds + first home concession on duty",
    grantAmount: "$30,000 (new builds, contracts signed 20 Nov 2023 – 30 Jun 2026)",
    revenueAuthority: "Queensland Revenue Office",
    propertyCap: "$750,000 (FHOG); $800,000 (stamp duty first home concession)",
    sections: [
      {
        heading: "Queensland's $30,000 First Home Owner Grant",
        body: `Queensland's First Home Owner Grant currently pays $30,000 — three times the NSW or Victorian amount — to eligible first home buyers purchasing a newly built home valued up to $750,000. The $30,000 figure applies to eligible transactions where the contract is dated between 20 November 2023 and 30 June 2026; outside that window the grant reverts to $15,000. The cash grant is restricted to brand-new homes: house-and-land packages, off-the-plan units, substantial renovations, and owner-builder builds qualify, but established homes do not. Combined with Queensland's stamp duty first home concession (which extends to $800,000), the total benefit on a sub-$700,000 new build commonly exceeds $50,000 — the most generous first home package in the country in 2026.`,
      },
      {
        heading: "Queensland's first home stamp duty concession",
        body: `Queensland increased its first home concession thresholds significantly in 2024, with full stamp duty exemption available on homes up to $700,000 and a sliding concession up to $800,000. A first home vacant land concession also applies for land valued up to $350,000. On a $700,000 purchase, the standard duty of $17,325 is reduced to $0 — saving the full amount. This concession applies to both new and established homes, so even a first home buyer purchasing an established home gets a meaningful saving (just not the $30,000 cash grant on top). Compared with NSW and Victoria, Queensland's lower base duty schedule means the absolute dollar saving on the exemption is smaller, but the cash FHOG more than makes up the difference for new-build buyers.`,
      },
      {
        heading: "Eligibility for the Queensland FHOG",
        body: `Applicants must be 18+, Australian citizens or permanent residents, and neither applicant (nor their spouse) may have previously owned residential property anywhere in Australia or received a first home owner grant in any state. The home must be your principal place of residence for a continuous six-month period commencing within 12 months of settlement. Investment purchases, family trust acquisitions, and corporate purchases are excluded. There is no income test, but the $750,000 cap on dutiable value is enforced strictly — a $760,000 purchase loses the entire $30,000 grant, not a proportional amount.`,
      },
      {
        heading: "Worked example — $650,000 new home in Logan",
        body: `A first home buyer purchases a brand-new $650,000 house-and-land package in Logan with a 12% deposit ($78,000). Standard stamp duty would be approximately $13,560; the first home concession reduces this to $0. The buyer also receives the $30,000 FHOG. Combined direct benefit: $43,560 — equivalent to 6.7% of the purchase price returned in cash and tax savings. Because the deposit is below 20%, LMI of approximately $9,500 is added (typically capitalised onto the loan). After the grant is paid into the loan account at settlement, total cash required at settlement (excluding deposit) is effectively negative — the grant exceeds remaining costs by ~$15,000, leaving the buyer with breathing room for furniture and moving.`,
      },
      {
        heading: "How to apply for the Queensland grant",
        body: APPLY("Queensland", "Queensland Revenue Office"),
      },
    ],
    faqs: [
      {
        question: "Is the Queensland FHOG still $30,000 in 2026?",
        answer:
          "Yes — the $30,000 amount applies to eligible transactions with contracts dated between 20 November 2023 and 30 June 2026. After that date the grant reverts to $15,000 unless the QLD Government announces a further extension.",
      },
      {
        question: "Can I claim the $30,000 grant on an established home?",
        answer:
          "No. The grant is restricted to newly built homes, off-the-plan units, house-and-land packages, and substantial renovations. Established home buyers can still claim the first home stamp duty concession on properties up to $800,000.",
      },
      {
        question: "Is there an income test for the Queensland FHOG?",
        answer:
          "No, the grant is not means-tested. The only limits are property value ($750,000 cap), property type (newly built), and applicant eligibility (first home, citizen/PR, owner-occupied).",
      },
      {
        question: "Can I use the $30,000 toward my deposit?",
        answer:
          "Yes — most lenders will accept the FHOG as part of your deposit and reduce the deposit you need to save. Check your lender's policy on FHOG-funded deposits as some require additional genuine savings on top.",
      },
    ],
  },
  wa: {
    code: "WA",
    slug: "wa",
    name: "Western Australia",
    metaTitle: "First Home Owner Grant WA 2026 — $10,000 + Stamp Duty Rebate | Calcy",
    metaDescription:
      "Western Australian First Home Owner Grant 2026: $10,000 on new builds plus stamp duty rebate up to $530k. Full eligibility, deadlines and worked examples.",
    h1: "First Home Owner Grant Western Australia 2026",
    subheading:
      "WA's $10,000 FHOG on new builds, the Keystart no-LMI scheme, and stamp duty rebates that make Perth one of the most affordable capitals for first home buyers.",
    highlight: "$10,000 FHOG + duty exempt under $450k (concession to $600k)",
    grantAmount: "$10,000",
    revenueAuthority: "RevenueWA",
    propertyCap: "$750,000 south of 26th parallel; $1,000,000 north (FHOG)",
    sections: [
      {
        heading: "The Western Australian First Home Owner Grant",
        body: `RevenueWA administers a $10,000 First Home Owner Grant for newly built homes purchased or constructed by eligible first home buyers. Property-value caps differ by region: $750,000 south of the 26th parallel of latitude (covering Perth and the south-west) and $1,000,000 north of it (Pilbara, Kimberley). The grant applies to off-the-plan apartments, house-and-land packages, and owner-builder construction. Established home purchases do not qualify for the cash grant but may still attract the first home buyer stamp duty rebate. Western Australia also operates Keystart, a state-government lender that allows first home buyers to enter the market with as little as 2% deposit and no LMI — a unique combination unavailable in any other state.`,
      },
      {
        heading: "WA stamp duty rebate for first home buyers",
        body: `Western Australia provides full stamp duty exemption for first home buyers on properties up to $450,000 and a sliding concession up to $600,000. The vacant-land concession threshold is $300,000 (full exemption) sliding to $400,000. Above these caps, full duty applies — WA's thresholds are the most conservative in mainland Australia, reflecting Perth's historically lower median prices. On a $450,000 purchase, the saving is $15,390; on a $600,000 purchase the residual duty after concession is roughly $12,000 (versus the standard $22,515). The combined effect of the $10,000 FHOG plus duty exemption on a $450,000 new build is a $25,390 benefit — meaningful relative to Perth's median dwelling price.`,
      },
      {
        heading: "Eligibility and Keystart eligibility",
        body: `Standard FHOG eligibility applies: 18+, Australian citizen or PR, neither applicant nor their spouse has previously owned residential property in Australia or received a first home owner grant, and the home is occupied as a principal place of residence for at least six continuous months within 12 months of settlement. Keystart is a separate scheme with income limits (currently ~$105,000 single / $130,000 couple in metro Perth) but allows purchases up to $560,000 with as little as 2% deposit and no LMI — saving tens of thousands compared with bank loans for buyers near the income limits. Eligibility for both schemes can be claimed simultaneously.`,
      },
      {
        heading: "Worked example — $480,000 new home in Baldivis",
        body: `A first home buyer purchases a brand-new $480,000 house-and-land package in Baldivis with a 5% deposit ($24,000) via Keystart, avoiding LMI. Standard stamp duty would be approximately $17,180; the first home concession reduces this to roughly $5,300 (price sits between the $450k full exemption and $600k cut-off). The buyer also receives the $10,000 FHOG, paid into the loan account at settlement. Combined direct benefit: roughly $21,880. After the grant offsets remaining settlement costs, the buyer needs less than $30,000 in total cash to take possession — an entry point unavailable in any other Australian capital.`,
      },
      {
        heading: "How to apply for the WA grant",
        body: APPLY("Western Australia", "RevenueWA"),
      },
    ],
    faqs: [
      {
        question: "Is Keystart only for WA?",
        answer:
          "Yes — Keystart is a Western Australian government lender with no equivalent in other states. It allows first home buyers to borrow with as little as 2% deposit and no LMI, subject to income and property-value caps.",
      },
      {
        question: "What is the WA FHOG cap in regional areas?",
        answer:
          "The cap is $1,000,000 for properties north of the 26th parallel (covering Pilbara, Kimberley, and parts of the Mid West) and $750,000 elsewhere — reflecting higher property prices in mining regions.",
      },
      {
        question: "Can I use the FHOG with Keystart?",
        answer:
          "Yes — the FHOG is independent of how you finance the purchase. You can claim the $10,000 grant whether your loan is with a bank, mutual lender, or Keystart, provided the property and applicants meet the eligibility rules.",
      },
      {
        question: "Are there stamp duty savings on established WA homes?",
        answer:
          "Yes — the WA first home stamp duty concession applies to established homes as well as new builds, up to $600,000. Only the $10,000 cash grant is restricted to new builds.",
      },
    ],
  },
  sa: {
    code: "SA",
    slug: "sa",
    name: "South Australia",
    metaTitle: "First Home Owner Grant SA 2026 — $15,000 Plus Stamp Duty Relief | Calcy",
    metaDescription:
      "South Australian First Home Owner Grant 2026: $15,000 on new builds plus stamp duty abolition for eligible first home buyers. Eligibility and examples.",
    h1: "First Home Owner Grant South Australia 2026",
    subheading:
      "South Australia's $15,000 FHOG plus the 2023 stamp duty abolition for first home buyers — making Adelaide one of the cheapest capitals to enter the market.",
    highlight: "$15,000 FHOG + stamp duty abolished for FHB on new builds",
    grantAmount: "$15,000",
    revenueAuthority: "RevenueSA",
    propertyCap: "$650,000 (new builds for FHOG); no cap on stamp duty abolition for new builds",
    sections: [
      {
        heading: "The South Australian First Home Owner Grant",
        body: `RevenueSA pays eligible first home buyers a $15,000 grant on newly built homes valued up to $650,000. The grant applies to off-the-plan apartments, house-and-land packages, and substantial renovations meeting the SA definition. Established home purchases do not qualify for the FHOG. Importantly, South Australia abolished stamp duty entirely for first home buyers purchasing new homes in 2023 — there is no value cap on the stamp duty exemption itself, only the FHOG. This combination makes SA the most generous state for new-build first home buyers above $650,000: you lose the $15,000 grant but keep the unlimited duty saving, which on a $700,000 home would be approximately $27,000 in saved duty.`,
      },
      {
        heading: "Stamp duty abolition — the bigger picture",
        body: `Since June 2023, eligible first home buyers in SA pay $0 stamp duty on newly built homes regardless of price, and on vacant land up to $400,000 with sliding relief up to $450,000. This is the most generous duty regime in Australia for high-value new builds — a NSW first home buyer on a $1.5m new build pays full duty above the $1m cap, while an SA buyer pays nothing. The trade-off is that established home buyers in SA receive no stamp duty relief at all, unlike NSW, Victoria, and Queensland. This skews SA first home buyers strongly toward new-build product, which has shaped Adelaide's outer-suburb development pipeline.`,
      },
      {
        heading: "Eligibility for the SA FHOG",
        body: `Standard FHOG eligibility applies: 18+, Australian citizen or PR, no previous home ownership in Australia by either applicant or spouse, no prior first home owner grant received in any state, and the home must be occupied as the principal place of residence for at least six continuous months within 12 months of settlement. The $650,000 cap is applied to the dutiable value, not contract price. Above $650,000 the grant is lost entirely (no sliding scale), but stamp duty abolition still applies regardless of value for new builds.`,
      },
      {
        heading: "Worked example — $600,000 new home in Mount Barker",
        body: `A first home buyer purchases a brand-new $600,000 house-and-land package in Mount Barker with a 10% deposit ($60,000). Standard stamp duty would be approximately $26,830; with the FHB abolition this is $0. The buyer also receives the $15,000 FHOG. Combined direct benefit: $41,830. Because the deposit is below 20%, LMI of roughly $10,500 is added (capitalised onto the loan). The $15,000 grant paid into the loan account at settlement effectively covers most of the remaining settlement costs — total out-of-pocket cash beyond deposit is well below $5,000.`,
      },
      {
        heading: "How to apply for the SA grant",
        body: APPLY("South Australia", "RevenueSA"),
      },
    ],
    faqs: [
      {
        question: "Does South Australia really have no stamp duty for first home buyers?",
        answer:
          "On newly built homes, yes — SA abolished stamp duty for eligible first home buyers in June 2023 with no value cap. Established homes do not receive the abolition; the policy is designed to support new construction.",
      },
      {
        question: "Can I claim the $15,000 FHOG on an established SA home?",
        answer:
          "No. The FHOG applies only to newly built or substantially renovated homes up to $650,000. Established home buyers in SA receive no first home buyer benefits unless they qualify for federal schemes like the First Home Guarantee.",
      },
      {
        question: "Is there a cap on the SA stamp duty abolition for new builds?",
        answer:
          "No — the duty abolition has no value cap, although the $15,000 cash grant does cut off at $650,000. A first home buyer can save $40,000+ on duty on a $1m+ new build in Adelaide.",
      },
      {
        question: "What if I buy vacant land and build later?",
        answer:
          "Vacant land qualifies for full stamp duty exemption up to $400,000 with sliding relief to $450,000. The FHOG is then claimable when construction completes, provided the build commences within 12 months of settlement on the land.",
      },
    ],
  },
  tas: {
    code: "TAS",
    slug: "tas",
    name: "Tasmania",
    metaTitle: "First Home Owner Grant TAS 2026 — $10,000 + 50% Stamp Duty Discount | Calcy",
    metaDescription:
      "Tasmanian First Home Owner Grant 2026: $10,000 on new builds and 50% stamp duty discount for established homes up to $750,000. Eligibility and worked examples.",
    h1: "First Home Owner Grant Tasmania 2026",
    subheading:
      "Tasmania's $10,000 grant on new homes and the 50% stamp duty discount on established homes — a hybrid model unique among Australian states.",
    highlight: "$10,000 FHOG + 50% stamp duty discount on established homes",
    grantAmount: "$10,000",
    revenueAuthority: "State Revenue Office of Tasmania",
    propertyCap: "$750,000 (new builds for FHOG); $750,000 (established for duty discount)",
    sections: [
      {
        heading: "The Tasmanian First Home Owner Grant",
        body: `Tasmania's State Revenue Office pays eligible first home buyers a $10,000 grant on newly built homes valued up to $750,000. Off-the-plan units, house-and-land packages, and owner-builder construction qualify; established homes do not receive the cash grant. Tasmania has the smallest first home buyer market in Australia by volume — under 4,000 grant payments per year — but per capita the rate of first home buyer activity is among the highest, reflecting Hobart and Launceston's relative affordability compared with mainland capitals. The grant is paid into the loan account at settlement via approved lender agents, or directly to the applicant if claimed within 12 months of settlement.`,
      },
      {
        heading: "Tasmania's 50% duty discount — unique in Australia",
        body: `Tasmania is the only Australian state offering a percentage-based stamp duty discount rather than a threshold exemption. Eligible first home buyers receive a 50% reduction on stamp duty for established homes valued up to $750,000. On a $500,000 established home, standard duty is approximately $18,000 — the FHB discount reduces this to $9,000, saving $9,000. The 50% structure means the absolute saving scales with price (subject to the $750,000 cap), giving more value at the upper end of the eligible range. For new builds, no separate duty discount applies in Tasmania — the $10,000 FHOG is the only benefit, but the underlying duty schedule is lower than mainland states.`,
      },
      {
        heading: "Eligibility for the Tasmanian FHOG",
        body: `At least one applicant must be 18+, an Australian citizen or PR, and neither applicant nor their spouse may have previously owned residential property in Australia or received a first home owner grant in any state. The home must be occupied as the principal place of residence for a continuous six-month period within 12 months of settlement. There is no income test. The $750,000 cap applies to dutiable value; above the cap the grant is lost entirely.`,
      },
      {
        heading: "Worked example — $480,000 first home in Kingston",
        body: `A first home buyer purchases an established $480,000 home in Kingston, south of Hobart, with a 10% deposit ($48,000). Standard stamp duty would be approximately $17,388; the 50% first home discount reduces this to $8,694, saving $8,694. As an established home, the $10,000 FHOG does not apply. Total direct benefit: $8,694. Because the deposit is below 20%, LMI of roughly $9,000 is added (capitalised onto the loan). For a comparable $480,000 new build, the buyer would forgo the duty discount but receive the $10,000 FHOG instead — a similar net outcome, demonstrating Tasmania's deliberate balance between new and established stock.`,
      },
      {
        heading: "How to apply for the Tasmanian grant",
        body: APPLY("Tasmania", "the State Revenue Office of Tasmania"),
      },
    ],
    faqs: [
      {
        question: "Can I get both the Tasmanian FHOG and the 50% duty discount?",
        answer:
          "No — the $10,000 FHOG applies only to new builds, and the 50% duty discount applies only to established homes. You receive whichever applies to your purchase type, not both.",
      },
      {
        question: "Is the Tasmanian duty discount the same on vacant land?",
        answer:
          "No — vacant land does not attract the 50% discount on its own. The discount is restricted to established residential property occupied as a principal place of residence.",
      },
      {
        question: "What if I buy a $700,000 new build in Tasmania?",
        answer:
          "You receive the $10,000 FHOG (price is under $750k) plus full standard stamp duty on the purchase — Tasmania does not offer an exemption on new-build duty, only the cash grant.",
      },
      {
        question: "Is the Tasmanian FHOG paid before or after settlement?",
        answer:
          "If you apply via an approved lender, the grant is paid into the loan account at settlement and used to reduce the cash you bring. If you apply directly, payment usually arrives within four weeks of approval.",
      },
    ],
  },
  act: {
    code: "ACT",
    slug: "act",
    name: "Australian Capital Territory",
    metaTitle: "First Home Owner Grant ACT 2026 — Home Buyer Concession Scheme | Calcy",
    metaDescription:
      "ACT First Home Owner Grant 2026: replaced by the Home Buyer Concession Scheme with full stamp duty exemption based on income. Eligibility and examples.",
    h1: "First Home Buyer Grant ACT 2026 — Home Buyer Concession Scheme",
    subheading:
      "The ACT replaced its FHOG with the income-tested Home Buyer Concession Scheme — full stamp duty exemption for buyers under the income cap, regardless of new or established property.",
    highlight: "Full stamp duty exemption for buyers under the income cap",
    grantAmount: "No cash grant — full stamp duty exemption instead",
    revenueAuthority: "ACT Revenue Office",
    propertyCap: "No property cap; income-tested instead (~$170k single, ~$250k household)",
    sections: [
      {
        heading: "The ACT Home Buyer Concession Scheme",
        body: `Unlike every other Australian jurisdiction, the ACT does not currently offer a cash First Home Owner Grant. The original FHOG was phased out and replaced by the Home Buyer Concession Scheme (HBCS), which provides full stamp duty exemption for eligible buyers. The HBCS is income-tested rather than property-value-tested — applicants must fall below the income cap (currently around $170,000 for a single applicant, scaling up to ~$250,000 for households with multiple dependants — check the ACT Revenue Office for current figures), but there is no upper limit on property price. This makes the ACT scheme structurally more progressive than any state grant: it caps the benefit by buyer income rather than property value.`,
      },
      {
        heading: "Eligibility and income cap",
        body: `To qualify, at least one applicant must be 18+, an Australian citizen or PR, must not have owned property anywhere in Australia in the previous five years, and must occupy the home as their principal place of residence for at least one continuous year. Total household income from all sources in the financial year before purchase must fall under the applicable cap (varies by dependants). The scheme applies to both new and established homes — the only Australian first home scheme that treats them equally. Investment purchases, family trust acquisitions, and corporate transactions are excluded.`,
      },
      {
        heading: "What the exemption is worth",
        body: `The ACT's stamp duty schedule is among the steepest in Australia at the upper end. On a $700,000 home, standard duty is approximately $20,520; the HBCS reduces this to $0. On a $1m home, standard duty is approximately $34,000 — also reduced to $0 for eligible buyers. The lack of a property cap means a high-income buyer is excluded, but a buyer within the cap purchasing a $1.5m+ property captures a saving exceeding $60,000. This makes the ACT scheme particularly valuable for buyers stepping up from rental into Canberra's inner-suburb market where median prices are well above the mainland state caps.`,
      },
      {
        heading: "Worked example — $750,000 first home in Belconnen",
        body: `A first home buyer couple with combined household income of $190,000 purchases a $750,000 townhouse in Belconnen with a 15% deposit ($112,500). Their household income is under the HBCS cap, so they qualify. Standard stamp duty would be approximately $23,470; the HBCS reduces this to $0, saving $23,470. No cash grant applies. Because the deposit is below 20%, LMI of approximately $7,500 is added (capitalised onto the loan). The HBCS saving of $23,470 is among the most valuable benefits of any state for a household in this income/price bracket — they pay no duty regardless of whether the home is new or established.`,
      },
      {
        heading: "How to apply for the ACT concession",
        body: APPLY("the ACT", "the ACT Revenue Office"),
      },
    ],
    faqs: [
      {
        question: "Does the ACT have a First Home Owner Grant?",
        answer:
          "No — the ACT phased out its FHOG and replaced it with the Home Buyer Concession Scheme (HBCS), which provides full stamp duty exemption to eligible buyers under the income cap rather than a cash payment.",
      },
      {
        question: "What is the ACT income cap for first home buyers?",
        answer:
          "The cap varies by household size, starting around $170,000 for a single applicant and scaling up to approximately $250,000 for households with multiple dependants. Confirm the current figure with the ACT Revenue Office before purchase.",
      },
      {
        question: "Can I get the HBCS on an established home?",
        answer:
          "Yes. Unlike most state grants, the HBCS applies equally to new and established homes — the ACT is the only jurisdiction with no new-build restriction on first home buyer benefits.",
      },
      {
        question: "Is there any property value cap on the HBCS?",
        answer:
          "No. The scheme is income-tested rather than property-value-tested. A buyer within the income cap purchasing a $1.5m home receives full stamp duty exemption.",
      },
    ],
  },
  nt: {
    code: "NT",
    slug: "nt",
    name: "Northern Territory",
    metaTitle: "First Home Owner Grant NT 2026 — $50,000 BuildBonus + Stamp Duty Relief | Calcy",
    metaDescription:
      "Northern Territory First Home Owner Grant 2026: HomeGrown Territory $50,000 BuildBonus plus stamp duty discounts. Eligibility and worked examples.",
    h1: "First Home Owner Grant Northern Territory 2026",
    subheading:
      "The Territory's HomeGrown Territory BuildBonus and FreshStart New Home Grant pay up to $50,000 toward eligible new builds — the largest first home benefit in Australia.",
    highlight: "Up to $50,000 in combined grants for eligible new builds",
    grantAmount: "$10,000 FHOG + up to $50,000 HomeGrown Territory BuildBonus",
    revenueAuthority: "Territory Revenue Office",
    propertyCap: "$750,000 (FHOG); BuildBonus has separate construction-cost rules",
    sections: [
      {
        heading: "The Northern Territory's grant stack",
        body: `The Northern Territory operates the most complex first home buyer benefit stack in Australia. The base $10,000 FHOG applies to new builds up to $750,000, administered by the Territory Revenue Office. On top of that, the HomeGrown Territory BuildBonus has historically paid up to $50,000 toward eligible new builds, with the exact amount and program window subject to periodic NT Government renewal. A separate FreshStart New Home Grant has previously paid up to $10,000 for renovations. Combined, eligible new-build buyers can capture $40,000–$60,000 in grant value alone — by far the highest in Australia, reflecting the NT Government's policy of using housing subsidies to attract and retain residents in Darwin and Alice Springs.`,
      },
      {
        heading: "Stamp duty in the Northern Territory",
        body: `The NT has historically operated a Senior, Pensioner and Carer Concession and a House and Land Package Stamp Duty Concession, but no permanent first home buyer exemption equivalent to NSW or Victoria. The combination of relatively low base duty rates (NT duty on a $500,000 home is approximately $23,929) and large cash grants means the headline benefit comes through the grant rather than the duty system. Always confirm current concessions with the Territory Revenue Office before purchase — NT housing policy has been more volatile than mainland states.`,
      },
      {
        heading: "Eligibility for NT grants",
        body: `Standard FHOG eligibility applies: 18+, Australian citizen or PR, no previous home ownership in Australia by either applicant or spouse, no prior first home owner grant received elsewhere, and occupation as principal place of residence for at least six continuous months within 12 months of settlement. The HomeGrown Territory BuildBonus has additional construction-cost and timeline requirements — for example, construction must commence and complete within prescribed windows, and the home must meet minimum size and amenity standards. Check the Territory Revenue Office BuildBonus guidelines closely before signing a building contract.`,
      },
      {
        heading: "Worked example — $580,000 new home in Palmerston",
        body: `A first home buyer purchases a brand-new $580,000 house-and-land package in Palmerston (Darwin's satellite city) with a 10% deposit ($58,000). Standard stamp duty would be approximately $28,279 (NT's duty schedule is relatively high). With no first home buyer duty exemption in the NT, the full duty is payable. However, the buyer receives the $10,000 FHOG plus the HomeGrown Territory BuildBonus (commonly $50,000 for eligible builds at this price point). Combined cash benefit: $60,000 — covering not just the stamp duty bill but also LMI and most other settlement costs. The buyer effectively receives a net subsidy from the Territory Government to enter the market.`,
      },
      {
        heading: "How to apply for the NT grants",
        body: APPLY("the Northern Territory", "the Territory Revenue Office"),
      },
    ],
    faqs: [
      {
        question: "Is the $50,000 BuildBonus still available in 2026?",
        answer:
          "The HomeGrown Territory BuildBonus has been extended several times since launch. Confirm the current cut-off date and dollar amount with the Territory Revenue Office before signing a building contract — the figure has fluctuated between $30,000 and $50,000 historically.",
      },
      {
        question: "Can I combine the NT FHOG with the BuildBonus?",
        answer:
          "Yes — the schemes operate independently and eligible first home buyers can claim both on the same eligible new-build transaction, subject to meeting each scheme's individual rules.",
      },
      {
        question: "Does the NT have first home buyer stamp duty exemption?",
        answer:
          "Not currently — the NT relies on cash grants rather than duty exemptions. Always confirm current concessions with the Territory Revenue Office as policy has shifted multiple times.",
      },
      {
        question: "Is the BuildBonus available for established homes?",
        answer:
          "No — it is strictly for new construction. Established home buyers in the NT receive only the more limited concessions administered by the Territory Revenue Office.",
      },
    ],
  },
};
