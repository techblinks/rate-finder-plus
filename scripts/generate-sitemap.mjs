// Build-time sitemap generator. Emits dist/sitemap.xml listing every prerendered
// route. Pairs with scripts/prerender.mjs — both must enumerate the same set.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { citiesByCountry } from "../src/data/cities.data.js";
import { countries, allCalculatorTypes } from "./data.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST = path.resolve(__dirname, "..", "dist");
const SITE = "https://zunecalculator.com";
const today = new Date().toISOString().slice(0, 10);

const CITY_CALCS = ["mortgage-calculator", "loan-calculator", "interest-calculator"];
const PRIMARY = new Set([
  "mortgage-calculator",
  "borrowing-power-calculator",
  "stamp-duty-calculator",
  "extra-repayments-calculator",
  "mortgage-insurance-calculator",
  "loan-comparison-calculator",
]);

function entries() {
  const list = [{ loc: `${SITE}/`, priority: 1.0, changefreq: "weekly" }];
  for (const code of Object.keys(countries)) {
    list.push({ loc: `${SITE}/${code}`, priority: 0.9, changefreq: "weekly" });
    for (const calc of allCalculatorTypes) {
      list.push({
        loc: `${SITE}/${code}/${calc}`,
        priority: PRIMARY.has(calc) ? 0.85 : 0.7,
        changefreq: "weekly",
      });
    }
    const cities = citiesByCountry[code] ?? [];
    for (const calc of CITY_CALCS) {
      for (const city of cities) {
        list.push({
          loc: `${SITE}/${code}/${calc}-${city.slug}`,
          priority: 0.6,
          changefreq: "monthly",
        });
      }
    }
  }
  return list;
}

function buildXml(urls) {
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(2)}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  try {
    await fs.access(DIST);
  } catch {
    console.warn("[sitemap] dist/ not found — did vite build run? Skipping.");
    return;
  }
  const urls = entries();
  const xml = buildXml(urls);
  await fs.writeFile(path.join(DIST, "sitemap.xml"), xml, "utf8");
  console.log(`[sitemap] wrote ${urls.length} URLs to dist/sitemap.xml`);
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exit(1);
});
