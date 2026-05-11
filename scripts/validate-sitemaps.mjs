#!/usr/bin/env node
/**
 * Live sitemap validator.
 *
 * Usage:
 *   node scripts/validate-sitemaps.mjs                          # default targets
 *   SITE=https://calcy.com.au node scripts/validate-sitemaps.mjs
 *
 * For each target URL it asserts:
 *   1. HTTP 200
 *   2. Content-Type starts with application/xml
 *   3. Body starts with <?xml and contains the expected root element
 *   4. XML tag balance is correct
 *   5. Every <loc> entry is an absolute https://<site> URL
 *
 * Exits with code 1 on any failure — safe to run in CI.
 */
const SITE = process.env.SITE ?? "https://calcy.com.au";

const TARGETS = [
  {
    url: `${SITE}/sitemap.xml`,
    rootTag: "sitemapindex",
    childTag: "sitemap",
    minEntries: 2,
  },
  {
    url: `${SITE}/sitemap-programmatic.xml`,
    rootTag: "urlset",
    childTag: "url",
    minEntries: 1,
  },
];

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
let failures = 0;

function pass(label) {
  console.log(`  ${GREEN}✓${RESET} ${label}`);
}
function fail(label, detail) {
  failures++;
  console.log(`  ${RED}✗${RESET} ${label}`);
  if (detail) console.log(`    ${DIM}${detail}${RESET}`);
}

function checkTagBalance(body) {
  const opens = [...body.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>/g)].map((m) => m[1]);
  const closes = [...body.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)].map((m) => m[1]);
  const counts = {};
  for (const t of opens) counts[t] = (counts[t] ?? 0) + 1;
  for (const t of closes) counts[t] = (counts[t] ?? 0) - 1;
  const unbalanced = Object.entries(counts).filter(([, n]) => n !== 0);
  return unbalanced;
}

async function validate({ url, rootTag, childTag, minEntries }) {
  console.log(`\n${url}`);
  let res, body;
  try {
    res = await fetch(url, { headers: { Accept: "application/xml" } });
    body = await res.text();
  } catch (e) {
    fail("fetch", e.message);
    return;
  }

  res.status === 200 ? pass(`HTTP 200`) : fail(`HTTP status`, `got ${res.status}`);

  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  ct.startsWith("application/xml")
    ? pass(`Content-Type: ${ct}`)
    : fail(`Content-Type`, `expected application/xml, got "${ct}"`);

  body.trim().startsWith("<?xml")
    ? pass("XML prolog present")
    : fail("XML prolog", `body starts with "${body.slice(0, 40)}…"`);

  body.includes(`<${rootTag}`) && body.includes(`</${rootTag}>`)
    ? pass(`<${rootTag}> root element`)
    : fail(`<${rootTag}> root element`, "missing open or close tag");

  body.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    ? pass("sitemaps.org namespace")
    : fail("sitemaps.org namespace", "xmlns attribute missing");

  const entryCount = (body.match(new RegExp(`<${childTag}>`, "g")) ?? []).length;
  entryCount >= minEntries
    ? pass(`${entryCount} <${childTag}> entries (≥ ${minEntries})`)
    : fail(`<${childTag}> entry count`, `got ${entryCount}, need ≥ ${minEntries}`);

  const unbalanced = checkTagBalance(body);
  unbalanced.length === 0
    ? pass("XML tag balance")
    : fail("XML tag balance", `unbalanced: ${unbalanced.map(([t, n]) => `${t}=${n}`).join(", ")}`);

  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) {
    fail("<loc> entries", "no <loc> tags found");
  } else {
    const bad = locs.filter((l) => !l.startsWith(`${SITE}/`));
    bad.length === 0
      ? pass(`${locs.length} absolute <loc> URLs`)
      : fail("absolute <loc> URLs", `non-canonical: ${bad.slice(0, 3).join(", ")}`);
  }
}

console.log(`Sitemap validation — ${SITE}`);
for (const t of TARGETS) await validate(t);

// Extra cross-check: index references both children
console.log(`\nCross-check: sitemap.xml references both children`);
try {
  const res = await fetch(`${SITE}/sitemap.xml`);
  const body = await res.text();
  body.includes(`${SITE}/sitemap-static.xml`)
    ? pass("references sitemap-static.xml")
    : fail("references sitemap-static.xml");
  body.includes(`${SITE}/sitemap-programmatic.xml`)
    ? pass("references sitemap-programmatic.xml")
    : fail("references sitemap-programmatic.xml");
} catch (e) {
  fail("cross-check fetch", e.message);
}

if (failures > 0) {
  console.log(`\n${RED}✗ ${failures} check(s) failed${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}✓ All sitemap checks passed${RESET}`);
}
