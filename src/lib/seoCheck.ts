/**
 * Lightweight in-browser SEO sanity check used by the admin dashboard.
 *
 * Mirrors a subset of scripts/validate-seo.mjs against the live document so
 * admins get immediate feedback after changing SEO/analytics/ad settings.
 * Full validation (sitemap, all routes, JSON-LD shape per type) still runs at
 * build time via `npm run test:seo`.
 */
export interface SeoCheckResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function runRuntimeSeoCheck(): SeoCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const canonicals = document.querySelectorAll('link[rel="canonical"]');
  if (canonicals.length === 0) errors.push("Missing canonical link");
  if (canonicals.length > 1) errors.push(`Duplicate canonical (${canonicals.length})`);
  const href = canonicals[0]?.getAttribute("href") || "";
  if (href && !href.startsWith("https://")) errors.push("Canonical is not https");

  const title = document.title || "";
  if (!title.trim()) errors.push("Empty <title>");
  if (title.length > 70) warnings.push(`Title is ${title.length} chars (>70)`);

  const desc = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content") || "";
  if (!desc.trim()) errors.push("Missing meta description");
  if (desc.length > 170) warnings.push(`Description is ${desc.length} chars (>170)`);

  const ogTags = ["og:title", "og:description", "og:url", "og:image"];
  for (const t of ogTags) {
    if (!document.querySelector(`meta[property="${t}"]`)) errors.push(`Missing ${t}`);
  }

  const blocks = document.querySelectorAll('script[type="application/ld+json"]');
  if (blocks.length === 0) errors.push("No JSON-LD blocks");
  blocks.forEach((b, i) => {
    try {
      const parsed = JSON.parse(b.textContent || "");
      if (parsed["@context"] !== "https://schema.org")
        errors.push(`JSON-LD #${i + 1}: bad @context`);
      if (!parsed["@type"]) errors.push(`JSON-LD #${i + 1}: missing @type`);
    } catch (e) {
      errors.push(`JSON-LD #${i + 1}: invalid JSON (${(e as Error).message})`);
    }
  });

  const hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
  const seen = new Set<string>();
  hreflangs.forEach((l) => {
    const lang = l.getAttribute("hreflang") || "";
    if (seen.has(lang)) errors.push(`Duplicate hreflang ${lang}`);
    seen.add(lang);
  });

  return { ok: errors.length === 0, errors, warnings };
}
