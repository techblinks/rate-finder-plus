## Programmatic SEO layer for Zune Calculator

Goal: add a 500+ page programmatic-SEO layer focused on Australian high-CPC mortgage/loan/finance queries, **without touching** existing routes, components, or calculator logic. The new layer is config-driven, additive, and fully reversible.

### Guard-rails (what I will NOT touch)

- `src/App.tsx` existing routes (`/`, `/:country`, `/:country/:calculator`, redirects).
- All files under `src/components/calculators/**` — calculator logic stays exactly as-is.
- `src/pages/CalculatorPage.tsx`, `CityCalculatorPage.tsx`, `CountryHome.tsx`, `Index.tsx`.
- The existing dynamic city pages at `/au/mortgage-calculator-{city}` keep working.

The new layer is mounted under a brand-new route prefix `/seo/...` and adds **one** new `<Route>` to `App.tsx`. Nothing else in `App.tsx` changes.

### What gets built (additive only)

```text
src/
  pages/
    seo/
      ProgrammaticSeoPage.tsx        ← new
      SeoAdmin.tsx                   ← new (toggle/edit panel)
  data/
    seo/
      seoPages.ts                    ← page registry (config-driven)
      content/
        mortgage/
          au-brisbane.json
          au-sydney.json
          au-melbourne.json
          au-perth.json
          au-adelaide.json           (+50 city stubs auto-generated)
        loan/
          au-personal-loan.json
          au-car-loan.json
          ...
      contentLoader.ts               ← merges JSON + template fallback
      adminConfig.ts                 ← localStorage-backed toggles
  lib/
    seo/
      programmaticSchemas.ts         ← Article + FAQ + Breadcrumb JSON-LD
      programmaticContent.ts         ← deterministic 1500-2000 word generator
scripts/
  generate-seo-pages.mjs             ← creates JSON content stubs at scale
  prerender.mjs                      ← extended to also prerender /seo/* URLs
  generate-sitemap.mjs               ← extended to include /seo/* URLs
```

### Page contract (`/seo/:slug`)

A single React page renders any programmatic SEO entry. It looks up the slug in `seoPages.ts`, loads matching content JSON (or generates from template), embeds the **existing** calculator components, and renders SEO blocks.

Layout (all reused components — no calculator changes):

1. `<SEOHead>` — title, description, canonical, Article + FAQ + Breadcrumb JSON-LD.
2. `<BreadcrumbNav>` — Home › Australia › City › Calculator.
3. `<AdPlaceholder zone="top-banner">` — top monetisation slot.
4. Hero: `<h1>` + intro paragraph (problem + solution).
5. **Embedded calculator** — imports the existing `MortgageCalculator` / `LoanCalculator` / `InterestCalculator` from `src/components/calculators/*` with `country={countries.au}` (or matching country). Lazy-loaded via `React.lazy`.
6. `<AffiliateCTA>` — "Compare Live Rates" button (existing component).
7. Long-form content sections (H2/H3) rendered from JSON: Overview, How it works, Real-life Australian example, Tips, Local market notes, Costs breakdown.
8. `<AdPlaceholder zone="in-content">`.
9. `<FAQSection>` (existing) — 5–8 city/topic-specific FAQs.
10. `<InternalLinks>` (existing) — related calculators + sibling SEO city pages + back to country home.
11. `<AdPlaceholder zone="bottom">` + `<TrustDisclaimer>` (existing).

Word-count target enforced by `programmaticContent.ts` at build time: each page produces 1500–2000 words. Verified by a small assertion in the generator script.

### Config-driven page registry

`src/data/seo/seoPages.ts`:

```ts
export type SeoPage = {
  slug: string;            // e.g. "mortgage-calculator-brisbane"
  type: "mortgage" | "loan" | "interest" | "borrowing-power" | "stamp-duty";
  country: "au" | "us" | "ca" | "gb";
  city?: string;
  state?: string;
  topic?: string;          // for non-city pages e.g. "first-home-buyer"
  enabled: boolean;        // admin toggle
  contentFile?: string;    // optional custom JSON path
};
```

Initial seed: 5 cities × 1 calculator (mortgage) for Australia, then `scripts/generate-seo-pages.mjs` expands to 50+ AU cities × 3 calculator types + 30 topic pages (refinance, first-home-buyer, investment property, FHB grants by state, stamp-duty-by-state, etc.) → **~200+ pages** initially with headroom to 500+ as more cities/topics get added to the registry.

### Content JSON shape

```json
{
  "title": "Mortgage Calculator Brisbane 2026 — Repayments, Stamp Duty & Borrowing Power",
  "metaDescription": "...",
  "h1": "Brisbane Mortgage Calculator",
  "intro": "...",
  "sections": [
    { "h2": "How Brisbane mortgage repayments are calculated", "body": "..." },
    { "h2": "Real-world example: buying a $850,000 home in Bulimba", "body": "..." }
  ],
  "tips": ["..."],
  "faqs": [{ "q": "...", "a": "..." }],
  "internalLinks": [{ "label": "...", "href": "/seo/..." }],
  "wordCount": 1820
}
```

`contentLoader.ts` does: import JSON dynamically (Vite's `import.meta.glob`); if missing, fall back to `programmaticContent.ts` template that fills city/state/numbers from `citiesByCountry` + the existing `countries` config so we always have shippable content.

### Admin control panel

`/seo/admin` (route added under the same `/seo` prefix). Reads/writes a `localStorage`-backed config (`zune.seo.admin.v1`):

- Per-page toggle: enable/disable (when disabled, page returns a 410-style "Page disabled" placeholder so it stops being indexed).
- Per-page meta override: title + description.
- AdSense snippet field (HTML) injected into `<AdPlaceholder>` slots (uses existing component, just passes a `slotHtml` prop already supported or via a new optional prop — additive).
- Affiliate URL override per page.
- Read-only word-count + last-built date for QA.

The admin page is unauthenticated for now (matches current app posture) but gated by a hidden `?key=...` query param matching an env-stored secret to avoid accidental scraping. Lovable Cloud is **not** required.

### Schema markup

`programmaticSchemas.ts` builds three JSON-LD blocks per page:

- `Article` (headline, datePublished, dateModified, author = "Zune Calculator Editorial").
- `FAQPage` from `faqs[]`.
- `BreadcrumbList`.

All injected through the existing `SEOHead` component (it already accepts FAQs + breadcrumbs; I'll extend it with an optional `articleSchema` prop — additive, default-undefined, so no existing callers change behaviour).

### Internal linking strategy

Every programmatic page links to:

- 3 sibling city pages (same calculator type).
- 2 cross-calculator pages (same city).
- The country hub (`/au`).
- 1 deep-link to the live calculator route (`/au/mortgage-calculator`) so existing pages get backlinks.

A small helper in `contentLoader.ts` deterministically picks neighbours from the registry to avoid duplicate phrasing across pages.

### Performance

- Calculator components imported with `React.lazy` + `<Suspense fallback={<CalculatorSkeleton />}>` (skeleton already exists on `CountryHome`).
- Long-form content rendered from plain JSON — no extra JS cost.
- Build-time prerender (extending the existing `scripts/prerender.mjs`) emits a static `dist/seo/{slug}/index.html` per page with full content + JSON-LD baked in, so the page is crawlable and TTFB is essentially file-serve time.
- Sitemap (extending `scripts/generate-sitemap.mjs`) appends every enabled `/seo/*` entry with `priority` 0.7 and `changefreq` weekly.

### Sitemap & robots

- `dist/sitemap.xml` keeps current entries and gains `/seo/*` URLs (only those flagged `enabled: true`).
- No robots.txt change beyond what's already there.

### Monetisation hooks

All four ad/affiliate slots use the **existing** `AdPlaceholder` and `AffiliateCTA` — no new monetisation primitives. Admin panel can override the affiliate URL and inject ad code per-page.

### Scaling path

1. Ship with the seed registry: 5 AU cities × mortgage = 5 pages, fully hand-curated JSON.
2. Run `scripts/generate-seo-pages.mjs --country=au --types=mortgage,loan,interest --cities=all` to scaffold ~150 pages with templated content.
3. Add `--topics=refinance,fhb,investment,stamp-duty-by-state` for 30+ topic pages.
4. Repeat for `us|ca|gb` later → 500+ pages without code changes.

### Files I will create

- `src/pages/seo/ProgrammaticSeoPage.tsx`
- `src/pages/seo/SeoAdmin.tsx`
- `src/data/seo/seoPages.ts`
- `src/data/seo/contentLoader.ts`
- `src/data/seo/adminConfig.ts`
- `src/data/seo/content/mortgage/au-brisbane.json`
- `src/data/seo/content/mortgage/au-sydney.json`
- `src/data/seo/content/mortgage/au-melbourne.json` (third example page)
- `src/lib/seo/programmaticSchemas.ts`
- `src/lib/seo/programmaticContent.ts`
- `scripts/generate-seo-pages.mjs`

### Files I will edit (additive only)

- `src/App.tsx` — add `<Route path="/seo/admin" element={<SeoAdmin />} />` and `<Route path="/seo/:slug" element={<ProgrammaticSeoPage />} />` inside the existing `<Layout>` block. No other changes.
- `src/components/SEOHead.tsx` — accept an optional `articleSchema` prop (default undefined). Existing call sites unaffected.
- `scripts/prerender.mjs` — extend the route enumerator to also walk `seoPages.ts` enabled entries and emit `/seo/{slug}/index.html`. Existing prerender output unchanged.
- `scripts/generate-sitemap.mjs` — append `/seo/*` URLs.

### Verification

- `npm run build` succeeds; existing 238 prerendered pages still emit unchanged.
- New `dist/seo/mortgage-calculator-brisbane/index.html` exists with `<h1>`, 1500+ words, FAQ + Article + Breadcrumb JSON-LD, and a `<script>` tag that hydrates the existing `MortgageCalculator`.
- Visiting `/seo/mortgage-calculator-brisbane` in dev shows: hero, working calculator (same UX as `/au/mortgage-calculator`), long-form content, FAQ, internal links, ad slots.
- Existing routes (`/`, `/au`, `/au/mortgage-calculator`, `/au/mortgage-calculator-brisbane`) all unchanged — verified by snapshot of route map and a smoke navigation.
- `/seo/admin?key=zune-admin` toggles a page off → that page returns the disabled placeholder and is dropped from sitemap on next build.
- Lighthouse-style sanity: no extra JS bundle for content (only the lazy calculator chunk on demand).

### Out of scope (explicitly)

- No changes to calculator math, inputs, or visuals.
- No SSR runtime — we use the existing build-time prerender, which is sufficient for SEO and load speed.
- No CMS / database. Admin = localStorage + JSON files in repo. (Easy to upgrade later by swapping `adminConfig.ts` for a Lovable Cloud-backed store.)
