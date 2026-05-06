import CalculatorPageShell from "./CalculatorPageShell";
import StampDuty from "@/components/calculators/StampDuty";
import { FAQS } from "@/data/faqs";
import type { StateCode } from "@/lib/calc/stampDuty";

interface StateConfig {
  code: StateCode;
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  fhbThreshold: string;
  rateSummary: string;
  practical: string;
}

const STATE_CONFIGS: Record<string, StateConfig> = {
  nsw: {
    code: "NSW",
    slug: "nsw",
    name: "New South Wales",
    metaTitle: "Stamp Duty Calculator NSW 2026 — Free | Calcy",
    metaDescription:
      "Calculate NSW stamp duty for 2026. Includes first home buyer exemptions up to $800k and concessions to $1m. Free, no sign-up.",
    h1: "NSW Stamp Duty Calculator 2026",
    fhbThreshold: "$800,000 (full exemption), $800k–$1m (concession)",
    rateSummary:
      "NSW applies progressive duty starting at $1.25 per $100 up to $14,000, rising to $5.50 per $100 above $1.06m. A $700,000 owner-occupier purchase incurs approximately $26,857 in stamp duty (Revenue NSW, 2026).",
    practical:
      "First home buyers in NSW pay zero stamp duty on properties up to $800,000 and a tapered concession between $800,000 and $1,000,000. Stamp duty is paid at settlement, typically 30–90 days after exchange of contracts. Your conveyancer or solicitor arranges payment to Revenue NSW on your behalf — the funds must be cleared before settlement.",
  },
  vic: {
    code: "VIC",
    slug: "vic",
    name: "Victoria",
    metaTitle: "Stamp Duty Calculator VIC 2026 — Free | Calcy",
    metaDescription:
      "Calculate VIC stamp duty for 2026. Includes first home buyer exemptions up to $600k and concessions to $750k. Free, no sign-up.",
    h1: "VIC Stamp Duty Calculator 2026",
    fhbThreshold: "$600,000 (full exemption), $600k–$750k (concession)",
    rateSummary:
      "Victoria charges 1.4% up to $25,000, then 2.4% to $130,000, 6% to $960,000, 5.5% to $2m, and a flat 6.5% above $2m. A $700,000 owner-occupier purchase incurs approximately $37,070 in stamp duty (State Revenue Office Victoria, 2026).",
    practical:
      "First home buyers in Victoria pay no stamp duty on properties up to $600,000 and a sliding concession from $600,001 to $750,000. The principal place of residence (PPR) concession can also reduce duty for owner-occupiers below $550,000. Settlement typically occurs 30–60 days after contract signing in Victoria.",
  },
  qld: {
    code: "QLD",
    slug: "qld",
    name: "Queensland",
    metaTitle: "Stamp Duty Calculator QLD 2026 — Free | Calcy",
    metaDescription:
      "Calculate QLD stamp duty for 2026. Includes first home buyer exemption up to $500k and concession to $550k. Free, no sign-up.",
    h1: "QLD Stamp Duty Calculator 2026",
    fhbThreshold: "$500,000 (full exemption), $500k–$550k (concession)",
    rateSummary:
      "Queensland applies $0 duty up to $5,000, $1.50 per $100 to $75,000, $3.50 per $100 to $540,000, $4.50 per $100 to $1m, and $5.75 per $100 above. Owner-occupiers receive a Home Concession that reduces duty significantly on properties up to $700,000 (Queensland Revenue Office, 2026).",
    practical:
      "Queensland's First Home Concession fully exempts purchases up to $500,000 and tapers to $550,000. The Home Concession (for any owner-occupier) provides a reduced rate on the first $350,000 of value. Stamp duty in QLD is payable within 30 days of settlement.",
  },
  wa: {
    code: "WA",
    slug: "wa",
    name: "Western Australia",
    metaTitle: "Stamp Duty Calculator WA 2026 — Free | Calcy",
    metaDescription:
      "Calculate WA stamp duty for 2026. Includes first home buyer exemption up to $430k and concession to $530k. Free, no sign-up.",
    h1: "WA Stamp Duty Calculator 2026",
    fhbThreshold: "$430,000 (full exemption), $430k–$530k (concession)",
    rateSummary:
      "Western Australia charges 1.9% up to $120,000, 2.85% to $150,000, 3.8% to $360,000, 4.75% to $725,000, and 5.15% above. A $700,000 owner-occupier purchase incurs approximately $27,265 in transfer duty (RevenueWA, 2026).",
    practical:
      "WA first home buyers pay no transfer duty on properties up to $430,000, with a sliding concession to $530,000. The First Home Owner Grant of $10,000 may also apply on new builds. Settlement in WA typically occurs 30–45 days after offer acceptance.",
  },
  sa: {
    code: "SA",
    slug: "sa",
    name: "South Australia",
    metaTitle: "Stamp Duty Calculator SA 2026 — Free | Calcy",
    metaDescription:
      "Calculate SA stamp duty for 2026 across all property values. Free, no sign-up.",
    h1: "SA Stamp Duty Calculator 2026",
    fhbThreshold: "Full exemption for new homes (any value, eligible FHBs)",
    rateSummary:
      "South Australia uses 8 progressive brackets from $1.00 per $100 up to $5.50 per $100 above $300,000. A $500,000 purchase incurs approximately $21,330 in stamp duty (RevenueSA, 2026).",
    practical:
      "South Australia abolished stamp duty for eligible first home buyers purchasing or building a new home from June 2024 — there is no value cap. Established home FHBs still pay full duty. Settlement is typically 4–6 weeks after contract signing.",
  },
  tas: {
    code: "TAS",
    slug: "tas",
    name: "Tasmania",
    metaTitle: "Stamp Duty Calculator TAS 2026 — Free | Calcy",
    metaDescription:
      "Calculate Tasmania stamp duty for 2026. Free, no sign-up.",
    h1: "TAS Stamp Duty Calculator 2026",
    fhbThreshold: "50% concession for established homes up to $750,000",
    rateSummary:
      "Tasmania charges a $50 minimum up to $3,000, then progressive rates from $1.75 per $100 to $4.50 per $100 above $725,000. A $500,000 purchase incurs approximately $18,000 in stamp duty (State Revenue Office of Tasmania, 2026).",
    practical:
      "Tasmania offers a 50% stamp duty concession for first home buyers purchasing established homes up to $750,000, in addition to the $10,000 First Home Owner Grant for newly built properties. Settlement is typically 30–60 days after contract date.",
  },
  act: {
    code: "ACT",
    slug: "act",
    name: "Australian Capital Territory",
    metaTitle: "Stamp Duty Calculator ACT 2026 — Free | Calcy",
    metaDescription:
      "Calculate ACT stamp duty for 2026. Free, no sign-up.",
    h1: "ACT Stamp Duty Calculator 2026",
    fhbThreshold: "Home Buyer Concession Scheme (HBCS) — income-tested, up to $34,790 saving",
    rateSummary:
      "The ACT uses a continuous formula: duty = (0.06571441 × V + 15) × V ÷ 1000, where V is the property value divided by 1,000. The ACT is gradually phasing stamp duty out and shifting to higher rates land tax (ACT Revenue Office, 2026).",
    practical:
      "The ACT's Home Buyer Concession Scheme (HBCS) is income-tested rather than property-value-tested. Eligible buyers can save up to $34,790 in stamp duty regardless of property value. Always check current HBCS income thresholds with the ACT Revenue Office before settlement.",
  },
  nt: {
    code: "NT",
    slug: "nt",
    name: "Northern Territory",
    metaTitle: "Stamp Duty Calculator NT 2026 — Free | Calcy",
    metaDescription:
      "Calculate NT stamp duty for 2026. Free, no sign-up.",
    h1: "NT Stamp Duty Calculator 2026",
    fhbThreshold: "House and Land Package Exemption — up to $10,000",
    rateSummary:
      "The Northern Territory uses the same continuous formula as the ACT for properties under $525,000: duty = (0.06571441 × V + 15) × V ÷ 1000. Above $525,000, a flat 4.95% applies to the full property value (Territory Revenue Office, 2026).",
    practical:
      "The NT offers a House and Land Package Exemption and the BuildBonus grant for new builds. The Territory Home Owner Discount has been phased out, but specific schemes remain for new homes. Settlement is typically 4–6 weeks.",
  },
};

const StampDutyStatePage = ({ slug }: { slug: keyof typeof STATE_CONFIGS }) => {
  const cfg = STATE_CONFIGS[slug];
  return (
    <CalculatorPageShell
      title={cfg.h1}
      metaTitle={cfg.metaTitle}
      metaDescription={cfg.metaDescription}
      canonical={`/stamp-duty-calculator/${cfg.slug}`}
      faqs={FAQS.stampDuty}
      related={[
        { to: "/stamp-duty-calculator", label: "All states stamp duty calculator" },
        { to: "/mortgage-calculator", label: "Mortgage Repayment Calculator" },
        { to: "/lmi-calculator", label: "LMI Calculator" },
      ]}
      sections={[
        {
          heading: `${cfg.code} stamp duty rates`,
          body: <p>{cfg.rateSummary}</p>,
        },
        {
          heading: `First home buyers in ${cfg.code}`,
          body: (
            <p>
              <strong>FHB threshold:</strong> {cfg.fhbThreshold}.
              <br />
              {cfg.practical}
            </p>
          ),
        },
        {
          heading: "How to use this calculator",
          body: (
            <p>
              Enter your purchase price and select your buyer type. The {cfg.code} state is
              pre-selected and the calculator applies {cfg.code}'s 2026 brackets, including any
              first home buyer concession that applies. Results update live — no Calculate button.
            </p>
          ),
        },
      ]}
    >
      <StampDuty lockedState={cfg.code} />
    </CalculatorPageShell>
  );
};

export default StampDutyStatePage;
export { STATE_CONFIGS };
