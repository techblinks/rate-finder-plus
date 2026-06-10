import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { buildSitemap } from "../../scripts/lib/sitemapRobots.mjs";
import MortgageScenarioTemplate from "@/components/mortgage/MortgageScenarioTemplate";
import {
  DRAFT_MORTGAGE_SCENARIOS,
  SAMPLE_DRAFT_MORTGAGE_SCENARIO,
  buildMortgageScenarioReviewReport,
  buildMortgageScenarioBreadcrumbSchema,
  buildMortgageScenarioFaqSchema,
  evaluateMortgageScenarioApproval,
  draftMortgageScenarioDefaults,
  isMortgageScenarioIndexable,
  mortgageScenarioPath,
  mortgageScenarioRobots,
  shouldIncludeMortgageScenarioInSitemap,
  validateMortgageScenarioDraft,
} from "@/data/mortgageScenarioPages";
import { buildAmortisation } from "@/lib/calc/mortgageEngine";
import { ROUTES, SITE } from "@/data/routes";

const PUBLISHED_SCENARIO_SLUGS = [
  "with-offset",
  "extra-repayments",
  "first-home-buyer",
  "with-hecs",
  "700k-mortgage-repayments",
  "qld",
  "nsw",
  "vic",
  "brisbane",
  "sydney",
];
const PHASE_3_SCENARIO_SLUGS = ["qld", "nsw", "vic", "brisbane", "sydney"];
const DRAFT_SCENARIO_SLUGS: string[] = [];

const getScenario = (slug: string) => {
  const scenario = DRAFT_MORTGAGE_SCENARIOS.find((item) => item.slug === slug);
  if (!scenario) throw new Error(`Missing scenario ${slug}`);
  return scenario;
};

const renderScenario = () =>
  render(
    <HelmetProvider>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <MortgageScenarioTemplate scenario={SAMPLE_DRAFT_MORTGAGE_SCENARIO} />
      </BrowserRouter>
    </HelmetProvider>,
  );

describe("Phase 2A mortgage scenario page template", () => {
  it("renders the reusable draft template with sample data", () => {
    renderScenario();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      SAMPLE_DRAFT_MORTGAGE_SCENARIO.h1,
    );
    expect(screen.getByText("Scenario overview")).toBeInTheDocument();
    expect(screen.getByText("Calculate this scenario")).toBeInTheDocument();
    expect(screen.getByText("Example repayment table")).toBeInTheDocument();
    expect(screen.getByText("Related calculators")).toBeInTheDocument();
    expect(screen.getByText("Frequently asked questions")).toBeInTheDocument();
    expect(screen.getByText("Methodology")).toBeInTheDocument();
    expect(screen.getByText("Important assumptions")).toBeInTheDocument();
    expect(screen.getByText(/Noindex draft/i)).toBeInTheDocument();
  });

  it("defaults draft scenario pages to noindex and sitemap exclusion", () => {
    expect(SAMPLE_DRAFT_MORTGAGE_SCENARIO.approvedForIndex).toBe(false);
    expect(draftMortgageScenarioDefaults.approvedForIndex).toBe(false);
    expect(draftMortgageScenarioDefaults.sitemapIncluded).toBe(false);
    expect(isMortgageScenarioIndexable(SAMPLE_DRAFT_MORTGAGE_SCENARIO)).toBe(false);
    expect(shouldIncludeMortgageScenarioInSitemap(SAMPLE_DRAFT_MORTGAGE_SCENARIO)).toBe(false);
    expect(mortgageScenarioRobots(SAMPLE_DRAFT_MORTGAGE_SCENARIO)).toBe("noindex, nofollow");
  });

  it("keeps draft scenario paths out of the route manifest and sitemap", () => {
    const draftPath = mortgageScenarioPath(SAMPLE_DRAFT_MORTGAGE_SCENARIO.slug);
    expect(ROUTES.some((route) => route.canonical === draftPath)).toBe(false);

    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-22", indexingEnabled: true });
    expect(xml).not.toContain(draftPath);
  });

  it("generates safe FAQ and breadcrumb schema for future scenario pages", () => {
    const faqSchema = buildMortgageScenarioFaqSchema(SAMPLE_DRAFT_MORTGAGE_SCENARIO);
    const breadcrumbSchema = buildMortgageScenarioBreadcrumbSchema(SAMPLE_DRAFT_MORTGAGE_SCENARIO);

    expect(faqSchema?.["@type"]).toBe("FAQPage");
    expect(faqSchema?.mainEntity).toHaveLength(2);
    expect(faqSchema?.mainEntity[0].acceptedAnswer.text).not.toContain("<");

    expect(breadcrumbSchema["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbSchema.itemListElement[0].position).toBe(1);
    expect(breadcrumbSchema.itemListElement.at(-1)?.item).toBe(
      `${SITE}${mortgageScenarioPath(SAMPLE_DRAFT_MORTGAGE_SCENARIO.slug)}`,
    );
  });

  it("documents draft quality gates before any scenario can be indexed", () => {
    const report = validateMortgageScenarioDraft(SAMPLE_DRAFT_MORTGAGE_SCENARIO);

    expect(report.issues).toContain("Draft remains noindex until approvedForIndex is true.");
    expect(report.issues).not.toContain("Missing unique H1.");
    expect(report.issues).not.toContain("Intro is too thin.");
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});

describe("Phase 2B curated mortgage scenarios", () => {
  it("keeps the original five approved scenario configs first", () => {
    expect(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.slug)).toEqual([
      "with-offset",
      "extra-repayments",
      "first-home-buyer",
      "with-hecs",
      "700k-mortgage-repayments",
      "qld",
      "nsw",
      "vic",
      "brisbane",
      "sydney",
    ]);

    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.slug)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.h1)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.metaTitle)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.metaDescription)).size).toBe(10);
  });

  it("keeps unapproved scenario drafts noindex and excluded from sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-22", indexingEnabled: true });
    const draftScenarios = DRAFT_MORTGAGE_SCENARIOS.filter((scenario) =>
      DRAFT_SCENARIO_SLUGS.includes(scenario.slug),
    );

    for (const scenario of draftScenarios) {
      const draftPath = mortgageScenarioPath(scenario.slug);
      expect(scenario.approvedForIndex).toBe(false);
      expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(false);
      expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(false);
      expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe("noindex, nofollow");
      expect(ROUTES.some((route) => route.canonical === draftPath)).toBe(false);
      expect(xml).not.toContain(draftPath);
    }
  });

  it("passes content quality gates for every curated scenario", () => {
    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const report = validateMortgageScenarioDraft(scenario);
      if (scenario.approvedForIndex) {
        expect(report.issues).toEqual([]);
      } else {
        expect(report.validForDraftPreview).toBe(true);
        expect(report.issues).toEqual(["Draft remains noindex until approvedForIndex is true."]);
      }
      expect(scenario.directAnswer.length).toBeGreaterThanOrEqual(120);
      expect(scenario.intro.length).toBeGreaterThanOrEqual(140);
      expect(scenario.summary.length).toBeGreaterThanOrEqual(3);
      expect(scenario.keyInsights.length).toBeGreaterThanOrEqual(3);
      expect(scenario.relatedTools.length).toBeGreaterThanOrEqual(3);
      expect(scenario.internalLinks.length).toBeGreaterThanOrEqual(2);
      expect(scenario.exampleRepaymentTable.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("builds safe FAQ and breadcrumb schema for every draft scenario", () => {
    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const faqSchema = buildMortgageScenarioFaqSchema(scenario);
      const breadcrumbSchema = buildMortgageScenarioBreadcrumbSchema(scenario);

      expect(faqSchema?.["@type"]).toBe("FAQPage");
      expect(faqSchema?.mainEntity.length).toBeGreaterThanOrEqual(2);
      for (const item of faqSchema?.mainEntity ?? []) {
        expect(item.name).toBeTruthy();
        expect(item.acceptedAnswer.text).toBeTruthy();
        expect(item.acceptedAnswer.text).not.toContain("<");
      }

      expect(breadcrumbSchema["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbSchema.itemListElement[0].item).toBe(`${SITE}/`);
      expect(breadcrumbSchema.itemListElement.at(-1)?.item).toBe(
        `${SITE}${mortgageScenarioPath(scenario.slug)}`,
      );
    }
  });

  it("test-renders each scenario through the template", () => {
    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const { unmount } = render(
        <HelmetProvider>
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <MortgageScenarioTemplate scenario={scenario} />
          </BrowserRouter>
        </HelmetProvider>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(scenario.h1);
      if (scenario.approvedForIndex) {
        expect(screen.queryByText(/Noindex draft/i)).not.toBeInTheDocument();
      } else {
        expect(screen.getAllByText(/Noindex draft/i).length).toBeGreaterThanOrEqual(1);
      }
      unmount();
    }
  });
});

describe("Phase 2C scenario approval workflow and indexing gate", () => {
  it("keeps unapproved curated drafts blocked from indexing and sitemap inclusion", () => {
    const report = buildMortgageScenarioReviewReport(DRAFT_MORTGAGE_SCENARIOS);
    const draftRows = report.filter((item) => DRAFT_SCENARIO_SLUGS.includes(item.slug));

    expect(draftRows).toHaveLength(0);
    for (const item of draftRows) {
      expect(item.approvedForIndex).toBe(false);
      expect(item.canIndex).toBe(false);
      expect(item.status).toBe("blocked");
      expect(item.robots).toBe("noindex, nofollow");
      expect(item.includeInSitemap).toBe(false);
      expect(item.qualityStatus).toBe("passed");
      expect(item.missingRequirements).toEqual([]);
      expect(item.manualReviewRequirements).toEqual(["Manual approvedForIndex flag is false."]);
    }
  });

  it("allows indexing only when approval, quality, uniqueness, and manual-review gates pass", () => {
    const approved = {
      ...DRAFT_MORTGAGE_SCENARIOS[0],
      approvedForIndex: true,
    };
    const decision = evaluateMortgageScenarioApproval(approved, [approved]);

    expect(decision.canIndex).toBe(true);
    expect(decision.status).toBe("approved_for_index");
    expect(decision.robots).toBe("index, follow, max-snippet:-1, max-image-preview:large");
    expect(decision.includeInSitemap).toBe(true);
    expect(isMortgageScenarioIndexable(approved, [approved])).toBe(true);
    expect(shouldIncludeMortgageScenarioInSitemap(approved, [approved])).toBe(true);
    expect(mortgageScenarioRobots(approved, [approved])).toBe(
      "index, follow, max-snippet:-1, max-image-preview:large",
    );
  });

  it("blocks approved scenarios when required content quality fails", () => {
    const thinApproved = {
      ...DRAFT_MORTGAGE_SCENARIOS[0],
      approvedForIndex: true,
      directAnswer: "Too thin.",
      faqs: [DRAFT_MORTGAGE_SCENARIOS[0].faqs[0]],
      methodology: "",
    };
    const decision = evaluateMortgageScenarioApproval(thinApproved, [thinApproved]);

    expect(decision.canIndex).toBe(false);
    expect(decision.includeInSitemap).toBe(false);
    expect(decision.robots).toBe("noindex, nofollow");
    expect(decision.qualityStatus).toBe("failed");
    expect(decision.missingRequirements).toEqual(
      expect.arrayContaining([
        "Direct answer is too thin.",
        "At least two FAQs are required for FAQ schema.",
        "Methodology is required.",
      ]),
    );
  });

  it("blocks approved scenarios that depend on finance facts needing manual review", () => {
    const approvedWithUnreviewedFact = {
      ...DRAFT_MORTGAGE_SCENARIOS[0],
      approvedForIndex: true,
      requiredFactKeys: ["lmi_bands_2026_indicative"],
    };
    const decision = evaluateMortgageScenarioApproval(approvedWithUnreviewedFact, [
      approvedWithUnreviewedFact,
    ]);

    expect(decision.canIndex).toBe(false);
    expect(decision.includeInSitemap).toBe(false);
    expect(decision.robots).toBe("noindex, nofollow");
    expect(decision.manualReviewRequirements).toContain(
      "Required finance fact lmi_bands_2026_indicative is needs_manual_review.",
    );
  });

  it("fails approval when duplicate slugs, meta titles, H1s, or canonicals exist", () => {
    const first = {
      ...DRAFT_MORTGAGE_SCENARIOS[0],
      approvedForIndex: true,
    };
    const duplicate = {
      ...DRAFT_MORTGAGE_SCENARIOS[1],
      slug: first.slug,
      metaTitle: first.metaTitle,
      h1: first.h1,
      approvedForIndex: true,
    };

    const decision = evaluateMortgageScenarioApproval(first, [first, duplicate]);
    expect(decision.canIndex).toBe(false);
    expect(decision.missingRequirements).toEqual(
      expect.arrayContaining(["Duplicate slug.", "Duplicate meta title.", "Duplicate H1.", "Duplicate canonical."]),
    );
  });

  it("fails approval when duplicate meta descriptions exist", () => {
    const first = {
      ...DRAFT_MORTGAGE_SCENARIOS[0],
      approvedForIndex: true,
    };
    const duplicate = {
      ...DRAFT_MORTGAGE_SCENARIOS[1],
      metaDescription: first.metaDescription,
      approvedForIndex: true,
    };

    const decision = evaluateMortgageScenarioApproval(first, [first, duplicate]);
    expect(decision.canIndex).toBe(false);
    expect(decision.missingRequirements).toContain("Duplicate meta description.");
  });

  it("keeps robots and sitemap decisions consistent for every scenario review row", () => {
    const report = buildMortgageScenarioReviewReport(DRAFT_MORTGAGE_SCENARIOS);

    for (const item of report) {
      expect(item.includeInSitemap).toBe(item.canIndex);
      expect(item.robots === "index, follow, max-snippet:-1, max-image-preview:large").toBe(item.canIndex);
      expect(item.robots === "noindex, nofollow").toBe(!item.canIndex);
    }
  });
});

describe("Phase 2D published mortgage scenario pages", () => {
  it("publishes only the manually approved scenario pages", () => {
    const approved = DRAFT_MORTGAGE_SCENARIOS.filter((scenario) => scenario.approvedForIndex);
    const drafts = DRAFT_MORTGAGE_SCENARIOS.filter((scenario) => !scenario.approvedForIndex);

    expect(approved.map((scenario) => scenario.slug)).toEqual(PUBLISHED_SCENARIO_SLUGS);
    expect(drafts.map((scenario) => scenario.slug)).toEqual(DRAFT_SCENARIO_SLUGS);
  });

  it("keeps published scenarios free of unreviewed required finance facts", () => {
    const approved = DRAFT_MORTGAGE_SCENARIOS.filter((scenario) => scenario.approvedForIndex);

    for (const scenario of approved) {
      expect(scenario.requiredFactKeys ?? []).toEqual([]);
      const decision = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);
      expect(decision.manualReviewRequirements).toEqual([]);
    }
  });

  it("adds only approved scenario pages to routes and sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-22", indexingEnabled: true });

    for (const slug of PUBLISHED_SCENARIO_SLUGS) {
      const path = mortgageScenarioPath(slug);
      expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
      expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    }

    for (const slug of DRAFT_SCENARIO_SLUGS) {
      const path = mortgageScenarioPath(slug);
      expect(ROUTES.some((route) => route.canonical === path)).toBe(false);
      expect(xml).not.toContain(`<loc>${SITE}${path}</loc>`);
    }
  });

  it("keeps canonical URLs unique and robots aligned with approval status", () => {
    const canonicals = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    expect(new Set(canonicals).size).toBe(canonicals.length);

    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const decision = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);
      expect(decision.canIndex).toBe(scenario.approvedForIndex === true);
      expect(decision.includeInSitemap).toBe(decision.canIndex);
      expect(decision.robots).toBe(
        decision.canIndex ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, nofollow",
      );
    }
  });
});

describe("Phase 2G first home buyer scenario publication", () => {
  it("publishes the First Home Buyer scenario through the approval gate", () => {
    const scenario = getScenario("first-home-buyer");
    const path = mortgageScenarioPath(scenario.slug);
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    expect(scenario.approvedForIndex).toBe(true);
    expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
      "index, follow, max-snippet:-1, max-image-preview:large",
    );
    expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
    expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  });

  it("passes the content quality gate without manual-review blockers", () => {
    const scenario = getScenario("first-home-buyer");
    const draftReport = validateMortgageScenarioDraft(scenario);
    const approval = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);

    expect(draftReport.validForDraftPreview).toBe(true);
    expect(draftReport.issues).toEqual([]);
    expect(approval.qualityStatus).toBe("passed");
    expect(approval.missingRequirements).toEqual([]);
    expect(approval.manualReviewRequirements).toEqual([]);
    expect(approval.canIndex).toBe(true);
  });

  it("uses safe first home buyer wording without presenting needs-review facts as verified", () => {
    const scenario = getScenario("first-home-buyer");
    const combinedText = [
      scenario.directAnswer,
      scenario.intro,
      ...scenario.summary,
      ...scenario.keyInsights,
      ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
      scenario.methodology,
      ...scenario.assumptions,
    ].join(" ");

    expect(scenario.requiredFactKeys ?? []).toEqual([]);
    expect(combinedText).toContain("Rules vary by state");
    expect(combinedText).toContain("state revenue office");
    expect(combinedText).toContain("eligibility can depend on property value");
    expect(combinedText).toContain("stamp duty calculator");
    expect(combinedText).not.toMatch(/\$[0-9][0-9,]*(?:\s*(?:grant|concession|exemption|threshold))?/i);
    expect(combinedText).not.toMatch(/full exemption to|concession to|verified grant|verified concession/i);
  });

  it("strengthens first home buyer internal links without overstuffing", () => {
    const scenario = getScenario("first-home-buyer");
    const links = [...scenario.relatedTools, ...scenario.internalLinks].map((item) => item.to);

    expect(links).toEqual(
      expect.arrayContaining([
        "/mortgage-calculator",
        "/stamp-duty-calculator",
        "/lmi-calculator",
        "/borrowing-power-calculator",
        "/first-home-buyer-grant-nsw",
        "/extra-repayments-calculator",
      ]),
    );
    expect(links.length).toBeLessThanOrEqual(8);
  });

  it("keeps only approved scenario pages in the sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });
    const scenarioPaths = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = scenarioPaths.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
  });
});

describe("Phase 2F first home buyer official fact review", () => {
  it("adds a state-by-state official source fact review table", () => {
    const scenario = getScenario("first-home-buyer");

    expect(scenario.factReview?.map((row) => row.jurisdiction)).toEqual([
      "NSW",
      "VIC",
      "QLD",
      "WA",
      "SA",
      "TAS",
      "ACT",
      "NT",
    ]);

    for (const row of scenario.factReview ?? []) {
      expect(row.sourceName).toBeTruthy();
      expect(row.sourceUrl).toMatch(/^https:\/\//);
      expect(row.lastReviewed).toBe("2026-05-23");
      expect(row.factStatus).toBe("general_safe_wording_only");
      expect(row.reviewedStatements.length).toBeGreaterThanOrEqual(2);
      expect(row.safeUsageNotes).toMatch(/general wording|rules|eligibility/i);
      expect(row.blockedSpecificClaims.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not present grant, concession, or stamp duty values as verified facts", () => {
    const scenario = getScenario("first-home-buyer");
    const publicDraftText = [
      scenario.directAnswer,
      scenario.intro,
      ...scenario.summary,
      ...scenario.keyInsights,
      ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
      scenario.methodology,
      ...scenario.assumptions,
    ].join(" ");
    const reviewText = (scenario.factReview ?? [])
      .flatMap((row) => [...row.reviewedStatements, row.safeUsageNotes, ...row.blockedSpecificClaims])
      .join(" ");

    expect(scenario.requiredFactKeys ?? []).toEqual([]);
    expect(publicDraftText).not.toMatch(/\$[0-9][0-9,]*/);
    expect(publicDraftText).not.toMatch(/verified (?:grant|concession|threshold|exemption)/i);
    expect(reviewText).toMatch(/Do not publish/);
    expect(reviewText).toMatch(/separate official fact-value review/);
  });

  it("keeps the approved scenario pages indexed", () => {
    for (const slug of PUBLISHED_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      const decision = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);

      expect(decision.canIndex).toBe(true);
      expect(decision.robots).toBe("index, follow, max-snippet:-1, max-image-preview:large");
      expect(decision.includeInSitemap).toBe(true);
    }
  });
});

describe("Phase 2I HECS scenario publication", () => {
  it("publishes the HECS scenario through the approval gate", () => {
    const scenario = getScenario("with-hecs");
    const path = mortgageScenarioPath(scenario.slug);
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    expect(scenario.approvedForIndex).toBe(true);
    expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
      "index, follow, max-snippet:-1, max-image-preview:large",
    );
    expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
    expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  });

  it("keeps HECS content general-safe while passing the approval gate", () => {
    const scenario = getScenario("with-hecs");
    const draftReport = validateMortgageScenarioDraft(scenario);
    const approval = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);
    const combinedText = [
      scenario.directAnswer,
      scenario.intro,
      ...scenario.summary,
      ...scenario.keyInsights,
      ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
      scenario.methodology,
      ...scenario.assumptions,
    ].join(" ");

    expect(draftReport.validForDraftPreview).toBe(true);
    expect(draftReport.issues).toEqual([]);
    expect(approval.qualityStatus).toBe("passed");
    expect(approval.missingRequirements).toEqual([]);
    expect(approval.manualReviewRequirements).toEqual([]);
    expect(approval.canIndex).toBe(true);
    expect(combinedText).toContain("HECS/HELP repayment thresholds can change each financial year");
    expect(combinedText).toMatch(/lenders may assess HECS or HELP differently/i);
    expect(combinedText).toContain("confirm current thresholds with the ATO");
    expect(combinedText).toMatch(/general information/i);
    expect(combinedText).toContain("repayment formula");
  });

  it("adds safe HECS internal links without overstuffing", () => {
    const scenario = getScenario("with-hecs");
    const links = [...scenario.relatedTools, ...scenario.internalLinks].map((item) => item.to);

    expect(links).toEqual(
      expect.arrayContaining([
        "/mortgage-calculator",
        "/hecs-borrowing-power",
        "/borrowing-power-calculator",
        "/stamp-duty-calculator",
        "/lmi-calculator",
        "/mortgage-calculator/first-home-buyer",
        "/extra-repayments-calculator",
      ]),
    );
    expect(links.length).toBeLessThanOrEqual(8);
  });

  it("adds an ATO fact review table without publishing exact HECS thresholds as verified", () => {
    const scenario = getScenario("with-hecs");
    const publicDraftText = [
      scenario.directAnswer,
      scenario.intro,
      ...scenario.summary,
      ...scenario.keyInsights,
      ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
      scenario.methodology,
      ...scenario.assumptions,
    ].join(" ");
    const reviewText = (scenario.factReview ?? [])
      .flatMap((row) => [...row.reviewedStatements, row.safeUsageNotes, ...row.blockedSpecificClaims])
      .join(" ");

    expect(scenario.factReview).toHaveLength(1);
    expect(scenario.factReview?.[0]).toMatchObject({
      jurisdiction: "AU",
      sourceName: "Australian Taxation Office - Study and training loan repayment thresholds and rates",
      lastReviewed: "2026-05-23",
      factStatus: "general_safe_wording_only",
    });
    expect(scenario.factReview?.[0].sourceUrl).toMatch(/^https:\/\/www\.ato\.gov\.au\//);
    expect(scenario.requiredFactKeys ?? []).toEqual([]);
    expect(publicDraftText).not.toMatch(/\$[0-9][0-9,]*/);
    expect(publicDraftText).not.toMatch(/\b\d+(?:\.\d+)?%/);
    expect(publicDraftText).not.toMatch(/verified (?:HECS|HELP|threshold|repayment rate)/i);
    expect(reviewText).toMatch(/Do not publish exact HECS\/HELP repayment thresholds/);
    expect(reviewText).toMatch(/separate official fact-value review/);
  });

  it("keeps all approved scenario pages in the sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });
    const scenarioPaths = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = scenarioPaths.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    expect(PUBLISHED_SCENARIO_SLUGS).toHaveLength(10);
  });

  it("keeps the $700k scenario indexed after publication", () => {
    const scenario = getScenario("700k-mortgage-repayments");
    const path = mortgageScenarioPath(scenario.slug);
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    expect(scenario.approvedForIndex).toBe(true);
    expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
      "index, follow, max-snippet:-1, max-image-preview:large",
    );
    expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
    expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});

describe("Phase 2K $700k mortgage repayments publication", () => {
  it("publishes the $700k scenario through the approval gate", () => {
    const scenario = getScenario("700k-mortgage-repayments");
    const path = mortgageScenarioPath(scenario.slug);
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    expect(scenario.approvedForIndex).toBe(true);
    expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
      "index, follow, max-snippet:-1, max-image-preview:large",
    );
    expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
    expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
  });

  it("passes the content quality and approval gates", () => {
    const scenario = getScenario("700k-mortgage-repayments");
    const draftReport = validateMortgageScenarioDraft(scenario);
    const approval = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);

    expect(draftReport.validForDraftPreview).toBe(true);
    expect(draftReport.issues).toEqual([]);
    expect(approval.qualityStatus).toBe("passed");
    expect(approval.missingRequirements).toEqual([]);
    expect(approval.manualReviewRequirements).toEqual([]);
    expect(approval.canIndex).toBe(true);
  });

  it("uses estimate-safe wording without publishing a fixed final repayment", () => {
    const scenario = getScenario("700k-mortgage-repayments");
    const combinedText = [
      scenario.directAnswer,
      scenario.intro,
      ...scenario.summary,
      ...scenario.keyInsights,
      ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
      scenario.methodology,
      ...scenario.assumptions,
    ].join(" ");

    expect(combinedText).toContain("Repayments depend on interest rate, loan term, repayment frequency");
    expect(combinedText).toContain("Example figures are estimates only");
    expect(combinedText).toContain("your actual repayment can differ");
    expect(combinedText).toContain("Use the mortgage calculator");
    expect(combinedText).toMatch(/general information/i);
    expect(combinedText).not.toMatch(/repayments?\s+(?:is|are|will be|would be)\s+\$[0-9][0-9,]*/i);
    expect(combinedText).not.toMatch(/guaranteed|guarantee|approved instantly|best loan for you/i);
    expect(combinedText).not.toMatch(/final repayment is|fixed repayment is|certain repayment/i);
  });

  it("adds the required planning links without overstuffing", () => {
    const scenario = getScenario("700k-mortgage-repayments");
    const links = [...scenario.relatedTools, ...scenario.internalLinks].map((item) => item.to);

    expect(links).toEqual(
      expect.arrayContaining([
        "/mortgage-calculator",
        "/mortgage-calculator/extra-repayments",
        "/mortgage-calculator/with-offset",
        "/borrowing-power-calculator",
        "/stamp-duty-calculator",
        "/lmi-calculator",
        "/mortgage-calculator/first-home-buyer",
        "/mortgage-calculator/with-hecs",
      ]),
    );
    expect(links.length).toBeLessThanOrEqual(8);
  });

  it("keeps all approved scenario pages in the sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });
    const scenarioPaths = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = scenarioPaths.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    expect(PUBLISHED_SCENARIO_SLUGS).toHaveLength(10);
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});

describe("Phase 3A next draft mortgage scenario pages", () => {
  it("creates the next five state and city scenario configs", () => {
    const scenarios = PHASE_3_SCENARIO_SLUGS.map(getScenario);

    expect(scenarios.map((scenario) => scenario.slug)).toEqual([
      "qld",
      "nsw",
      "vic",
      "brisbane",
      "sydney",
    ]);
    expect(scenarios.map((scenario) => scenario.h1)).toEqual([
      "Mortgage calculator QLD",
      "Mortgage calculator NSW",
      "Mortgage calculator VIC",
      "Mortgage calculator Brisbane",
      "Mortgage calculator Sydney",
    ]);
  });

  it("has no remaining Phase 3A drafts after manual publication", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    expect(DRAFT_SCENARIO_SLUGS).toEqual([]);
    for (const slug of DRAFT_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      const path = mortgageScenarioPath(slug);

      expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(false);
      expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(false);
      expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe("noindex, nofollow");
      expect(ROUTES.some((route) => route.canonical === path)).toBe(false);
      expect(xml).not.toContain(`<loc>${SITE}${path}</loc>`);
    }
  });

  it("keeps approved scenario pages indexed and in the sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });
    const scenarioPaths = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = scenarioPaths.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(sitemapScenarioPaths).toHaveLength(10);
    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    for (const slug of PUBLISHED_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
    }
  });

  it("passes content quality gates and keeps metadata unique", () => {
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.slug)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.metaTitle)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.metaDescription)).size).toBe(10);
    expect(new Set(DRAFT_MORTGAGE_SCENARIOS.map((scenario) => scenario.h1)).size).toBe(10);

    for (const slug of PHASE_3_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      const report = validateMortgageScenarioDraft(scenario);

      if (scenario.approvedForIndex) {
        expect(report.validForDraftPreview).toBe(true);
        expect(report.issues).toEqual([]);
      } else {
        expect(report.validForDraftPreview).toBe(true);
        expect(report.issues).toEqual(["Draft remains noindex until approvedForIndex is true."]);
      }
      expect(scenario.directAnswer.length).toBeGreaterThanOrEqual(120);
      expect(scenario.intro.length).toBeGreaterThanOrEqual(140);
      expect(scenario.summary.length).toBeGreaterThanOrEqual(3);
      expect(scenario.keyInsights.length).toBeGreaterThanOrEqual(3);
      expect(scenario.relatedTools.length).toBeGreaterThanOrEqual(3);
      expect(scenario.internalLinks.length).toBeGreaterThanOrEqual(2);
      expect(scenario.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses general-safe state and city wording without verified exact duty or grant claims", () => {
    for (const slug of PHASE_3_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      const combinedText = [
        scenario.directAnswer,
        scenario.intro,
        ...scenario.summary,
        ...scenario.keyInsights,
        ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
        scenario.methodology,
        ...scenario.assumptions,
      ].join(" ");

      expect(scenario.requiredFactKeys ?? []).toEqual([]);
      expect(combinedText).toMatch(/rules vary by state|state rules|official .* rules|official sources/i);
      expect(combinedText).toMatch(/property value|buyer circumstances|buyer circumstances/i);
      expect(combinedText).not.toMatch(/\$[0-9][0-9,]*(?:\s*(?:grant|concession|exemption|threshold|duty))?/i);
      expect(combinedText).not.toMatch(/verified (?:grant|concession|threshold|exemption|stamp duty|duty)/i);
    }
  });

  it("builds FAQ and breadcrumb schema for all Phase 3A scenarios", () => {
    for (const slug of PHASE_3_SCENARIO_SLUGS) {
      const scenario = getScenario(slug);
      const faqSchema = buildMortgageScenarioFaqSchema(scenario);
      const breadcrumbSchema = buildMortgageScenarioBreadcrumbSchema(scenario);

      expect(faqSchema?.["@type"]).toBe("FAQPage");
      expect(faqSchema?.mainEntity.length).toBeGreaterThanOrEqual(2);
      expect(breadcrumbSchema["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbSchema.itemListElement.at(-1)?.item).toBe(`${SITE}${mortgageScenarioPath(slug)}`);
    }
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});

describe("Phase 3B QLD and NSW scenario publication", () => {
  it("keeps QLD and NSW state scenarios published", () => {
    expect(getScenario("qld").approvedForIndex).toBe(true);
    expect(getScenario("nsw").approvedForIndex).toBe(true);
  });

  it("keeps QLD and NSW in routes and sitemap", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    for (const slug of ["qld", "nsw"]) {
      const scenario = getScenario(slug);
      const path = mortgageScenarioPath(slug);

      expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
      expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
      expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
        "index, follow, max-snippet:-1, max-image-preview:large",
      );
      expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
      expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    }
  });

  it("keeps QLD and NSW content general-safe without verified exact state values", () => {
    for (const slug of ["qld", "nsw"]) {
      const scenario = getScenario(slug);
      const combinedText = [
        scenario.metaTitle,
        scenario.metaDescription,
        scenario.directAnswer,
        scenario.intro,
        ...scenario.summary,
        ...scenario.keyInsights,
        ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
        scenario.methodology,
        ...scenario.assumptions,
      ].join(" ");

      expect(scenario.requiredFactKeys ?? []).toEqual([]);
      expect(scenario.metaTitle).not.toMatch(/draft/i);
      expect(scenario.metaDescription).not.toMatch(/draft|noindex/i);
      expect(combinedText).toMatch(/rules vary by state|official .* rules|official .* sources/i);
      expect(combinedText).toMatch(/property value/i);
      expect(combinedText).toMatch(/buyer circumstances/i);
      expect(combinedText).toMatch(/stamp duty calculator/i);
      expect(combinedText).not.toMatch(/\$[0-9][0-9,]*(?:\s*(?:grant|concession|exemption|threshold|duty))?/i);
      expect(combinedText).not.toMatch(/verified (?:grant|concession|threshold|exemption|stamp duty|duty)/i);
      expect(combinedText).not.toMatch(/exact (?:stamp duty|FHOG|grant|concession|exemption) (?:is|are|value|threshold)/i);
    }
  });

  it("keeps canonical URLs unique and sitemap inclusion aligned with approval status", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });
    const canonicals = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = canonicals.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(new Set(canonicals).size).toBe(canonicals.length);
    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    expect(sitemapScenarioPaths).toHaveLength(10);

    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const decision = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);
      expect(decision.includeInSitemap).toBe(decision.canIndex);
      expect(decision.robots).toBe(
        decision.canIndex ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, nofollow",
      );
    }
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});

describe("Phase 3C VIC, Brisbane, and Sydney scenario publication", () => {
  it("publishes VIC, Brisbane, and Sydney through the approval gate", () => {
    for (const slug of ["vic", "brisbane", "sydney"]) {
      const scenario = getScenario(slug);

      expect(scenario.approvedForIndex).toBe(true);
      expect(isMortgageScenarioIndexable(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
      expect(shouldIncludeMortgageScenarioInSitemap(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(true);
      expect(mortgageScenarioRobots(scenario, DRAFT_MORTGAGE_SCENARIOS)).toBe(
        "index, follow, max-snippet:-1, max-image-preview:large",
      );
    }
  });

  it("adds VIC, Brisbane, and Sydney routes and sitemap entries", () => {
    const xml = buildSitemap({ routes: ROUTES, site: SITE, lastmod: "2026-05-23", indexingEnabled: true });

    for (const slug of ["vic", "brisbane", "sydney"]) {
      const path = mortgageScenarioPath(slug);

      expect(ROUTES.some((route) => route.canonical === path)).toBe(true);
      expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    }

    const scenarioPaths = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));
    const sitemapScenarioPaths = scenarioPaths.filter((path) => xml.includes(`<loc>${SITE}${path}</loc>`));

    expect(sitemapScenarioPaths).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    expect(sitemapScenarioPaths).toHaveLength(10);
  });

  it("keeps VIC, Brisbane, and Sydney content general-safe without exact verified state values", () => {
    for (const slug of ["vic", "brisbane", "sydney"]) {
      const scenario = getScenario(slug);
      const combinedText = [
        scenario.metaTitle,
        scenario.metaDescription,
        scenario.directAnswer,
        scenario.intro,
        ...scenario.summary,
        ...scenario.keyInsights,
        ...scenario.faqs.map((faq) => `${faq.question} ${faq.answer}`),
        scenario.methodology,
        ...scenario.assumptions,
      ].join(" ");

      expect(scenario.requiredFactKeys ?? []).toEqual([]);
      expect(scenario.metaTitle).not.toMatch(/draft/i);
      expect(scenario.metaDescription).not.toMatch(/draft|noindex/i);
      expect(combinedText).toMatch(/rules vary by state|official .* rules|official .* sources|official .* facts/i);
      expect(combinedText).toMatch(/property value|buyer circumstances|buyer history/i);
      expect(combinedText).toMatch(/stamp duty calculator|stamp duty estimates|duty estimates/i);
      expect(combinedText).not.toMatch(/\$[0-9][0-9,]*(?:\s*(?:grant|concession|exemption|threshold|duty))?/i);
      expect(combinedText).not.toMatch(/verified (?:grant|concession|threshold|exemption|stamp duty|duty)/i);
      expect(combinedText).not.toMatch(/exact (?:stamp duty|FHOG|grant|concession|exemption) (?:is|are|value|threshold)/i);
    }
  });

  it("keeps Brisbane and Sydney as city-level pages without suburb-spam expansion", () => {
    const cityScenarios = ["brisbane", "sydney"].map(getScenario);
    const mortgageScenarioRoutes = ROUTES.filter((route) =>
      route.canonical.startsWith("/mortgage-calculator/"),
    ).map((route) => route.canonical);

    expect(mortgageScenarioRoutes).toEqual(PUBLISHED_SCENARIO_SLUGS.map((slug) => mortgageScenarioPath(slug)));
    for (const scenario of cityScenarios) {
      const combinedText = [
        scenario.intro,
        ...scenario.summary,
        ...scenario.keyInsights,
        ...scenario.assumptions,
      ].join(" ");

      expect(combinedText).toMatch(/city-level planning page/i);
      expect(combinedText).not.toMatch(/suburb template|suburb-spam|suburb spam/i);
    }
  });

  it("keeps scenario canonical URLs unique and robots aligned with approval status", () => {
    const canonicals = DRAFT_MORTGAGE_SCENARIOS.map((scenario) => mortgageScenarioPath(scenario.slug));

    expect(new Set(canonicals).size).toBe(canonicals.length);
    for (const scenario of DRAFT_MORTGAGE_SCENARIOS) {
      const decision = evaluateMortgageScenarioApproval(scenario, DRAFT_MORTGAGE_SCENARIOS);

      expect(decision.canIndex).toBe(true);
      expect(decision.includeInSitemap).toBe(true);
      expect(decision.robots).toBe("index, follow, max-snippet:-1, max-image-preview:large");
      expect(decision.missingRequirements).toEqual([]);
      expect(decision.manualReviewRequirements).toEqual([]);
    }
  });

  it("keeps existing mortgage calculator outputs unchanged", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
  });
});
