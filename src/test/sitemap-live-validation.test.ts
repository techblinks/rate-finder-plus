/**
 * Live sitemap validation — fetches the production sitemap URLs and asserts
 * each one returns:
 *   - HTTP 200
 *   - Content-Type starting with application/xml
 *   - A well-formed XML body matching the expected root element
 *     (sitemapindex for sitemap.xml, urlset for sitemap-programmatic.xml)
 *
 * Set RUN_LIVE_SITEMAP_CHECK=1 to run; skipped by default so offline CI doesn't
 * fail on network issues. CI can opt in.
 */
import { describe, it, expect } from "vitest";

const RUN = process.env.RUN_LIVE_SITEMAP_CHECK === "1";
const SITE = "https://calcy.com.au";

interface Target {
  url: string;
  rootTag: "sitemapindex" | "urlset";
  childTag: "sitemap" | "url";
  minEntries: number;
}

const TARGETS: Target[] = [
  {
    url: `${SITE}/sitemap.xml`,
    rootTag: "sitemapindex",
    childTag: "sitemap",
    minEntries: 2, // static + programmatic
  },
  {
    url: `${SITE}/sitemap-programmatic.xml`,
    rootTag: "urlset",
    childTag: "url",
    minEntries: 1,
  },
];

async function fetchSitemap(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/xml" } });
  const body = await res.text();
  return { status: res.status, contentType: res.headers.get("content-type") ?? "", body };
}

function assertWellFormedXml(body: string) {
  expect(body.trim().startsWith("<?xml")).toBe(true);
  expect(body).toMatch(/<\?xml version="1\.0"/);
  // Tag balance: every opening tag must close.
  const opens = [...body.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s|>)/g)].map((m) => m[1]);
  const closes = [...body.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)].map((m) => m[1]);
  const counts: Record<string, number> = {};
  for (const t of opens) counts[t] = (counts[t] ?? 0) + 1;
  for (const t of closes) counts[t] = (counts[t] ?? 0) - 1;
  for (const [tag, n] of Object.entries(counts)) {
    expect(n, `tag <${tag}> is unbalanced`).toBe(0);
  }
}

describe.runIf(RUN)("live sitemap endpoints", () => {
  for (const t of TARGETS) {
    describe(t.url, () => {
      it("returns HTTP 200 with application/xml Content-Type", async () => {
        const { status, contentType } = await fetchSitemap(t.url);
        expect(status).toBe(200);
        expect(contentType.toLowerCase()).toMatch(/^application\/xml/);
      });

      it(`is well-formed XML with <${t.rootTag}> root and ≥ ${t.minEntries} <${t.childTag}> entries`, async () => {
        const { body } = await fetchSitemap(t.url);
        assertWellFormedXml(body);
        expect(body).toContain(`<${t.rootTag}`);
        expect(body).toContain(`</${t.rootTag}>`);
        expect(body).toContain(
          `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
        );
        const entryCount = (body.match(new RegExp(`<${t.childTag}>`, "g")) ?? []).length;
        expect(entryCount).toBeGreaterThanOrEqual(t.minEntries);
      });

      it("every <loc> is an absolute https://calcy.com.au URL", async () => {
        const { body } = await fetchSitemap(t.url);
        const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        expect(locs.length).toBeGreaterThan(0);
        for (const loc of locs) {
          expect(loc.startsWith("https://calcy.com.au/")).toBe(true);
        }
      });
    });
  }

  it("sitemap.xml references sitemap-programmatic.xml", async () => {
    const { body } = await fetchSitemap(`${SITE}/sitemap.xml`);
    expect(body).toContain(`${SITE}/sitemap-programmatic.xml`);
    expect(body).toContain(`${SITE}/sitemap-static.xml`);
  });
});

// When the live check is disabled (default), assert that at least the
// validator wiring itself is sound — so a refactor that breaks the test
// doesn't go unnoticed.
describe.skipIf(RUN)("sitemap validator wiring", () => {
  it("has at least two live targets configured", () => {
    expect(TARGETS.length).toBeGreaterThanOrEqual(2);
    expect(TARGETS.map((t) => t.url)).toContain(`${SITE}/sitemap.xml`);
    expect(TARGETS.map((t) => t.url)).toContain(`${SITE}/sitemap-programmatic.xml`);
  });
});
