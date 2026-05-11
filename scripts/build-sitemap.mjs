/**
 * Generates dist/sitemap.xml and dist/robots.txt from the canonical route
 * manifest. Runs after vite build so every route in src/data/routes.ts is
 * included automatically.
 *
 * Pure builders live in scripts/lib/sitemapRobots.mjs so the same logic can
 * be unit-tested under a matrix of admin settings (see
 * src/test/sitemap-robots-regression.test.ts).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSitemap, buildRobots } from "./lib/sitemapRobots.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://calcy.com.au";

const { ROUTES } = await import(
  pathToFileURL(join(__dirname, "routes.generated.mjs")).href
);
const { CITY_GUIDES } = await import(
  pathToFileURL(join(__dirname, "cityGuides.generated.mjs")).href
);
const { SUBURB_CATALOGUE } = await import(
  pathToFileURL(join(__dirname, "suburbCatalogue.generated.mjs")).href
);

const today = new Date().toISOString().slice(0, 10);

// ---- sitemap-static.xml (editorial + base routes; 37 URLs) ----
const PROGRAMMATIC_RE = /^\/guides\/(mortgage|lmi|stamp-duty)-calculator-/;
const STATIC_ROUTES = ROUTES.filter((r) => !PROGRAMMATIC_RE.test(r.canonical));
writeFileSync(
  join(DIST, "sitemap-static.xml"),
  buildSitemap({ routes: STATIC_ROUTES, site: SITE, lastmod: today, indexingEnabled: true }),
  "utf8",
);
console.log(`[sitemap] Wrote ${STATIC_ROUTES.length} URLs to dist/sitemap-static.xml`);

// ---- sitemap-programmatic.xml (150 city × calculator URLs) ----
// Mirrors the URL shape, priority, and changefreq previously emitted by the
// sitemap-programmatic edge function. CITY_GUIDES already contains one entry
// per city × topic; we just translate slug → /guides/<slug>.
const programmaticEntries = CITY_GUIDES.map(
  (g) =>
    `  <url><loc>${SITE}/guides/${g.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
).join("\n");
const programmaticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${programmaticEntries}
</urlset>
`;
writeFileSync(join(DIST, "sitemap-programmatic.xml"), programmaticXml, "utf8");
console.log(`[sitemap] Wrote ${CITY_GUIDES.length} URLs to dist/sitemap-programmatic.xml`);

// ---- sitemap-suburbs.xml (200 suburbs × 3 topics = 600 URLs) ----
const SUBURB_TOPICS = ["mortgage-calculator", "lmi-calculator", "stamp-duty-calculator"];
const suburbEntries = SUBURB_CATALOGUE.flatMap((s) =>
  SUBURB_TOPICS.map(
    (topic) =>
      `  <url><loc>${SITE}/suburbs/${topic}-${s.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
  ),
).join("\n");
const suburbXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${suburbEntries}
</urlset>
`;
writeFileSync(join(DIST, "sitemap-suburbs.xml"), suburbXml, "utf8");
console.log(
  `[sitemap] Wrote ${SUBURB_CATALOGUE.length * SUBURB_TOPICS.length} URLs to dist/sitemap-suburbs.xml`,
);

// ---- sitemap.xml (index with 3 children) ----
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-programmatic.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-suburbs.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
writeFileSync(join(DIST, "sitemap.xml"), indexXml, "utf8");
console.log(`[sitemap] Wrote sitemap index to dist/sitemap.xml`);

writeFileSync(
  join(DIST, "robots.txt"),
  buildRobots({ settings: { indexing_enabled: true, robots_txt: null }, site: SITE }),
  "utf8",
);
console.log(`[robots] Wrote dist/robots.txt`);

