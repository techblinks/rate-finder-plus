/**
 * Generates dist/sitemap.xml from the canonical route manifest. Runs after
 * vite build so every route in src/data/routes.ts is included automatically —
 * homepage, calculator hubs, and each state-level (city/region) page.
 *
 * Priority heuristic:
 *   /                         → 1.0
 *   top-level calculators     → 0.9
 *   nested state pages        → 0.7
 *   marketing/legal pages     → 0.5
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://calcy.com.au";

const { ROUTES } = await import(
  pathToFileURL(join(__dirname, "routes.generated.mjs")).href
);

const LEGAL = new Set(["/about", "/privacy-policy", "/terms-of-use"]);

function priorityFor(route) {
  if (route.canonical === "/") return "1.0";
  if (LEGAL.has(route.canonical)) return "0.5";
  const depth = route.canonical.split("/").filter(Boolean).length;
  if (route.isCalculator && depth === 1) return "0.9";
  if (route.isCalculator && depth >= 2) return "0.7";
  return "0.6";
}

function changefreqFor(route) {
  if (route.canonical === "/") return "weekly";
  if (LEGAL.has(route.canonical)) return "yearly";
  return "monthly";
}

const today = new Date().toISOString().slice(0, 10);

const urls = ROUTES.map((r) => {
  const loc = `${SITE}${r.canonical}`;
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${changefreqFor(r)}</changefreq><priority>${priorityFor(r)}</priority></url>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(DIST, "sitemap.xml"), xml, "utf8");
console.log(`[sitemap] Wrote ${ROUTES.length} URLs to dist/sitemap.xml`);
