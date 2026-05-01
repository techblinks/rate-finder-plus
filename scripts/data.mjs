// Build-time mirror of countries + calculatorMeta data so prerender/sitemap scripts run as
// plain Node ESM (no TS transpile step needed). Keep in sync with src/data/countries.ts.

export const countries = {
  us: { code: "us", name: "United States", currency: "USD", currencySymbol: "$", flag: "🇺🇸", defaultRate: 7.10, defaultTerm: 30, defaultAmount: 400000, rateLabel: "30yr Fixed Rate" },
  au: { code: "au", name: "Australia", currency: "AUD", currencySymbol: "$", flag: "🇦🇺", defaultRate: 6.25, defaultTerm: 30, defaultAmount: 650000, rateLabel: "RBA Variable Rate" },
  ca: { code: "ca", name: "Canada", currency: "CAD", currencySymbol: "$", flag: "🇨🇦", defaultRate: 5.45, defaultTerm: 25, defaultAmount: 550000, rateLabel: "Mortgage Rate" },
  gb: { code: "gb", name: "United Kingdom", currency: "GBP", currencySymbol: "£", flag: "🇬🇧", defaultRate: 5.25, defaultTerm: 25, defaultAmount: 280000, rateLabel: "Base Rate" },
};

// Only the calculator types that have city-specific pages.
export const cityCalculatorTypes = /** @type {const} */ ([
  "mortgage-calculator",
  "loan-calculator",
  "interest-calculator",
]);

// All calculators (for country-level prerender + sitemap).
export const allCalculatorTypes = [
  "mortgage-calculator",
  "borrowing-power-calculator",
  "stamp-duty-calculator",
  "extra-repayments-calculator",
  "mortgage-insurance-calculator",
  "loan-comparison-calculator",
  "loan-calculator",
  "interest-calculator",
];

export const calculatorMeta = {
  "mortgage-calculator":            { title: "Mortgage Calculator",            shortTitle: "Mortgage",          description: "Calculate your monthly mortgage repayment, total interest, and amortization." },
  "loan-calculator":                { title: "Loan Calculator",                shortTitle: "Loan",              description: "Estimate personal-loan repayments and total cost over the life of the loan." },
  "interest-calculator":            { title: "Interest Calculator",            shortTitle: "Interest",          description: "Project compound interest growth on savings and investments." },
  "borrowing-power-calculator":     { title: "Borrowing Power Calculator",     shortTitle: "Borrowing Power",   description: "See how much you can borrow based on income, expenses, and rates." },
  "stamp-duty-calculator":          { title: "Stamp Duty Calculator",          shortTitle: "Stamp Duty",        description: "Estimate stamp duty / transfer tax on a property purchase." },
  "extra-repayments-calculator":    { title: "Extra Repayments Calculator",    shortTitle: "Extra Repayments",  description: "See how extra payments shorten your loan and cut interest." },
  "mortgage-insurance-calculator":  { title: "Mortgage Insurance Calculator",  shortTitle: "Mortgage Insurance", description: "Estimate LMI / PMI premiums based on your deposit." },
  "loan-comparison-calculator":     { title: "Loan Comparison Calculator",     shortTitle: "Loan Comparison",   description: "Compare two loan scenarios side-by-side." },
};
