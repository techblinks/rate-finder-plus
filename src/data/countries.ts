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
    defaultRate: 6.75,
    defaultTerm: 30,
    defaultAmount: 350000,
    rateLabel: "APR",
    cities: [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
      "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin",
    ],
  },
  au: {
    code: "au",
    name: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
    flag: "🇦🇺",
    defaultRate: 6.25,
    defaultTerm: 30,
    defaultAmount: 600000,
    rateLabel: "Interest Rate",
    cities: [
      "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
      "Gold Coast", "Canberra", "Newcastle", "Hobart", "Darwin",
    ],
  },
  ca: {
    code: "ca",
    name: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    flag: "🇨🇦",
    defaultRate: 5.50,
    defaultTerm: 25,
    defaultAmount: 500000,
    rateLabel: "Interest Rate",
    cities: [
      "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton",
      "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Victoria",
    ],
  },
};

export const getCountry = (code: string): CountryConfig | undefined => countries[code];

export const calculatorTypes = ["mortgage-calculator", "loan-calculator", "interest-calculator"] as const;
export type CalculatorType = typeof calculatorTypes[number];

export const calculatorMeta: Record<CalculatorType, { title: string; shortTitle: string; description: string }> = {
  "mortgage-calculator": {
    title: "Mortgage Calculator",
    shortTitle: "Mortgage",
    description: "Calculate your monthly mortgage payments, total interest, and view a full amortization schedule.",
  },
  "loan-calculator": {
    title: "Loan Calculator",
    shortTitle: "Loan",
    description: "Estimate your monthly loan payments, total cost of borrowing, and payoff timeline.",
  },
  "interest-calculator": {
    title: "Interest Calculator",
    shortTitle: "Interest",
    description: "Calculate simple and compound interest on your savings or investments over time.",
  },
};
