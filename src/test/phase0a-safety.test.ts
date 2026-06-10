import { describe, expect, it, beforeEach } from "vitest";
import { CALCULATE_SEO_POLICY, FINANCE_FACTS_REGISTRY } from "@/data/financeFactsRegistry";
import { ROUTES } from "@/data/routes";
import { jsonLdTypeExists, sanitiseArticleHtml } from "@/lib/safeHtml";

describe("Phase 0A article HTML guardrails", () => {
  it("removes scripts, event handlers, and unsafe URLs from admin-authored article HTML", () => {
    const input = `
      <h2 onclick="alert(1)">Heading</h2>
      <p>Safe <strong>copy</strong></p>
      <script>alert("xss")</script>
      <a href="javascript:alert(1)" onmouseover="alert(2)">bad link</a>
      <iframe src="https://example.com"></iframe>
    `;

    const output = sanitiseArticleHtml(input);

    expect(output).toContain("<h2>Heading</h2>");
    expect(output).toContain("<strong>copy</strong>");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("onclick");
    expect(output).not.toContain("onmouseover");
    expect(output).not.toContain("javascript:");
    expect(output).not.toContain("<iframe");
  });
});

describe("Phase 0A JSON-LD guardrails", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("detects prerendered JSON-LD blocks so hydration can avoid duplicates", () => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [],
    });
    document.head.appendChild(script);

    expect(jsonLdTypeExists("FAQPage")).toBe(true);
    expect(jsonLdTypeExists("Article")).toBe(false);
  });
});

describe("Phase 0A /calculate/* SEO policy", () => {
  it("documents that DB-backed /calculate/* pages are not bulk-added to the static sitemap route manifest", () => {
    expect(CALCULATE_SEO_POLICY.routePattern).toBe("/calculate/*");
    expect(CALCULATE_SEO_POLICY.safestPolicy).toContain("Do not bulk-add");
    expect(ROUTES.some((route) => route.canonical.startsWith("/calculate/"))).toBe(false);
  });
});

describe("Phase 0A finance facts registry", () => {
  it("tracks duplicated finance facts before a source-of-truth migration", () => {
    const keys = FINANCE_FACTS_REGISTRY.map((item) => item.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "rba_cash_rate",
        "apra_serviceability_buffer",
        "hecs_help_thresholds",
        "stamp_duty_thresholds",
        "fhog_grants",
        "lmi_assumptions",
      ]),
    );
  });
});
