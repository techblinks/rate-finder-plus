import { CountryConfig, CalculatorType } from "./countries";

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

const usCities: CityConfig[] = [
  { name: "New York", slug: "new-york", state: "NY", medianHomePrice: 680000, avgMortgageRate: 6.85, avgRent: 3500, population: "8.3M", highlights: ["Co-ops and condos dominate", "High property taxes", "Competitive market"] },
  { name: "Los Angeles", slug: "los-angeles", state: "CA", medianHomePrice: 950000, avgMortgageRate: 6.75, avgRent: 2800, population: "3.9M", highlights: ["Jumbo loans common", "ADU-friendly zoning", "Earthquake insurance needed"] },
  { name: "Chicago", slug: "chicago", state: "IL", medianHomePrice: 330000, avgMortgageRate: 6.70, avgRent: 1900, population: "2.7M", highlights: ["Affordable vs coasts", "High property taxes", "Strong rental market"] },
  { name: "Houston", slug: "houston", state: "TX", medianHomePrice: 310000, avgMortgageRate: 6.80, avgRent: 1400, population: "2.3M", highlights: ["No state income tax", "Flood zone considerations", "Rapid suburban growth"] },
  { name: "Phoenix", slug: "phoenix", state: "AZ", medianHomePrice: 420000, avgMortgageRate: 6.75, avgRent: 1600, population: "1.6M", highlights: ["Fast appreciation", "Low property taxes", "Desert climate savings"] },
  { name: "Philadelphia", slug: "philadelphia", state: "PA", medianHomePrice: 260000, avgMortgageRate: 6.70, avgRent: 1500, population: "1.6M", highlights: ["Affordable Northeast option", "Wage tax for residents", "Historic neighborhoods"] },
  { name: "San Antonio", slug: "san-antonio", state: "TX", medianHomePrice: 280000, avgMortgageRate: 6.80, avgRent: 1300, population: "1.5M", highlights: ["No state income tax", "Military-friendly lending", "Growing tech sector"] },
  { name: "San Diego", slug: "san-diego", state: "CA", medianHomePrice: 870000, avgMortgageRate: 6.75, avgRent: 2600, population: "1.4M", highlights: ["VA loan popular (military)", "Coastal premium", "Limited housing supply"] },
  { name: "Dallas", slug: "dallas", state: "TX", medianHomePrice: 380000, avgMortgageRate: 6.80, avgRent: 1600, population: "1.3M", highlights: ["No state income tax", "DFW suburban boom", "Corporate relocations driving demand"] },
  { name: "Austin", slug: "austin", state: "TX", medianHomePrice: 480000, avgMortgageRate: 6.80, avgRent: 1700, population: "1.0M", highlights: ["Tech hub growth", "No state income tax", "High demand from transplants"] },
];

const auCities: CityConfig[] = [
  { name: "Sydney", slug: "sydney", state: "NSW", medianHomePrice: 1150000, avgMortgageRate: 6.30, avgRent: 750, population: "5.3M", highlights: ["Most expensive market", "Stamp duty reform ongoing", "Strong auction culture"] },
  { name: "Melbourne", slug: "melbourne", state: "VIC", medianHomePrice: 780000, avgMortgageRate: 6.25, avgRent: 580, population: "5.0M", highlights: ["Auction-dominated market", "Investor-friendly", "Inner-city apartments competitive"] },
  { name: "Brisbane", slug: "brisbane", state: "QLD", medianHomePrice: 750000, avgMortgageRate: 6.20, avgRent: 600, population: "2.5M", highlights: ["Strong capital growth", "Olympic 2032 infrastructure", "No stamp duty for FHB under threshold"] },
  { name: "Perth", slug: "perth", state: "WA", medianHomePrice: 620000, avgMortgageRate: 6.25, avgRent: 550, population: "2.1M", highlights: ["Mining boom influence", "Affordable vs east coast", "Rising rental yields"] },
  { name: "Adelaide", slug: "adelaide", state: "SA", medianHomePrice: 680000, avgMortgageRate: 6.20, avgRent: 500, population: "1.4M", highlights: ["Strong price growth", "Defence sector investment", "Affordable relative to size"] },
  { name: "Gold Coast", slug: "gold-coast", state: "QLD", medianHomePrice: 830000, avgMortgageRate: 6.25, avgRent: 650, population: "700K", highlights: ["Tourism-driven economy", "Lifestyle premium", "Strong interstate migration"] },
  { name: "Canberra", slug: "canberra", state: "ACT", medianHomePrice: 850000, avgMortgageRate: 6.20, avgRent: 620, population: "460K", highlights: ["Government employment stability", "High median incomes", "Stamp duty being replaced by land tax"] },
  { name: "Newcastle", slug: "newcastle", state: "NSW", medianHomePrice: 750000, avgMortgageRate: 6.25, avgRent: 520, population: "320K", highlights: ["Sydney overflow market", "Harbour city lifestyle", "Emerging tech hub"] },
  { name: "Hobart", slug: "hobart", state: "TAS", medianHomePrice: 630000, avgMortgageRate: 6.20, avgRent: 480, population: "240K", highlights: ["Rapid price appreciation", "Limited housing stock", "Growing tourism economy"] },
  { name: "Darwin", slug: "darwin", state: "NT", medianHomePrice: 490000, avgMortgageRate: 6.30, avgRent: 520, population: "140K", highlights: ["Most affordable capital", "Defence and mining economy", "Tropical climate building costs"] },
];

const caCities: CityConfig[] = [
  { name: "Toronto", slug: "toronto", state: "ON", medianHomePrice: 1100000, avgMortgageRate: 5.55, avgRent: 2800, population: "2.9M", highlights: ["Most expensive market", "Foreign buyer ban impacts", "Condo market dominates"] },
  { name: "Vancouver", slug: "vancouver", state: "BC", medianHomePrice: 1200000, avgMortgageRate: 5.50, avgRent: 2700, population: "2.6M", highlights: ["Foreign buyer tax", "Empty homes tax", "Highest prices nationally"] },
  { name: "Montreal", slug: "montreal", state: "QC", medianHomePrice: 530000, avgMortgageRate: 5.45, avgRent: 1600, population: "1.8M", highlights: ["Welcome tax (mutation)", "Bilingual market", "Affordable vs Toronto/Vancouver"] },
  { name: "Calgary", slug: "calgary", state: "AB", medianHomePrice: 520000, avgMortgageRate: 5.50, avgRent: 1800, population: "1.3M", highlights: ["No provincial sales tax", "Oil economy influence", "Strong price recovery"] },
  { name: "Edmonton", slug: "edmonton", state: "AB", medianHomePrice: 380000, avgMortgageRate: 5.50, avgRent: 1400, population: "1.0M", highlights: ["Most affordable major city", "No provincial sales tax", "Government sector employment"] },
  { name: "Ottawa", slug: "ottawa", state: "ON", medianHomePrice: 620000, avgMortgageRate: 5.55, avgRent: 2100, population: "1.0M", highlights: ["Government employment stability", "Bilingual market", "Steady appreciation"] },
  { name: "Winnipeg", slug: "winnipeg", state: "MB", medianHomePrice: 350000, avgMortgageRate: 5.50, avgRent: 1300, population: "750K", highlights: ["Very affordable housing", "Land transfer tax applies", "Growing immigrant population"] },
  { name: "Quebec City", slug: "quebec-city", state: "QC", medianHomePrice: 340000, avgMortgageRate: 5.45, avgRent: 1100, population: "550K", highlights: ["Francophone market", "Low vacancy rates", "Affordable historic city"] },
  { name: "Hamilton", slug: "hamilton", state: "ON", medianHomePrice: 720000, avgMortgageRate: 5.55, avgRent: 1900, population: "580K", highlights: ["Toronto spillover market", "GO Transit commuter city", "Revitalizing downtown"] },
  { name: "Victoria", slug: "victoria", state: "BC", medianHomePrice: 880000, avgMortgageRate: 5.50, avgRent: 2200, population: "400K", highlights: ["Island premium pricing", "Retirement destination", "Limited land supply"] },
];

export const citiesByCountry: Record<string, CityConfig[]> = {
  us: usCities,
  au: auCities,
  ca: caCities,
};

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
