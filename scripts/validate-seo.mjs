/**
 * SEO regression validator.
 *
 * Re-validates the prerendered output (dist/) so any change — including admin
 * SEO/analytics/ad setting toggles that affect runtime injection — can be
 * checked against the same invariants Google relies on.
 *
 * Checks per page:
 *  - Exactly one canonical, absolute https URL matching expected route
 *  - JSON-LD parses, has @context + @type, required fields per schema type
 *  - BreadcrumbList: ListItem chain with position 1..N and absolute item URLs
 *  - WebApplication / Article / FAQPage / HowTo / Organization required props
 *  - hreflang: if present, every alternate is reachable in the routes manifest
 *
 * Plus sitemap.xml: well-formed, every <loc> resolves to a built file, no
 * duplicate or unknown URLs vs the routes manifest, every route appears.
 *
 * Exits non-zero on any error so CI / `npm test` fails fast.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://calcy.com.au";

const errors = [];
const warnings = [];
const fail = (page, msg) => errors.push(`[${page}] ${msg}`);
const warn = (page, msg) => warnings.push(`[${page}] ${msg}`);

function loadHtml(route) {
  const file =
    route.canonical === "/"
      ? join(DIST, "index.html")
      : join(DIST, `${route.canonical.replace(/^\//, "")}.html`);
  if (!existsSync(file)) {
    fail(route.canonical, `prerendered file missing: ${file}`);
    return null;
  }
  return readFileSync(file, "utf8");
}

function extractJsonLd(html, page) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch (e) {
      fail(page, `invalid JSON-LD: ${e.message}`);
    }
  }
  return blocks;
}

function checkCanonical(html, route) {
  const matches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)];
  if (matches.length === 0) return fail(route.canonical, "missing canonical");
  if (matches.length > 1)
    return fail(route.canonical, `duplicate canonical (${matches.length})`);
  const href = matches[0][1];
  const expected = `${SITE}${route.canonical}`;
  if (href !== expected) fail(route.canonical, `canonical ${href} ≠ ${expected}`);
  if (!href.startsWith("https://")) fail(route.canonical, "canonical not https");
}

function checkHreflang(html, route, knownCanonicals) {
  const matches = [
    ...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g),
  ];
  if (matches.length === 0) return; // single-locale site is fine
  const seen = new Set();
  for (const [, lang, href] of matches) {
    if (seen.has(lang)) fail(route.canonical, `duplicate hreflang ${lang}`);
    seen.add(lang);
    if (!href.startsWith("https://")) fail(route.canonical, `hreflang ${lang} not https`);
    const path = href.replace(SITE, "").replace(/\/[a-z]{2}\//, "/");
    if (!knownCanonicals.has(path) && path !== route.canonical)
      warn(route.canonical, `hreflang ${lang} → unknown route ${path}`);
  }
  if (!seen.has("x-default")) warn(route.canonical, "hreflang missing x-default");
}

const REQUIRED = {
  BreadcrumbList: (b, page) => {
    if (!Array.isArray(b.itemListElement) || !b.itemListElement.length)
      return fail(page, "BreadcrumbList: empty itemListElement");
    b.itemListElement.forEach((it, i) => {
      if (it.position !== i + 1)
        fail(page, `BreadcrumbList: position ${it.position} ≠ ${i + 1}`);
      if (!it.name) fail(page, "BreadcrumbList: ListItem missing name");
      if (!it.item || !it.item.startsWith("https://"))
        fail(page, "BreadcrumbList: ListItem missing absolute item URL");
    });
  },
  WebApplication: (b, page) => {
    for (const k of ["name", "description", "url", "applicationCategory", "offers"])
      if (!b[k]) fail(page, `WebApplication missing ${k}`);
  },
  FAQPage: (b, page) => {
    if (!Array.isArray(b.mainEntity) || !b.mainEntity.length)
      return fail(page, "FAQPage: empty mainEntity");
    b.mainEntity.forEach((q) => {
      if (q["@type"] !== "Question" || !q.name)
        fail(page, "FAQPage: malformed Question");
      if (!q.acceptedAnswer || !q.acceptedAnswer.text)
        fail(page, `FAQPage: Q "${q.name}" missing acceptedAnswer.text`);
    });
  },
  HowTo: (b, page) => {
    if (!b.name) fail(page, "HowTo missing name");
    if (!Array.isArray(b.step) || !b.step.length)
      return fail(page, "HowTo: empty step list");
    b.step.forEach((s, i) => {
      if (s["@type"] !== "HowToStep") fail(page, `HowTo: step ${i} wrong @type`);
      if (!s.name || !s.text) fail(page, `HowTo: step ${i} missing name/text`);
    });
  },
  Article: (b, page) => {
    for (const k of ["headline", "image", "datePublished", "author", "publisher"])
      if (!b[k]) fail(page, `Article missing ${k}`);
    if (Array.isArray(b.image) && !b.image.length) fail(page, "Article image[] empty");
  },
  Organization: (b, page) => {
    for (const k of ["name", "url"]) if (!b[k]) fail(page, `Organization missing ${k}`);
  },
};

function validateBlocks(blocks, page) {
  if (!blocks.length) return fail(page, "no JSON-LD blocks found");
  for (const b of blocks) {
    if (b["@context"] !== "https://schema.org")
      fail(page, `bad @context: ${b["@context"]}`);
    const t = b["@type"];
    if (!t) fail(page, "block missing @type");
    if (REQUIRED[t]) REQUIRED[t](b, page);
  }
}

function validateSitemap(routes) {
  const file = join(DIST, "sitemap-static.xml");
  if (!existsSync(file)) return fail("sitemap-static.xml", "missing");
  const xml = readFileSync(file, "utf8");
  if (!xml.startsWith("<?xml")) fail("sitemap-static.xml", "bad XML prolog");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const set = new Set(locs);
  if (locs.length !== set.size) fail("sitemap-static.xml", "duplicate <loc> entries");
  // Programmatic city guides live in sitemap-programmatic.xml and suburb
  // guides in sitemap-suburbs.xml. Exclude both from the static check.
  const PROGRAMMATIC_RE = /^\/guides\/(mortgage|lmi|stamp-duty)-calculator-/;
  const staticRoutes = routes.filter(
    (r) => !PROGRAMMATIC_RE.test(r.canonical) && !r.canonical.startsWith("/suburbs/"),
  );
  const expected = new Set(staticRoutes.map((r) => `${SITE}${r.canonical}`));
  for (const l of locs) {
    if (!expected.has(l)) fail("sitemap-static.xml", `unknown URL ${l}`);
    const path = l.replace(SITE, "");
    const f =
      path === "/" ? join(DIST, "index.html") : join(DIST, path.replace(/^\//, ""), "index.html");
    if (!existsSync(f) || !statSync(f).isFile())
      fail("sitemap-static.xml", `URL has no built file: ${l}`);
  }
  for (const e of expected) {
    if (!set.has(e)) fail("sitemap-static.xml", `missing route ${e}`);
  }

  // Also validate the sitemap index references both children.
  const indexFile = join(DIST, "sitemap.xml");
  if (!existsSync(indexFile)) return fail("sitemap.xml", "missing index");
  const indexXml = readFileSync(indexFile, "utf8");
  if (!indexXml.includes("<sitemapindex")) fail("sitemap.xml", "not a sitemap index");
  if (!indexXml.includes(`${SITE}/sitemap-static.xml`))
    fail("sitemap.xml", "missing sitemap-static.xml reference");
  if (!indexXml.includes(`${SITE}/sitemap-programmatic.xml`))
    fail("sitemap.xml", "missing sitemap-programmatic.xml reference");
}

export async function runValidation() {
  errors.length = 0;
  warnings.length = 0;
  const { ROUTES } = await import(
    pathToFileURL(join(__dirname, "routes.generated.mjs")).href
  );
  const known = new Set(ROUTES.map((r) => r.canonical));

  for (const route of ROUTES) {
    const html = loadHtml(route);
    if (!html) continue;
    checkCanonical(html, route);
    checkHreflang(html, route, known);
    const blocks = extractJsonLd(html, route.canonical);
    validateBlocks(blocks, route.canonical);
  }
  validateSitemap(ROUTES);

  return { errors: [...errors], warnings: [...warnings], routeCount: ROUTES.length };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const { errors: errs, warnings: warns, routeCount } = await runValidation();
  console.log(`[seo-validate] Checked ${routeCount} routes + sitemap.xml`);
  for (const w of warns) console.warn("WARN", w);
  if (errs.length) {
    for (const e of errs) console.error("FAIL", e);
    console.error(`[seo-validate] ${errs.length} error(s)`);
    process.exit(1);
  }
  console.log("[seo-validate] OK");
}
