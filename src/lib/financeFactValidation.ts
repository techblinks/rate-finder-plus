import {
  CALCULATE_SEO_POLICY,
  FINANCE_FACTS_REGISTRY,
  type FinanceFact,
  type FinanceFactCategory,
  type FinanceFactStatus,
  type FinanceJurisdiction,
} from "../data/financeFactsRegistry";
import type { StateCode } from "./calc/stampDuty";

export type FinanceFactReadiness =
  | "ready_for_public_use"
  | "internal_only"
  | "needs_manual_review"
  | "deprecated_do_not_use";

export type StateReviewStatus = "not_verified" | "partially_ready" | "ready";

export interface FinanceFactValidationIssue {
  key: string;
  category: FinanceFactCategory;
  jurisdiction?: FinanceJurisdiction;
  issue: string;
  severity: "warning" | "critical";
}

export interface StateFinanceFactReviewChecklistItem {
  state: StateCode;
  label: string;
  status: StateReviewStatus;
  requiredChecks: string[];
  relatedFactKeys: string[];
  notes: string;
}

export interface CalculateSeoPolicyProtection {
  routePattern: "/calculate/*";
  indexable: "conditional";
  sitemapIncluded: false;
  defaultNoindexRequired: false;
  approvalRequiredBeforeIndexing: true;
  policy: string;
  approvalChecklist: string[];
}

export interface FinanceFactValidationReport {
  totalFacts: number;
  factsMarkedNeedsReview: FinanceFact[];
  missingSourceUrls: FinanceFactValidationIssue[];
  missingEffectiveDates: FinanceFactValidationIssue[];
  missingLastReviewedDates: FinanceFactValidationIssue[];
  stateBasedGaps: FinanceFactValidationIssue[];
  conflictingDuplicatedAssumptions: FinanceFactValidationIssue[];
  factsNotReadyForPublicUse: Array<{ fact: FinanceFact; readiness: FinanceFactReadiness }>;
  readinessCounts: Record<FinanceFactReadiness, number>;
  stateReviewChecklist: StateFinanceFactReviewChecklistItem[];
  calculateSeoPolicy: CalculateSeoPolicyProtection;
}

const STATE_CODES: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const PUBLIC_USE_BLOCKED_CATEGORIES = new Set<FinanceFactCategory>([
  "seo_policy",
  "living_expenses",
]);

const EFFECTIVE_DATE_REQUIRED_CATEGORIES = new Set<FinanceFactCategory>([
  "rba",
  "serviceability",
  "hecs",
  "tax",
  "stamp_duty",
  "fhog",
  "lmi",
]);

export const CALCULATE_SEO_POLICY_PROTECTION: CalculateSeoPolicyProtection = {
  routePattern: "/calculate/*",
  indexable: "conditional",
  sitemapIncluded: false,
  defaultNoindexRequired: false,
  approvalRequiredBeforeIndexing: true,
  policy: CALCULATE_SEO_POLICY.safestPolicy,
  approvalChecklist: [
    "Page has an active programmatic_pages row with unique intent and useful calculator prefill.",
    "Page has unique H1, title, meta description, intro, FAQ support, and internal links.",
    "Page is reviewed for thin/duplicate content before any sitemap inclusion.",
    "Page is included in a generated manifest only after admin approval.",
    "No bulk /calculate/* sitemap inclusion until route coverage and duplicate checks pass.",
  ],
};

export const STATE_FINANCE_FACT_REVIEW_CHECKLIST: StateFinanceFactReviewChecklistItem[] = [
  {
    state: "NSW",
    label: "NSW stamp duty / first home buyer rules",
    status: "partially_ready",
    relatedFactKeys: ["stamp_duty_thresholds_nsw", "fhog_nsw"],
    requiredChecks: [
      "Confirm transfer duty brackets against Revenue NSW.",
      "Confirm first home buyer exemption and concession thresholds.",
      "Confirm FHOG amount and new-home property cap.",
      "Confirm occupancy and eligibility rules before public reuse.",
    ],
    notes: "Registry marks NSW stamp duty thresholds current, but FHOG still needs manual state-source verification before adapters.",
  },
  {
    state: "VIC",
    label: "VIC stamp duty / first home buyer rules",
    status: "partially_ready",
    relatedFactKeys: ["stamp_duty_thresholds_vic", "fhog_vic"],
    requiredChecks: [
      "Confirm transfer duty brackets against SRO Victoria.",
      "Confirm FHB exemption and concession thresholds.",
      "Confirm FHOG amount and any regional bonus language.",
      "Confirm PPR concession treatment before public reuse.",
    ],
    notes: "Registry marks VIC stamp duty thresholds current, but FHOG/regional references need manual verification.",
  },
  {
    state: "QLD",
    label: "QLD stamp duty / first home buyer rules",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_qld", "fhog_qld"],
    requiredChecks: [
      "Resolve mismatch between calculator thresholds and newer public content references.",
      "Confirm first home concession, home concession, and new-home FHB treatment.",
      "Confirm $30,000 FHOG date window and property cap.",
      "Update registry status only after official-source review.",
    ],
    notes: "Do not use QLD registry facts for public replacement yet; marked needs_review.",
  },
  {
    state: "WA",
    label: "WA stamp duty / first home buyer rules",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_wa", "fhog_wa"],
    requiredChecks: [
      "Resolve mismatch between calculator thresholds and public content references.",
      "Confirm first-home-buyer transfer duty thresholds.",
      "Confirm FHOG regional property caps north/south of 26th parallel.",
      "Confirm Keystart mentions stay separate from tax/grant calculations.",
    ],
    notes: "Do not use WA registry facts for public replacement yet; marked needs_review.",
  },
  {
    state: "SA",
    label: "SA stamp duty / first home buyer rules",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_sa", "fhog_sa"],
    requiredChecks: [
      "Confirm current first-home-buyer stamp duty relief for new and established homes.",
      "Confirm FHOG amount and property cap.",
      "Confirm calculator behavior before any formula migration.",
    ],
    notes: "Registry records current calculator behavior only; manual verification required.",
  },
  {
    state: "TAS",
    label: "TAS stamp duty / first home buyer rules",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_tas", "fhog_tas"],
    requiredChecks: [
      "Confirm 50% transfer duty concession and any property-value cap.",
      "Confirm FHOG amount and eligibility.",
      "Confirm whether established/new home treatment differs.",
    ],
    notes: "Registry records current calculator behavior only; manual verification required.",
  },
  {
    state: "ACT",
    label: "ACT stamp duty / concession handling",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_act", "fhog_act"],
    requiredChecks: [
      "Confirm Home Buyer Concession Scheme income and property tests.",
      "Confirm whether calculator should model income-tested eligibility.",
      "Confirm FHOG/grant messaging remains accurate.",
    ],
    notes: "Calculator currently simplifies ACT first-home-buyer duty to $0; do not use publicly until reviewed.",
  },
  {
    state: "NT",
    label: "NT stamp duty / grant handling",
    status: "not_verified",
    relatedFactKeys: ["stamp_duty_thresholds_nt", "fhog_nt"],
    requiredChecks: [
      "Confirm current stamp duty formula and discount/grant treatment.",
      "Confirm HomeGrown Territory or other grant availability.",
      "Confirm FHOG and occupancy rules.",
    ],
    notes: "Registry records current calculator behavior only; manual verification required.",
  },
];

export function classifyFinanceFactReadiness(fact: FinanceFact): FinanceFactReadiness {
  if (fact.status === "deprecated") return "deprecated_do_not_use";
  if (fact.status === "needs_review") return "needs_manual_review";
  if (PUBLIC_USE_BLOCKED_CATEGORIES.has(fact.category)) return "internal_only";
  if (fact.sourceName.toLowerCase().includes("calcy calculator model")) return "internal_only";
  if (!fact.sourceUrl || !fact.lastReviewed) return "needs_manual_review";
  if (EFFECTIVE_DATE_REQUIRED_CATEGORIES.has(fact.category) && !fact.effectiveDate) {
    return "needs_manual_review";
  }
  return "ready_for_public_use";
}

function hasValidUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function issueFor(
  fact: FinanceFact,
  issue: string,
  severity: "warning" | "critical" = "warning",
): FinanceFactValidationIssue {
  return {
    key: fact.key,
    category: fact.category,
    jurisdiction: fact.jurisdiction,
    issue,
    severity,
  };
}

export function buildFinanceFactValidationReport(
  facts: FinanceFact[] = FINANCE_FACTS_REGISTRY,
): FinanceFactValidationReport {
  const missingSourceUrls = facts
    .filter((fact) => !hasValidUrl(fact.sourceUrl))
    .map((fact) => issueFor(fact, "Missing or invalid sourceUrl.", "critical"));

  const missingEffectiveDates = facts
    .filter((fact) => EFFECTIVE_DATE_REQUIRED_CATEGORIES.has(fact.category) && !fact.effectiveDate)
    .map((fact) => issueFor(fact, "Missing effectiveDate before public reuse."));

  const missingLastReviewedDates = facts
    .filter((fact) => !fact.lastReviewed)
    .map((fact) => issueFor(fact, "Missing lastReviewed date.", "critical"));

  const stateBasedGaps: FinanceFactValidationIssue[] = [];
  for (const state of STATE_CODES) {
    const stampDutyFact = facts.find((fact) => fact.key === `stamp_duty_thresholds_${state.toLowerCase()}`);
    const fhogFact = facts.find((fact) => fact.key === `fhog_${state.toLowerCase()}`);
    if (!stampDutyFact) {
      stateBasedGaps.push({
        key: `stamp_duty_thresholds_${state.toLowerCase()}`,
        category: "stamp_duty",
        jurisdiction: state,
        issue: "Missing state stamp duty fact.",
        severity: "critical",
      });
    }
    if (!fhogFact) {
      stateBasedGaps.push({
        key: `fhog_${state.toLowerCase()}`,
        category: "fhog",
        jurisdiction: state,
        issue: "Missing state FHOG fact.",
        severity: "critical",
      });
    }
  }

  const conflictingDuplicatedAssumptions = facts
    .filter((fact) => fact.risk === "duplicated" && fact.status === "needs_review")
    .map((fact) =>
      issueFor(
        fact,
        "Duplicated assumption marked needs_review; do not use publicly until source conflict is resolved.",
      ),
    );

  const factsNotReadyForPublicUse = facts
    .map((fact) => ({ fact, readiness: classifyFinanceFactReadiness(fact) }))
    .filter(({ readiness }) => readiness !== "ready_for_public_use");

  const readinessCounts: Record<FinanceFactReadiness, number> = {
    ready_for_public_use: 0,
    internal_only: 0,
    needs_manual_review: 0,
    deprecated_do_not_use: 0,
  };
  for (const fact of facts) readinessCounts[classifyFinanceFactReadiness(fact)] += 1;

  return {
    totalFacts: facts.length,
    factsMarkedNeedsReview: facts.filter((fact) => fact.status === "needs_review"),
    missingSourceUrls,
    missingEffectiveDates,
    missingLastReviewedDates,
    stateBasedGaps,
    conflictingDuplicatedAssumptions,
    factsNotReadyForPublicUse,
    readinessCounts,
    stateReviewChecklist: STATE_FINANCE_FACT_REVIEW_CHECKLIST,
    calculateSeoPolicy: CALCULATE_SEO_POLICY_PROTECTION,
  };
}
