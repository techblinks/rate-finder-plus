// Plain-JS source of truth for the programmatic SEO registry.
// Shared by the runtime app (src/data/seo/seoPages.ts) and build-time scripts
// (prerender, sitemap, content scaffolder). Mirrors the cities.data.js pattern.
//
// Adding a row here is the ONLY thing required to ship a new SEO page:
//   1. Add an entry below.
//   2. (Optional) Drop a JSON file under src/data/seo/content/<type>/<slug>.json
//      to override the auto-generated long-form content.
//   3. Run `npm run build` — the page is prerendered + sitemapped automatically.

import { citiesByCountry } from "../cities.data.js";

/**
 * @typedef {Object} SeoPage
 * @property {string} slug                       URL slug after /seo/ (kebab-case)
 * @property {"mortgage"|"loan"|"interest"|"borrowing-power"|"stamp-duty"} type
 * @property {"au"|"us"|"ca"|"gb"} country
 * @property {string} [city]                     City display name
 * @property {string} [citySlug]                 Matching slug in cities.data.js
 * @property {string} [state]
 * @property {string} [topic]                    Non-city topical pages
 * @property {string} [topicLabel]
 * @property {boolean} enabled
 */

const TYPE_KEYWORDS = {
  mortgage: "mortgage-calculator",
  loan: "loan-calculator",
  interest: "interest-calculator",
  "borrowing-power": "borrowing-power-calculator",
  "stamp-duty": "stamp-duty-calculator",
};

// ---- Australia: city × calculator combinations (high CPC focus) ----------

const AU_CITY_TYPES = ["mortgage", "loan", "interest", "borrowing-power", "stamp-duty"];

function buildAuCityPages() {
  const out = [];
  const auCities = citiesByCountry.au ?? [];
  for (const city of auCities) {
    for (const type of AU_CITY_TYPES) {
      out.push({
        slug: `${TYPE_KEYWORDS[type]}-${city.slug}`,
        type,
        country: "au",
        city: city.name,
        citySlug: city.slug,
        state: city.state,
        enabled: true,
      });
    }
  }
  return out;
}

// ---- Australia: high-CPC topical pages -----------------------------------

const AU_TOPICS = [
  { slug: "refinance-mortgage-calculator-australia", type: "mortgage", topic: "refinance", topicLabel: "Refinance" },
  { slug: "first-home-buyer-mortgage-calculator-australia", type: "mortgage", topic: "first-home-buyer", topicLabel: "First Home Buyer" },
  { slug: "investment-property-mortgage-calculator-australia", type: "mortgage", topic: "investment-property", topicLabel: "Investment Property" },
  { slug: "interest-only-mortgage-calculator-australia", type: "mortgage", topic: "interest-only", topicLabel: "Interest Only" },
  { slug: "split-loan-mortgage-calculator-australia", type: "mortgage", topic: "split-loan", topicLabel: "Split Loan" },
  { slug: "fixed-vs-variable-mortgage-calculator-australia", type: "mortgage", topic: "fixed-vs-variable", topicLabel: "Fixed vs Variable" },
  { slug: "offset-account-mortgage-calculator-australia", type: "mortgage", topic: "offset-account", topicLabel: "Offset Account" },
  { slug: "self-employed-mortgage-calculator-australia", type: "borrowing-power", topic: "self-employed", topicLabel: "Self-Employed" },
  { slug: "low-deposit-home-loan-calculator-australia", type: "mortgage", topic: "low-deposit", topicLabel: "Low Deposit" },
  { slug: "lmi-mortgage-insurance-calculator-australia", type: "mortgage", topic: "lmi", topicLabel: "LMI" },
  { slug: "stamp-duty-calculator-nsw", type: "stamp-duty", topic: "nsw", topicLabel: "NSW Stamp Duty", state: "NSW" },
  { slug: "stamp-duty-calculator-vic", type: "stamp-duty", topic: "vic", topicLabel: "VIC Stamp Duty", state: "VIC" },
  { slug: "stamp-duty-calculator-qld", type: "stamp-duty", topic: "qld", topicLabel: "QLD Stamp Duty", state: "QLD" },
  { slug: "stamp-duty-calculator-wa", type: "stamp-duty", topic: "wa", topicLabel: "WA Stamp Duty", state: "WA" },
  { slug: "stamp-duty-calculator-sa", type: "stamp-duty", topic: "sa", topicLabel: "SA Stamp Duty", state: "SA" },
  { slug: "personal-loan-calculator-australia", type: "loan", topic: "personal-loan", topicLabel: "Personal Loan" },
  { slug: "car-loan-calculator-australia", type: "loan", topic: "car-loan", topicLabel: "Car Loan" },
  { slug: "debt-consolidation-loan-calculator-australia", type: "loan", topic: "debt-consolidation", topicLabel: "Debt Consolidation" },
  { slug: "compound-interest-calculator-australia", type: "interest", topic: "compound-interest", topicLabel: "Compound Interest" },
  { slug: "term-deposit-calculator-australia", type: "interest", topic: "term-deposit", topicLabel: "Term Deposit" },
  { slug: "savings-goal-calculator-australia", type: "interest", topic: "savings-goal", topicLabel: "Savings Goal" },
  { slug: "borrowing-power-calculator-australia", type: "borrowing-power", topic: "borrowing-power", topicLabel: "Borrowing Power" },
].map((p) => ({ ...p, country: "au", enabled: true }));

// ---- US/CA/GB seed (topic pages only — easy to scale later) --------------

const GLOBAL_TOPICS = [
  { slug: "mortgage-refinance-calculator-usa", type: "mortgage", country: "us", topic: "refinance", topicLabel: "Refinance" },
  { slug: "fha-loan-calculator-usa", type: "mortgage", country: "us", topic: "fha-loan", topicLabel: "FHA Loan" },
  { slug: "va-loan-calculator-usa", type: "mortgage", country: "us", topic: "va-loan", topicLabel: "VA Loan" },
  { slug: "jumbo-mortgage-calculator-usa", type: "mortgage", country: "us", topic: "jumbo", topicLabel: "Jumbo Mortgage" },
  { slug: "cmhc-mortgage-insurance-calculator-canada", type: "mortgage", country: "ca", topic: "cmhc", topicLabel: "CMHC Insurance" },
  { slug: "first-time-buyer-mortgage-calculator-canada", type: "mortgage", country: "ca", topic: "ftb", topicLabel: "First-Time Buyer" },
  { slug: "buy-to-let-mortgage-calculator-uk", type: "mortgage", country: "gb", topic: "btl", topicLabel: "Buy-to-Let" },
  { slug: "stamp-duty-calculator-uk", type: "stamp-duty", country: "gb", topic: "uk", topicLabel: "UK Stamp Duty" },
].map((p) => ({ ...p, enabled: true }));

export const seoPages = [
  ...buildAuCityPages(),
  ...AU_TOPICS,
  ...GLOBAL_TOPICS,
];

export const findSeoPage = (slug) => seoPages.find((p) => p.slug === slug);
