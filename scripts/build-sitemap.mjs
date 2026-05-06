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

const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  join(DIST, "sitemap.xml"),
  buildSitemap({ routes: ROUTES, site: SITE, lastmod: today, indexingEnabled: true }),
  "utf8",
);
console.log(`[sitemap] Wrote ${ROUTES.length} URLs to dist/sitemap.xml`);

writeFileSync(
  join(DIST, "robots.txt"),
  buildRobots({ settings: { indexing_enabled: true, robots_txt: null }, site: SITE }),
  "utf8",
);
console.log(`[robots] Wrote dist/robots.txt`);
