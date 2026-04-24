import { CalculatorType, CountryConfig, calculatorMeta } from "@/data/countries";

const baseUrl = "https://zunecalculator.com";
const year = new Date().getFullYear();

interface MetaConfig {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  robots?: string;
}

const calculatorKeywords: Partial<Record<CalculatorType, Record<string, { primary: string; secondary: string[] }>>> = {
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
    gb: {
      primary: "mortgage calculator uk",
      secondary: ["uk mortgage calculator", "home loan calculator uk", "monthly mortgage payment uk", "mortgage repayment calculator uk"],
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
    gb: {
      primary: "loan calculator uk",
      secondary: ["personal loan calculator uk", "car loan calculator uk"],
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
    gb: {
      primary: "interest calculator uk",
      secondary: ["compound interest calculator uk", "savings calculator uk"],
    },
  },
  "borrowing-power-calculator": {
    us: { primary: "borrowing power calculator usa", secondary: ["how much can i borrow", "home affordability calculator", "mortgage qualification calculator"] },
    au: { primary: "borrowing power calculator australia", secondary: ["how much can i borrow australia", "home loan eligibility", "mortgage borrowing capacity"] },
    ca: { primary: "mortgage affordability calculator canada", secondary: ["how much mortgage can i get canada", "stress test calculator", "home affordability canada"] },
    gb: { primary: "mortgage affordability calculator uk", secondary: ["how much can i borrow uk", "mortgage borrowing calculator uk", "uk mortgage affordability"] },
  },
  "stamp-duty-calculator": {
    us: { primary: "transfer tax calculator", secondary: ["real estate transfer tax", "property transfer tax usa", "closing cost calculator"] },
    au: { primary: "stamp duty calculator australia", secondary: ["stamp duty nsw", "stamp duty vic", "stamp duty qld", "first home buyer stamp duty"] },
    ca: { primary: "land transfer tax calculator", secondary: ["ontario land transfer tax", "toronto land transfer tax", "first time home buyer rebate"] },
    gb: { primary: "stamp duty calculator uk", secondary: ["sdlt calculator", "stamp duty land tax", "first time buyer stamp duty uk"] },
  },
  "extra-repayments-calculator": {
    us: { primary: "extra mortgage payment calculator", secondary: ["pay off mortgage early", "extra principal payment calculator", "mortgage payoff calculator"] },
    au: { primary: "extra repayments calculator", secondary: ["pay off mortgage early australia", "extra home loan repayments", "mortgage offset calculator"] },
    ca: { primary: "mortgage prepayment calculator canada", secondary: ["pay off mortgage early canada", "lump sum mortgage payment", "accelerated mortgage payment"] },
    gb: { primary: "mortgage overpayment calculator uk", secondary: ["pay off mortgage early uk", "uk mortgage overpayment", "extra mortgage payment uk"] },
  },
  "loan-comparison-calculator": {
    us: { primary: "loan comparison calculator", secondary: ["compare mortgages", "15 vs 30 year mortgage", "mortgage comparison tool"] },
    au: { primary: "home loan comparison calculator", secondary: ["compare home loans australia", "mortgage comparison tool australia", "compare interest rates"] },
    ca: { primary: "mortgage comparison calculator canada", secondary: ["compare mortgages canada", "fixed vs variable mortgage", "mortgage rate comparison"] },
    gb: { primary: "mortgage comparison calculator uk", secondary: ["compare mortgages uk", "fixed vs tracker mortgage", "uk mortgage comparison"] },
  },
};

export const getKeywords = (calcType: CalculatorType, countryCode: string) =>
  calculatorKeywords[calcType]?.[countryCode === "uk" ? "gb" : countryCode];

const titleMap: Partial<Record<CalculatorType, Record<string, string>>> = {
  "mortgage-calculator": {
    us: `Mortgage Calculator USA ${year} | Free Monthly Payment Tool — Zune Calculator`,
    au: `Mortgage Calculator Australia ${year} | Free Repayment & Stamp Duty — Zune Calculator`,
    ca: `Mortgage Calculator Canada ${year} | CMHC, Stress Test & Amortisation — Zune Calculator`,
    gb: `Mortgage Calculator UK ${year} | Free SDLT & Repayment Tool — Zune Calculator`,
  },
  "loan-calculator": {
    us: `Loan Calculator USA ${year} | Personal & Auto Loan Tool — Zune Calculator`,
    au: `Loan Calculator Australia ${year} | Personal & Car Loan Tool — Zune Calculator`,
    ca: `Loan Calculator Canada ${year} | Personal Loan Payment Tool — Zune Calculator`,
    gb: `Loan Calculator UK ${year} | Personal & Car Loan Payment Tool — Zune Calculator`,
  },
  "interest-calculator": {
    us: `Interest Calculator USA ${year} | Compound & Simple Interest — Zune Calculator`,
    au: `Interest Calculator Australia ${year} | Compound Savings Tool — Zune Calculator`,
    ca: `Interest Calculator Canada ${year} | TFSA & GIC Compound Tool — Zune Calculator`,
    gb: `Interest Calculator UK ${year} | ISA & Compound Savings Tool — Zune Calculator`,
  },
  "borrowing-power-calculator": {
    us: `Mortgage Affordability Calculator USA ${year} | How Much Can I Borrow — Zune Calculator`,
    au: `Borrowing Power Calculator Australia ${year} | Home Loan Capacity — Zune Calculator`,
    ca: `Mortgage Affordability Calculator Canada ${year} | Stress Test — Zune Calculator`,
    gb: `Mortgage Affordability Calculator UK ${year} | How Much Can I Borrow — Zune Calculator`,
  },
  "stamp-duty-calculator": {
    us: `Transfer Tax Calculator USA ${year} | Real Estate Closing Costs — Zune Calculator`,
    au: `Stamp Duty Calculator Australia ${year} | NSW VIC QLD WA SA — Zune Calculator`,
    ca: `Land Transfer Tax Calculator Canada ${year} | Ontario, Toronto — Zune Calculator`,
    gb: `Stamp Duty Calculator UK ${year} | SDLT & First-Time Buyer Relief — Zune Calculator`,
  },
  "extra-repayments-calculator": {
    us: `Extra Mortgage Payment Calculator USA ${year} | Pay Off Early — Zune Calculator`,
    au: `Extra Repayments Calculator Australia ${year} | Save Years & Interest — Zune Calculator`,
    ca: `Mortgage Prepayment Calculator Canada ${year} | Lump Sum Savings — Zune Calculator`,
    gb: `Mortgage Overpayment Calculator UK ${year} | Pay Off Early — Zune Calculator`,
  },
  "loan-comparison-calculator": {
    us: `Mortgage Comparison Calculator USA ${year} | 15 vs 30 Year — Zune Calculator`,
    au: `Home Loan Comparison Calculator Australia ${year} | Compare Rates — Zune Calculator`,
    ca: `Mortgage Comparison Calculator Canada ${year} | Fixed vs Variable — Zune Calculator`,
    gb: `Mortgage Comparison Calculator UK ${year} | Fixed vs Tracker — Zune Calculator`,
  },
};

const descMap: Partial<Record<CalculatorType, Record<string, string>>> = {
  "mortgage-calculator": {
    us: `Free USA mortgage calculator for ${year}. Estimate monthly payments, view full amortisation schedules, and compare 15-year vs 30-year fixed rates instantly in USD.`,
    au: `Free Australian mortgage calculator for ${year}. Calculate home loan repayments, compare RBA-impacted rates from Big 4 banks, and view amortisation in AUD.`,
    ca: `Free Canadian mortgage calculator for ${year}. Estimate payments with CMHC insurance, semi-annual compounding, stress test rates, and full amortisation in CAD.`,
    gb: `Free UK mortgage calculator for ${year}. Estimate monthly repayments, compare fixed and tracker rates, and view full amortisation schedules in GBP.`,
  },
  "loan-calculator": {
    us: `Free USA loan calculator for ${year}. Calculate personal, auto, and student loan payments. Compare rates and see total borrowing costs in USD.`,
    au: `Free Australian loan calculator for ${year}. Estimate personal and car loan repayments, compare lender rates, and see total interest in AUD.`,
    ca: `Free Canadian loan calculator for ${year}. Calculate personal and auto loan payments, compare interest rates, and view full schedules in CAD.`,
    gb: `Free UK loan calculator for ${year}. Estimate personal and car loan repayments, compare APR, and see total cost in GBP.`,
  },
  "interest-calculator": {
    us: `Free compound and simple interest calculator for ${year}. Project savings growth, investment returns, and APY-adjusted earnings instantly in USD.`,
    au: `Free Australian interest calculator for ${year}. Project compound interest on savings and term deposits, with regular contributions in AUD.`,
    ca: `Free Canadian interest calculator for ${year}. Calculate compound interest on TFSA, FHSA, and GIC growth in CAD.`,
    gb: `Free UK interest calculator for ${year}. Project compound interest on ISA, savings, and bond growth in GBP.`,
  },
  "borrowing-power-calculator": {
    us: `Free USA mortgage affordability calculator for ${year}. See exactly how much you can borrow based on income, expenses, and lender stress tests.`,
    au: `Free Australian borrowing power calculator for ${year}. Estimate maximum home loan with APRA serviceability buffer and partner income.`,
    ca: `Free Canadian mortgage affordability tool for ${year}. Apply the federal stress test to find your maximum approved mortgage amount in CAD.`,
    gb: `Free UK mortgage affordability calculator for ${year}. Estimate how much you can borrow under FCA MMR rules and lender stress tests.`,
  },
  "stamp-duty-calculator": {
    us: `Free USA real estate transfer tax calculator for ${year}. Estimate state-level closing costs, recordation fees, and total upfront cash needed.`,
    au: `Free Australian stamp duty calculator for ${year}. Compare NSW, VIC, QLD, WA, and SA brackets with first-home-buyer concessions.`,
    ca: `Free Canadian land transfer tax calculator for ${year}. Calculate Ontario LTT, Toronto municipal LTT, and first-time buyer rebates.`,
    gb: `Free UK stamp duty calculator (SDLT) for ${year}. Apply current bands plus first-time buyer relief instantly in GBP.`,
  },
  "extra-repayments-calculator": {
    us: `Free extra mortgage payment calculator for ${year}. See how an additional principal payment can shave years off your loan and save thousands in interest.`,
    au: `Free extra repayments calculator for ${year}. See how additional monthly repayments shorten your home loan and slash total Australian interest paid.`,
    ca: `Free Canadian mortgage prepayment calculator for ${year}. Model lump-sum and accelerated payments, including CMHC-eligible prepayment limits.`,
    gb: `Free UK mortgage overpayment calculator for ${year}. See how 10% annual overpayments and lump sums shorten your term and cut total interest.`,
  },
  "loan-comparison-calculator": {
    us: `Free loan comparison calculator for ${year}. Compare two mortgage scenarios side-by-side — 15 vs 30 years, fixed vs ARM — and see the lifetime savings.`,
    au: `Free Australian home loan comparison calculator for ${year}. Compare two scenarios on rate, term, and fees — see exactly which loan saves more.`,
    ca: `Free Canadian mortgage comparison calculator for ${year}. Compare fixed vs variable, 25 vs 30 year amortisations, and total interest paid.`,
    gb: `Free UK mortgage comparison calculator for ${year}. Compare fixed vs tracker, 25 vs 35 year terms, and total interest cost in GBP.`,
  },
};

export const generateCalculatorMeta = (calcType: CalculatorType, country: CountryConfig): MetaConfig => {
  const meta = calculatorMeta[calcType];
  const title = titleMap[calcType]?.[country.code] ?? `${meta.title} ${country.name} ${year} | Zune Calculator`;
  const description = descMap[calcType]?.[country.code] ?? `Free ${meta.title.toLowerCase()} for ${country.name}. ${meta.description} Updated ${year}.`;

  return {
    title,
    description,
    canonical: `/${country.code}/${calcType}`,
    ogType: "website",
  };
};

export const generateCountryMeta = (country: CountryConfig): MetaConfig => ({
  title: `${country.name} Mortgage Calculator ${year} | Repayment, Stamp Duty — Zune Calculator`,
  description: `Premium mortgage calculators for ${country.name} in ${year}. Mortgage repayments, borrowing power, stamp duty, extra repayments and loan comparison in ${country.currency}.`,
  canonical: `/${country.code}`,
  ogType: "website",
});

export const generateHomeMeta = (): MetaConfig => ({
  title: `Zune Calculator — Mortgage Calculator (US, AU, CA, UK ${year})`,
  description: `Zune Calculator offers bank-grade mortgage calculators for the US, Australia, Canada and UK. Mortgage, borrowing power, stamp duty, extra repayments, loan comparison — instant, accurate, free.`,
  canonical: "/",
  ogType: "website",
});

export const generateStaticPageMeta = (page: "about" | "contact" | "privacy-policy" | "terms"): MetaConfig => {
  const metas: Record<string, MetaConfig> = {
    about: {
      title: `About Zune Calculator — Premium Financial Calculators for US, AU, CA, UK`,
      description: `Learn about Zune Calculator — bank-grade mortgage, loan, stamp duty and interest calculators serving the US, Australia, Canada and the United Kingdom.`,
      canonical: "/about",
    },
    contact: {
      title: `Contact Zune Calculator — Premium Financial Calculators`,
      description: `Get in touch with the Zune Calculator team. Questions, feedback, or partnership inquiries about our premium financial calculator suite.`,
      canonical: "/contact",
    },
    "privacy-policy": {
      title: `Privacy Policy — Zune Calculator`,
      description: `Zune Calculator privacy policy. How we handle your data, cookies, analytics, and advertising. GDPR and CCPA compliant.`,
      canonical: "/privacy-policy",
      robots: "noindex, follow",
    },
    terms: {
      title: `Terms of Service — Zune Calculator`,
      description: `Terms of service for Zune Calculator. Read our disclaimer, calculator accuracy information, and usage terms for US, AU, CA, UK.`,
      canonical: "/terms",
      robots: "noindex, follow",
    },
  };
  return metas[page];
};

export { baseUrl };
