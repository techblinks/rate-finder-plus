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
    title: "Extra repayments calculator — see how much you can save",
    metaTitle: "Extra Repayments Calculator Australia — Save Years & Thousands | Calcy",
    metaDescription:
      "See exactly how much extra repayments save on your Australian home loan. Enter your loan balance, interest rate, and extra amount — instantly see interest saved, years cut, and your new payoff date. Includes lump sum calculator and amortisation chart. Free, no sign-up.",
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
    path: "/rent-vs-buy-calculator",
    title: "Rent vs buy calculator — which is better for you?",
    metaTitle: "Rent vs Buy Calculator Australia 2026 — Should You Buy or Keep Renting? | Calcy",
    metaDescription:
      "Compare the true long-term cost of renting vs buying a home in Australia. Find your break-even year, compare 10-year net worth, and see how assumptions change the result. Free, no sign-up required.",
    canonical: "/rent-vs-buy-calculator",
    faqs: FAQS.rentVsBuy,
    isCalculator: true,
  },
  {
    path: "/refinance-calculator",
    title: "Refinance calculator — see how much you could save",
    metaTitle: "Refinance Calculator Australia 2026 — Is Refinancing Your Home Loan Worth It? | Calcy",
    metaDescription:
      "Calculate how much you could save by refinancing your home loan. See your monthly saving, break-even month, 5-year saving, and total interest saved. Includes fixed rate break cost warning and LMI check. Free, no sign-up.",
    canonical: "/refinance-calculator",
    faqs: FAQS.refinance,
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

import { STAMP_DUTY_STATE_CONTENT } from "./stampDutyStateContent";

for (const slug of Object.keys(STAMP_DUTY_STATE_CONTENT)) {
  const cfg = STAMP_DUTY_STATE_CONTENT[slug];
  ROUTES.push({
    path: `/stamp-duty-calculator/${cfg.slug}`,
    title: cfg.h1,
    metaTitle: cfg.metaTitle,
    metaDescription: cfg.metaDescription,
    canonical: `/stamp-duty-calculator/${cfg.slug}`,
    faqs: cfg.faqs,
    isCalculator: true,
  });
}

import { FHB_GRANT_CONTENT } from "./fhbGrantContent";

for (const slug of Object.keys(FHB_GRANT_CONTENT)) {
  const cfg = FHB_GRANT_CONTENT[slug];
  ROUTES.push({
    path: `/first-home-buyer-grant-${cfg.slug}`,
    title: cfg.h1,
    metaTitle: cfg.metaTitle,
    metaDescription: cfg.metaDescription,
    canonical: `/first-home-buyer-grant-${cfg.slug}`,
    faqs: cfg.faqs,
    isArticle: true,
  });
}

ROUTES.push({
  path: "/best-home-loans-australia",
  title: "Best Home Loans Australia 2026",
  metaTitle: "Best Home Loans Australia 2026 — Compare Rates, Features & Lenders | Calcy",
  metaDescription:
    "Compare the best Australian home loans for 2026 — fixed vs variable, big-four vs neobanks, offset accounts, and how to switch. Independent, no sign-up.",
  canonical: "/best-home-loans-australia",
  isArticle: true,
});

// Editorial + city programmatic guides live under /guides/. Suburb guides
// are intentionally excluded here — they're served by the /suburbs/:slug
// React route and listed only in sitemap-suburbs.xml (the dynamic edge
// function), keeping suburbs in a single namespace.
import { GUIDES } from "./guides";
import { CITY_GUIDES } from "./cityGuides";

for (const g of [...GUIDES, ...CITY_GUIDES]) {
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
