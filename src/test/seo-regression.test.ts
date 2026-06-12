/**
 * SEO regression suite.
 *
 * 1. Asserts pure invariants of <SeoHead/>'s tag derivation under a matrix of
 *    admin setting permutations (indexing toggle, title template, OG image,
 *    analytics IDs, custom head HTML, fallback description).
 *
 * 2. Re-runs the static validator (scripts/validate-seo.mjs) against dist/ so
 *    JSON-LD, canonical, hreflang, and sitemap output are verified end-to-end
 *    after every build. Skipped when dist/ hasn't been built.
 *
 * Run with:   npm test  -- src/test/seo-regression
 *           or  npm run test:seo
 */
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveSeoTags } from "@/components/seo/SeoHead";
import { removeDuplicateCanonicalLinks } from "@/lib/seoCanonical";
import type { SiteSettings } from "@/hooks/useSiteSettings";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "..", "dist");
const HAS_DIST = existsSync(join(DIST, "index.html"));

const baseSettings: SiteSettings = {
  logo_url: null,
  favicon_url: null,
  logo_height: 32,
  logo_height_mobile: 28,
  ga4_id: null,
  gtm_id: null,
  fb_pixel_id: null,
  head_html: null,
  body_html: null,
  adsense_client: null,
  adsense_slot_header: null,
  adsense_slot_inline: null,
  adsense_slot_sidebar: null,
  adsense_slot_sticky_mobile: null,
  adsense_enabled: true,
  adsense_auto_ads: false,
  slot_header_enabled: true,
  slot_inline_enabled: true,
  slot_sidebar_enabled: true,
  slot_sticky_mobile_enabled: true,
  ads_txt: null,
  default_og_image: null,
  default_meta_description: null,
  title_template: "%s | Calcy",
  gsc_verification: null,
  bing_verification: null,
  robots_txt: null,
  indexing_enabled: true,
};

const PAGE = {
  title: "Mortgage Calculator",
  description: "Estimate your repayments.",
  canonical: "/mortgage-calculator",
};

describe("SeoHead invariants under admin settings", () => {
  const permutations: Array<[string, Partial<SiteSettings>]> = [
    ["defaults", {}],
    ["custom title template", { title_template: "%s — Calcy AU" }],
    ["empty title template falls back", { title_template: "" }],
    ["template without %s passes title through", { title_template: "Calcy" }],
    ["admin OG image", { default_og_image: "https://cdn.example/og.png" }],
    ["indexing disabled", { indexing_enabled: false }],
    [
      "analytics + custom head HTML",
      {
        ga4_id: "G-XXXX",
        gtm_id: "GTM-YYY",
        fb_pixel_id: "12345",
        head_html: "<script>noop()</script>",
      },
    ],
    ["adsense disabled", { adsense_enabled: false, slot_header_enabled: false }],
  ];

  it.each(permutations)("canonical URL is absolute https for %s", (_, overrides) => {
    const { url } = deriveSeoTags(PAGE, { ...baseSettings, ...overrides });
    expect(url).toBe("https://calcy.com.au/mortgage-calculator");
    expect(url.startsWith("https://")).toBe(true);
  });

  it("never double-suffixes a title that already matches the template", () => {
    const { finalTitle } = deriveSeoTags(
      { ...PAGE, title: "Mortgage Calculator | Calcy" },
      baseSettings,
    );
    expect(finalTitle.match(/\| Calcy/g)?.length).toBe(1);
  });

  it("applies the template when title is bare", () => {
    const { finalTitle } = deriveSeoTags(PAGE, baseSettings);
    expect(finalTitle).toBe("Mortgage Calculator | Calcy");
  });

  it("uses admin default description when page passes empty", () => {
    const { finalDescription } = deriveSeoTags(
      { ...PAGE, description: "" },
      { ...baseSettings, default_meta_description: "Calcy: free Aussie finance tools." },
    );
    expect(finalDescription).toBe("Calcy: free Aussie finance tools.");
  });

  it("page description always wins over admin default when both present", () => {
    const { finalDescription } = deriveSeoTags(PAGE, {
      ...baseSettings,
      default_meta_description: "Should not appear.",
    });
    expect(finalDescription).toBe(PAGE.description);
  });

  it("falls back to /og-image.png when no admin OG image configured", () => {
    const { ogImage } = deriveSeoTags(PAGE, baseSettings);
    expect(ogImage).toBe("https://calcy.com.au/og-image.png");
  });

  it("admin OG image override is reflected", () => {
    const { ogImage } = deriveSeoTags(PAGE, {
      ...baseSettings,
      default_og_image: "https://cdn.example/og.png",
    });
    expect(ogImage).toBe("https://cdn.example/og.png");
  });

  it("removes stale runtime canonical tags while keeping the current route canonical", () => {
    document.head.innerHTML = `
      <link rel="canonical" href="https://calcy.com.au/" />
      <link rel="canonical" href="https://calcy.com.au/mortgage-calculator" />
    `;

    const removed = removeDuplicateCanonicalLinks("https://calcy.com.au/mortgage-calculator");
    const canonicals = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];

    expect(removed).toBe(1);
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].href).toBe("https://calcy.com.au/mortgage-calculator");
  });

  it("dedupes identical runtime canonical tags", () => {
    document.head.innerHTML = `
      <link rel="canonical" href="https://calcy.com.au/" />
      <link rel="canonical" href="https://calcy.com.au/" />
    `;

    const removed = removeDuplicateCanonicalLinks("https://calcy.com.au/");
    const canonicals = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];

    expect(removed).toBe(1);
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].href).toBe("https://calcy.com.au/");
  });
});

describe.skipIf(!HAS_DIST)("Prerendered output (dist/)", () => {
  it("passes JSON-LD, canonical, hreflang, and sitemap validation", async () => {
    const { runValidation } = await import("../../scripts/validate-seo.mjs");
    const { errors, routeCount } = await runValidation();
    expect(routeCount).toBeGreaterThan(0);
    expect(errors, "SEO regression errors:\n" + errors.join("\n")).toEqual([]);
  });
});
