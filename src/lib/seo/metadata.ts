import { CalculatorType, CountryConfig, calculatorMeta, countries } from "@/data/countries";

const baseUrl = "https://zunecalculator.com";
const year = new Date().getFullYear();

interface MetaConfig {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  robots?: string;
}

const calculatorKeywords: Record<CalculatorType, Record<string, { primary: string; secondary: string[] }>> = {
  "mortgage-calculator": {
    us: {
      primary: "mortgage calculator",
      secondary: ["mortgage payment calculator usa", "home loan calculator us", "monthly mortgage payment calculator", "mortgage amortization calculator"],
    },
    au: {
      primary: "mortgage calculator australia",
      secondary: ["home loan calculator australia", "mortgage repayment calculator", "australian mortgage calculator"],
    },
    ca: {
      primary: "mortgage calculator canada",
      secondary: ["canadian mortgage calculator", "home loan calculator canada", "cmhc mortgage calculator"],
    },
  },
  "loan-calculator": {
    us: {
      primary: "loan calculator",
      secondary: ["personal loan calculator usa", "auto loan calculator", "loan payment calculator"],
    },
    au: {
      primary: "loan calculator australia",
      secondary: ["personal loan calculator au", "car loan calculator australia"],
    },
    ca: {
      primary: "loan calculator canada",
      secondary: ["personal loan calculator canada", "car loan calculator canada"],
    },
  },
  "interest-calculator": {
    us: {
      primary: "interest calculator",
      secondary: ["compound interest calculator usa", "simple interest calculator", "savings interest calculator"],
    },
    au: {
      primary: "interest calculator australia",
      secondary: ["compound interest calculator au", "savings calculator australia"],
    },
    ca: {
      primary: "interest calculator canada",
      secondary: ["compound interest calculator canada", "savings calculator canada"],
    },
  },
};

export const getKeywords = (calcType: CalculatorType, countryCode: string) =>
  calculatorKeywords[calcType]?.[countryCode];

export const generateCalculatorMeta = (calcType: CalculatorType, country: CountryConfig): MetaConfig => {
  const meta = calculatorMeta[calcType];
  const kw = calculatorKeywords[calcType]?.[country.code];
  const primary = kw?.primary ?? meta.title.toLowerCase();

  const titles: Record<CalculatorType, Record<string, string>> = {
    "mortgage-calculator": {
      us: `Mortgage Calculator USA ${year} — Free Monthly Payment Calculator | Zune Calculator`,
      au: `Mortgage Calculator Australia ${year} — Free Home Loan Repayment Tool | Zune Calculator`,
      ca: `Mortgage Calculator Canada ${year} — Free Payment & Amortization Tool | Zune Calculator`,
    },
    "loan-calculator": {
      us: `Loan Calculator USA ${year} — Free Personal & Auto Loan Tool | Zune Calculator`,
      au: `Loan Calculator Australia ${year} — Free Personal & Car Loan Tool | Zune Calculator`,
      ca: `Loan Calculator Canada ${year} — Free Personal Loan Payment Tool | Zune Calculator`,
    },
    "interest-calculator": {
      us: `Interest Calculator USA ${year} — Free Compound & Simple Interest Tool | Zune Calculator`,
      au: `Interest Calculator Australia ${year} — Free Savings & Compound Tool | Zune Calculator`,
      ca: `Interest Calculator Canada ${year} — Free Compound Interest Tool | Zune Calculator`,
    },
  };

  const descriptions: Record<CalculatorType, Record<string, string>> = {
    "mortgage-calculator": {
      us: `Use our free ${year} USA mortgage calculator to estimate monthly payments, view amortization schedules, and compare 15-year vs 30-year fixed rates. Instant results in USD.`,
      au: `Free Australian mortgage calculator for ${year}. Calculate home loan repayments, view amortization tables, and compare rates from Big 4 banks. Results in AUD.`,
      ca: `Free Canadian mortgage calculator for ${year}. Estimate payments with CMHC insurance, stress test rates, and full amortization schedules. Results in CAD.`,
    },
    "loan-calculator": {
      us: `Free USA loan calculator for ${year}. Calculate personal loan, auto loan, and student loan payments instantly. Compare rates and see total borrowing costs in USD.`,
      au: `Free Australian loan calculator for ${year}. Estimate personal loan and car loan repayments, compare lender rates, and see total interest costs in AUD.`,
      ca: `Free Canadian loan calculator for ${year}. Calculate personal and auto loan payments, compare interest rates, and view full repayment schedules in CAD.`,
    },
    "interest-calculator": {
      us: `Free compound and simple interest calculator for ${year}. Calculate savings growth, investment returns, and interest earnings over time. Results in USD.`,
      au: `Free Australian interest calculator for ${year}. Calculate compound interest on savings and term deposits. Compare rates and project growth in AUD.`,
      ca: `Free Canadian interest calculator for ${year}. Calculate compound interest, TFSA growth, and savings returns. Project your wealth in CAD.`,
    },
  };

  return {
    title: titles[calcType]?.[country.code] ?? `${meta.title} ${country.name} ${year} | Zune Calculator`,
    description: descriptions[calcType]?.[country.code] ?? `Free ${primary} for ${country.name}. ${meta.description} Updated for ${year}.`,
    canonical: `/${country.code}/${calcType}`,
    ogType: "website",
  };
};

export const generateCountryMeta = (country: CountryConfig): MetaConfig => ({
  title: `${country.name} Financial Calculators ${year} — Free Mortgage, Loan & Interest Tools | Zune Calculator`,
  description: `Free financial calculators for ${country.name} in ${year}. Calculate mortgage payments, loan costs, and compound interest in ${country.currency}. Trusted by thousands.`,
  canonical: `/${country.code}`,
  ogType: "website",
});

export const generateHomeMeta = (): MetaConfig => ({
  title: `Free Mortgage, Loan & Interest Calculators ${year} — US, Australia, Canada | Zune Calculator`,
  description: `ZuneCalculator.com offers free financial calculators for the US, Australia, and Canada. Calculate mortgage payments, loan costs, and compound interest instantly. Updated ${year}.`,
  canonical: "/",
  ogType: "website",
});

export const generateStaticPageMeta = (page: "about" | "contact" | "privacy-policy" | "terms"): MetaConfig => {
  const metas: Record<string, MetaConfig> = {
    about: {
      title: `About Zune Calculator — Free Financial Tools for US, AU & CA | Zune Calculator`,
      description: `Learn about ZuneCalculator.com — free mortgage, loan, and interest calculators serving the United States, Australia, and Canada. Our mission and tools.`,
      canonical: "/about",
    },
    contact: {
      title: `Contact Us — Zune Calculator | Zune Calculator`,
      description: `Get in touch with the ZuneCalculator.com team. Questions, feedback, or partnership inquiries about our free financial calculators.`,
      canonical: "/contact",
    },
    "privacy-policy": {
      title: `Privacy Policy — Zune Calculator | Zune Calculator`,
      description: `ZuneCalculator.com privacy policy. Learn how we handle your data, cookies, analytics, and advertising. GDPR and CCPA compliant.`,
      canonical: "/privacy-policy",
      robots: "noindex, follow",
    },
    terms: {
      title: `Terms of Service — Zune Calculator | Zune Calculator`,
      description: `Terms of service for ZuneCalculator.com. Read our disclaimer, calculator accuracy information, and usage terms for US, Australia, and Canada.`,
      canonical: "/terms",
      robots: "noindex, follow",
    },
  };
  return metas[page];
};

export { baseUrl };
