/**
 * Pure builders for robots.txt and sitemap.xml.
 *
 * Inputs:
 *   - routes: ROUTES manifest from src/data/routes.ts
 *   - settings: subset of SiteSettings (robots_txt, indexing_enabled)
 *   - site: canonical origin (e.g. "https://calcy.com.au")
 *
 * No I/O, no Date.now() side effects (lastmod injected by caller) so the
 * outputs are 100% deterministic for unit tests. Used at build time
 * (scripts/build-sitemap.mjs) and validated by the SEO regression suite.
 */

const LEGAL = new Set(["/about", "/privacy-policy", "/terms-of-use"]);

export function priorityFor(route) {
  if (route.canonical === "/") return "1.0";
  if (LEGAL.has(route.canonical)) return "0.5";
  const depth = route.canonical.split("/").filter(Boolean).length;
  if (route.isCalculator && depth === 1) return "0.9";
  if (route.isCalculator && depth >= 2) return "0.7";
  return "0.6";
}

export function changefreqFor(route) {
  if (route.canonical === "/") return "weekly";
  if (LEGAL.has(route.canonical)) return "yearly";
  return "monthly";
}

/**
 * Build sitemap.xml. When `indexingEnabled` is false the sitemap is empty
 * (still well-formed) so accidentally publishing with site-wide noindex does
 * not surface URLs to crawlers.
 */
export function buildSitemap({ routes, site, lastmod, indexingEnabled = true }) {
  const urls = indexingEnabled
    ? routes
        .map((r) => {
          const loc = `${site}${r.canonical}`;
          return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreqFor(r)}</changefreq><priority>${priorityFor(r)}</priority></url>`;
        })
        .join("\n")
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const DEFAULT_BOTS = [
  "*",
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "anthropic-ai",
  "cohere-ai",
];

/**
 * Build robots.txt.
 *  - If admin provided custom robots_txt, return it verbatim (trusted override).
 *  - If indexing disabled site-wide, emit Disallow: / for all bots.
 *  - Otherwise emit the canonical default allowing crawlers, blocking /admin,
 *    pointing to the sitemap.
 */
export function buildRobots({ settings, site }) {
  if (settings?.robots_txt && settings.robots_txt.trim()) {
    return settings.robots_txt.trim() + "\n";
  }

  const lines = [];
  if (settings?.indexing_enabled === false) {
    lines.push("User-agent: *", "Disallow: /", "");
    return lines.join("\n");
  }

  for (const bot of DEFAULT_BOTS) {
    lines.push(`User-agent: ${bot}`, "Allow: /", "");
  }
  lines.push(`Sitemap: ${site}/sitemap.xml`, "Disallow: /admin", "");
  return lines.join("\n");
}
