// Plain-JS dataset shared between the runtime app and the build-time prerender/sitemap scripts.
// Source of truth for city-specific SEO content. No TS, so Node ESM scripts can import directly.

/** @typedef {{name:string,slug:string,state?:string,medianHomePrice:number,avgMortgageRate:number,avgRent:number,population:string,highlights:string[]}} CityConfig */

/** @type {CityConfig[]} */
const usCities = [
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
  { name: "San Jose", slug: "san-jose", state: "CA", medianHomePrice: 1380000, avgMortgageRate: 6.75, avgRent: 3100, population: "1.0M", highlights: ["Silicon Valley pricing", "Tech-driven demand", "High median income offsets cost"] },
  { name: "Jacksonville", slug: "jacksonville", state: "FL", medianHomePrice: 320000, avgMortgageRate: 6.80, avgRent: 1500, population: "950K", highlights: ["No state income tax", "Coastal lifestyle", "Affordable Florida market"] },
  { name: "Indianapolis", slug: "indianapolis", state: "IN", medianHomePrice: 240000, avgMortgageRate: 6.70, avgRent: 1200, population: "880K", highlights: ["One of the most affordable US metros", "Strong rental yields", "Growing logistics sector"] },
  { name: "Columbus", slug: "columbus", state: "OH", medianHomePrice: 270000, avgMortgageRate: 6.70, avgRent: 1300, population: "910K", highlights: ["Insurance & tech employment hub", "Steady appreciation", "Affordable Midwest pricing"] },
  { name: "Charlotte", slug: "charlotte", state: "NC", medianHomePrice: 390000, avgMortgageRate: 6.75, avgRent: 1700, population: "880K", highlights: ["Banking sector employment", "Strong inbound migration", "No estate tax"] },
  { name: "Seattle", slug: "seattle", state: "WA", medianHomePrice: 850000, avgMortgageRate: 6.75, avgRent: 2300, population: "750K", highlights: ["No state income tax", "Tech sector concentration", "Limited supply downtown"] },
  { name: "Denver", slug: "denver", state: "CO", medianHomePrice: 580000, avgMortgageRate: 6.75, avgRent: 1900, population: "710K", highlights: ["Mountain lifestyle premium", "Strong job growth", "Property tax cap protections"] },
  { name: "Boston", slug: "boston", state: "MA", medianHomePrice: 780000, avgMortgageRate: 6.75, avgRent: 2900, population: "650K", highlights: ["University-driven rentals", "Limited land supply", "Strong long-term appreciation"] },
  { name: "Nashville", slug: "nashville", state: "TN", medianHomePrice: 460000, avgMortgageRate: 6.80, avgRent: 1700, population: "690K", highlights: ["No state income tax", "Music & healthcare economy", "Rapid in-migration"] },
  { name: "Portland", slug: "portland", state: "OR", medianHomePrice: 530000, avgMortgageRate: 6.75, avgRent: 1800, population: "650K", highlights: ["Urban growth boundary limits supply", "No sales tax", "Strong walkability premium"] },
  { name: "Las Vegas", slug: "las-vegas", state: "NV", medianHomePrice: 420000, avgMortgageRate: 6.80, avgRent: 1600, population: "660K", highlights: ["No state income tax", "Tourism-linked economy", "Investor-heavy market"] },
  { name: "Miami", slug: "miami", state: "FL", medianHomePrice: 580000, avgMortgageRate: 6.80, avgRent: 2400, population: "450K", highlights: ["No state income tax", "International buyer demand", "Hurricane insurance required"] },
  { name: "Atlanta", slug: "atlanta", state: "GA", medianHomePrice: 410000, avgMortgageRate: 6.75, avgRent: 1700, population: "500K", highlights: ["Southeast economic hub", "Film industry growth", "Strong rental demand"] },
  { name: "Minneapolis", slug: "minneapolis", state: "MN", medianHomePrice: 340000, avgMortgageRate: 6.70, avgRent: 1500, population: "430K", highlights: ["Fortune 500 corporate base", "Strong public-school districts", "Cold-climate construction costs"] },
  { name: "Tampa", slug: "tampa", state: "FL", medianHomePrice: 400000, avgMortgageRate: 6.80, avgRent: 1800, population: "400K", highlights: ["No state income tax", "Strong retiree migration", "Flood insurance considerations"] },
];

/** @type {CityConfig[]} */
const auCities = [
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
  { name: "Wollongong", slug: "wollongong", state: "NSW", medianHomePrice: 820000, avgMortgageRate: 6.25, avgRent: 560, population: "310K", highlights: ["Coastal Sydney commuter market", "University-driven rentals", "Strong lifestyle premium"] },
  { name: "Geelong", slug: "geelong", state: "VIC", medianHomePrice: 680000, avgMortgageRate: 6.25, avgRent: 480, population: "270K", highlights: ["Melbourne spillover market", "Waterfront regeneration", "Strong infrastructure investment"] },
  { name: "Townsville", slug: "townsville", state: "QLD", medianHomePrice: 410000, avgMortgageRate: 6.30, avgRent: 460, population: "180K", highlights: ["Defence base economy", "Affordable Queensland market", "Cyclone insurance required"] },
  { name: "Cairns", slug: "cairns", state: "QLD", medianHomePrice: 460000, avgMortgageRate: 6.30, avgRent: 480, population: "150K", highlights: ["Tourism-led economy", "Tropical lifestyle market", "Strong holiday-rental yields"] },
  { name: "Sunshine Coast", slug: "sunshine-coast", state: "QLD", medianHomePrice: 880000, avgMortgageRate: 6.25, avgRent: 660, population: "350K", highlights: ["Lifestyle migration hotspot", "Coastal premium pricing", "Olympic 2032 infrastructure benefits"] },
];

/** @type {CityConfig[]} */
const caCities = [
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
  { name: "Mississauga", slug: "mississauga", state: "ON", medianHomePrice: 1050000, avgMortgageRate: 5.55, avgRent: 2500, population: "720K", highlights: ["GTA suburb premium", "Strong condo market", "Pearson Airport employment"] },
  { name: "Brampton", slug: "brampton", state: "ON", medianHomePrice: 990000, avgMortgageRate: 5.55, avgRent: 2400, population: "650K", highlights: ["Family-oriented suburb", "Strong inbound migration", "Detached home premium"] },
  { name: "Surrey", slug: "surrey", state: "BC", medianHomePrice: 1100000, avgMortgageRate: 5.50, avgRent: 2400, population: "570K", highlights: ["Vancouver overflow market", "Skytrain extensions driving prices", "Diverse housing stock"] },
  { name: "Halifax", slug: "halifax", state: "NS", medianHomePrice: 480000, avgMortgageRate: 5.50, avgRent: 1900, population: "450K", highlights: ["Atlantic Canada hub", "Recent rapid appreciation", "University and naval employment"] },
  { name: "Saskatoon", slug: "saskatoon", state: "SK", medianHomePrice: 360000, avgMortgageRate: 5.50, avgRent: 1300, population: "270K", highlights: ["Affordable prairie market", "Resource economy influence", "Strong yields for investors"] },
];

/** @type {CityConfig[]} */
const gbCities = [
  { name: "London", slug: "london", state: "England", medianHomePrice: 525000, avgMortgageRate: 5.25, avgRent: 2400, population: "9.0M", highlights: ["Highest UK prices", "Strong transport links", "Competitive mortgage market"] },
  { name: "Manchester", slug: "manchester", state: "England", medianHomePrice: 260000, avgMortgageRate: 5.15, avgRent: 1200, population: "550K", highlights: ["Northern growth hub", "Strong rental demand", "Regeneration areas"] },
  { name: "Birmingham", slug: "birmingham", state: "England", medianHomePrice: 250000, avgMortgageRate: 5.15, avgRent: 1100, population: "1.1M", highlights: ["HS2 infrastructure boost", "Affordable major city", "Strong student population"] },
  { name: "Leeds", slug: "leeds", state: "England", medianHomePrice: 240000, avgMortgageRate: 5.15, avgRent: 1000, population: "800K", highlights: ["Financial sector hub", "Strong yields outside London", "Major regeneration ongoing"] },
  { name: "Glasgow", slug: "glasgow", state: "Scotland", medianHomePrice: 200000, avgMortgageRate: 5.20, avgRent: 950, population: "630K", highlights: ["Most affordable major UK city", "LBTT applies (not stamp duty)", "Strong rental yields"] },
  { name: "Liverpool", slug: "liverpool", state: "England", medianHomePrice: 200000, avgMortgageRate: 5.15, avgRent: 900, population: "500K", highlights: ["Excellent rental yields", "Cultural regeneration", "Affordable terrace housing"] },
  { name: "Bristol", slug: "bristol", state: "England", medianHomePrice: 360000, avgMortgageRate: 5.20, avgRent: 1500, population: "470K", highlights: ["Strong professional employment", "Limited housing supply", "South-West premium pricing"] },
  { name: "Edinburgh", slug: "edinburgh", state: "Scotland", medianHomePrice: 320000, avgMortgageRate: 5.20, avgRent: 1300, population: "520K", highlights: ["LBTT instead of stamp duty", "Festival-driven short-let market", "Limited new build supply"] },
  { name: "Sheffield", slug: "sheffield", state: "England", medianHomePrice: 220000, avgMortgageRate: 5.15, avgRent: 950, population: "550K", highlights: ["Affordable Northern city", "Strong student rental market", "Green-belt protected"] },
  { name: "Cardiff", slug: "cardiff", state: "Wales", medianHomePrice: 260000, avgMortgageRate: 5.20, avgRent: 1100, population: "370K", highlights: ["LTT instead of stamp duty", "Capital city premium for Wales", "Strong public-sector employment"] },
  { name: "Belfast", slug: "belfast", state: "Northern Ireland", medianHomePrice: 200000, avgMortgageRate: 5.20, avgRent: 950, population: "340K", highlights: ["Most affordable UK capital", "Strong recent appreciation", "Tech-sector growth"] },
  { name: "Newcastle Upon Tyne", slug: "newcastle-upon-tyne", state: "England", medianHomePrice: 200000, avgMortgageRate: 5.15, avgRent: 900, population: "300K", highlights: ["North-East affordability", "Strong student population", "Regeneration zones offer growth"] },
];

export const citiesByCountry = {
  us: usCities,
  au: auCities,
  ca: caCities,
  gb: gbCities,
};
