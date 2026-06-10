import type { FaqItem } from "./faqs";
import { getFact } from "./financeFactsRegistry";
import { classifyFinanceFactReadiness } from "../lib/financeFactValidation";

export type MortgageScenarioType =
  | "offset"
  | "extra_repayments"
  | "rate_rise"
  | "first_home_buyer"
  | "investment_property"
  | "refinance"
  | "hecs_impact"
  | "upfront_costs";

export interface MortgageScenarioToolLink {
  to: string;
  label: string;
  description: string;
}

export interface MortgageScenarioPreset {
  loan?: number;
  rate?: number;
  term?: number;
  freq?: "weekly" | "fortnightly" | "monthly";
  extra?: number;
  offsetStart?: number;
  offsetMonthly?: number;
}

export interface MortgageScenarioTableRow {
  label: string;
  repayment: string;
  totalInterest: string;
  totalRepaid: string;
  note: string;
}

export type MortgageScenarioFactStatus =
  | "verified_from_official_source"
  | "general_safe_wording_only"
  | "needs_manual_review"
  | "do_not_publish_as_specific_fact";

export interface MortgageScenarioFactReview {
  jurisdiction: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
  sourceName: string;
  sourceUrl: string;
  lastReviewed: string;
  factStatus: MortgageScenarioFactStatus;
  reviewedStatements: string[];
  safeUsageNotes: string;
  blockedSpecificClaims: string[];
}

export interface MortgageScenarioPageConfig {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  directAnswer: string;
  intro: string;
  scenarioType: MortgageScenarioType;
  summary: string[];
  calculatorPreset?: MortgageScenarioPreset;
  exampleRepaymentTable: MortgageScenarioTableRow[];
  keyInsights: string[];
  relatedTools: MortgageScenarioToolLink[];
  internalLinks: MortgageScenarioToolLink[];
  faqs: FaqItem[];
  breadcrumbs: { name: string; path: string }[];
  methodology: string;
  assumptions: string[];
  updatedDate: string;
  reviewedDate: string;
  approvedForIndex?: boolean;
  requiredFactKeys?: string[];
  factReview?: MortgageScenarioFactReview[];
}

export const MORTGAGE_SCENARIO_BASE_PATH = "/mortgage-calculator";

export const MORTGAGE_SCENARIO_QUALITY_RULES = [
  "Every scenario must have a unique H1, meta title, and meta description.",
  "Body copy must be specific to the scenario and cannot duplicate another scenario page.",
  "Content must be useful for Australian mortgage or home-buying decisions.",
  "Each page needs clear internal links to related calculators and supporting guides.",
  "Pages must include real methodology, assumptions, FAQ coverage, and a reviewed date.",
  "Thin pages, generic AI text, or unreviewed finance claims must remain noindex.",
] as const;

export const draftMortgageScenarioDefaults = {
  approvedForIndex: false,
  indexable: false,
  sitemapIncluded: false,
  robots: "noindex, nofollow",
} as const;

export function mortgageScenarioPath(slug: string) {
  return `${MORTGAGE_SCENARIO_BASE_PATH}/${slug.replace(/^\/+|\/+$/g, "")}`;
}

export function normalizeMortgageScenarioConfig(
  config: MortgageScenarioPageConfig,
): Required<Pick<MortgageScenarioPageConfig, "approvedForIndex">> & MortgageScenarioPageConfig {
  return {
    ...config,
    approvedForIndex: config.approvedForIndex === true,
  };
}

export type MortgageScenarioApprovalStatus = "approved_for_index" | "blocked";

export interface MortgageScenarioApprovalDecision {
  slug: string;
  canonical: string;
  approvedForIndex: boolean;
  canIndex: boolean;
  status: MortgageScenarioApprovalStatus;
  robots: "index, follow, max-snippet:-1, max-image-preview:large" | "noindex, nofollow";
  includeInSitemap: boolean;
  qualityStatus: "passed" | "failed";
  missingRequirements: string[];
  manualReviewRequirements: string[];
}

function countBy<T>(items: T[], keyFn: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item).trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function validateMortgageScenarioContentQuality(config: MortgageScenarioPageConfig) {
  const issues: string[] = [];
  if (!config.slug.trim()) issues.push("Missing slug.");
  if (!config.h1.trim()) issues.push("Missing unique H1.");
  if (!config.metaTitle.trim()) issues.push("Missing unique meta title.");
  if (!config.metaDescription.trim()) issues.push("Missing unique meta description.");
  if (config.directAnswer.trim().length < 80) issues.push("Direct answer is too thin.");
  if (config.intro.trim().length < 120) issues.push("Intro is too thin.");
  if (config.summary.length < 2) issues.push("Scenario summary needs at least two points.");
  if (config.exampleRepaymentTable.length < 1) issues.push("Example repayment table is missing.");
  if (config.keyInsights.length < 3) issues.push("Key insights need at least three points.");
  if (config.relatedTools.length < 2) issues.push("Related calculators are too sparse.");
  if (config.faqs.length < 2) issues.push("At least two FAQs are required for FAQ schema.");
  if (!config.methodology.trim()) issues.push("Methodology is required.");
  if (config.assumptions.length < 1) issues.push("Assumptions are required.");
  if (!config.updatedDate) issues.push("Updated date is required.");
  if (!config.reviewedDate) issues.push("Reviewed date is required.");

  return {
    passes: issues.length === 0,
    issues,
  };
}

export function evaluateMortgageScenarioApproval(
  config: MortgageScenarioPageConfig,
  scenarios: MortgageScenarioPageConfig[] = [config],
): MortgageScenarioApprovalDecision {
  const normalized = normalizeMortgageScenarioConfig(config);
  const canonical = mortgageScenarioPath(normalized.slug);
  const quality = validateMortgageScenarioContentQuality(normalized);
  const missingRequirements = [...quality.issues];
  const manualReviewRequirements: string[] = [];

  const slugCounts = countBy(scenarios, (scenario) => scenario.slug);
  const metaTitleCounts = countBy(scenarios, (scenario) => scenario.metaTitle);
  const metaDescriptionCounts = countBy(scenarios, (scenario) => scenario.metaDescription);
  const h1Counts = countBy(scenarios, (scenario) => scenario.h1);
  const canonicalCounts = countBy(scenarios, (scenario) => mortgageScenarioPath(scenario.slug));

  if ((slugCounts.get(normalized.slug.trim().toLowerCase()) ?? 0) > 1) {
    missingRequirements.push("Duplicate slug.");
  }
  if ((metaTitleCounts.get(normalized.metaTitle.trim().toLowerCase()) ?? 0) > 1) {
    missingRequirements.push("Duplicate meta title.");
  }
  if ((metaDescriptionCounts.get(normalized.metaDescription.trim().toLowerCase()) ?? 0) > 1) {
    missingRequirements.push("Duplicate meta description.");
  }
  if ((h1Counts.get(normalized.h1.trim().toLowerCase()) ?? 0) > 1) {
    missingRequirements.push("Duplicate H1.");
  }
  if ((canonicalCounts.get(canonical.trim().toLowerCase()) ?? 0) > 1) {
    missingRequirements.push("Duplicate canonical.");
  }

  for (const factKey of normalized.requiredFactKeys ?? []) {
    const fact = getFact(factKey);
    if (!fact) {
      manualReviewRequirements.push(`Required finance fact ${factKey} is missing.`);
      continue;
    }

    const readiness = classifyFinanceFactReadiness(fact);
    if (readiness === "needs_manual_review" || readiness === "deprecated_do_not_use") {
      manualReviewRequirements.push(`Required finance fact ${factKey} is ${readiness}.`);
    }
  }

  if (!normalized.approvedForIndex) {
    manualReviewRequirements.push("Manual approvedForIndex flag is false.");
  }

  const canIndex =
    normalized.approvedForIndex === true &&
    missingRequirements.length === 0 &&
    manualReviewRequirements.length === 0;

  return {
    slug: normalized.slug,
    canonical,
    approvedForIndex: normalized.approvedForIndex,
    canIndex,
    status: canIndex ? "approved_for_index" : "blocked",
    robots: canIndex
      ? "index, follow, max-snippet:-1, max-image-preview:large"
      : draftMortgageScenarioDefaults.robots,
    includeInSitemap: canIndex,
    qualityStatus: missingRequirements.length === 0 ? "passed" : "failed",
    missingRequirements,
    manualReviewRequirements,
  };
}

export function isMortgageScenarioIndexable(
  config: MortgageScenarioPageConfig,
  scenarios: MortgageScenarioPageConfig[] = [config],
) {
  return evaluateMortgageScenarioApproval(config, scenarios).canIndex;
}

export function shouldIncludeMortgageScenarioInSitemap(
  config: MortgageScenarioPageConfig,
  scenarios: MortgageScenarioPageConfig[] = [config],
) {
  return evaluateMortgageScenarioApproval(config, scenarios).includeInSitemap;
}

export function mortgageScenarioRobots(
  config: MortgageScenarioPageConfig,
  scenarios: MortgageScenarioPageConfig[] = [config],
) {
  return evaluateMortgageScenarioApproval(config, scenarios).robots;
}

export function buildMortgageScenarioReviewReport(
  scenarios: MortgageScenarioPageConfig[] = DRAFT_MORTGAGE_SCENARIOS,
): MortgageScenarioApprovalDecision[] {
  return scenarios.map((scenario) => evaluateMortgageScenarioApproval(scenario, scenarios));
}

export function getMortgageScenarioBySlug(slug: string) {
  return DRAFT_MORTGAGE_SCENARIOS.find((scenario) => scenario.slug === slug);
}

export function getApprovedMortgageScenarioBySlug(slug: string) {
  const scenario = getMortgageScenarioBySlug(slug);
  if (!scenario) return undefined;
  return evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS).canIndex
    ? scenario
    : undefined;
}

export function buildMortgageScenarioFaqSchema(config: MortgageScenarioPageConfig) {
  const mainEntity = config.faqs
    .map((faq) => ({
      "@type": "Question",
      name: faq.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      },
    }))
    .filter((faq) => faq.name && faq.acceptedAnswer.text);

  if (mainEntity.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function buildMortgageScenarioBreadcrumbSchema(config: MortgageScenarioPageConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: config.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://calcy.com.au${item.path}`,
    })),
  };
}

export function validateMortgageScenarioDraft(config: MortgageScenarioPageConfig) {
  const quality = validateMortgageScenarioContentQuality(config);
  const issues = [...quality.issues];
  if (!config.approvedForIndex) issues.push("Draft remains noindex until approvedForIndex is true.");

  return {
    validForDraftPreview: issues.every((issue) => issue === "Draft remains noindex until approvedForIndex is true."),
    issues,
  };
}

export const SAMPLE_DRAFT_MORTGAGE_SCENARIO: MortgageScenarioPageConfig = {
  slug: "extra-repayments-on-660k-mortgage",
  title: "Extra repayments on a $660k mortgage",
  metaTitle: "Extra Repayments on a $660k Mortgage | Draft Scenario | Calcy",
  metaDescription:
    "Draft noindex mortgage scenario template for comparing extra repayments on a $660k Australian home loan.",
  h1: "Extra repayments on a $660k mortgage",
  directAnswer:
    "Extra repayments can reduce total interest and shorten the loan term when they are paid above the scheduled principal-and-interest repayment. This draft scenario shows how Calcy can explain the trade-off using existing calculator outputs only.",
  intro:
    "This draft template is designed for future manually reviewed Australian mortgage scenario pages. It demonstrates the layout, internal linking, schema support, and noindex safety rules before any scenario page is approved for search indexing.",
  scenarioType: "extra_repayments",
  summary: [
    "The scenario starts with a $660,000 home loan and a fortnightly repayment rhythm.",
    "Extra repayment examples must use existing calculator outputs, not invented values.",
    "The page should help users move from repayment estimate to borrowing power, stamp duty, LMI, and refinance checks.",
  ],
  calculatorPreset: {
    loan: 660000,
    rate: 6.39,
    term: 30,
    freq: "fortnightly",
    extra: 500,
  },
  exampleRepaymentTable: [
    {
      label: "Base mortgage scenario",
      repayment: "Use calculator output",
      totalInterest: "Use calculator output",
      totalRepaid: "Use calculator output",
      note: "Figures must be generated by the mortgage calculator before publication.",
    },
    {
      label: "With extra repayments",
      repayment: "Use calculator output",
      totalInterest: "Use calculator output",
      totalRepaid: "Use calculator output",
      note: "Only publish when values are verified against the calculator.",
    },
  ],
  keyInsights: [
    "Extra repayments reduce principal earlier, which may reduce future interest.",
    "The impact depends on rate, term, repayment frequency, and how consistently extra repayments are made.",
    "Users should compare repayment comfort, upfront costs, and borrowing power before relying on one scenario.",
  ],
  relatedTools: [
    {
      to: "/mortgage-calculator",
      label: "Mortgage repayment calculator",
      description: "Model the repayment and total interest for the scenario.",
    },
    {
      to: "/extra-repayments-calculator",
      label: "Extra repayments calculator",
      description: "Estimate extra repayment savings in more detail.",
    },
    {
      to: "/borrowing-power-calculator",
      label: "Borrowing power calculator",
      description: "Check whether the loan size is realistic for income and expenses.",
    },
  ],
  internalLinks: [
    {
      to: "/stamp-duty-calculator",
      label: "Stamp duty calculator",
      description: "Estimate upfront purchase costs.",
    },
    {
      to: "/lmi-calculator",
      label: "LMI calculator",
      description: "Check whether a low deposit may add LMI.",
    },
  ],
  faqs: [
    {
      question: "Can extra repayments reduce mortgage interest?",
      answer:
        "Yes. Extra repayments can reduce the loan balance earlier, which may reduce the interest charged over the remaining term. The exact saving depends on the loan inputs.",
    },
    {
      question: "Should this scenario be indexed by Google?",
      answer:
        "No. Draft mortgage scenario pages remain noindex and excluded from sitemap until manually reviewed and explicitly approved for indexing.",
    },
  ],
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Mortgage calculator", path: "/mortgage-calculator" },
    { name: "Extra repayments on a $660k mortgage", path: "/mortgage-calculator/extra-repayments-on-660k-mortgage" },
  ],
  methodology:
    "Scenario pages must explain that repayment examples are produced from Calcy calculator outputs and are general information only.",
  assumptions: [
    "Public finance assumptions are not replaced from the finance facts registry in this phase.",
    "No scenario page should claim verified finance facts until manual review is complete.",
    "Calculator formulas remain the source for repayment and interest outputs.",
  ],
  updatedDate: "2026-05-22",
  reviewedDate: "2026-05-22",
  approvedForIndex: false,
};

export const DRAFT_MORTGAGE_SCENARIOS: MortgageScenarioPageConfig[] = [
  {
    slug: "with-offset",
    title: "Mortgage calculator with offset",
    metaTitle: "Mortgage Calculator with Offset Account Australia | Calcy",
    metaDescription:
      "Learn how an offset account may affect Australian mortgage interest, repayment planning, and loan payoff timing using Calcy's mortgage calculator.",
    h1: "Mortgage calculator with offset",
    directAnswer:
      "An offset account may reduce the interest charged on a mortgage because money in the offset is typically counted against the loan balance for interest calculation. The scheduled repayment may stay similar, but more of each repayment can go toward principal when less interest is charged.",
    intro:
      "This scenario is for Australian borrowers who want to understand the planning role of an offset account before comparing loan features. It explains the decision in plain English and keeps repayment examples tied to calculator output rather than unreviewed assumptions.",
    scenarioType: "offset",
    summary: [
      "Use this scenario to compare a normal principal-and-interest repayment with an offset setup.",
      "Offset benefits depend on the offset balance, contribution pattern, interest rate, term, and lender product rules.",
      "The page should help users move from repayment modelling to loan comparison, refinance checks, and deposit planning.",
    ],
    calculatorPreset: {
      loan: 660000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
      offsetStart: 50000,
      offsetMonthly: 500,
    },
    exampleRepaymentTable: [
      {
        label: "Without offset",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Baseline repayment scenario before offset modelling.",
      },
      {
        label: "With offset balance",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Offset impact must come from the existing offset calculator output.",
      },
    ],
    keyInsights: [
      "Offset accounts can be useful when borrowers keep savings in the linked account consistently.",
      "The repayment amount may not fall, but interest savings can change how quickly principal reduces.",
      "A loan with offset should still be compared against fees, rate differences, and redraw needs.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Model offset inputs against the standard mortgage repayment estimate.",
      },
      {
        to: "/loan-comparison-calculator",
        label: "Loan comparison calculator",
        description: "Compare an offset loan with another loan structure.",
      },
      {
        to: "/refinance-calculator",
        label: "Refinance calculator",
        description: "Check whether moving to a loan with different features may be worthwhile.",
      },
    ],
    internalLinks: [
      {
        to: "/extra-repayments-calculator",
        label: "Extra repayments calculator",
        description: "Compare offset planning with paying extra directly into the loan.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Estimate whether the target loan size is realistic before comparing features.",
      },
    ],
    faqs: [
      {
        question: "Does an offset account lower my mortgage repayment?",
        answer:
          "An offset account usually reduces interest charged rather than automatically lowering the scheduled repayment. The exact effect depends on lender rules and the loan setup.",
      },
      {
        question: "Is this offset scenario ready for indexing?",
        answer:
          "Yes. This page has passed Calcy's manual scenario review gate, uses general educational copy, and avoids unverified finance facts.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator with offset", path: "/mortgage-calculator/with-offset" },
    ],
    methodology:
      "Offset scenario examples must be generated from the existing mortgage calculator and offset model. This page describes the result without replacing calculator formulas.",
    assumptions: [
      "Offset effects depend on product rules, fees, balance timing, and lender treatment.",
      "No unreviewed finance registry facts are used as verified claims on this page.",
      "This page is general information only and does not recommend a specific loan product.",
    ],
    updatedDate: "2026-05-22",
    reviewedDate: "2026-05-22",
    approvedForIndex: true,
  },
  {
    slug: "extra-repayments",
    title: "Mortgage calculator with extra repayments",
    metaTitle: "Mortgage Calculator with Extra Repayments Australia | Calcy",
    metaDescription:
      "Learn how extra repayments may reduce Australian mortgage interest and loan term using Calcy's mortgage calculator and repayment planning tools.",
    h1: "Mortgage calculator with extra repayments",
    directAnswer:
      "Extra repayments may reduce mortgage interest because they lower the loan balance earlier than scheduled. When the principal falls sooner, future interest can be charged on a smaller balance, which may shorten the loan term if the repayment pattern continues.",
    intro:
      "This scenario helps Australian borrowers compare a base mortgage repayment with a version that includes additional repayments. It is designed for practical planning only and keeps all repayment figures dependent on existing calculator outputs.",
    scenarioType: "extra_repayments",
    summary: [
      "Use this scenario to compare scheduled repayments with additional monthly repayments.",
      "The value of extra repayments depends on amount, timing, rate, loan term, and whether the loan allows extra payments.",
      "The scenario should help users understand interest savings without implying personal financial advice.",
    ],
    calculatorPreset: {
      loan: 660000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
      extra: 500,
    },
    exampleRepaymentTable: [
      {
        label: "Scheduled repayments only",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Base result generated by the mortgage calculator.",
      },
      {
        label: "With extra repayments",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Savings must be calculated from the existing extra repayment input.",
      },
    ],
    keyInsights: [
      "Extra repayments tend to have the most impact when made early and consistently.",
      "Some fixed-rate loans may limit extra repayments, so product rules still matter.",
      "A borrower should compare extra repayments with offset flexibility and emergency savings needs.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Model extra repayment inputs in the main mortgage calculator.",
      },
      {
        to: "/extra-repayments-calculator",
        label: "Extra repayments calculator",
        description: "Review extra repayment savings with a dedicated calculator.",
      },
      {
        to: "/loan-comparison-calculator",
        label: "Loan comparison calculator",
        description: "Compare loans before deciding whether a lower rate or extra repayments matter more.",
      },
    ],
    internalLinks: [
      {
        to: "/refinance-calculator",
        label: "Refinance calculator",
        description: "Check whether refinancing could change the repayment and interest picture.",
      },
      {
        to: "/rent-vs-buy-calculator",
        label: "Rent vs buy calculator",
        description: "Compare buying costs with renting before committing extra cash to repayments.",
      },
    ],
    faqs: [
      {
        question: "Can extra repayments shorten a home loan?",
        answer:
          "They can, if the extra amount reduces principal and the borrower keeps paying above the scheduled repayment. The exact result depends on the loan inputs.",
      },
      {
        question: "Are extra repayment figures guaranteed?",
        answer:
          "No. Extra repayment estimates are planning outputs only. Actual lender treatment can vary by product rules, repayment limits, fees, and rounding.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator with extra repayments", path: "/mortgage-calculator/extra-repayments" },
    ],
    methodology:
      "Extra repayment scenarios should use the mortgage calculator's existing extra repayment input and compare the result with a base case.",
    assumptions: [
      "No claim is made about fixed-rate repayment limits or lender policy without review.",
      "Results are planning estimates and not personal financial advice.",
      "Calculator formulas are not changed by this scenario page.",
    ],
    updatedDate: "2026-05-22",
    reviewedDate: "2026-05-22",
    approvedForIndex: true,
  },
  {
    slug: "first-home-buyer",
    title: "First home buyer mortgage calculator",
    metaTitle: "First Home Buyer Mortgage Calculator Australia | Calcy",
    metaDescription:
      "Plan first home buyer repayments, deposit, stamp duty awareness, LMI risk, borrowing power, and upfront costs with general-safe Australian guidance.",
    h1: "First home buyer mortgage calculator",
    directAnswer:
      "A first home buyer mortgage scenario should connect repayments with deposit size, stamp duty awareness, LMI risk, borrowing power, and upfront purchase costs. The repayment alone is not enough to decide affordability because settlement costs can change how much cash is available for deposit and how much needs to be borrowed.",
    intro:
      "This page is designed for Australian first home buyers who need a structured way to move from a repayment estimate to a fuller home-buying budget. It keeps grants, concessions, and state-based stamp duty rules general unless verified, and points users toward tools that help estimate upfront costs before choosing a loan size.",
    scenarioType: "first_home_buyer",
    summary: [
      "Start with a realistic property budget, deposit, loan amount, rate, term, and repayment frequency.",
      "Check upfront costs before treating the repayment as affordable because stamp duty, conveyancing, inspections, moving costs, and lender fees can reduce cash available for deposit.",
      "Deposit size can influence whether LMI applies, how much needs to be borrowed, and whether the repayment still feels manageable.",
      "First home buyer grants, concessions, and stamp duty relief vary by state and should be checked against the relevant state revenue office before relying on a budget.",
    ],
    calculatorPreset: {
      loan: 600000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
    },
    exampleRepaymentTable: [
      {
        label: "Repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Start with the mortgage calculator output for the target loan amount.",
      },
      {
        label: "After deposit and upfront-cost review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Loan amount may need to change after checking stamp duty, LMI, savings buffer, and other purchase costs.",
      },
      {
        label: "Borrowing power cross-check",
        repayment: "Use borrowing power output",
        totalInterest: "Not applicable",
        totalRepaid: "Not applicable",
        note: "Check whether the target loan size is plausible for income, expenses, and commitments.",
      },
    ],
    keyInsights: [
      "First home buyers should check repayments and cash required at settlement together, not as separate decisions.",
      "A smaller deposit may increase the loan amount or trigger LMI depending on lender rules, loan-to-value ratio, and property price.",
      "Borrowing power can be lower than a repayment estimate suggests once living expenses, other debts, HECS, dependants, and serviceability buffers are considered.",
      "Rules vary by state, and eligibility for grants or concessions can depend on property value, home type, residency, occupancy, and buyer circumstances.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate repayments for a first home buyer loan amount before checking upfront costs.",
      },
      {
        to: "/stamp-duty-calculator",
        label: "Stamp duty calculator",
        description: "Estimate stamp duty and review state-based first home buyer rules before relying on specific claims.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Check whether a smaller deposit may create LMI exposure.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Cross-check whether the target loan amount is realistic for income, expenses, and commitments.",
      },
    ],
    internalLinks: [
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Estimate whether the target loan size fits income and expenses.",
      },
      {
        to: "/first-home-buyer-grant-nsw",
        label: "First home buyer grant guide",
        description: "Use state-specific first home buyer guides as supporting review material before relying on exact rules.",
      },
      {
        to: "/extra-repayments-calculator",
        label: "Extra repayments calculator",
        description: "Plan future repayment flexibility after the first home buyer budget is comfortable.",
      },
      {
        to: "/rent-vs-buy-calculator",
        label: "Rent vs buy calculator",
        description: "Compare buying with continuing to rent over a longer horizon.",
      },
    ],
    faqs: [
      {
        question: "What should first home buyers check after repayments?",
        answer:
          "They should check deposit, stamp duty, LMI, conveyancing, inspections, moving costs, borrowing power, and a savings buffer before relying on a repayment estimate.",
      },
      {
        question: "How should first home buyer grants and concessions be handled?",
        answer:
          "Rules vary by state, and eligibility can depend on property value, home type, buyer circumstances, and occupancy rules. This page does not publish exact grant or concession values as verified facts; check your state revenue office before relying on them.",
      },
      {
        question: "Can a first home buyer use repayments alone to set a budget?",
        answer:
          "No. A repayment estimate is only one part of the buying decision. First home buyers should also check upfront costs, deposit size, LMI exposure, borrowing power, and state-specific rules.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "First home buyer mortgage calculator", path: "/mortgage-calculator/first-home-buyer" },
    ],
    methodology:
      "First home buyer scenarios combine mortgage calculator outputs with stamp duty, LMI, borrowing power, and upfront-cost checks. This page avoids hard-coding grants, concessions, or stamp duty thresholds unless a specific state fact is separately reviewed and approved.",
    assumptions: [
      "No state grant, concession, or stamp duty threshold is published as a verified specific value on this page.",
      "Rules vary by state, and eligibility can depend on property value, home type, occupancy, citizenship or residency, and buyer circumstances.",
      "Users should check their relevant state revenue office before relying on grant, concession, or stamp duty treatment.",
      "Use Calcy's stamp duty calculator to estimate upfront costs, then manually verify official rules before relying on grants or concessions.",
      "The mortgage repayment formula remains unchanged.",
    ],
    factReview: [
      {
        jurisdiction: "NSW",
        sourceName: "Revenue NSW - First Home Buyers Assistance scheme",
        sourceUrl: "https://www.revenue.nsw.gov.au/grants-schemes/first-home-buyer/assistance-scheme",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official NSW source confirms first home buyer transfer duty assistance exists and eligibility depends on scheme rules.",
          "Specific NSW thresholds and concession values are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: NSW rules vary by property value, property type, buyer history, residency and occupancy requirements.",
        blockedSpecificClaims: [
          "Do not publish NSW exemption thresholds, concession thresholds, land thresholds, or grant amounts until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "VIC",
        sourceName: "State Revenue Office Victoria - First home buyer duty exemption or concession",
        sourceUrl: "https://www.sro.vic.gov.au/first-home-owner/exemption-concession-reduction",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official Victorian source confirms first home buyer duty exemption or concession may apply when criteria are met.",
          "Specific Victorian thresholds and grant amounts are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: Victorian eligibility can depend on property value, buyer status, principal place of residence requirements and SRO criteria.",
        blockedSpecificClaims: [
          "Do not publish VIC exemption values, concession bands, duty reductions, or FHOG values until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "QLD",
        sourceName: "Queensland Government - Home buyers financial help",
        sourceUrl: "https://www.qld.gov.au/housing/buying-owning-home/home-buyers-financial-help/compare-home-buyer-help",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official Queensland source confirms multiple first home buyer grants, concessions and duty options may exist.",
          "Specific Queensland grant amounts, concession caps and transfer duty treatment are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: Queensland grant and duty treatment can vary by new or established home, vacant land, occupancy and buyer eligibility.",
        blockedSpecificClaims: [
          "Do not publish QLD grant values, new-home concession claims, vacant land concession claims, or established-home concession caps until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "WA",
        sourceName: "Government of Western Australia - First Home Owner Rate of Duty fact sheet",
        sourceUrl: "https://www.wa.gov.au/government/publications/duties-fact-sheet-first-home-owner-rate",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official WA source confirms a first home owner rate of duty may apply when criteria are met.",
          "Specific WA duty thresholds and grant values are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: WA rules can depend on property value, transaction date, buyer eligibility and whether the home is new, established or vacant land.",
        blockedSpecificClaims: [
          "Do not publish WA dutiable value thresholds, concessional rates, grant caps, or regional cap rules until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "SA",
        sourceName: "RevenueSA - First Home Buyer",
        sourceUrl: "https://www.revenuesa.sa.gov.au/grants-and-concessions/first-home-owners",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official SA source confirms first home buyer grant and stamp duty relief information is available from RevenueSA.",
          "Specific SA relief, property type and grant values are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: South Australian relief can depend on property type, contract date, principal place of residence and RevenueSA eligibility criteria.",
        blockedSpecificClaims: [
          "Do not publish SA relief percentages, date-based caps, property-type rules, or FHOG amounts until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "TAS",
        sourceName: "State Revenue Office Tasmania - First Home Buyers",
        sourceUrl: "https://www.sro.tas.gov.au/first-home-owner",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official Tasmania source confirms first home buyer incentives and duty relief information is available from the State Revenue Office.",
          "Specific Tasmania concession, date window and threshold values are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: Tasmanian treatment can depend on established or new home status, settlement date, property value and eligibility criteria.",
        blockedSpecificClaims: [
          "Do not publish TAS discount percentages, value caps, settlement windows, or FHOG amounts until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "ACT",
        sourceName: "ACT Revenue Office - Home Buyer Concession Scheme",
        sourceUrl: "https://www.revenue.act.gov.au/home-buyer-assistance/home-buyer-concession-scheme",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official ACT source confirms the Home Buyer Concession Scheme is the relevant conveyance duty assistance pathway.",
          "Specific ACT income, property and duty settings are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: ACT concession eligibility can depend on income, property, buyer circumstances and ACT Revenue Office rules.",
        blockedSpecificClaims: [
          "Do not publish ACT income thresholds, duty concession values, property tests, or FHOG status claims until separate official fact-value review.",
        ],
      },
      {
        jurisdiction: "NT",
        sourceName: "Northern Territory Government - Buying or building a new home",
        sourceUrl: "https://nt.gov.au/property/home-owner-assistance/buy-build-new-home",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official NT source confirms HomeGrown Territory and first home owner grant information is available through NT Government channels.",
          "Specific NT grant amounts, dates and duty treatment are not published as verified values on this page.",
        ],
        safeUsageNotes:
          "Use only general wording: NT assistance can depend on transaction date, new or established home status, occupancy and Territory Revenue Office eligibility rules.",
        blockedSpecificClaims: [
          "Do not publish NT grant amounts, scheme dates, discount values, or duty concession claims until separate official fact-value review.",
        ],
      },
    ],
    updatedDate: "2026-05-22",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "with-hecs",
    title: "Mortgage calculator with HECS",
    metaTitle: "Mortgage Calculator with HECS Australia | Calcy",
    metaDescription:
      "Understand how HECS or HELP debt may affect borrowing power conversations while keeping mortgage repayment estimates separate.",
    h1: "Mortgage calculator with HECS",
    directAnswer:
      "HECS or HELP debt may affect mortgage planning because lenders can treat compulsory repayments as an ongoing commitment when assessing borrowing power. The mortgage repayment itself is still based on loan amount, rate, term, and repayment frequency, so HECS should be reviewed as part of serviceability rather than added into the repayment formula.",
    intro:
      "This scenario separates two decisions that are often confused: calculating the repayment on a chosen loan amount, and discussing borrowing power when HECS or HELP repayments are part of the applicant's financial position. It keeps threshold wording general and directs users to confirm current thresholds with the ATO.",
    scenarioType: "hecs_impact",
    summary: [
      "Use the mortgage calculator to estimate repayments on the selected loan amount.",
      "Use the HECS borrowing power calculator to explore how compulsory repayments may affect serviceability.",
      "Avoid treating HECS as a direct mortgage formula input unless a specific calculator supports that output.",
      "HECS/HELP repayment thresholds can change each financial year, so users should confirm current thresholds with the ATO before relying on exact values.",
    ],
    calculatorPreset: {
      loan: 650000,
      rate: 6.39,
      term: 30,
      freq: "monthly",
    },
    exampleRepaymentTable: [
      {
        label: "Mortgage repayment only",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Mortgage repayment based on loan inputs only.",
      },
      {
        label: "Borrowing power conversation",
        repayment: "Use HECS tool output",
        totalInterest: "Not applicable",
        totalRepaid: "Not applicable",
        note: "HECS impact belongs in serviceability planning, not the repayment formula.",
      },
      {
        label: "Budget cross-check",
        repayment: "Use borrowing power output",
        totalInterest: "Not applicable",
        totalRepaid: "Not applicable",
        note: "Compare mortgage comfort with borrowing capacity before increasing the target loan amount.",
      },
    ],
    keyInsights: [
      "HECS does not change the amortisation formula for a selected loan amount.",
      "HECS can still matter when a lender assesses available income, compulsory repayments, and ongoing commitments.",
      "Lenders may assess HECS or HELP differently, so borrowing capacity estimates should be treated as planning guidance rather than approval certainty.",
      "Users should compare mortgage repayment comfort with borrowing power estimates before setting a budget.",
      "First home buyers with HECS should also check upfront costs, LMI exposure, and stamp duty estimates before deciding how much to borrow.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate repayments for the chosen loan amount.",
      },
      {
        to: "/hecs-borrowing-power",
        label: "HECS and borrowing power calculator",
        description: "Use Calcy's HECS and borrowing power calculator as an estimate before confirming current thresholds with the ATO.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Estimate overall borrowing capacity using income and expenses.",
      },
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review deposit, upfront costs, LMI, and state-rule awareness alongside HECS planning.",
      },
    ],
    internalLinks: [
      {
        to: "/stamp-duty-calculator",
        label: "Stamp duty calculator",
        description: "Check upfront costs after setting a loan budget.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Review low-deposit cost exposure alongside borrowing power.",
      },
      {
        to: "/extra-repayments-calculator",
        label: "Extra repayments calculator",
        description: "Plan repayment flexibility after checking borrowing power and HECS commitments.",
      },
    ],
    faqs: [
      {
        question: "Does HECS change the mortgage repayment formula?",
        answer:
          "No. A repayment estimate is based on loan amount, interest rate, term, and frequency. HECS is more relevant to borrowing power and serviceability discussions.",
      },
      {
        question: "Should HECS thresholds be treated as verified here?",
        answer:
          "No. HECS/HELP repayment thresholds can change each financial year, so this page does not publish exact threshold or repayment-rate values as verified facts. Confirm current thresholds with the ATO.",
      },
      {
        question: "Why compare the HECS calculator with the borrowing power calculator?",
        answer:
          "The mortgage calculator estimates repayments on a chosen loan amount, while the HECS and borrowing power tools help estimate whether that loan size may be realistic once income, expenses, debts, and compulsory repayments are considered.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator with HECS", path: "/mortgage-calculator/with-hecs" },
    ],
    methodology:
      "This scenario keeps repayment calculations separate from HECS serviceability analysis. Repayments come from the mortgage calculator, while HECS-related borrowing capacity checks should be reviewed through the dedicated HECS and borrowing power tools.",
    assumptions: [
      "No exact HECS threshold or repayment-rate value is published as verified on this page.",
      "HECS/HELP repayment thresholds can change each financial year, so users should confirm current thresholds with the ATO.",
      "Lenders may assess HECS or HELP differently, and this page does not predict lender approval.",
      "Mortgage repayment outputs continue to come from the mortgage calculator.",
      "Borrowing power varies by lender policy and individual circumstances.",
      "General information only, not financial advice.",
    ],
    factReview: [
      {
        jurisdiction: "AU",
        sourceName: "Australian Taxation Office - Study and training loan repayment thresholds and rates",
        sourceUrl:
          "https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds",
        lastReviewed: "2026-05-23",
        factStatus: "general_safe_wording_only",
        reviewedStatements: [
          "Official ATO source publishes study and training loan repayment thresholds and rates.",
          "Specific HECS/HELP thresholds and repayment rates are not published as verified values on this scenario.",
        ],
        safeUsageNotes:
          "Use only general wording: HECS/HELP repayment thresholds can change each financial year, and users should confirm current thresholds with the ATO.",
        blockedSpecificClaims: [
          "Do not publish exact HECS/HELP repayment thresholds, repayment rates, income bands, or annual threshold values until separate official fact-value review.",
        ],
      },
    ],
    updatedDate: "2026-05-22",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "700k-mortgage-repayments",
    title: "$700k mortgage repayments",
    metaTitle: "$700k Mortgage Repayments Australia | Calcy",
    metaDescription:
      "Estimate $700k mortgage repayments in Australia and review rate, term, frequency, deposit, LMI, stamp duty, and borrowing power factors.",
    h1: "$700k mortgage repayments",
    directAnswer:
      "A $700,000 mortgage repayment estimate depends on the interest rate, loan term, repayment frequency, loan type, fees, and any extra repayments or offset balance. The same loan amount can feel very different once deposit size, LVR, LMI, stamp duty, upfront costs, and borrowing power are reviewed.",
    intro:
      "This scenario is a manually curated loan-amount page for users who search by mortgage size. It explains the planning steps around a $700k loan without presenting a single fixed repayment as the answer. Users should test their own interest rate, term, repayment frequency, offset balance, and extra repayment assumptions in the mortgage calculator.",
    scenarioType: "upfront_costs",
    summary: [
      "Start with a $700,000 loan amount, then test interest rate, loan term, repayment frequency, loan type, and fees.",
      "Compare weekly, fortnightly, and monthly repayment views so the estimate matches how income and bills are managed.",
      "Review total interest and total repaid before deciding whether the repayment feels manageable.",
      "Check deposit size, LVR, LMI, stamp duty, borrowing power, and upfront costs before treating the scenario as affordable.",
      "Use extra repayment and offset scenarios to understand how repayment strategy may change total interest over time.",
    ],
    calculatorPreset: {
      loan: 700000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
    },
    exampleRepaymentTable: [
      {
        label: "$700k base repayment",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Example only. Base result for a $700,000 loan before extra repayments or offset, using the user's selected rate, term, and frequency.",
      },
      {
        label: "$700k with planning adjustments",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Use calculator-supported inputs only, such as extra repayments or offset.",
      },
      {
        label: "Upfront-cost cross-check",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Review stamp duty, deposit, LVR, LMI, and cash buffer before treating the repayment as affordable.",
      },
    ],
    keyInsights: [
      "Repayments depend on interest rate, loan term, repayment frequency, lender fees, and loan type.",
      "A $700k loan should be assessed with upfront costs and borrowing power, not repayment alone.",
      "A longer loan term can reduce the scheduled repayment but may increase total interest over the life of the loan.",
      "A smaller deposit can increase LVR and may create LMI exposure depending on lender rules.",
      "Extra repayments and offset balances may reduce interest, but the effect depends on consistent use and product rules.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Model a $700,000 loan with your own rate, term, repayment frequency, and fees.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Check whether a $700k loan is plausible for income and expenses.",
      },
      {
        to: "/stamp-duty-calculator",
        label: "Stamp duty calculator",
        description: "Estimate upfront purchase costs alongside the loan amount.",
      },
      {
        to: "/mortgage-calculator/extra-repayments",
        label: "Extra repayments scenario",
        description: "Review how extra repayments may change interest and payoff timing.",
      },
    ],
    internalLinks: [
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Check whether deposit size could create LMI exposure.",
      },
      {
        to: "/mortgage-calculator/with-offset",
        label: "Offset mortgage scenario",
        description: "Review how an offset balance may affect interest on a larger mortgage.",
      },
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Connect repayments with deposit planning, upfront costs, LMI, and buying readiness.",
      },
      {
        to: "/mortgage-calculator/with-hecs",
        label: "Mortgage with HECS scenario",
        description: "Check how HECS or HELP may affect borrowing-power conversations for a larger loan.",
      },
    ],
    faqs: [
      {
        question: "How do I estimate repayments on a $700k mortgage?",
        answer:
          "Use the mortgage calculator with the loan amount, interest rate, term, repayment frequency, loan type, and any extra repayment or offset assumptions. Example figures are estimates only and your actual repayment can differ based on lender, loan type, fees, and rounding.",
      },
      {
        question: "Is a $700k mortgage affordable?",
        answer:
          "Affordability depends on income, expenses, deposit, rate, other debts, LVR, LMI exposure, upfront costs, and lender policy. Use borrowing power and upfront cost tools for broader planning before relying on the repayment estimate.",
      },
      {
        question: "Why do weekly, fortnightly, and monthly repayments look different?",
        answer:
          "Different repayment frequencies can make budgeting feel easier or harder, but users should compare the annual payment pattern and total interest estimate rather than focusing only on the smallest per-period number.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "$700k mortgage repayments", path: "/mortgage-calculator/700k-mortgage-repayments" },
    ],
    methodology:
      "Loan-amount scenarios must use calculator-generated repayment outputs and should present the loan amount as a planning example rather than advice. Example figures are estimates only and should be recalculated with the user's own rate, term, repayment frequency, offset, extra repayment, and fee assumptions.",
    assumptions: [
      "No repayment figure is hard-coded as final or certain on this page.",
      "Repayments depend on interest rate, loan term, repayment frequency, lender fees, and loan type.",
      "Your actual repayment can differ based on lender, loan type, fees, repayment timing, and rounding.",
      "Users need to review upfront costs, deposit size, LVR, LMI, borrowing power, and lender rules.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-22",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "qld",
    title: "Mortgage calculator QLD",
    metaTitle: "Mortgage Calculator QLD | Calcy",
    metaDescription:
      "Estimate Queensland mortgage repayments and review stamp duty awareness, LMI, borrowing power, and upfront costs with general-safe planning guidance.",
    h1: "Mortgage calculator QLD",
    directAnswer:
      "A Queensland mortgage repayment estimate depends on the loan amount, interest rate, loan term, repayment frequency, deposit size, loan type, and fees. Buyers should connect the repayment with stamp duty awareness, LMI risk, borrowing power, and upfront-cost planning before treating a Queensland property budget as affordable.",
    intro:
      "This Queensland mortgage scenario is for buyers who want a state-aware planning path without publishing exact duty, grant, or concession values. It keeps Queensland stamp duty and first home buyer rules general, points users to calculators for estimates, and directs specific rule checks to official Queensland sources.",
    scenarioType: "upfront_costs",
    summary: [
      "Start with the expected Queensland property budget, deposit, loan amount, interest rate, term, and repayment frequency.",
      "Use repayment results with stamp duty, transfer costs, LMI, inspections, conveyancing, and moving-cost awareness.",
      "Rules and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Use Calcy's calculators for estimates, then confirm official Queensland rules before relying on any specific amount.",
    ],
    calculatorPreset: {
      loan: 650000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
    },
    exampleRepaymentTable: [
      {
        label: "Queensland repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Repayment estimate depends on the selected rate, term, loan amount, and frequency.",
      },
      {
        label: "Upfront-cost review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Review Queensland stamp duty, deposit, LMI, and cash buffer before finalising loan size.",
      },
    ],
    keyInsights: [
      "Queensland buyers should compare repayment comfort with upfront costs and borrowing power.",
      "Stamp duty and first home buyer rules vary by state and should be checked against official Queensland sources.",
      "Deposit size can affect LVR, LMI exposure, and how much needs to be borrowed.",
      "Repayment estimates are planning outputs only and are not lender quotes or approval guidance.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate repayments using your Queensland loan amount, rate, term, and frequency.",
      },
      {
        to: "/stamp-duty-calculator/qld",
        label: "Queensland stamp duty calculator",
        description: "Estimate Queensland transfer duty and upfront costs without relying on hard-coded claims.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Check whether the target loan size fits income, expenses, and commitments.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Review whether deposit size could create LMI exposure.",
      },
    ],
    internalLinks: [
      {
        to: "/mortgage-calculator/700k-mortgage-repayments",
        label: "$700k mortgage repayments",
        description: "Compare a loan-size scenario with Queensland planning checks.",
      },
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review first home buyer planning language before relying on grants or concessions.",
      },
    ],
    faqs: [
      {
        question: "How should Queensland buyers use a mortgage calculator?",
        answer:
          "Use the calculator to estimate repayments, then compare the result with Queensland stamp duty estimates, deposit size, LMI risk, borrowing power, and a settlement cash buffer.",
      },
      {
        question: "Are Queensland stamp duty or grant values verified on this page?",
        answer:
          "No. This page uses general-safe wording only. Rules vary by state, and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      },
      {
        question: "What should be checked before publishing a QLD mortgage scenario?",
        answer:
          "The page should be manually reviewed for unique content, official-source accuracy, calculator links, assumptions, FAQ quality, and no exact duty or grant claims unless separately verified.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator QLD", path: "/mortgage-calculator/qld" },
    ],
    methodology:
      "This Queensland scenario uses the mortgage calculator for repayment outputs and connects the result to state-aware upfront-cost checks. It avoids publishing exact Queensland duty, grant, or concession values until official fact review is complete.",
    assumptions: [
      "No Queensland stamp duty, grant, concession, or exemption value is published as verified on this page.",
      "Rules vary by state and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Use Calcy's stamp duty calculator as an estimate and confirm official Queensland rules before relying on specific treatment.",
      "Mortgage repayment formulas and public finance assumptions are unchanged.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-23",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "nsw",
    title: "Mortgage calculator NSW",
    metaTitle: "Mortgage Calculator NSW | Calcy",
    metaDescription:
      "Estimate NSW mortgage repayments and review stamp duty awareness, borrowing power, LMI, and upfront costs with general-safe planning guidance.",
    h1: "Mortgage calculator NSW",
    directAnswer:
      "A NSW mortgage repayment estimate depends on the loan amount, interest rate, loan term, repayment frequency, deposit size, loan type, and lender fees. NSW buyers should review repayments alongside stamp duty estimates, borrowing power, LMI exposure, and settlement cash needs before deciding a purchase budget.",
    intro:
      "This NSW mortgage scenario is designed for buyers who need a practical repayment-planning page without publishing exact duty, grant, or concession values. It uses general-safe state wording and links users to calculators instead of treating unreviewed thresholds as verified.",
    scenarioType: "upfront_costs",
    summary: [
      "Start with a NSW property price target, deposit, loan amount, rate, term, and repayment frequency.",
      "Compare the repayment with stamp duty estimates, conveyancing, inspections, LMI, and savings buffer needs.",
      "First home buyer eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Use calculators for estimates and check official NSW sources before relying on state-specific treatment.",
    ],
    calculatorPreset: {
      loan: 750000,
      rate: 6.39,
      term: 30,
      freq: "monthly",
    },
    exampleRepaymentTable: [
      {
        label: "NSW repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Repayment estimate must come from calculator inputs, not static copy.",
      },
      {
        label: "NSW upfront-cost review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Review stamp duty, LMI, deposit, and settlement costs before treating the loan as affordable.",
      },
    ],
    keyInsights: [
      "NSW buyers should connect repayment estimates with upfront costs and borrowing capacity.",
      "A higher deposit can reduce loan size and may affect LMI exposure.",
      "Stamp duty and first home buyer treatment should remain general until official facts are manually reviewed.",
      "A repayment that looks manageable may still be unrealistic if cash required at settlement is too high.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate NSW home loan repayments using your own rate, term, and frequency.",
      },
      {
        to: "/stamp-duty-calculator/nsw",
        label: "NSW stamp duty calculator",
        description: "Estimate NSW transfer duty and upfront costs before finalising loan size.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Check whether the target NSW loan size fits income and expenses.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Estimate whether deposit size may create LMI exposure.",
      },
    ],
    internalLinks: [
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review general-safe first home buyer planning before relying on exact state rules.",
      },
      {
        to: "/mortgage-calculator/with-hecs",
        label: "Mortgage with HECS scenario",
        description: "Check how HECS or HELP may affect borrowing power conversations.",
      },
    ],
    faqs: [
      {
        question: "What should NSW buyers check after estimating repayments?",
        answer:
          "They should check stamp duty estimates, deposit size, LMI risk, borrowing power, conveyancing, inspections, and a cash buffer before relying on the repayment estimate.",
      },
      {
        question: "Does this page verify NSW stamp duty or first home buyer thresholds?",
        answer:
          "No. This page uses general-safe wording only and does not publish exact NSW grant, concession, exemption, or duty values as verified facts.",
      },
      {
        question: "Why is borrowing power important for NSW buyers?",
        answer:
          "Borrowing power can be lower than a repayment estimate suggests once income, expenses, debts, dependants, and lender serviceability rules are considered.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator NSW", path: "/mortgage-calculator/nsw" },
    ],
    methodology:
      "This NSW scenario uses calculator-generated repayment outputs and links to NSW upfront-cost tools. Exact NSW stamp duty, grant, concession, or exemption values remain unpublished until official fact review is complete.",
    assumptions: [
      "No NSW stamp duty, grant, concession, or exemption value is published as verified on this page.",
      "Rules vary by state and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Use Calcy's stamp duty calculator as an estimate and confirm official NSW rules before relying on specific treatment.",
      "Mortgage repayment formulas and public finance assumptions are unchanged.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-23",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "vic",
    title: "Mortgage calculator VIC",
    metaTitle: "Mortgage Calculator VIC | Calcy",
    metaDescription:
      "Estimate Victorian mortgage repayments and review stamp duty awareness, borrowing power, LMI, and first-home buyer considerations with general-safe guidance.",
    h1: "Mortgage calculator VIC",
    directAnswer:
      "A Victorian mortgage repayment estimate depends on loan amount, interest rate, term, repayment frequency, deposit size, loan type, and fees. Buyers should connect the repayment with Victorian stamp duty awareness, borrowing power, LMI, upfront costs, and first-home buyer considerations before deciding on a purchase budget.",
    intro:
      "This Victorian mortgage scenario helps buyers move from a repayment estimate to a fuller affordability check. It uses general-safe wording for Victorian stamp duty and first-home buyer considerations, and avoids publishing exact state thresholds or grant values as verified facts.",
    scenarioType: "first_home_buyer",
    summary: [
      "Start with a Victorian property budget, deposit, loan amount, rate, term, and repayment frequency.",
      "Review repayment comfort alongside stamp duty estimates, LMI, borrowing power, and settlement costs.",
      "First-home buyer treatment can depend on property value, buyer history, occupancy, and official state criteria.",
      "Use calculator estimates for planning and confirm official Victorian rules before relying on specific amounts.",
    ],
    calculatorPreset: {
      loan: 700000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
    },
    exampleRepaymentTable: [
      {
        label: "Victoria repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Use the mortgage calculator for repayment values based on selected loan inputs.",
      },
      {
        label: "First-home buyer review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Check duty, deposit, LMI, and borrowing power before relying on the estimate.",
      },
    ],
    keyInsights: [
      "Victorian buyers should treat repayment estimates as one part of the purchase decision.",
      "Stamp duty and first-home buyer rules should remain general until official facts are manually reviewed.",
      "Borrowing power can change once income, expenses, dependants, other debts, and HECS are considered.",
      "Deposit size affects LVR, LMI exposure, and the loan amount used in repayment modelling.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate Victorian home loan repayments with your own loan inputs.",
      },
      {
        to: "/stamp-duty-calculator/vic",
        label: "Victoria stamp duty calculator",
        description: "Estimate Victorian stamp duty and upfront costs before finalising a loan size.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Estimate whether the target loan amount fits income and expenses.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Review whether deposit size may create LMI exposure.",
      },
    ],
    internalLinks: [
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review deposit, duty, LMI, and upfront-cost planning language.",
      },
      {
        to: "/mortgage-calculator/extra-repayments",
        label: "Mortgage with extra repayments",
        description: "Review how additional repayments may change interest and payoff timing.",
      },
      {
        to: "/mortgage-calculator/with-offset",
        label: "Mortgage with offset",
        description: "Review how offset planning may affect interest costs.",
      },
      {
        to: "/mortgage-calculator/with-hecs",
        label: "Mortgage with HECS",
        description: "Check how HECS or HELP may affect borrowing power conversations.",
      },
    ],
    faqs: [
      {
        question: "What should Victorian buyers check after repayments?",
        answer:
          "They should check stamp duty estimates, deposit, LMI exposure, borrowing power, settlement costs, and a cash buffer before relying on a repayment estimate.",
      },
      {
        question: "Are Victorian first-home buyer values verified on this page?",
        answer:
          "No. This page uses general-safe wording only and does not publish exact Victorian grant, concession, exemption, or duty values as verified facts.",
      },
      {
        question: "Why does LMI matter in a Victorian mortgage estimate?",
        answer:
          "A smaller deposit can increase LVR and may create LMI exposure, which can change upfront costs or the amount borrowed depending on lender rules.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator VIC", path: "/mortgage-calculator/vic" },
    ],
    methodology:
      "This Victorian scenario uses mortgage calculator outputs for repayments and links to state-aware upfront-cost checks. Exact Victorian duty, grant, concession, or exemption values remain unpublished until official fact review is complete.",
    assumptions: [
      "No Victorian stamp duty, grant, concession, or exemption value is published as verified on this page.",
      "Rules vary by state and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Use Calcy's stamp duty calculator as an estimate and confirm official Victorian rules before relying on specific treatment.",
      "Mortgage repayment formulas and public finance assumptions are unchanged.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-23",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "brisbane",
    title: "Mortgage calculator Brisbane",
    metaTitle: "Mortgage Calculator Brisbane | Calcy",
    metaDescription:
      "Estimate Brisbane mortgage repayments and review deposit planning, LMI, borrowing power, and Queensland upfront-cost awareness.",
    h1: "Mortgage calculator Brisbane",
    directAnswer:
      "A Brisbane mortgage repayment estimate depends on the property budget, loan amount, interest rate, term, repayment frequency, deposit size, loan type, and fees. Buyers should combine the repayment with Queensland upfront-cost awareness, LMI risk, borrowing power, and cash-buffer planning.",
    intro:
      "This Brisbane mortgage scenario is a city-level planning page, not a suburb-scale expansion. It helps buyers connect repayment estimates with deposit, LMI, borrowing power, and Queensland upfront-cost checks while avoiding exact unreviewed duty or grant claims.",
    scenarioType: "upfront_costs",
    summary: [
      "Start with a Brisbane property budget, deposit, loan amount, rate, term, and repayment frequency.",
      "Compare repayment comfort with borrowing power, LMI exposure, and settlement cash needs.",
      "Use Queensland stamp duty estimates as planning inputs, not verified state-law advice.",
      "Avoid treating a repayment estimate as affordable until deposit, upfront costs, and lender rules are reviewed.",
    ],
    calculatorPreset: {
      loan: 650000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
    },
    exampleRepaymentTable: [
      {
        label: "Brisbane repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Use calculator output for the selected rate, term, and frequency.",
      },
      {
        label: "Deposit and LMI review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Review deposit size, LVR, LMI, and cash buffer before treating the estimate as affordable.",
      },
    ],
    keyInsights: [
      "Brisbane buyers should compare repayment comfort with deposit and upfront-cost requirements.",
      "Queensland state rules should be checked through official sources before relying on grants or concessions.",
      "Borrowing power can be more restrictive than a repayment estimate suggests.",
      "LMI can matter when deposit size is low relative to the target property price.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate Brisbane mortgage repayments with your own loan inputs.",
      },
      {
        to: "/stamp-duty-calculator/qld",
        label: "Queensland stamp duty calculator",
        description: "Estimate Queensland duty and upfront costs for Brisbane purchase planning.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Check whether a Brisbane loan target fits income and expenses.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Review low-deposit LMI exposure before increasing loan size.",
      },
    ],
    internalLinks: [
      {
        to: "/mortgage-calculator/qld",
        label: "Mortgage calculator QLD",
        description: "Review broader Queensland mortgage planning context.",
      },
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review deposit, LMI, duty awareness, and upfront-cost planning.",
      },
      {
        to: "/mortgage-calculator/extra-repayments",
        label: "Mortgage with extra repayments",
        description: "Review how additional repayments may change interest and payoff timing.",
      },
      {
        to: "/mortgage-calculator/with-offset",
        label: "Mortgage with offset",
        description: "Review how offset planning may affect interest costs.",
      },
      {
        to: "/mortgage-calculator/with-hecs",
        label: "Mortgage with HECS",
        description: "Check how HECS or HELP may affect borrowing power conversations.",
      },
    ],
    faqs: [
      {
        question: "How should Brisbane buyers estimate mortgage repayments?",
        answer:
          "Use the mortgage calculator with the target loan amount, interest rate, term, and repayment frequency, then compare the result with Queensland upfront costs and borrowing power.",
      },
      {
        question: "Does this Brisbane page publish exact Queensland duty or grant values?",
        answer:
          "No. It uses general-safe wording and links to calculators for estimates. Official Queensland rules should be checked before relying on specific values.",
      },
      {
        question: "Why check LMI for a Brisbane property purchase?",
        answer:
          "Deposit size can affect LVR and may create LMI exposure depending on lender rules, which can change upfront costs or the amount borrowed.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator Brisbane", path: "/mortgage-calculator/brisbane" },
    ],
    methodology:
      "This Brisbane scenario uses calculator outputs for repayment estimates and connects city-level planning to Queensland upfront-cost checks. It avoids exact state duty, grant, or concession claims until official fact review is complete.",
    assumptions: [
      "No Queensland stamp duty, grant, concession, or exemption value is published as verified on this page.",
      "This is a city-level planning page and does not create suburb-level claims.",
      "Rules vary by state and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Mortgage repayment formulas and public finance assumptions are unchanged.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-23",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
  {
    slug: "sydney",
    title: "Mortgage calculator Sydney",
    metaTitle: "Mortgage Calculator Sydney | Calcy",
    metaDescription:
      "Estimate Sydney mortgage repayments and review affordability pressure, deposit size, LMI, NSW stamp duty awareness, and borrowing power.",
    h1: "Mortgage calculator Sydney",
    directAnswer:
      "A Sydney mortgage repayment estimate depends on the target property budget, loan amount, interest rate, term, repayment frequency, deposit size, loan type, and fees. Buyers should compare the repayment with NSW stamp duty estimates, deposit pressure, LMI, borrowing power, and upfront costs before treating the budget as affordable.",
    intro:
      "This Sydney mortgage scenario helps buyers understand mortgage affordability pressure without publishing exact NSW duty, grant, or concession values. It is a city-level planning page focused on repayments, deposit size, LMI, stamp duty estimates, and borrowing power.",
    scenarioType: "upfront_costs",
    summary: [
      "Start with a Sydney property budget, deposit, target loan amount, rate, term, and repayment frequency.",
      "Compare repayment estimates with NSW upfront costs, deposit size, LMI risk, and borrowing power.",
      "Use first-home buyer and HECS scenarios where buyer circumstances may affect planning conversations.",
      "Do not rely on exact state thresholds or grant values unless official NSW facts are separately reviewed.",
    ],
    calculatorPreset: {
      loan: 900000,
      rate: 6.39,
      term: 30,
      freq: "monthly",
    },
    exampleRepaymentTable: [
      {
        label: "Sydney repayment estimate",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Repayment estimate depends on the selected loan amount, rate, term, and frequency.",
      },
      {
        label: "Affordability pressure review",
        repayment: "Use calculator output",
        totalInterest: "Use calculator output",
        totalRepaid: "Use calculator output",
        note: "Review borrowing power, deposit, LMI, stamp duty, and cash buffer before relying on the estimate.",
      },
    ],
    keyInsights: [
      "Sydney buyers should treat repayment estimates and borrowing power as separate checks.",
      "Deposit size can affect LVR, LMI exposure, and the loan amount used in repayment modelling.",
      "NSW stamp duty and first-home buyer treatment should remain general until official facts are reviewed.",
      "Higher property budgets can make small interest-rate changes more noticeable in repayment planning.",
    ],
    relatedTools: [
      {
        to: "/mortgage-calculator",
        label: "Mortgage repayment calculator",
        description: "Estimate Sydney mortgage repayments with your own loan inputs.",
      },
      {
        to: "/stamp-duty-calculator/nsw",
        label: "NSW stamp duty calculator",
        description: "Estimate NSW stamp duty and upfront costs for Sydney purchase planning.",
      },
      {
        to: "/borrowing-power-calculator",
        label: "Borrowing power calculator",
        description: "Check whether a Sydney loan target fits income and expenses.",
      },
      {
        to: "/lmi-calculator",
        label: "LMI calculator",
        description: "Estimate whether deposit size may create LMI exposure.",
      },
    ],
    internalLinks: [
      {
        to: "/mortgage-calculator/nsw",
        label: "Mortgage calculator NSW",
        description: "Review broader NSW mortgage planning context.",
      },
      {
        to: "/mortgage-calculator/with-hecs",
        label: "Mortgage with HECS scenario",
        description: "Review how HECS or HELP may affect borrowing power conversations.",
      },
      {
        to: "/mortgage-calculator/first-home-buyer",
        label: "First home buyer mortgage scenario",
        description: "Review deposit, LMI, duty awareness, and upfront-cost planning.",
      },
      {
        to: "/mortgage-calculator/extra-repayments",
        label: "Mortgage with extra repayments",
        description: "Review how additional repayments may change interest and payoff timing.",
      },
      {
        to: "/mortgage-calculator/with-offset",
        label: "Mortgage with offset",
        description: "Review how offset planning may affect interest costs.",
      },
    ],
    faqs: [
      {
        question: "How should Sydney buyers use a mortgage calculator?",
        answer:
          "Use the calculator to estimate repayments, then compare the result with NSW stamp duty estimates, deposit size, LMI exposure, borrowing power, and a settlement cash buffer.",
      },
      {
        question: "Does this Sydney page publish exact NSW duty or grant values?",
        answer:
          "No. It uses general-safe wording only and does not publish exact NSW grant, concession, exemption, or stamp duty values as verified facts.",
      },
      {
        question: "Why can borrowing power matter more in Sydney?",
        answer:
          "Higher target budgets can make serviceability, deposit size, LMI, and lender policy more important than the repayment estimate alone.",
      },
    ],
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Mortgage calculator", path: "/mortgage-calculator" },
      { name: "Mortgage calculator Sydney", path: "/mortgage-calculator/sydney" },
    ],
    methodology:
      "This Sydney scenario uses calculator outputs for repayments and connects city-level planning to NSW upfront-cost checks. It avoids exact NSW stamp duty, grant, concession, or exemption claims until official fact review is complete.",
    assumptions: [
      "No NSW stamp duty, grant, concession, or exemption value is published as verified on this page.",
      "This is a city-level planning page and does not create suburb-level claims.",
      "Rules vary by state and eligibility can depend on property value, property type, occupancy, and buyer circumstances.",
      "Mortgage repayment formulas and public finance assumptions are unchanged.",
      "General information only, not financial advice.",
    ],
    updatedDate: "2026-05-23",
    reviewedDate: "2026-05-23",
    approvedForIndex: true,
  },
];
