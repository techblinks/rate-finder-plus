/**
 * Sitemap + robots.txt regression suite.
 *
 * Re-derives robots.txt and sitemap.xml from the route manifest under a
 * matrix of admin SiteSettings permutations (indexing toggle, custom
 * robots_txt override) and asserts:
 *   - Every route from src/data/routes.ts (homepage, calculator hubs, every
 *     state/city page) appears in sitemap.xml exactly once with absolute
 *     https URL, valid <changefreq> and <priority>.
 *   - robots.txt always references the sitemap (when indexing enabled),
 *     blocks /admin, and respects site-wide noindex.
 *   - Custom robots_txt admin override is emitted verbatim.
 *   - Sitemap is empty (but still well-formed XML) when indexing is off.
 */
import { buildSitemap, buildRobots, priorityFor, changefreqFor } from "../../scripts/lib/sitemapRobots.mjs";
import { describe, it, expect } from "vitest";
import { ROUTES, SITE } from "@/data/routes";
import type { SiteSettings } from "@/hooks/useSiteSettings";

const LASTMOD = "2026-05-06";

const baseSettings = {
  indexing_enabled: true,
  robots_txt: null,
} as Pick<SiteSettings, "indexing_enabled" | "robots_txt">;

describe("sitemap.xml — every route accounted for", () => {
  const xml = buildSitemap({
    routes: ROUTES,
    site: SITE,
    lastmod: LASTMOD,
    indexingEnabled: true,
  });

  it("is valid XML with urlset wrapper", () => {
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("</urlset>");
  });

  it.each(ROUTES.map((r) => [r.canonical] as const))(
    "contains route %s exactly once with absolute https loc",
    (canonical) => {
      const loc = `${SITE}${canonical}`;
      const matches = [...xml.matchAll(new RegExp(`<loc>${loc.replace(/\//g, "\\/")}</loc>`, "g"))];
      expect(matches.length).toBe(1);
      expect(loc.startsWith("https://")).toBe(true);
    },
  );

  it("emits a valid changefreq + priority for each route", () => {
    for (const r of ROUTES) {
      const cf = changefreqFor(r);
      const pr = priorityFor(r);
      expect(["weekly", "monthly", "yearly"]).toContain(cf);
      expect(Number(pr)).toBeGreaterThanOrEqual(0);
      expect(Number(pr)).toBeLessThanOrEqual(1);
      expect(xml).toContain(`<changefreq>${cf}</changefreq>`);
      expect(xml).toContain(`<priority>${pr}</priority>`);
    }
  });

  it("homepage gets priority 1.0", () => {
    expect(priorityFor({ canonical: "/", isCalculator: false } as never)).toBe("1.0");
  });

  it("state/city stamp-duty pages get priority 0.7 and monthly changefreq", () => {
    const states = ROUTES.filter((r) => r.canonical.startsWith("/stamp-duty-calculator/"));
    expect(states.length).toBeGreaterThanOrEqual(8);
    for (const s of states) {
      expect(priorityFor(s)).toBe("0.7");
      expect(changefreqFor(s)).toBe("monthly");
    }
  });

  it("uses the lastmod passed in (deterministic, no Date.now)", () => {
    expect(xml).toContain(`<lastmod>${LASTMOD}</lastmod>`);
    const occurrences = (xml.match(/<lastmod>/g) || []).length;
    expect(occurrences).toBe(ROUTES.length);
  });

  it("contains no duplicate <loc> entries", () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs).size).toBe(locs.length);
  });
});

describe("sitemap.xml — admin indexing toggle", () => {
  it("emits no <url> entries when indexing is disabled site-wide", () => {
    const xml = buildSitemap({
      routes: ROUTES,
      site: SITE,
      lastmod: LASTMOD,
      indexingEnabled: false,
    });
    expect(xml).not.toContain("<loc>");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });
});

describe("robots.txt — derived from admin settings", () => {
  it("default (indexing on, no override) allows crawlers and points at sitemap", () => {
    const out = buildRobots({ settings: baseSettings, site: SITE });
    expect(out).toContain("User-agent: *");
    expect(out).toContain("Allow: /");
    expect(out).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(out).toContain("Disallow: /admin");
  });

  it("includes AI crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)", () => {
    const out = buildRobots({ settings: baseSettings, site: SITE });
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(out).toContain(`User-agent: ${bot}`);
    }
  });

  it("indexing disabled emits a hard Disallow: / for all bots", () => {
    const out = buildRobots({
      settings: { indexing_enabled: false, robots_txt: null },
      site: SITE,
    });
    expect(out).toContain("User-agent: *");
    expect(out).toContain("Disallow: /");
    expect(out).not.toContain("Allow: /");
    expect(out).not.toContain("Sitemap:");
  });

  it("admin custom robots_txt override is emitted verbatim", () => {
    const custom = "User-agent: BadBot\nDisallow: /\n";
    const out = buildRobots({
      settings: { indexing_enabled: true, robots_txt: custom },
      site: SITE,
    });
    expect(out.trim()).toBe(custom.trim());
    // Custom override must NOT have default lines auto-appended.
    expect(out).not.toContain("Disallow: /admin");
  });

  it("blank/whitespace robots_txt falls back to defaults", () => {
    const out = buildRobots({
      settings: { indexing_enabled: true, robots_txt: "   " },
      site: SITE,
    });
    expect(out).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});
