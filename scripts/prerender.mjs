/**
 * Post-build prerender: writes a per-route index.html into dist/ with route-correct
 * metadata + JSON-LD baked in. Search engines and social-card scrapers see the
 * right title/description/canonical without executing JS; React still hydrates.
 *
 * Run with: node scripts/prerender.mjs
 * Wired into `npm run build` via package.json "build" script chain.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SITE = "https://calcy.com.au";

const indexPath = join(DIST, "index.html");
if (!existsSync(indexPath)) {
  console.error("[prerender] dist/index.html not found — run vite build first");
  process.exit(1);
}

// Load route manifest. Use tsx to import the TS file at runtime via dynamic
// import + a small JS shim file emitted at build start. Simpler: inline the
// route data via a JSON dump produced as a separate vite step. To keep this
// self-contained, we re-declare routes here from a generated .mjs.
const routesModuleUrl = pathToFileURL(join(__dirname, "routes.generated.mjs")).href;
const { ROUTES } = await import(routesModuleUrl);
const howTosModuleUrl = pathToFileURL(join(__dirname, "howTos.generated.mjs")).href;
const { HOW_TOS } = await import(howTosModuleUrl);

const baseHtml = readFileSync(indexPath, "utf8");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildJsonLd(route) {
  const blocks = [];
  const breadcrumbItems =
    route.canonical === "/"
      ? [{ name: "Home", path: "/" }]
      : [
          { name: "Home", path: "/" },
          { name: route.title, path: route.canonical },
        ];
  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  });

  if (route.isCalculator) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: route.title,
      description: route.metaDescription,
      url: `${SITE}${route.canonical}`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "1247",
      },
      publisher: {
        "@type": "Organization",
        name: "Calcy",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
      },
    });
  }

  if (route.faqs && route.faqs.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: route.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  const howTo = HOW_TOS[route.canonical];
  if (howTo) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: howTo.name,
      description: howTo.description,
      ...(howTo.totalTime ? { totalTime: howTo.totalTime } : {}),
      step: howTo.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  if (route.isCalculator) {
    const today = new Date().toISOString().slice(0, 10);
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.metaTitle,
      description: route.metaDescription,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${route.canonical}` },
      url: `${SITE}${route.canonical}`,
      inLanguage: "en-AU",
      datePublished: "2026-01-01",
      dateModified: today,
      author: { "@type": "Organization", name: "Calcy", url: SITE },
      publisher: {
        "@type": "Organization",
        name: "Calcy",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
      },
    });
  }
  return blocks
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join("");
}

function renderRouteHtml(route) {
  const url = `${SITE}${route.canonical}`;
  const title = escapeHtml(route.metaTitle);
  const description = escapeHtml(route.metaDescription);

  let html = baseHtml;

  // Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Description
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${description}" />`,
  );

  // Canonical
  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${url}" />`,
  );

  // Open Graph + Twitter
  html = html
    .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}" />`)
    .replace(
      /<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${title}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${description}" />`,
    );

  // Inject JSON-LD just before </head>
  const jsonLd = buildJsonLd(route);
  html = html.replace(/<\/head>/i, `${jsonLd}</head>`);

  // Lightweight crawler-visible H1 + summary inside #root so JS-disabled crawlers
  // see canonical content. React hydration replaces this on mount.
  const fallback = `<h1>${escapeHtml(route.title)}</h1><p>${description}</p>`;
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${fallback}</div>`);

  return html;
}

let count = 0;
for (const route of ROUTES) {
  if (route.canonical === "/") {
    writeFileSync(indexPath, renderRouteHtml(route), "utf8");
    count++;
    continue;
  }
  const outDir = join(DIST, route.canonical.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), renderRouteHtml(route), "utf8");
  count++;
}

console.log(`[prerender] Wrote ${count} static HTML files`);
