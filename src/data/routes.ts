import { FAQS, type FaqItem } from "./faqs";

export interface RouteMeta {
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  faqs?: FaqItem[];
  isCalculator?: boolean;
  isArticle?: boolean;
}

export const SITE = "https://calcy.com.au";

export const ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: "Calcy",
    metaTitle: "Free Australian Mortgage Calculator 2026 | Calcy",
    metaDescription:
      "Calculate home loan repayments, stamp duty, borrowing power and LMI for free. All 8 Australian states. Updated with current RBA rates. No sign-up required.",
    canonical: "/",
    faqs: FAQS.home,
  },
  {
    path: "/mortgage-calculator",
    title: "Mortgage Repayment Calculator",
    metaTitle: "Mortgage Calculator Australia 2026 | Calcy",
    metaDescription:
      "Free Australian mortgage repayment calculator. See fortnightly and monthly repayments, total interest, and full amortisation schedule. Updated for 2026.",
    canonical: "/mortgage-calculator",
    faqs: FAQS.mortgage,
    isCalculator: true,
  },
  {
    path: "/stamp-duty-calculator",
    title: "Stamp duty calculator — all Australian states 2026",
    metaTitle: "Stamp Duty Calculator Australia 2026 — All States & First Home Buyers | Calcy",
    metaDescription:
      "Calculate stamp duty for every Australian state and territory in 2026. Includes first home buyer exemptions, FHOG grants, and total upfront cost estimate. Compare stamp duty across all states instantly. Free, no sign-up.",
    canonical: "/stamp-duty-calculator",
    faqs: FAQS.stampDuty,
    isCalculator: true,
  },
  {
    path: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    metaTitle: "Borrowing Power Calculator Australia 2026 | Calcy",
    metaDescription:
      "Estimate how much an Australian lender may let you borrow based on your income, expenses, and APRA's 3% serviceability buffer.",
    canonical: "/borrowing-power-calculator",
    faqs: FAQS.borrowingPower,
    isCalculator: true,
  },
  {
    path: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    metaTitle: "Extra Repayments Calculator Australia 2026 | Calcy",
    metaDescription:
      "See how extra monthly repayments shorten your mortgage and reduce total interest. Free Australian extra repayments calculator.",
    canonical: "/extra-repayments-calculator",
    faqs: FAQS.extraRepayments,
    isCalculator: true,
  },
  {
    path: "/lmi-calculator",
    title: "LMI Calculator",
    metaTitle: "LMI Calculator Australia 2026 | Lender's Mortgage Insurance | Calcy",
    metaDescription:
      "Estimate Lender's Mortgage Insurance (LMI) for any Australian home loan. Compare costs at different deposits and LVR levels.",
    canonical: "/lmi-calculator",
    faqs: FAQS.lmi,
    isCalculator: true,
  },
  {
    path: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    metaTitle: "Loan Comparison Calculator Australia 2026 | Calcy",
    metaDescription:
      "Compare two Australian home loans side-by-side. See which loan saves more on monthly repayments, total interest, and upfront fees.",
    canonical: "/loan-comparison-calculator",
    faqs: FAQS.loanComparison,
    isCalculator: true,
  },
  {
    path: "/hecs-borrowing-power",
    title: "HECS & Borrowing Power Calculator",
    metaTitle: "HECS & Borrowing Power Calculator Australia 2026 | Calcy",
    metaDescription:
      "See exactly how your HECS/HELP debt reduces your home loan borrowing power. Uses 2025-26 ATO thresholds and APRA's 3% serviceability buffer.",
    canonical: "/hecs-borrowing-power",
    isCalculator: true,
  },
  {
    path: "/guides",
    title: "Guides",
    metaTitle: "Mortgage & Property Guides Australia 2026 | Calcy",
    metaDescription:
      "Plain-English Australian guides on stamp duty, LMI, borrowing power, first home buyer grants, and fixed vs variable rates. Updated 2026.",
    canonical: "/guides",
  },
  {
    path: "/about",
    title: "About",
    metaTitle: "About Calcy | Free Australian Mortgage Calculators",
    metaDescription:
      "Calcy provides free, bank-grade Australian mortgage and property calculators. No sign-up, no data collection.",
    canonical: "/about",
  },
  {
    path: "/contact",
    title: "Contact",
    metaTitle: "Contact Calcy | Australian Mortgage Calculators",
    metaDescription:
      "Get in touch with Calcy. Send feedback, suggestions, or report an issue with our free Australian mortgage and property calculators.",
    canonical: "/contact",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | Calcy",
    metaDescription: "How Calcy handles privacy and data on its free Australian mortgage calculators.",
    canonical: "/privacy-policy",
  },
  {
    path: "/terms-of-use",
    title: "Terms of Use",
    metaTitle: "Terms of Use | Calcy",
    metaDescription: "Terms of use for Calcy's free Australian mortgage and property calculators.",
    canonical: "/terms-of-use",
  },
];

const STATE_DEFS: { slug: string; code: string; name: string }[] = [
  { slug: "nsw", code: "NSW", name: "New South Wales" },
  { slug: "vic", code: "VIC", name: "Victoria" },
  { slug: "qld", code: "QLD", name: "Queensland" },
  { slug: "wa", code: "WA", name: "Western Australia" },
  { slug: "sa", code: "SA", name: "South Australia" },
  { slug: "tas", code: "TAS", name: "Tasmania" },
  { slug: "act", code: "ACT", name: "Australian Capital Territory" },
  { slug: "nt", code: "NT", name: "Northern Territory" },
];

for (const s of STATE_DEFS) {
  ROUTES.push({
    path: `/stamp-duty-calculator/${s.slug}`,
    title: `${s.name} Stamp Duty Calculator`,
    metaTitle: `${s.code} Stamp Duty Calculator 2026 | ${s.name} | Calcy`,
    metaDescription: `Calculate ${s.name} (${s.code}) stamp duty for owner-occupiers, first home buyers, and investors. Includes 2026 thresholds and concessions.`,
    canonical: `/stamp-duty-calculator/${s.slug}`,
    faqs: FAQS.stampDuty,
    isCalculator: true,
  });
}

import { ALL_GUIDES } from "./allGuides";

for (const g of ALL_GUIDES) {
  ROUTES.push({
    path: `/guides/${g.slug}`,
    title: g.title,
    metaTitle: g.metaTitle,
    metaDescription: g.metaDescription,
    canonical: `/guides/${g.slug}`,
    faqs: g.faqs,
    isArticle: true,
  });
}
