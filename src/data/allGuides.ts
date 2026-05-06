/**
 * Single resolver for all guide articles (base + city-specific).
 * Use this everywhere instead of importing GUIDES directly so new guide
 * collections can be added without touching call sites.
 */
import { GUIDES, type GuideMeta } from "./guides";
import { CITY_GUIDES } from "./cityGuides";

export const ALL_GUIDES: GuideMeta[] = [...GUIDES, ...CITY_GUIDES];

export const findGuide = (slug: string): GuideMeta | undefined =>
  ALL_GUIDES.find((g) => g.slug === slug);
