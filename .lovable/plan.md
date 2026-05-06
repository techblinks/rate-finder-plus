## Goal

Close the remaining gaps from the SEO brief without touching the existing JSON-LD pipeline (prerender, validators, regression tests, admin settings) that already covers titles, descriptions, canonicals, hreflang, BreadcrumbList, WebApplication, FAQPage, HowTo, Article, sitemap, robots.txt.

Audit result vs. brief:

| Brief item | Status |
|---|---|
| Per-page meta + canonical + OG/Twitter | Done (`SeoHead`, `prerender.mjs`) |
| Calculator JSON-LD (WebApp, FAQ, HowTo, Article, Breadcrumb) | Done |
| Sitemap + robots.txt | Done (builders + tests) |
| URL slugs `/mortgage-calculator` etc. | Already correct |
| Admin SEO/Analytics/AdSense | Done |
| **Organization JSON-LD site-wide** | Missing |
| **Homepage FAQ section + FAQPage schema** | Missing |
| **Homepage trust-signals bar** | Missing |
| **`lang="en-AU"` on `<html>`** | Partial — only set client-side via Helmet; missing in `index.html` and prerendered output |
| **Guides hub + 5 guide articles** | Missing |
| **/contact page** | Missing |
| **Short-slug 301-style redirects** (`/mortgage`, `/stamp-duty`, `/borrowing`, `/lmi`, `/extra`, `/compare`) | Missing |
| Image alt audit + `loading="lazy"` below fold | Spot-check + fix as needed |

## Changes

### 1. Global Organization JSON-LD
- New `OrganizationJsonLd` in `src/components/seo/JsonLd.tsx` (areaServed: AU, sameAs empty array, logo).
- Mount once in `src/components/layout/Layout.tsx` so it ships on every route.
- Add the same block to `scripts/prerender.mjs` `buildJsonLd()` so prerendered HTML carries it without JS.

### 2. Homepage FAQ + trust bar
- Add the 5 brief FAQs to `src/data/faqs.ts` under `FAQS.home`.
- In `src/pages/Home.tsx`:
  - Add a compact **Trust signals row** under the hero (`Updated May 2026`, `All 8 states & territories`, `6 free calculators`, `RBA rate: 4.10%`, `No sign-up required`) using existing pill styles, sourced from `rbaRates.ts` where applicable.
  - Insert an **FAQ accordion** (reuses `FAQ.tsx` + shadcn accordion) between the calculator grid and "Current in home loans".
  - Wrap with `<FaqJsonLd faqs={FAQS.home} />`.
- Update `src/data/routes.ts` `/` entry with `faqs: FAQS.home` so prerender bakes the FAQPage schema into static HTML too.

### 3. `lang="en-AU"` baseline
- Set `<html lang="en-AU">` in `index.html` (Helmet still overrides per-locale at runtime).
- Sanity-check prerender pass-through.

### 4. Guides hub + 5 articles
- New data file `src/data/guides.ts`: array of 5 guides (slug, h1, metaTitle, metaDescription, category, readMins, datePublished, dateModified, intro, sections [{h2, body, h3s?}], keyTakeaways[], faqs[], relatedCalculators[{to,label}], relatedGuides[slug]).
- New shared component `src/components/guides/GuideArticleShell.tsx` rendering: breadcrumb (Home › Guides › Title), category + read-time badges, H1, last-updated/author meta, intro, auto-generated TOC from H2s, body sections, key-takeaways callout, related-calculator CTA button, related-guides cards, topic FAQ accordion. Emits `BreadcrumbJsonLd`, `ArticleJsonLd`, `FaqJsonLd`.
- New pages:
  - `src/pages/GuidesIndex.tsx` — `/guides` hub listing all 5 with cards + Article hub meta.
  - `src/pages/GuidePage.tsx` — dynamic `/guides/:slug` looking up the guide and rendering the shell; 404 fallback for unknown slugs.
- Register routes in `src/App.tsx` (lazy).
- Add all 6 guide URLs to `src/data/routes.ts` so they enter the prerender + sitemap + SEO validator pipeline automatically.
- Add the 5 guide topic HowTo entries are NOT required (Article schema covers them).
- Cross-link: each calculator's "Related" section gets ≥2 guide links; each guide includes a calculator CTA.

### 5. /contact page
- Static `src/pages/Contact.tsx` with email + simple intro (no form backend yet); add to routes manifest, sitemap, footer nav, header nav.

### 6. Short-slug redirects
- In `src/App.tsx`, add `<Route path="/mortgage" element={<Navigate to="/mortgage-calculator" replace />} />` for: `/mortgage`, `/stamp-duty`, `/borrowing`, `/lmi`, `/extra`, `/compare`. (SPA-side; documents the canonical URL. We don't add these to sitemap.)

### 7. Image / heading hygiene pass
- Grep for `<img` to ensure alt text and add `loading="lazy"` for below-fold images.
- Verify each page has a single H1 (calculator pages already do via `CalculatorPageShell`).

### 8. Tests
- Extend `src/test/sitemap-robots-regression.test.ts` to assert `/guides` + each guide slug + `/contact` are present.
- Extend `src/test/seo-regression.test.ts` with cases for guide page meta derivation and homepage FAQ schema presence.
- `scripts/validate-seo.mjs` already validates Article/FAQ/Breadcrumb on every emitted page — guides will be checked automatically once added to the manifest.

## Out of scope (already covered or non-applicable)
- True 301 server redirects: Lovable hosting can't issue HTTP 301s; SPA `<Navigate replace>` is the supported equivalent and is what's used elsewhere (`/terms` → `/terms-of-use`).
- Per-locale subdirectories — `activeLocales()` infrastructure exists; no new locales requested here.
- Re-adding any removed admin features.

## Files to touch
- `src/components/seo/JsonLd.tsx` (+OrganizationJsonLd)
- `src/components/layout/Layout.tsx` (mount Organization)
- `src/components/layout/Header.tsx`, `Footer.tsx` (Guides + Contact links)
- `src/data/faqs.ts` (+home), `src/data/routes.ts` (+/, guides, contact), new `src/data/guides.ts`
- `src/pages/Home.tsx` (trust bar + FAQ)
- New: `src/pages/GuidesIndex.tsx`, `src/pages/GuidePage.tsx`, `src/pages/Contact.tsx`, `src/components/guides/GuideArticleShell.tsx`
- `src/App.tsx` (routes + redirects)
- `index.html` (`lang="en-AU"`)
- `scripts/prerender.mjs` (Organization block)
- `src/test/seo-regression.test.ts`, `src/test/sitemap-robots-regression.test.ts`
