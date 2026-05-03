// Typed wrapper around the plain-JS registry. The JS file is the source of
// truth so build-time scripts (prerender, sitemap) can import without a TS step.
import { seoPages as raw } from "./seoPages.data.js";

export type SeoPageType = "mortgage" | "loan" | "interest" | "borrowing-power" | "stamp-duty";
export type SeoCountry = "au" | "us" | "ca" | "gb";

export interface SeoPage {
  slug: string;
  type: SeoPageType;
  country: SeoCountry;
  city?: string;
  citySlug?: string;
  state?: string;
  topic?: string;
  topicLabel?: string;
  enabled: boolean;
}

export const seoPages: SeoPage[] = raw as SeoPage[];

export const findSeoPage = (slug: string): SeoPage | undefined =>
  seoPages.find((p) => p.slug === slug);

export const TYPE_KEYWORDS: Record<SeoPageType, string> = {
  mortgage: "mortgage-calculator",
  loan: "loan-calculator",
  interest: "interest-calculator",
  "borrowing-power": "borrowing-power-calculator",
  "stamp-duty": "stamp-duty-calculator",
};

export const TYPE_LABELS: Record<SeoPageType, string> = {
  mortgage: "Mortgage",
  loan: "Loan",
  interest: "Interest",
  "borrowing-power": "Borrowing Power",
  "stamp-duty": "Stamp Duty",
};
