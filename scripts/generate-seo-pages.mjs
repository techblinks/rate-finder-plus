#!/usr/bin/env node
// Scaffolds empty content JSON override files for SEO pages so editors can
// drop in hand-curated copy without regenerating from the template each time.
//
// Usage:
//   node scripts/generate-seo-pages.mjs              # all pages
//   node scripts/generate-seo-pages.mjs --country=au # filter by country
//   node scripts/generate-seo-pages.mjs --type=mortgage

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seoPages } from "../src/data/seo/seoPages.data.js";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const CONTENT_DIR = path.join(ROOT, "src/data/seo/content");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

async function main() {
  let written = 0, skipped = 0;
  for (const p of seoPages) {
    if (args.country && p.country !== args.country) continue;
    if (args.type && p.type !== args.type) continue;
    const dir = path.join(CONTENT_DIR, p.type);
    const file = path.join(dir, `${p.slug}.json`);
    try {
      await fs.access(file);
      skipped++;
      continue;
    } catch {}
    await fs.mkdir(dir, { recursive: true });
    const stub = {
      _note: "Override fields you want to hand-curate. Anything omitted falls back to the deterministic generator.",
      title: "",
      metaDescription: "",
      h1: "",
    };
    await fs.writeFile(file, JSON.stringify(stub, null, 2) + "\n", "utf8");
    written++;
  }
  console.log(`[seo-scaffold] wrote ${written} stub files, skipped ${skipped} existing.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
