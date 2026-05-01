import { CountryConfig, CalculatorType } from "./countries";
// Single source of truth for city data lives in plain JS so build-time scripts
// (prerender, sitemap) can import the same dataset without a TS toolchain.
import { citiesByCountry as citiesByCountryRaw } from "./cities.data.js";

export interface CityConfig {
  name: string;
  slug: string;
  state?: string;
  medianHomePrice: number;
  avgMortgageRate: number;
  avgRent: number;
  population: string;
  highlights: string[];
}

export const citiesByCountry: Record<string, CityConfig[]> = citiesByCountryRaw as Record<string, CityConfig[]>;

export const getCityBySlug = (countryCode: string, slug: string): CityConfig | undefined =>
  citiesByCountry[countryCode]?.find((c) => c.slug === slug);

export const parseCityFromCalculatorSlug = (slug: string): { calcType: CalculatorType | null; citySlug: string | null } => {
  const calcPrefixes = ["mortgage-calculator", "loan-calculator", "interest-calculator"] as const;
  for (const prefix of calcPrefixes) {
    if (slug.startsWith(`${prefix}-`)) {
      return { calcType: prefix, citySlug: slug.slice(prefix.length + 1) };
    }
    if (slug === prefix) {
      return { calcType: prefix, citySlug: null };
    }
  }
  return { calcType: null, citySlug: null };
};

export const generateCityFAQs = (city: CityConfig, country: CountryConfig, calcType: CalculatorType): { question: string; answer: string }[] => {
  const year = new Date().getFullYear();
  const sym = country.currencySymbol;

  const base = [
    {
      question: `What is the average home price in ${city.name} in ${year}?`,
      answer: `The median home price in ${city.name} is approximately ${sym}${city.medianHomePrice.toLocaleString()} as of ${year}. Prices vary significantly by neighborhood, property type, and condition.`,
    },
    {
      question: `What mortgage rate can I expect in ${city.name}?`,
      answer: `Average mortgage rates in ${city.name} are around ${city.avgMortgageRate}% for a standard fixed-rate mortgage. Your actual rate depends on your credit score, down payment, and lender.`,
    },
    {
      question: `Is it cheaper to rent or buy in ${city.name}?`,
      answer: `Average rent in ${city.name} is ${sym}${city.avgRent.toLocaleString()}/month. With a median home price of ${sym}${city.medianHomePrice.toLocaleString()}, the buy-vs-rent decision depends on your timeline, savings, and local market conditions.`,
    },
    {
      question: `How much down payment do I need to buy a home in ${city.name}?`,
      answer: `Most lenders require 5–20% down. On a ${sym}${city.medianHomePrice.toLocaleString()} home in ${city.name}, that's ${sym}${(city.medianHomePrice * 0.05).toLocaleString()} to ${sym}${(city.medianHomePrice * 0.2).toLocaleString()}.`,
    },
    {
      question: `What are the property market trends in ${city.name}?`,
      answer: `${city.name} (population ${city.population}) has seen ${city.highlights[0].toLowerCase()}. Key factors include ${city.highlights.slice(1).join(" and ").toLowerCase()}.`,
    },
    {
      question: `How do I calculate my monthly mortgage payment in ${city.name}?`,
      answer: `Use our free ${city.name} mortgage calculator above. Enter the home price (avg ${sym}${city.medianHomePrice.toLocaleString()}), your down payment, interest rate (avg ${city.avgMortgageRate}%), and loan term to get an instant estimate.`,
    },
  ];

  if (calcType === "loan-calculator") {
    base[5] = {
      question: `What are typical personal loan rates in ${city.name}?`,
      answer: `Personal loan rates in ${city.name} typically range from 6% to 15% depending on your credit profile. Use our calculator to estimate payments at different rates.`,
    };
  } else if (calcType === "interest-calculator") {
    base[5] = {
      question: `What savings rates are available in ${city.name}?`,
      answer: `High-yield savings accounts in ${city.name} currently offer 4–5% APY. Use our interest calculator to project growth on your savings over time.`,
    };
  }

  return base;
};

export const generateCityContent = (city: CityConfig, country: CountryConfig, calcType: CalculatorType) => {
  const year = new Date().getFullYear();
  const sym = country.currencySymbol;
  const calcName = calcType === "mortgage-calculator" ? "Mortgage" : calcType === "loan-calculator" ? "Loan" : "Interest";

  return {
    h1: `${city.name} ${calcName} Calculator ${year} — ${country.name}`,
    intro: `Calculate your ${calcName.toLowerCase()} payments for ${city.name}, ${city.state || country.name}. With a median home price of ${sym}${city.medianHomePrice.toLocaleString()} and average rates around ${city.avgMortgageRate}%, our free calculator helps ${city.name} residents and buyers make informed financial decisions. ${city.name} has a population of ${city.population} and is known for ${city.highlights[0].toLowerCase()}.`,
    localInsights: `The ${city.name} real estate market in ${year} is shaped by several key factors. ${city.highlights.map((h) => h + ".").join(" ")} Average mortgage rates in ${city.name} sit around ${city.avgMortgageRate}%, while the median property price is ${sym}${city.medianHomePrice.toLocaleString()}. Monthly rent averages ${sym}${city.avgRent.toLocaleString()}, making the rent-vs-buy calculation particularly relevant for ${city.name} residents. Local economic conditions, employment trends, and housing supply all influence what you'll pay for property in ${city.name}.`,
    tips: [
      `Research ${city.name} neighborhoods carefully — prices can vary 30–50% between areas.`,
      `Get pre-approved before house hunting in ${city.name}'s competitive market.`,
      `Factor in ${city.state ? `${city.state} ` : ""}property taxes and insurance when budgeting.`,
      `Consider the commute and transit options — they directly impact property values in ${city.name}.`,
      `Work with a local ${city.name} real estate agent who knows micro-market trends.`,
    ],
  };
};
