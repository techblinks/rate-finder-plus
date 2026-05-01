// Single source of truth for SEO-relevant static routes. Used by the build-time
// prerender script and the sitemap generator so they never drift out of sync.

import { countries, calculatorTypes, primaryCalculatorTypes, type CalculatorType } from "@/data/countries";
import { citiesByCountry } from "@/data/cities";

export type StaticRoute = {
  /** URL path including leading slash. e.g. "/us/mortgage-calculator-houston". */
  path: string;
  /** Routing kind for downstream content generation. */
  kind: "home" | "country" | "calculator" | "city-calculator";
  country?: string;
  calculatorType?: CalculatorType;
  citySlug?: string;
  /** Sitemap priority (higher = more important). */
  priority: number;
  changefreq: "daily" | "weekly" | "monthly";
};

const CITY_ENABLED_CALCS: CalculatorType[] = ["mortgage-calculator", "loan-calculator", "interest-calculator"];

export function enumerateStaticRoutes(): StaticRoute[] {
  const out: StaticRoute[] = [
    { path: "/", kind: "home", priority: 1.0, changefreq: "weekly" },
  ];

  for (const code of Object.keys(countries)) {
    out.push({ path: `/${code}`, kind: "country", country: code, priority: 0.9, changefreq: "weekly" });

    for (const calc of calculatorTypes) {
      const isPrimary = (primaryCalculatorTypes as CalculatorType[]).includes(calc);
      out.push({
        path: `/${code}/${calc}`,
        kind: "calculator",
        country: code,
        calculatorType: calc,
        priority: isPrimary ? 0.85 : 0.7,
        changefreq: "weekly",
      });
    }

    const cities = citiesByCountry[code] ?? [];
    for (const calc of CITY_ENABLED_CALCS) {
      for (const city of cities) {
        out.push({
          path: `/${code}/${calc}-${city.slug}`,
          kind: "city-calculator",
          country: code,
          calculatorType: calc,
          citySlug: city.slug,
          priority: 0.6,
          changefreq: "monthly",
        });
      }
    }
  }

  return out;
}
