// Loads hand-curated content JSON for an SEO page when present, otherwise
// falls back to the deterministic generator. Uses Vite's import.meta.glob so
// new JSON files under src/data/seo/content/<type>/<slug>.json are picked up
// automatically — no registry edit required.

import type { SeoPage } from "./seoPages";
import type { CountryConfig } from "@/data/countries";
import type { CityConfig } from "@/data/cities";
import { generateContent, type SeoContent } from "@/lib/seo/programmaticContent";

const overrides = import.meta.glob<{ default: Partial<SeoContent> }>(
  "./content/**/*.json",
  { eager: true }
);

function findOverride(page: SeoPage): Partial<SeoContent> | null {
  // expected path: ./content/<type>/<slug>.json
  const key = `./content/${page.type}/${page.slug}.json`;
  const hit = overrides[key];
  return hit ? (hit.default as Partial<SeoContent>) : null;
}

export function loadContent(
  page: SeoPage,
  country: CountryConfig,
  city?: CityConfig,
): SeoContent {
  const generated = generateContent(page, country, city);
  const override = findOverride(page);
  if (!override) return generated;
  return {
    ...generated,
    ...override,
    sections: override.sections ?? generated.sections,
    faqs: override.faqs ?? generated.faqs,
    tips: override.tips ?? generated.tips,
    example: override.example ?? generated.example,
  };
}

// Pick deterministic neighbour pages for internal linking.
export function pickRelatedSlugs(
  page: SeoPage,
  allPages: SeoPage[],
  count = 4,
): SeoPage[] {
  const sameType = allPages.filter(
    (p) => p.enabled && p.slug !== page.slug && p.type === page.type && p.country === page.country,
  );
  const crossType = allPages.filter(
    (p) => p.enabled && p.slug !== page.slug && p.type !== page.type && p.country === page.country,
  );
  return [...sameType.slice(0, Math.ceil(count * 0.6)), ...crossType.slice(0, Math.floor(count * 0.4))].slice(0, count);
}
