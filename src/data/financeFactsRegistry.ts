import { rbaRates } from "./rbaRates";
import { FHOG, type StateCode } from "../lib/calc/stampDuty";
import { HECS_BRACKETS_2025_26 } from "../lib/calc/hecsBorrowing";

export type FinanceFactRisk = "single_source" | "duplicated" | "stale_risk";
export type FinanceFactCategory =
  | "rba"
  | "serviceability"
  | "hecs"
  | "tax"
  | "stamp_duty"
  | "fhog"
  | "lmi"
  | "living_expenses"
  | "seo_policy";
export type FinanceFactStatus = "current" | "needs_review" | "deprecated";
export type FinanceJurisdiction = "AU" | StateCode;

export interface FinanceFactSource {
  name: string;
  url: string;
}

export interface FinanceFact<TValue = unknown> {
  key: string;
  category: FinanceFactCategory;
  label: string;
  value: TValue;
  jurisdiction?: FinanceJurisdiction;
  effectiveDate?: string;
  lastReviewed: string;
  sourceName: string;
  sourceUrl: string;
  sources?: FinanceFactSource[];
  status: FinanceFactStatus;
  risk: FinanceFactRisk;
  notes?: string;
  internalComments?: string;
  currentKnownSources?: string[];
  phase0aNote?: string;
}

export interface FinanceFactRegistryItem extends FinanceFact {
  currentKnownSources: string[];
  phase0aNote: string;
}

export interface StampDutyThresholdValue {
  fullExemptionTo?: number;
  concessionTo?: number;
  discountPercent?: number;
  grantAmount?: number;
  summary: string;
}

export interface LmiBand {
  minLvrExclusive: number;
  maxLvrInclusive: number | null;
  ownerRate: number;
  investorRate: number;
}

const RBA_SOURCE: FinanceFactSource = {
  name: "Reserve Bank of Australia",
  url: "https://www.rba.gov.au/statistics/cash-rate/",
};

const APRA_SOURCE: FinanceFactSource = {
  name: "APRA Prudential Practice Guide APG 223",
  url: "https://www.apra.gov.au/prudential-practice-guide-apg-223-residential-mortgage-lending",
};

const ATO_HECS_SOURCE: FinanceFactSource = {
  name: "Australian Taxation Office",
  url: "https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds",
};

const ATO_TAX_SOURCE: FinanceFactSource = {
  name: "Australian Taxation Office",
  url: "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
};

const LMI_SOURCE: FinanceFactSource = {
  name: "Calcy indicative LMI model based on common Australian insurer bands",
  url: "https://calcy.com.au/lmi-calculator",
};

const STATE_REVENUE_SOURCES: Record<StateCode, FinanceFactSource> = {
  NSW: {
    name: "Revenue NSW",
    url: "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty",
  },
  VIC: {
    name: "State Revenue Office Victoria",
    url: "https://www.sro.vic.gov.au/land-transfer-duty",
  },
  QLD: {
    name: "Queensland Revenue Office",
    url: "https://qro.qld.gov.au/duties/transfer-duty/",
  },
  WA: {
    name: "RevenueWA",
    url: "https://www.wa.gov.au/organisation/department-of-finance/transfer-duty",
  },
  SA: {
    name: "RevenueSA",
    url: "https://www.revenuesa.sa.gov.au/stampduty",
  },
  TAS: {
    name: "State Revenue Office Tasmania",
    url: "https://www.sro.tas.gov.au/property-transfer-duties",
  },
  ACT: {
    name: "ACT Revenue Office",
    url: "https://www.revenue.act.gov.au/duties/conveyance-duty",
  },
  NT: {
    name: "Northern Territory Revenue Office",
    url: "https://nt.gov.au/property/buying-and-selling-property/stamp-duty",
  },
};

const REVIEW_DATE = "2026-05-22";

const stampDutyFacts: FinanceFact<StampDutyThresholdValue>[] = [
  {
    key: "stamp_duty_thresholds_nsw",
    category: "stamp_duty",
    label: "NSW first home buyer transfer duty thresholds",
    jurisdiction: "NSW",
    value: { fullExemptionTo: 800000, concessionTo: 1000000, summary: "Full exemption to $800,000; concession to $1,000,000." },
    effectiveDate: "2023-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.NSW.name,
    sourceUrl: STATE_REVENUE_SOURCES.NSW.url,
    status: "current",
    risk: "duplicated",
    notes: "Mirrors current calculator first-home-buyer logic; do not replace formula tables until a dedicated stamp duty validation pass.",
  },
  {
    key: "stamp_duty_thresholds_vic",
    category: "stamp_duty",
    label: "VIC first home buyer transfer duty thresholds",
    jurisdiction: "VIC",
    value: { fullExemptionTo: 600000, concessionTo: 750000, summary: "Full exemption to $600,000; concession to $750,000." },
    effectiveDate: "2021-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.VIC.name,
    sourceUrl: STATE_REVENUE_SOURCES.VIC.url,
    status: "current",
    risk: "duplicated",
  },
  {
    key: "stamp_duty_thresholds_qld",
    category: "stamp_duty",
    label: "QLD first home buyer transfer duty thresholds",
    jurisdiction: "QLD",
    value: { fullExemptionTo: 500000, concessionTo: 550000, summary: "Calculator currently applies exemption to $500,000 and concession to $550,000." },
    effectiveDate: "2012-01-01",
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.QLD.name,
    sourceUrl: STATE_REVENUE_SOURCES.QLD.url,
    status: "needs_review",
    risk: "duplicated",
    notes: "Content references newer QLD thresholds in some pages. Phase 0B records the mismatch but intentionally preserves existing calculator behavior.",
  },
  {
    key: "stamp_duty_thresholds_wa",
    category: "stamp_duty",
    label: "WA first home buyer transfer duty thresholds",
    jurisdiction: "WA",
    value: { fullExemptionTo: 430000, concessionTo: 530000, summary: "Calculator currently applies exemption to $430,000 and concession to $530,000." },
    effectiveDate: "2022-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.WA.name,
    sourceUrl: STATE_REVENUE_SOURCES.WA.url,
    status: "needs_review",
    risk: "duplicated",
    notes: "Some content references WA $450,000/$600,000 thresholds. Keep calculator unchanged until a state-by-state validation pass.",
  },
  {
    key: "stamp_duty_thresholds_sa",
    category: "stamp_duty",
    label: "SA first home buyer transfer duty thresholds",
    jurisdiction: "SA",
    value: { summary: "Calculator currently applies no first-home-buyer duty reduction." },
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.SA.name,
    sourceUrl: STATE_REVENUE_SOURCES.SA.url,
    status: "needs_review",
    risk: "duplicated",
    notes: "SA content and calculator assumptions should be manually verified before any public replacement.",
  },
  {
    key: "stamp_duty_thresholds_tas",
    category: "stamp_duty",
    label: "TAS first home buyer transfer duty concession",
    jurisdiction: "TAS",
    value: { discountPercent: 50, summary: "Calculator currently applies 50% duty concession for first home buyers." },
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.TAS.name,
    sourceUrl: STATE_REVENUE_SOURCES.TAS.url,
    status: "needs_review",
    risk: "duplicated",
  },
  {
    key: "stamp_duty_thresholds_act",
    category: "stamp_duty",
    label: "ACT Home Buyer Concession handling",
    jurisdiction: "ACT",
    value: { summary: "Calculator currently sets first-home-buyer duty to $0 without income testing." },
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.ACT.name,
    sourceUrl: STATE_REVENUE_SOURCES.ACT.url,
    status: "needs_review",
    risk: "duplicated",
    notes: "ACT scheme is income-tested; calculator behavior is preserved pending validation.",
  },
  {
    key: "stamp_duty_thresholds_nt",
    category: "stamp_duty",
    label: "NT first home buyer discount handling",
    jurisdiction: "NT",
    value: { fullExemptionTo: 18601, summary: "Calculator currently applies a discount capped at $18,601." },
    lastReviewed: REVIEW_DATE,
    sourceName: STATE_REVENUE_SOURCES.NT.name,
    sourceUrl: STATE_REVENUE_SOURCES.NT.url,
    status: "needs_review",
    risk: "duplicated",
  },
];

const fhogFacts: FinanceFact<number>[] = (Object.keys(FHOG) as StateCode[]).map((state) => ({
  key: `fhog_${state.toLowerCase()}`,
  category: "fhog",
  label: `${state} First Home Owner Grant amount used by calculator`,
  jurisdiction: state,
  value: FHOG[state],
  lastReviewed: REVIEW_DATE,
  sourceName: STATE_REVENUE_SOURCES[state].name,
  sourceUrl: STATE_REVENUE_SOURCES[state].url,
  status: state === "ACT" ? "current" : "needs_review",
  risk: "duplicated",
  notes: "Mirrors existing FHOG constant. Future admin editing should update this registry and calculator adapters together after validation.",
}));

export const FINANCE_FACTS_REGISTRY: FinanceFact[] = [
  {
    key: "rba_cash_rate",
    category: "rba",
    label: "RBA cash rate",
    jurisdiction: "AU",
    value: rbaRates.cashRate,
    effectiveDate: "2026-05-05",
    lastReviewed: REVIEW_DATE,
    sourceName: RBA_SOURCE.name,
    sourceUrl: RBA_SOURCE.url,
    sources: [RBA_SOURCE],
    status: "current",
    risk: "duplicated",
    currentKnownSources: [
      "public/llms.txt",
      "src/data/rbaRates.ts",
      "src/hooks/useLiveRates.ts fallback",
      "supabase rate_data seed",
      "calculator defaults and programmatic page seed rates",
    ],
    phase0aNote:
      "Keep live rate_data as operational source; Phase 0B centralises metadata but does not replace public text or calculator defaults.",
  },
  {
    key: "rba_owner_occupier_average_rate",
    category: "rba",
    label: "Average owner-occupier rate used in public helper copy",
    jurisdiction: "AU",
    value: rbaRates.ownerOccupier,
    effectiveDate: "2026-05",
    lastReviewed: REVIEW_DATE,
    sourceName: RBA_SOURCE.name,
    sourceUrl: RBA_SOURCE.url,
    status: "current",
    risk: "duplicated",
  },
  {
    key: "rba_investor_average_rate",
    category: "rba",
    label: "Average investor rate used in public helper copy",
    jurisdiction: "AU",
    value: rbaRates.investor,
    effectiveDate: "2026-05",
    lastReviewed: REVIEW_DATE,
    sourceName: RBA_SOURCE.name,
    sourceUrl: RBA_SOURCE.url,
    status: "current",
    risk: "duplicated",
  },
  {
    key: "apra_serviceability_buffer",
    category: "serviceability",
    label: "APRA serviceability buffer",
    jurisdiction: "AU",
    value: 3.0,
    effectiveDate: "2021-10-01",
    lastReviewed: REVIEW_DATE,
    sourceName: APRA_SOURCE.name,
    sourceUrl: APRA_SOURCE.url,
    sources: [APRA_SOURCE],
    status: "current",
    risk: "duplicated",
    currentKnownSources: [
      "src/lib/calc/borrowingPower.ts",
      "src/lib/calc/hecsBorrowing.ts",
      "src/components/mobile/MobileHomepage.tsx",
      "src/data/guides.ts and generated guide copy",
      "public/llms.txt",
    ],
    phase0aNote:
      "Keep calculator assumptions unchanged; Phase 0B exposes one cited buffer constant for future adapters.",
  },
  {
    key: "calcy_conservative_serviceability_buffer",
    category: "serviceability",
    label: "Calcy conservative borrowing-power buffer",
    jurisdiction: "AU",
    value: 3.5,
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy calculator model",
    sourceUrl: "https://calcy.com.au/borrowing-power-calculator",
    status: "current",
    risk: "single_source",
    notes: "Internal conservative scenario used by borrowing power v2. Not an APRA policy setting.",
  },
  {
    key: "calcy_reduced_serviceability_buffer_scenario",
    category: "serviceability",
    label: "Calcy reduced-buffer borrowing-power scenario",
    jurisdiction: "AU",
    value: 2.5,
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy calculator model",
    sourceUrl: "https://calcy.com.au/borrowing-power-calculator",
    status: "current",
    risk: "single_source",
    notes: "Scenario-only comparison; not used as the main lender assessment assumption.",
  },
  {
    key: "hem_simple_model",
    category: "living_expenses",
    label: "Simplified HEM model used by borrowing power v2",
    jurisdiction: "AU",
    value: { baseMonthly: 2000, partnerMonthly: 800, dependantMonthly: 400 },
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy calculator model",
    sourceUrl: "https://calcy.com.au/borrowing-power-calculator",
    status: "needs_review",
    risk: "single_source",
    notes: "Simplified estimate, not a lender-specific HEM table. Do not expose as official HEM data.",
  },
  {
    key: "hecs_help_thresholds_2025_26",
    category: "hecs",
    label: "HECS/HELP compulsory repayment thresholds",
    jurisdiction: "AU",
    value: HECS_BRACKETS_2025_26,
    effectiveDate: "2025-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: ATO_HECS_SOURCE.name,
    sourceUrl: ATO_HECS_SOURCE.url,
    sources: [ATO_HECS_SOURCE],
    status: "needs_review",
    risk: "stale_risk",
    currentKnownSources: [
      "src/lib/calc/hecsBorrowing.ts",
      "HECS calculator/page copy",
      "SEO Intelligence freshness checks",
    ],
    phase0aNote:
      "Do not rewrite thresholds in Phase 0A/0B; add annual review workflow before tax-time content expansion.",
  },
  {
    key: "hecs_help_thresholds",
    category: "hecs",
    label: "HECS/HELP repayment thresholds audit summary",
    jurisdiction: "AU",
    value: HECS_BRACKETS_2025_26,
    effectiveDate: "2025-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: ATO_HECS_SOURCE.name,
    sourceUrl: ATO_HECS_SOURCE.url,
    status: "needs_review",
    risk: "stale_risk",
    currentKnownSources: [
      "src/lib/calc/hecsBorrowing.ts",
      "HECS calculator/page copy",
      "SEO Intelligence freshness checks",
    ],
    phase0aNote:
      "Compatibility alias retained from Phase 0A. Use hecs_help_thresholds_2025_26 for year-specific logic.",
  },
  {
    key: "resident_income_tax_2025_26",
    category: "tax",
    label: "Resident individual income tax assumptions used by HECS calculator",
    jurisdiction: "AU",
    value: [
      { min: 0, max: 18200, rate: 0, baseTax: 0 },
      { min: 18201, max: 45000, rate: 0.16, baseTax: 0 },
      { min: 45001, max: 135000, rate: 0.3, baseTax: 4288 },
      { min: 135001, max: 190000, rate: 0.37, baseTax: 31288 },
      { min: 190001, max: null, rate: 0.45, baseTax: 51638 },
    ],
    effectiveDate: "2025-07-01",
    lastReviewed: REVIEW_DATE,
    sourceName: ATO_TAX_SOURCE.name,
    sourceUrl: ATO_TAX_SOURCE.url,
    status: "needs_review",
    risk: "single_source",
    notes: "Mirrors private annualTax function assumptions; not wired into calculator yet.",
  },
  {
    key: "medicare_levy_assumption",
    category: "tax",
    label: "Medicare levy assumption",
    jurisdiction: "AU",
    value: { includedInCalculatorTax: false },
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy calculator model",
    sourceUrl: "https://calcy.com.au/hecs-borrowing-power",
    status: "needs_review",
    risk: "single_source",
    notes: "HECS calculator tax model does not currently include a separate Medicare levy calculation.",
  },
  {
    key: "lmi_threshold_lvr",
    category: "lmi",
    label: "LMI threshold LVR",
    jurisdiction: "AU",
    value: 80,
    lastReviewed: REVIEW_DATE,
    sourceName: LMI_SOURCE.name,
    sourceUrl: LMI_SOURCE.url,
    status: "current",
    risk: "duplicated",
  },
  {
    key: "lmi_bands_2026_indicative",
    category: "lmi",
    label: "Indicative 2026 LMI premium bands",
    jurisdiction: "AU",
    value: [
      { minLvrExclusive: 80, maxLvrInclusive: 85, ownerRate: 0.0066, investorRate: 0.008 },
      { minLvrExclusive: 85, maxLvrInclusive: 90, ownerRate: 0.0119, investorRate: 0.0145 },
      { minLvrExclusive: 90, maxLvrInclusive: 95, ownerRate: 0.0196, investorRate: 0.023 },
      { minLvrExclusive: 95, maxLvrInclusive: null, ownerRate: 0.031, investorRate: 0.036 },
    ] satisfies LmiBand[],
    effectiveDate: "2026-01-01",
    lastReviewed: REVIEW_DATE,
    sourceName: LMI_SOURCE.name,
    sourceUrl: LMI_SOURCE.url,
    status: "needs_review",
    risk: "duplicated",
    currentKnownSources: [
      "src/lib/calc/lmi.ts",
      "src/lib/calc/refinance.ts",
      "src/pages/ProgrammaticPage.tsx",
      "src/data/guides.ts",
      "src/data/cityGuides.ts",
      "public/llms.txt",
    ],
    phase0aNote:
      "Keep estimates unchanged; Phase 0B documents insurer/source assumptions and avoids implying lender-specific quotes.",
  },
  {
    key: "lmi_stamp_duty_surcharge_factor",
    category: "lmi",
    label: "Approximate LMI stamp duty surcharge factor",
    jurisdiction: "AU",
    value: 1.1,
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy indicative LMI model",
    sourceUrl: "https://calcy.com.au/lmi-calculator",
    status: "needs_review",
    risk: "duplicated",
    notes: "Used by LMI/refinance estimates as an approximate 10% uplift. State-specific insurer duty should be validated before future formula changes.",
  },
  ...stampDutyFacts,
  {
    key: "stamp_duty_thresholds",
    category: "stamp_duty",
    label: "State stamp duty and first-home-buyer thresholds audit summary",
    jurisdiction: "AU",
    value: stampDutyFacts.map((fact) => ({ key: fact.key, jurisdiction: fact.jurisdiction, value: fact.value, status: fact.status })),
    lastReviewed: REVIEW_DATE,
    sourceName: "State and territory revenue authorities",
    sourceUrl: "https://calcy.com.au/stamp-duty-calculator",
    sources: Object.values(STATE_REVENUE_SOURCES),
    status: "needs_review",
    risk: "duplicated",
    currentKnownSources: [
      "src/lib/calc/stampDuty.ts",
      "src/data/stampDutyStateContent.ts",
      "src/data/fhbGrantContent.ts",
      "src/data/cityGuides.ts",
      "supabase programmatic_pages seed",
      "public/llms.txt",
    ],
    phase0aNote:
      "Compatibility alias retained from Phase 0A. Use state-specific stamp_duty_thresholds_* facts for future adapters.",
  },
  ...fhogFacts,
  {
    key: "fhog_grants",
    category: "fhog",
    label: "First Home Owner Grant amounts audit summary",
    jurisdiction: "AU",
    value: FHOG,
    lastReviewed: REVIEW_DATE,
    sourceName: "State and territory revenue authorities",
    sourceUrl: "https://calcy.com.au/stamp-duty-calculator",
    sources: Object.values(STATE_REVENUE_SOURCES),
    status: "needs_review",
    risk: "duplicated",
    currentKnownSources: [
      "src/lib/calc/stampDuty.ts",
      "src/data/fhbGrantContent.ts",
      "src/data/cityGuides.ts",
      "public/llms.txt",
      "SEO freshness engine prompts",
    ],
    phase0aNote:
      "Compatibility alias retained from Phase 0A. Use fhog_* state-specific facts for future adapters.",
  },
  {
    key: "lmi_assumptions",
    category: "lmi",
    label: "LMI assumptions and insurer references audit summary",
    jurisdiction: "AU",
    value: {
      thresholdLvr: 80,
      bandsFactKey: "lmi_bands_2026_indicative",
      stampDutySurchargeFactor: 1.1,
    },
    effectiveDate: "2026-01-01",
    lastReviewed: REVIEW_DATE,
    sourceName: LMI_SOURCE.name,
    sourceUrl: LMI_SOURCE.url,
    status: "needs_review",
    risk: "duplicated",
    currentKnownSources: [
      "src/lib/calc/lmi.ts",
      "src/lib/calc/refinance.ts",
      "src/pages/ProgrammaticPage.tsx",
      "src/data/guides.ts",
      "src/data/cityGuides.ts",
      "public/llms.txt",
    ],
    phase0aNote:
      "Compatibility alias retained from Phase 0A. Use lmi_bands_2026_indicative and lmi_threshold_lvr for future adapters.",
  },
  {
    key: "calculate_pages_seo_policy",
    category: "seo_policy",
    label: "/calculate/* SEO policy",
    jurisdiction: "AU",
    value: {
      routePattern: "/calculate/*",
      currentState:
        "Routed through ProgrammaticPage and loaded from active programmatic_pages rows. Static sitemap/prerender generation currently uses src/data/routes.ts plus generated city/suburb guides, so these DB-backed /calculate/* URLs are not included in the static sitemap by default.",
      safestPolicy:
        "Keep /calculate/* indexable only when each page has a unique active DB row, useful copy, FAQ support, and internal links. Do not bulk-add these URLs to sitemap until a build-time/exported manifest exists and thin/duplicate pages are filtered.",
    },
    lastReviewed: REVIEW_DATE,
    sourceName: "Calcy Phase 0A audit",
    sourceUrl: "https://calcy.com.au/calculate",
    status: "current",
    risk: "single_source",
  },
];

const factIndex = new Map(FINANCE_FACTS_REGISTRY.map((fact) => [fact.key, fact]));

export function getFact<TValue = unknown>(key: string): FinanceFact<TValue> | undefined {
  return factIndex.get(key) as FinanceFact<TValue> | undefined;
}

export function getFactsByCategory(category: FinanceFactCategory): FinanceFact[] {
  return FINANCE_FACTS_REGISTRY.filter((fact) => fact.category === category);
}

export function getFactsByJurisdiction(jurisdiction: FinanceJurisdiction): FinanceFact[] {
  return FINANCE_FACTS_REGISTRY.filter((fact) => fact.jurisdiction === jurisdiction);
}

export function checkFactsNeedingReview(referenceDate = new Date(REVIEW_DATE)): FinanceFact[] {
  const staleCutoff = new Date(referenceDate);
  staleCutoff.setMonth(staleCutoff.getMonth() - 12);

  return FINANCE_FACTS_REGISTRY.filter((fact) => {
    if (fact.status === "needs_review" || fact.status === "deprecated") return true;
    const reviewedAt = new Date(fact.lastReviewed);
    return Number.isFinite(reviewedAt.getTime()) && reviewedAt < staleCutoff;
  });
}

export function getFactDateLabels(key: string): { effectiveDate: string; lastReviewed: string } | null {
  const fact = getFact(key);
  if (!fact) return null;
  return {
    effectiveDate: fact.effectiveDate || "Not specified",
    lastReviewed: fact.lastReviewed,
  };
}

export function getNumericFactValue(key: string): number | undefined {
  const value = getFact<number>(key)?.value;
  return typeof value === "number" ? value : undefined;
}

export const CALCULATE_SEO_POLICY = getFact<{
  routePattern: "/calculate/*";
  currentState: string;
  safestPolicy: string;
}>("calculate_pages_seo_policy")?.value ?? {
  routePattern: "/calculate/*",
  currentState:
    "Routed through ProgrammaticPage and loaded from active programmatic_pages rows. Static sitemap/prerender generation currently uses src/data/routes.ts plus generated city/suburb guides, so these DB-backed /calculate/* URLs are not included in the static sitemap by default.",
  safestPolicy:
    "Keep /calculate/* indexable only when each page has a unique active DB row, useful copy, FAQ support, and internal links. Do not bulk-add these URLs to sitemap until a build-time/exported manifest exists and thin/duplicate pages are filtered.",
};

export const FINANCE_FACTS_ADMIN_READINESS = {
  currentState:
    "Finance facts are centralised in a typed registry with source metadata, status, review dates, and helper accessors. Existing calculators still use their current constants/functions.",
  futureConnection:
    "A later admin/backend phase can mirror these facts into rate_data or a dedicated finance_facts table, then introduce adapters behind tests before changing public calculator behavior.",
  safetyRule:
    "Do not update public copy, formulas, schema, metadata, or sitemap from this registry until each fact has been verified and a calculator regression test exists.",
} as const;
