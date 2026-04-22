export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  defaultRate: number;
  defaultTerm: number;
  defaultAmount: number;
  rateLabel: string;
  cities: string[];
}

export const countries: Record<string, CountryConfig> = {
  us: {
    code: "us",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇺🇸",
    defaultRate: 7.10,
    defaultTerm: 30,
    defaultAmount: 400000,
    rateLabel: "30yr Fixed Rate",
    cities: [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
      "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
    ],
  },
  au: {
    code: "au",
    name: "Australia",
    currency: "AUD",
    currencySymbol: "$",
    flag: "🇦🇺",
    defaultRate: 6.25,
    defaultTerm: 30,
    defaultAmount: 650000,
    rateLabel: "RBA Variable Rate",
    cities: [
      "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
      "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin",
    ],
  },
  ca: {
    code: "ca",
    name: "Canada",
    currency: "CAD",
    currencySymbol: "$",
    flag: "🇨🇦",
    defaultRate: 5.45,
    defaultTerm: 25,
    defaultAmount: 550000,
    rateLabel: "Mortgage Rate",
    cities: [
      "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton",
      "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Victoria",
    ],
  },
  uk: {
    code: "uk",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    flag: "🇬🇧",
    defaultRate: 5.25,
    defaultTerm: 25,
    defaultAmount: 280000,
    rateLabel: "Base Rate",
    cities: [
      "London", "Manchester", "Birmingham", "Edinburgh", "Glasgow",
      "Bristol", "Leeds", "Liverpool", "Cardiff", "Belfast",
    ],
  },
};

export const getCountry = (code: string): CountryConfig | undefined => countries[code];

export const calculatorTypes = [
  "mortgage-calculator",
  "borrowing-power-calculator",
  "stamp-duty-calculator",
  "extra-repayments-calculator",
  "loan-comparison-calculator",
  "loan-calculator",
  "interest-calculator",
] as const;
export type CalculatorType = typeof calculatorTypes[number];

/**
 * The 5 "premium tabs" surfaced in the bank-style top + bottom navigation.
 * Loan + interest are still indexable but live as supplementary calculators.
 */
export const primaryCalculatorTypes: CalculatorType[] = [
  "mortgage-calculator",
  "borrowing-power-calculator",
  "stamp-duty-calculator",
  "extra-repayments-calculator",
  "loan-comparison-calculator",
];

export const calculatorMeta: Record<
  CalculatorType,
  { title: string; shortTitle: string; description: string; tabLabel: string; icon: string }
> = {
  "mortgage-calculator": {
    title: "Mortgage Calculator",
    shortTitle: "Mortgage",
    description: "Calculate monthly home loan repayments, total interest, and view a full amortisation schedule.",
    tabLabel: "Repayment",
    icon: "🏠",
  },
  "borrowing-power-calculator": {
    title: "Borrowing Power Calculator",
    shortTitle: "Borrowing Power",
    description: "Estimate the maximum home loan you could qualify for based on income, expenses, and lender stress tests.",
    tabLabel: "Borrow Power",
    icon: "💪",
  },
  "stamp-duty-calculator": {
    title: "Stamp Duty Calculator",
    shortTitle: "Stamp Duty",
    description: "Calculate stamp duty, transfer tax, and upfront costs by state, with first-home-buyer concessions.",
    tabLabel: "Stamp Duty",
    icon: "📋",
  },
  "extra-repayments-calculator": {
    title: "Extra Repayments Calculator",
    shortTitle: "Extra Repayments",
    description: "See how extra monthly repayments shorten your loan term and slash total interest paid.",
    tabLabel: "Extra Repayments",
    icon: "⚡",
  },
  "loan-comparison-calculator": {
    title: "Loan Comparison Calculator",
    shortTitle: "Compare Loans",
    description: "Compare two mortgage scenarios side-by-side — see which one saves you more over the loan life.",
    tabLabel: "Compare Loans",
    icon: "⚖️",
  },
  "loan-calculator": {
    title: "Loan Calculator",
    shortTitle: "Loan",
    description: "Estimate monthly loan repayments, total cost of borrowing, and full payoff timeline.",
    tabLabel: "Loan",
    icon: "💳",
  },
  "interest-calculator": {
    title: "Interest Calculator",
    shortTitle: "Interest",
    description: "Calculate simple and compound interest on savings or investments over time.",
    tabLabel: "Interest",
    icon: "📈",
  },
};
