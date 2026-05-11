/**
 * City-page SEO validation.
 * Confirms each city guide has:
 *  - keyword-focused H1 containing the city name
 *  - meta description between 150 and 160 characters (inclusive bounds with
 *    a tolerated band 140-170 reported as warnings)
 *  - valid FAQPage + BreadcrumbList JSON-LD blocks
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

async function loadCityGuides() {
  const mod = await import(
    "file://" + join(__dirname, "..", "dist-route-manifest.mjs").replace(/\\/g, "/")
  ).catch(() => null);
  if (mod?.ALL_GUIDES) return mod.ALL_GUIDES;

  // Fall back to executing the route-manifest builder output via TS-stripped read.
  // The simplest approach: re-run build-route-manifest.mjs upstream guarantees
  // dist/sitemap.xml lists every guide. So we discover from sitemap.
  const sitemap = readFileSync(join(DIST, "sitemap-static.xml"), "utf8");
  const slugs = [...sitemap.matchAll(/<loc>https:\/\/calcy\.com\.au\/guides\/([a-z0-9-]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((s) => /^(mortgage|lmi|stamp-duty)-calculator-/.test(s));
  return slugs.map((slug) => ({ slug }));
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function extractCityName(slug) {
  // mortgage-calculator-mornington-peninsula -> "mornington peninsula"
  const stripped = slug.replace(/^(mortgage|lmi|stamp-duty)-calculator-/, "");
  return stripped.replace(/-/g, " ");
}

const errors = [];
const warnings = [];
const fail = (slug, msg) => errors.push(`[${slug}] ${msg}`);
const warn = (slug, msg) => warnings.push(`[${slug}] ${msg}`);

const guides = await loadCityGuides();
let checked = 0;

for (const g of guides) {
  const file = join(DIST, "guides", `${g.slug}.html`);
  if (!existsSync(file)) {
    fail(g.slug, `missing prerendered file ${file}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  checked++;

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    fail(g.slug, "missing <h1>");
  } else {
    const h1 = decodeEntities(h1Match[1].replace(/<[^>]+>/g, "").trim());
    const city = extractCityName(g.slug).toLowerCase();
    if (!h1.toLowerCase().includes(city)) {
      fail(g.slug, `H1 missing city "${city}": "${h1}"`);
    }
    const topicKw = g.slug.startsWith("mortgage")
      ? "mortgage"
      : g.slug.startsWith("lmi")
        ? "lmi"
        : "stamp duty";
    if (!h1.toLowerCase().includes(topicKw)) {
      fail(g.slug, `H1 missing topic "${topicKw}": "${h1}"`);
    }
    if (h1.length < 30 || h1.length > 90) {
      warn(g.slug, `H1 length ${h1.length} chars (target 30-90)`);
    }
  }

  // Multiple H1 check
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count > 1) fail(g.slug, `multiple <h1> tags (${h1Count})`);

  // Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!descMatch) {
    fail(g.slug, "missing meta description");
  } else {
    const desc = decodeEntities(descMatch[1]);
    const len = desc.length;
    if (len < 140 || len > 170) {
      fail(g.slug, `meta description ${len} chars (must be 140-170)`);
    } else if (len < 150 || len > 160) {
      warn(g.slug, `meta description ${len} chars (target 150-160)`);
    }
  }

  // JSON-LD
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch (e) {
      fail(g.slug, `invalid JSON-LD: ${e.message}`);
    }
  }
  const types = blocks.map((b) => b["@type"]);
  if (!types.includes("FAQPage")) fail(g.slug, "missing FAQPage JSON-LD");
  if (!types.includes("BreadcrumbList")) fail(g.slug, "missing BreadcrumbList JSON-LD");
  if (!types.includes("Article")) warn(g.slug, "missing Article JSON-LD");

  const faq = blocks.find((b) => b["@type"] === "FAQPage");
  if (faq) {
    const items = Array.isArray(faq.mainEntity) ? faq.mainEntity : [];
    if (items.length < 1) fail(g.slug, "FAQPage has no questions");
    for (const q of items) {
      if (q["@type"] !== "Question") fail(g.slug, "FAQ item not @type Question");
      if (!q.acceptedAnswer?.text) fail(g.slug, "FAQ Question missing acceptedAnswer.text");
    }
  }

  const bc = blocks.find((b) => b["@type"] === "BreadcrumbList");
  if (bc) {
    const items = Array.isArray(bc.itemListElement) ? bc.itemListElement : [];
    if (items.length < 2) fail(g.slug, `BreadcrumbList has only ${items.length} item(s)`);
    items.forEach((it, i) => {
      if (it["@type"] !== "ListItem") fail(g.slug, `Breadcrumb #${i + 1} not ListItem`);
      if (it.position !== i + 1) fail(g.slug, `Breadcrumb #${i + 1} bad position ${it.position}`);
      if (!it.item || typeof it.item !== "string" || !it.item.startsWith("https://")) {
        fail(g.slug, `Breadcrumb #${i + 1} item not absolute https URL`);
      }
    });
  }
}

const out = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length}):`);
  for (const l of list.slice(0, 50)) console.log("  " + l);
  if (list.length > 50) console.log(`  …and ${list.length - 50} more`);
};

console.log(`[validate-city-seo] Checked ${checked} city guide pages`);
out("WARNINGS", warnings);
out("ERRORS", errors);

if (errors.length) {
  console.error(`\n[validate-city-seo] FAILED with ${errors.length} error(s)`);
  process.exit(1);
}
console.log("[validate-city-seo] OK");
