/**
 * Single resolver for all guide articles — base editorial guides + city
 * programmatic guides + suburb programmatic guides.
 *
 * findGuide(slug) is namespace-agnostic; callers that need to disambiguate
 * the URL prefix should use isSuburbGuide().
 */
import { GUIDES, type GuideMeta } from "./guides";
import { CITY_GUIDES } from "./cityGuides";
import { SUBURB_GUIDES, SUBURB_GUIDE_BY_SLUG } from "./suburbGuides";

export const ALL_GUIDES: GuideMeta[] = [...GUIDES, ...CITY_GUIDES, ...SUBURB_GUIDES];

export const findGuide = (slug: string): GuideMeta | undefined =>
  ALL_GUIDES.find((g) => g.slug === slug);

/** True if the slug belongs to the /suburbs/ namespace (vs /guides/). */
export const isSuburbGuide = (slug: string): boolean => slug in SUBURB_GUIDE_BY_SLUG;

export { SUBURB_GUIDES };
