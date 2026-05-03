// Build-time prerender: walks every SEO-worthy route and emits a static HTML
// file containing real metadata, headings, intro copy, local insights, FAQ, and
// JSON-LD so crawlers see fully-rendered content without executing JavaScript.
//
// Run via `postbuild` after `vite build`. The React SPA still hydrates on top
// of the same DOM and replaces the prerender slot at runtime — see main.tsx.
//
// Pure Node ESM, no extra deps.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { citiesByCountry } from "../src/data/cities.data.js";
import { countries, allCalculatorTypes, calculatorMeta } from "./data.mjs";
import { seoPages } from "../src/data/seo/seoPages.data.js";
import { generateContent as generateSeoContent } from "./seo-content.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://zunecalculator.com";
const YEAR = new Date().getFullYear();

const CITY_CALCS = ["mortgage-calculator", "loan-calculator", "interest-calculator"];

// ---- HTML helpers --------------------------------------------------------

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeJson = (s) => String(s ?? "").replace(/</g, "\\u003c");

const fmt = (n) => Number(n).toLocaleString("en-US");

// ---- Route enumeration (mirror of src/lib/seo/staticRoutes.ts) -----------

function enumerateRoutes() {
  const routes = [{ path: "/", kind: "home" }];
  for (const code of Object.keys(countries)) {
    routes.push({ path: `/${code}`, kind: "country", country: code });
    for (const calc of allCalculatorTypes) {
      routes.push({ path: `/${code}/${calc}`, kind: "calculator", country: code, calc });
    }
    const cities = citiesByCountry[code] ?? [];
    for (const calc of CITY_CALCS) {
      for (const city of cities) {
        routes.push({
          path: `/${code}/${calc}-${city.slug}`,
          kind: "city-calculator",
          country: code,
          calc,
          city,
        });
      }
    }
  }
  // Programmatic SEO pages.
  for (const p of seoPages) {
    if (!p.enabled) continue;
    const country = countries[p.country];
    if (!country) continue;
    const city = p.citySlug ? (citiesByCountry[p.country] ?? []).find((c) => c.slug === p.citySlug) : null;
    routes.push({ path: `/seo/${p.slug}`, kind: "seo", country: p.country, seo: p, city });
  }
  return routes;
}

// ---- Content generators (mirror of src/data/cities.ts) -------------------

function cityContent(city, country, calc) {
  const sym = country.currencySymbol;
  const calcName = calc === "mortgage-calculator" ? "Mortgage" : calc === "loan-calculator" ? "Loan" : "Interest";
  return {
    h1: `${city.name} ${calcName} Calculator ${YEAR} — ${country.name}`,
    intro: `Calculate your ${calcName.toLowerCase()} payments for ${city.name}, ${city.state || country.name}. With a median home price of ${sym}${fmt(city.medianHomePrice)} and average rates around ${city.avgMortgageRate}%, our free calculator helps ${city.name} residents and buyers make informed financial decisions. ${city.name} has a population of ${city.population} and is known for ${city.highlights[0].toLowerCase()}.`,
    localInsights: `The ${city.name} real estate market in ${YEAR} is shaped by several key factors. ${city.highlights.map((h) => h + ".").join(" ")} Average mortgage rates in ${city.name} sit around ${city.avgMortgageRate}%, while the median property price is ${sym}${fmt(city.medianHomePrice)}. Monthly rent averages ${sym}${fmt(city.avgRent)}, making the rent-vs-buy calculation particularly relevant for ${city.name} residents.`,
    tips: [
      `Research ${city.name} neighborhoods carefully — prices can vary 30–50% between areas.`,
      `Get pre-approved before house hunting in ${city.name}'s competitive market.`,
      `Factor in ${city.state ? `${city.state} ` : ""}property taxes and insurance when budgeting.`,
      `Consider commute and transit options — they directly impact property values in ${city.name}.`,
      `Work with a local ${city.name} real estate agent who knows micro-market trends.`,
    ],
  };
}

function cityFaqs(city, country, calc) {
  const sym = country.currencySymbol;
  const base = [
    { question: `What is the average home price in ${city.name} in ${YEAR}?`, answer: `The median home price in ${city.name} is approximately ${sym}${fmt(city.medianHomePrice)} as of ${YEAR}. Prices vary significantly by neighborhood, property type, and condition.` },
    { question: `What mortgage rate can I expect in ${city.name}?`, answer: `Average mortgage rates in ${city.name} are around ${city.avgMortgageRate}% for a standard fixed-rate mortgage. Your actual rate depends on your credit score, down payment, and lender.` },
    { question: `Is it cheaper to rent or buy in ${city.name}?`, answer: `Average rent in ${city.name} is ${sym}${fmt(city.avgRent)}/month. With a median home price of ${sym}${fmt(city.medianHomePrice)}, the buy-vs-rent decision depends on your timeline, savings, and local market conditions.` },
    { question: `How much down payment do I need to buy a home in ${city.name}?`, answer: `Most lenders require 5–20% down. On a ${sym}${fmt(city.medianHomePrice)} home in ${city.name}, that's ${sym}${fmt(Math.round(city.medianHomePrice * 0.05))} to ${sym}${fmt(Math.round(city.medianHomePrice * 0.2))}.` },
    { question: `What are the property market trends in ${city.name}?`, answer: `${city.name} (population ${city.population}) has seen ${city.highlights[0].toLowerCase()}. Key factors include ${city.highlights.slice(1).join(" and ").toLowerCase()}.` },
    { question: `How do I calculate my monthly mortgage payment in ${city.name}?`, answer: `Use our free ${city.name} mortgage calculator above. Enter the home price (avg ${sym}${fmt(city.medianHomePrice)}), your down payment, interest rate (avg ${city.avgMortgageRate}%), and loan term to get an instant estimate.` },
  ];
  if (calc === "loan-calculator") {
    base[5] = { question: `What are typical personal loan rates in ${city.name}?`, answer: `Personal loan rates in ${city.name} typically range from 6% to 15% depending on your credit profile. Use our calculator to estimate payments at different rates.` };
  } else if (calc === "interest-calculator") {
    base[5] = { question: `What savings rates are available in ${city.name}?`, answer: `High-yield savings accounts in ${city.name} currently offer 4–5% APY. Use our interest calculator to project growth on your savings over time.` };
  }
  return base;
}

// ---- Per-route SEO blob --------------------------------------------------

function seoFor(route) {
  const { kind, country: cc, calc, city } = route;
  const country = cc ? countries[cc] : null;
  const meta = calc ? calculatorMeta[calc] : null;
  const canonical = `${SITE}${route.path === "/" ? "/" : route.path}`;

  if (kind === "home") {
    return {
      title: `Zune Calculator — Free Mortgage, Loan & Interest Calculators ${YEAR}`,
      description: `Free, bank-grade financial calculators for the US, Australia, Canada and the UK. Calculate mortgage repayments, borrowing power, stamp duty, loan costs and compound interest in seconds.`,
      canonical,
      h1: `Zune Calculator — Premium Financial Calculators ${YEAR}`,
      intro: `Plan smarter with free, accurate financial calculators built for buyers, borrowers and savers across the United States, Australia, Canada and the United Kingdom. Pick your country to access localised mortgage, loan, borrowing power, stamp duty and interest tools.`,
      bodyExtras: "",
      faqs: [],
    };
  }

  if (kind === "country") {
    return {
      title: `${country.name} Financial Calculators ${YEAR} | Zune Calculator`,
      description: `Free ${country.name} mortgage, loan, borrowing power, stamp duty and interest calculators. Localised rates, currency and tax rules. Updated ${YEAR}.`,
      canonical,
      h1: `${country.flag} ${country.name} Financial Calculators ${YEAR}`,
      intro: `Plan your ${country.name} home loan or savings with free calculators tuned to local rates (${country.rateLabel}, currently ${country.defaultRate}%), ${country.currency} amounts and ${country.name} tax rules. Choose a calculator below to get started.`,
      bodyExtras: "",
      faqs: [],
    };
  }

  if (kind === "calculator") {
    return {
      title: `${country.name} ${meta.title} ${YEAR} | Zune Calculator`,
      description: `${meta.description} Free ${country.name} ${meta.shortTitle.toLowerCase()} calculator with localised rates and currency. Updated ${YEAR}.`,
      canonical,
      h1: `${country.flag} ${country.name} ${meta.title} ${YEAR}`,
      intro: `${meta.description} This ${country.name} edition uses ${country.currency} amounts and ${country.rateLabel.toLowerCase()} defaults (currently around ${country.defaultRate}%) so the figures match what you'll see from local lenders.`,
      bodyExtras: "",
      faqs: [],
    };
  }

  // city-calculator
  if (kind === "city-calculator") {
    const content = cityContent(city, country, calc);
    const faqs = cityFaqs(city, country, calc);
    return {
      title: `${city.name} ${meta.title} ${YEAR} | Zune Calculator`,
      description: `Free ${city.name} ${meta.shortTitle.toLowerCase()} calculator. Median home price ${country.currencySymbol}${fmt(city.medianHomePrice)}, avg rate ${city.avgMortgageRate}%. Calculate payments instantly.`,
      canonical,
      h1: `${country.flag} ${content.h1}`,
      intro: content.intro,
      bodyExtras: `
        <section class="prerender-section">
          <h2>${escapeHtml(meta.shortTitle)} Rates in ${escapeHtml(city.name)} ${YEAR}</h2>
          <p>${escapeHtml(content.localInsights)}</p>
        </section>
        <section class="prerender-section">
          <h2>${escapeHtml(city.name)} Market Highlights</h2>
          <ul>${city.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
        </section>
        <section class="prerender-section">
          <h2>Tips for ${escapeHtml(city.name)} Home Buyers</h2>
          <ul>${content.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        </section>`,
      faqs,
      city,
    };
  }

  // programmatic SEO page
  if (kind === "seo") {
    const seoPage = route.seo;
    const c = generateSeoContent(seoPage, country, route.city ?? undefined);
    const sectionsHtml = c.sections
      .map((s) => `<section class="prerender-section"><h2>${escapeHtml(s.h2)}</h2><p>${escapeHtml(s.body)}</p></section>`)
      .join("");
    const exampleHtml = `<section class="prerender-section"><h2>${escapeHtml(c.example.h2)}</h2><p>${escapeHtml(c.example.body)}</p></section>`;
    const tipsHtml = `<section class="prerender-section"><h2>Tips</h2><ul>${c.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></section>`;
    return {
      title: c.title,
      description: c.metaDescription,
      canonical,
      h1: c.h1,
      intro: c.intro,
      bodyExtras: sectionsHtml + exampleHtml + tipsHtml,
      faqs: c.faqs,
    };
  }

  return null;
}

// ---- HTML assembly -------------------------------------------------------

function jsonLdBlocks(route, seo) {
  const blocks = [];
  // BreadcrumbList
  const crumbs = [{ name: "Home", url: SITE + "/" }];
  if (route.country) crumbs.push({ name: countries[route.country].name, url: `${SITE}/${route.country}` });
  if (route.calc) crumbs.push({ name: calculatorMeta[route.calc].title, url: `${SITE}/${route.country}/${route.calc}` });
  if (route.city) crumbs.push({ name: route.city.name, url: seo.canonical });
  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  });
  // FAQPage
  if (seo.faqs && seo.faqs.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  // WebPage
  blocks.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: seo.canonical,
    inLanguage: "en",
  });
  return blocks
    .map((b) => `<script type="application/ld+json">${escapeJson(JSON.stringify(b))}</script>`)
    .join("\n    ");
}

function hreflangFor(route) {
  // Cross-link the same calculator across countries when applicable.
  if (!route.calc) return "";
  const codes = Object.keys(countries);
  return codes
    .map((code) => {
      const url = route.kind === "city-calculator"
        ? `${SITE}/${code}/${route.calc}` // cities don't always exist across countries
        : `${SITE}/${code}/${route.calc}`;
      return `<link rel="alternate" hreflang="en-${code}" href="${url}" />`;
    })
    .join("\n    ") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/us/${route.calc}" />`;
}

function buildHtml(template, route, seo) {
  const headInjection = `
    <link rel="canonical" href="${escapeHtml(seo.canonical)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonical)}" />
    ${hreflangFor(route)}
    ${jsonLdBlocks(route, seo)}`;

  const faqHtml = seo.faqs && seo.faqs.length
    ? `<section class="prerender-section">
         <h2>Frequently Asked Questions</h2>
         <dl>${seo.faqs.map((f) => `<dt>${escapeHtml(f.question)}</dt><dd>${escapeHtml(f.answer)}</dd>`).join("")}</dl>
       </section>`
    : "";

  const slotHtml = `<div id="prerender-content" hidden>
    <h1>${escapeHtml(seo.h1)}</h1>
    <p>${escapeHtml(seo.intro)}</p>
    ${seo.bodyExtras || ""}
    ${faqHtml}
  </div>`;

  let html = template;

  // Replace title.
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(seo.title)}</title>`);
  // Replace description meta.
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`
  );
  // Remove existing canonical (we inject our own).
  html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "");
  // Inject extra head + slot.
  html = html.replace("</head>", `${headInjection}\n  </head>`);
  html = html.replace(`<div id="prerender-content" hidden></div>`, slotHtml);

  return html;
}

// ---- Main ----------------------------------------------------------------

async function main() {
  const templatePath = path.join(DIST, "index.html");
  let template;
  try {
    template = await fs.readFile(templatePath, "utf8");
  } catch {
    console.warn("[prerender] dist/index.html not found — did vite build run? Skipping.");
    return;
  }

  const routes = enumerateRoutes();
  let written = 0;

  for (const route of routes) {
    const seo = seoFor(route);
    const html = buildHtml(template, route, seo);

    // Output path: route "/" -> dist/index.html (overwrite),
    // others -> dist/<path>/index.html
    const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
    const outFile = path.join(outDir, "index.html");
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, html, "utf8");
    written += 1;
  }

  console.log(`[prerender] wrote ${written} HTML files (${routes.filter(r => r.kind === "city-calculator").length} city pages).`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
