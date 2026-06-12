import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRobots, buildSitemap } from "../../scripts/lib/sitemapRobots.mjs";
import { FINANCE_FACTS_REGISTRY } from "@/data/financeFactsRegistry";
import { ROUTES, SITE } from "@/data/routes";
import {
  CALCULATE_SEO_POLICY_PROTECTION,
  STATE_FINANCE_FACT_REVIEW_CHECKLIST,
  buildFinanceFactValidationReport,
  classifyFinanceFactReadiness,
} from "@/lib/financeFactValidation";
import { calcBorrowingPowerV2 } from "@/lib/calc/borrowingPower";
import { calcHecsBorrowing } from "@/lib/calc/hecsBorrowing";
import { calcLmi } from "@/lib/calc/lmi";
import { calcStampDuty } from "@/lib/calc/stampDuty";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "..", "dist");
const HAS_DIST = existsSync(join(DIST, "index.html"));

const criticalRoutes = [
  "/",
  "/mortgage-calculator",
  "/borrowing-power-calculator",
  "/stamp-duty-calculator",
  "/lmi-calculator",
  "/hecs-borrowing-power",
  "/refinance-calculator",
  "/extra-repayments-calculator",
  "/loan-comparison-calculator",
  "/rent-vs-buy-calculator",
  "/guides",
  "/best-home-loans-australia",
] as const;

function htmlForRoute(canonical: string) {
  const file =
    canonical === "/"
      ? join(DIST, "index.html")
      : join(DIST, `${canonical.replace(/^\//, "")}.html`);
  return readFileSync(file, "utf8");
}

function jsonLdBlocks(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]),
  );
}

describe("Phase 0C finance fact validation", () => {
  it("builds an audit report for facts that are not safe for public use yet", () => {
    const report = buildFinanceFactValidationReport();

    expect(report.totalFacts).toBe(FINANCE_FACTS_REGISTRY.length);
    expect(report.factsMarkedNeedsReview.length).toBeGreaterThan(0);
    expect(report.conflictingDuplicatedAssumptions.length).toBeGreaterThan(0);
    expect(report.factsNotReadyForPublicUse.length).toBeGreaterThan(0);
    expect(report.readinessCounts.needs_manual_review).toBeGreaterThan(0);
    expect(report.missingSourceUrls).toEqual([]);
    expect(report.missingLastReviewedDates).toEqual([]);
  });

  it("classifies readiness without overclaiming public validity", () => {
    const rba = FINANCE_FACTS_REGISTRY.find((fact) => fact.key === "rba_cash_rate");
    const qld = FINANCE_FACTS_REGISTRY.find((fact) => fact.key === "stamp_duty_thresholds_qld");
    const hem = FINANCE_FACTS_REGISTRY.find((fact) => fact.key === "hem_simple_model");

    expect(rba && classifyFinanceFactReadiness(rba)).toBe("ready_for_public_use");
    expect(qld && classifyFinanceFactReadiness(qld)).toBe("needs_manual_review");
    expect(hem && classifyFinanceFactReadiness(hem)).toBe("needs_manual_review");
  });

  it("contains a state-by-state manual review checklist", () => {
    expect(STATE_FINANCE_FACT_REVIEW_CHECKLIST.map((item) => item.state)).toEqual([
      "NSW",
      "VIC",
      "QLD",
      "WA",
      "SA",
      "TAS",
      "ACT",
      "NT",
    ]);
    expect(STATE_FINANCE_FACT_REVIEW_CHECKLIST.some((item) => item.status === "not_verified")).toBe(true);
    expect(STATE_FINANCE_FACT_REVIEW_CHECKLIST.every((item) => item.requiredChecks.length >= 3)).toBe(true);
  });
});

describe("Phase 0C /calculate/* policy protection", () => {
  it("documents DB-backed /calculate/* pages as conditional and excluded from sitemap until approved", () => {
    expect(CALCULATE_SEO_POLICY_PROTECTION.routePattern).toBe("/calculate/*");
    expect(CALCULATE_SEO_POLICY_PROTECTION.indexable).toBe("conditional");
    expect(CALCULATE_SEO_POLICY_PROTECTION.sitemapIncluded).toBe(false);
    expect(CALCULATE_SEO_POLICY_PROTECTION.approvalRequiredBeforeIndexing).toBe(true);
    expect(CALCULATE_SEO_POLICY_PROTECTION.approvalChecklist.length).toBeGreaterThanOrEqual(4);
    expect(ROUTES.some((route) => route.canonical.startsWith("/calculate/"))).toBe(false);
  });
});

describe("Phase 0C route and sitemap guardrails", () => {
  it("protects critical public calculator and guide routes from removal", () => {
    const canonicals = new Set(ROUTES.map((route) => route.canonical));
    for (const route of criticalRoutes) expect(canonicals.has(route)).toBe(true);
  });

  it("keeps canonical URLs unique in the route manifest", () => {
    const canonicals = ROUTES.map((route) => route.canonical);
    expect(new Set(canonicals).size).toBe(canonicals.length);
  });

  it("sitemap generation includes critical routes and excludes DB-backed /calculate/* pages", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-22", indexingEnabled: true });
    for (const route of criticalRoutes) expect(xml).toContain(`<loc>${SITE}${route}</loc>`);
    expect(xml).not.toContain(`${SITE}/calculate/`);
  });

  it("robots output keeps admin blocked and sitemap discoverable", () => {
    const robots = buildRobots({
      settings: { indexing_enabled: true, robots_txt: null },
      site: SITE,
    });
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});

describe.skipIf(!HAS_DIST)("Phase 0C prerendered SEO guardrails", () => {
  it.each(criticalRoutes)("has exactly one canonical tag for %s", (route) => {
    const html = htmlForRoute(route);
    const matches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe(`${SITE}${route}`);
  });

  it("keeps FAQ and breadcrumb JSON-LD valid on the mortgage calculator", () => {
    const blocks = jsonLdBlocks(htmlForRoute("/mortgage-calculator"));
    const breadcrumbs = blocks.filter((block) => block["@type"] === "BreadcrumbList");
    const faqs = blocks.filter((block) => block["@type"] === "FAQPage");

    expect(breadcrumbs.length).toBe(1);
    expect(breadcrumbs[0].itemListElement[0].item).toBe(`${SITE}/`);
    expect(breadcrumbs[0].itemListElement.at(-1).item).toBe(`${SITE}/mortgage-calculator`);

    expect(faqs.length).toBe(1);
    expect(faqs[0].mainEntity.length).toBeGreaterThanOrEqual(2);
    for (const item of faqs[0].mainEntity) {
      expect(item["@type"]).toBe("Question");
      expect(item.acceptedAnswer.text).toBeTruthy();
    }
  });
});

describe("Phase 0C calculator behavior guardrails", () => {
  it("does not change key calculator outputs while validating facts", () => {
    const borrowing = calcBorrowingPowerV2({
      income: 100000,
      partnerIncome: 0,
      overtimeIncome: 0,
      rentalIncome: 0,
      monthlyExpenses: 3000,
      otherRepayments: 0,
      creditCardLimit: 0,
      dependants: 0,
      interestRate: 6.39,
      loanTerm: 30,
      deposit: 100000,
    });
    expect(borrowing.assessmentRate).toBe(9.39);
    expect(borrowing.conservativeRate).toBe(9.89);

    expect(calcHecsBorrowing({ grossIncome: 100000, hecsBalance: 50000, ratePct: 6.39 }).taxAnnual).toBe(20788);
    expect(calcStampDuty(700000, "NSW", "fhb", "new").netDuty).toBe(0);
    expect(calcLmi(700000, 70000, 30, 6.39, "owner").lmiCost).toBe(8200);
  });
});
