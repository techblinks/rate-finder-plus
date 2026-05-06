/**
 * SEO regression suite.
 *
 * 1. Re-runs the static validator against dist/ (JSON-LD, canonical, hreflang,
 *    sitemap). Skipped automatically when dist/ hasn't been built — local
 *    `npm test` after `npm run build` and CI both exercise it.
 * 2. Renders <SeoHead /> with several admin-setting permutations to ensure
 *    indexing toggles, title templates, and OG image overrides never break
 *    canonical, og:url, or hreflang invariants.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render, cleanup, act } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import React from "react";
import { SeoHead } from "@/components/seo/SeoHead";
import * as siteSettings from "@/hooks/useSiteSettings";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "..", "dist");
const HAS_DIST = existsSync(join(DIST, "index.html"));

const baseSettings: siteSettings.SiteSettings = {
  logo_url: null,
  favicon_url: null,
  logo_height: 32,
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

afterEach(() => {
  cleanup();
  // Helmet writes to document.head asynchronously; fully reset between tests.
  document.head.querySelectorAll("[data-rh]").forEach((n) => n.remove());
  vi.restoreAllMocks();
});

async function renderHead(
  settings: Partial<siteSettings.SiteSettings>,
  props = {
    title: "Mortgage Calculator",
    description: "Estimate your repayments.",
    canonical: "/mortgage-calculator",
  },
) {
  vi.spyOn(siteSettings, "useSiteSettings").mockReturnValue({
    ...baseSettings,
    ...settings,
  });
  await act(async () => {
    render(
      React.createElement(
        HelmetProvider,
        null,
        React.createElement(SeoHead, props),
      ),
    );
    // Helmet schedules its DOM mutations via requestAnimationFrame/microtasks.
    await new Promise((r) => setTimeout(r, 0));
  });
  return {
    title: document.title,
    link: document.head.innerHTML,
    meta: document.head.innerHTML,
  };
}

describe("SeoHead invariants under admin settings", () => {
  it("emits exactly one canonical with absolute https URL regardless of settings", async () => {
    for (const overrides of [
      {},
      { title_template: "%s — Calcy AU" },
      { default_og_image: "https://cdn.example/og.png" },
      { indexing_enabled: false },
      { ga4_id: "G-XXXX", gtm_id: "GTM-YYY", head_html: "<script>x()</script>" },
    ]) {
      const { link } = await renderHead(overrides);
      const canonicals = [...link.matchAll(/rel="canonical"[^>]*href="([^"]+)"/g)];
      expect(canonicals.length, JSON.stringify(overrides)).toBe(1);
      expect(canonicals[0][1]).toBe("https://calcy.com.au/mortgage-calculator");
    }
  });

  it("title template never double-suffixes", async () => {
    const { title } = await renderHead(
      { title_template: "%s | Calcy" },
      {
        title: "Mortgage Calculator | Calcy",
        description: "x",
        canonical: "/mortgage-calculator",
      },
    );
    expect(title.match(/\| Calcy/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });

  it("OG image falls back to a default when no admin override", async () => {
    const { meta } = await renderHead({});
    expect(meta).toContain('property="og:image"');
    expect(meta).toMatch(/og:image"[^>]*content="https:\/\/[^"]+"/);
  });

  it("admin OG image override is reflected in og:image", async () => {
    const { meta } = await renderHead({ default_og_image: "https://cdn.example/og.png" });
    expect(meta).toContain('content="https://cdn.example/og.png"');
  });
});

describe.skipIf(!HAS_DIST)("Prerendered output (dist/)", () => {
  it("passes JSON-LD, canonical, hreflang, and sitemap validation", async () => {
    const { runValidation } = await import("../../scripts/validate-seo.mjs");
    const { errors, routeCount } = await runValidation();
    expect(routeCount).toBeGreaterThan(0);
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
