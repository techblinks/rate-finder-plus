/**
 * Locale registry. AU is live today; US and CA are scaffolded so URL prefixes,
 * currency formatters, and hreflang tags can be wired in without touching
 * calling code when localized calculators land.
 */
export type LocaleCode = "au" | "us" | "ca";

export interface Locale {
  code: LocaleCode;
  htmlLang: string;
  region: string;
  currency: string;
  currencySymbol: string;
  pathPrefix: string; // "" for default (AU), "/us", "/ca" for others
  siteName: string;
  /** Whether this locale's pages should be exposed in nav/sitemap/hreflang. */
  enabled: boolean;
}

export const LOCALES: Record<LocaleCode, Locale> = {
  au: {
    code: "au",
    htmlLang: "en-AU",
    region: "AU",
    currency: "AUD",
    currencySymbol: "$",
    pathPrefix: "",
    siteName: "Calcy",
    enabled: true,
  },
  us: {
    code: "us",
    htmlLang: "en-US",
    region: "US",
    currency: "USD",
    currencySymbol: "$",
    pathPrefix: "/us",
    siteName: "Calcy",
    enabled: false,
  },
  ca: {
    code: "ca",
    htmlLang: "en-CA",
    region: "CA",
    currency: "CAD",
    currencySymbol: "$",
    pathPrefix: "/ca",
    siteName: "Calcy",
    enabled: false,
  },
};

export const DEFAULT_LOCALE: LocaleCode = "au";

export function localeFromPath(pathname: string): LocaleCode {
  if (pathname.startsWith("/us/") || pathname === "/us") return "us";
  if (pathname.startsWith("/ca/") || pathname === "/ca") return "ca";
  return "au";
}

export function formatCurrency(value: number, locale: LocaleCode = DEFAULT_LOCALE): string {
  const l = LOCALES[locale];
  return new Intl.NumberFormat(l.htmlLang, {
    style: "currency",
    currency: l.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Returns enabled locales for hreflang/sitemap consumption. */
export function activeLocales(): Locale[] {
  return Object.values(LOCALES).filter((l) => l.enabled);
}
