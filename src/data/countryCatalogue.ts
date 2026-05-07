/**
 * Country + city catalogue for programmatically generated guides.
 *
 * This file is the single source of truth for which countries and cities
 * get pre-rendered guide pages. Adding a new country is a data-only change:
 *   1. Add an entry to `COUNTRIES` (with currency, base rate, FHB rules).
 *   2. Add cities to that country's `cities` array.
 *   3. Build → city guides are auto-generated via cityGuides.ts.
 *
 * Today we ship 50 Australian cities (8 capitals + 42 large regional centres),
 * each producing a Mortgage, LMI, and Stamp Duty guide = 150 AU guides.
 */

export interface CityRecord {
  slug: string;       // e.g. "sydney" — must be unique within country
  name: string;       // "Sydney"
  state: string;      // ISO-style state/territory code "NSW"
  stateName: string;  // "New South Wales"
  median: number;     // median dwelling value (local currency)
  medianHouse: number;
  medianUnit: number;
  exampleSuburbs: string[];
  notes: string;      // 1-sentence local colour
  isCapital?: boolean;
}

export interface CountryRecord {
  code: "au";        // ISO-style country code; one country per record
  name: string;      // "Australia"
  currency: string;  // ISO 4217
  currencyLocale: string; // BCP-47 for Intl formatting
  cashRate: number;  // current central-bank policy rate, e.g. 0.0410
  avgMortgageRate: number; // current avg owner-occupier rate, e.g. 0.0614
  fhbCapByState: Record<string, number>; // state code → FHB stamp duty exemption cap
  cities: CityRecord[];
}

// ---------- Australia (50 cities) ----------
const AU_FHB_CAPS: Record<string, number> = {
  NSW: 800000,
  VIC: 600000,
  QLD: 800000,
  WA: 450000,
  SA: 650000,
  TAS: 750000,
  ACT: 1000000,
  NT: 650000,
};

const AU_CITIES: CityRecord[] = [
  // 8 capitals
  { slug: "sydney", name: "Sydney", state: "NSW", stateName: "New South Wales",
    median: 1190000, medianHouse: 1480000, medianUnit: 845000,
    exampleSuburbs: ["Parramatta", "Blacktown", "Liverpool", "Bondi", "Chatswood"],
    notes: "Australia's most expensive capital, where typical buyers face full LMI exposure and significant stamp duty.", isCapital: true },
  { slug: "melbourne", name: "Melbourne", state: "VIC", stateName: "Victoria",
    median: 780000, medianHouse: 935000, medianUnit: 615000,
    exampleSuburbs: ["Footscray", "Sunshine", "Dandenong", "Frankston", "Reservoir"],
    notes: "Victoria's First Home Owner Grant ($10,000 in regional VIC) and concessional duty up to $750k make outer suburbs FHB-friendly.", isCapital: true },
  { slug: "brisbane", name: "Brisbane", state: "QLD", stateName: "Queensland",
    median: 880000, medianHouse: 990000, medianUnit: 615000,
    exampleSuburbs: ["Logan", "Ipswich", "Redcliffe", "Moreton Bay", "Carindale"],
    notes: "QLD raised the FHB stamp duty exemption to $800k in 2024 — buyers under that threshold pay $0 duty.", isCapital: true },
  { slug: "perth", name: "Perth", state: "WA", stateName: "Western Australia",
    median: 770000, medianHouse: 825000, medianUnit: 510000,
    exampleSuburbs: ["Joondalup", "Mandurah", "Rockingham", "Armadale", "Midland"],
    notes: "Perth's median has surged 70% since 2020 but remains below Sydney/Melbourne, with WA's $10,000 First Home Owner Grant still available.", isCapital: true },
  { slug: "adelaide", name: "Adelaide", state: "SA", stateName: "South Australia",
    median: 790000, medianHouse: 855000, medianUnit: 525000,
    exampleSuburbs: ["Salisbury", "Elizabeth", "Marion", "Tea Tree Gully", "Norwood"],
    notes: "SA abolished stamp duty entirely for eligible first-home buyers on new homes from June 2024.", isCapital: true },
  { slug: "hobart", name: "Hobart", state: "TAS", stateName: "Tasmania",
    median: 660000, medianHouse: 705000, medianUnit: 555000,
    exampleSuburbs: ["Glenorchy", "Kingston", "Sandy Bay", "Bellerive", "New Town"],
    notes: "Tasmania offers a 50% stamp duty discount for established homes up to $750k and a $10k FHOG for new builds.", isCapital: true },
  { slug: "canberra", name: "Canberra", state: "ACT", stateName: "Australian Capital Territory",
    median: 845000, medianHouse: 985000, medianUnit: 580000,
    exampleSuburbs: ["Belconnen", "Tuggeranong", "Gungahlin", "Woden", "Inner North"],
    notes: "ACT uses the Home Buyer Concession Scheme — income-tested $0 stamp duty for properties under ~$1m.", isCapital: true },
  { slug: "darwin", name: "Darwin", state: "NT", stateName: "Northern Territory",
    median: 510000, medianHouse: 590000, medianUnit: 365000,
    exampleSuburbs: ["Palmerston", "Casuarina", "Nightcliff", "Karama", "Coconut Grove"],
    notes: "Australia's most affordable capital; NT BuildBonus and HomeGrown Territory Grants stack with the FHOG for new builds.", isCapital: true },

  // NSW regional (8)
  { slug: "newcastle", name: "Newcastle", state: "NSW", stateName: "New South Wales",
    median: 880000, medianHouse: 945000, medianUnit: 705000,
    exampleSuburbs: ["Hamilton", "Merewether", "Mayfield", "Charlestown", "New Lambton"],
    notes: "NSW's second-largest city and a high-growth coastal corridor north of Sydney." },
  { slug: "wollongong", name: "Wollongong", state: "NSW", stateName: "New South Wales",
    median: 920000, medianHouse: 1050000, medianUnit: 700000,
    exampleSuburbs: ["Wollongong CBD", "Figtree", "Corrimal", "Fairy Meadow", "Dapto"],
    notes: "Coastal Illawarra city benefiting from Sydney commuter spillover and the NSW FHB exemption up to $800k." },
  { slug: "central-coast", name: "Central Coast", state: "NSW", stateName: "New South Wales",
    median: 845000, medianHouse: 920000, medianUnit: 660000,
    exampleSuburbs: ["Gosford", "Wyong", "Terrigal", "Erina", "The Entrance"],
    notes: "Lifestyle-driven NSW market between Sydney and Newcastle with strong owner-occupier demand." },
  { slug: "byron-bay", name: "Byron Bay", state: "NSW", stateName: "New South Wales",
    median: 1850000, medianHouse: 2100000, medianUnit: 1100000,
    exampleSuburbs: ["Byron Bay", "Suffolk Park", "Bangalow", "Mullumbimby", "Ocean Shores"],
    notes: "Northern Rivers premium coastal market — among the most expensive non-capital postcodes in Australia." },
  { slug: "coffs-harbour", name: "Coffs Harbour", state: "NSW", stateName: "New South Wales",
    median: 720000, medianHouse: 760000, medianUnit: 545000,
    exampleSuburbs: ["Sawtell", "Toormina", "Boambee", "Korora", "Park Beach"],
    notes: "Mid-North Coast lifestyle city offering NSW FHB benefits well under the $800k cap." },
  { slug: "wagga-wagga", name: "Wagga Wagga", state: "NSW", stateName: "New South Wales",
    median: 525000, medianHouse: 555000, medianUnit: 380000,
    exampleSuburbs: ["Kooringal", "Tolland", "Lake Albert", "Estella", "Glenfield Park"],
    notes: "Riverina regional centre with affordable entry pricing and broad FHB eligibility." },
  { slug: "albury", name: "Albury", state: "NSW", stateName: "New South Wales",
    median: 555000, medianHouse: 595000, medianUnit: 410000,
    exampleSuburbs: ["East Albury", "Lavington", "Glenroy", "Thurgoona", "West Albury"],
    notes: "Border city paired with Wodonga (VIC) — buyers can choose either NSW or VIC duty rules depending on side of the river." },
  { slug: "tamworth", name: "Tamworth", state: "NSW", stateName: "New South Wales",
    median: 480000, medianHouse: 510000, medianUnit: 350000,
    exampleSuburbs: ["South Tamworth", "North Tamworth", "Hillvue", "Calala", "Westdale"],
    notes: "New England regional hub; well below the NSW FHB exemption cap, attracting strong first-home buyer demand." },

  // VIC regional (6)
  { slug: "geelong", name: "Geelong", state: "VIC", stateName: "Victoria",
    median: 720000, medianHouse: 770000, medianUnit: 545000,
    exampleSuburbs: ["Belmont", "Newtown", "Highton", "Grovedale", "Armstrong Creek"],
    notes: "Victoria's second city and a major Melbourne overflow market with the regional VIC FHOG of $20,000 (new builds)." },
  { slug: "ballarat", name: "Ballarat", state: "VIC", stateName: "Victoria",
    median: 560000, medianHouse: 595000, medianUnit: 420000,
    exampleSuburbs: ["Wendouree", "Sebastopol", "Delacombe", "Alfredton", "Mount Pleasant"],
    notes: "Goldfields city with strong commuter rail to Melbourne and regional VIC FHOG eligibility." },
  { slug: "bendigo", name: "Bendigo", state: "VIC", stateName: "Victoria",
    median: 545000, medianHouse: 580000, medianUnit: 410000,
    exampleSuburbs: ["Strathfieldsaye", "Kangaroo Flat", "Eaglehawk", "Golden Square", "Epsom"],
    notes: "Central VIC regional centre, FHB-friendly with concessional duty up to $750k." },
  { slug: "mornington-peninsula", name: "Mornington Peninsula", state: "VIC", stateName: "Victoria",
    median: 985000, medianHouse: 1090000, medianUnit: 720000,
    exampleSuburbs: ["Mornington", "Mount Eliza", "Rosebud", "Sorrento", "Dromana"],
    notes: "Premium VIC coastal lifestyle market within commuter reach of Melbourne CBD." },
  { slug: "shepparton", name: "Shepparton", state: "VIC", stateName: "Victoria",
    median: 460000, medianHouse: 490000, medianUnit: 340000,
    exampleSuburbs: ["Shepparton", "Mooroopna", "Kialla", "Tatura", "Wyndham North"],
    notes: "Goulburn Valley regional centre with strong FHB participation under VIC concessions." },
  { slug: "warrnambool", name: "Warrnambool", state: "VIC", stateName: "Victoria",
    median: 540000, medianHouse: 575000, medianUnit: 405000,
    exampleSuburbs: ["East Warrnambool", "Dennington", "North Warrnambool", "Russells Creek", "Allansford"],
    notes: "South-west VIC coastal city; FHB exempt under the $600k cap on most established stock." },

  // QLD regional (8)
  { slug: "gold-coast", name: "Gold Coast", state: "QLD", stateName: "Queensland",
    median: 970000, medianHouse: 1100000, medianUnit: 745000,
    exampleSuburbs: ["Southport", "Robina", "Burleigh Heads", "Coomera", "Helensvale"],
    notes: "Australia's sixth-largest urban area; QLD's $800k FHB exemption opens doors in outer suburbs." },
  { slug: "sunshine-coast", name: "Sunshine Coast", state: "QLD", stateName: "Queensland",
    median: 920000, medianHouse: 1050000, medianUnit: 720000,
    exampleSuburbs: ["Maroochydore", "Caloundra", "Mooloolaba", "Buderim", "Sippy Downs"],
    notes: "Fast-growing QLD coastal market driven by interstate migration and 2032 Olympics infrastructure." },
  { slug: "townsville", name: "Townsville", state: "QLD", stateName: "Queensland",
    median: 470000, medianHouse: 495000, medianUnit: 340000,
    exampleSuburbs: ["Kirwan", "Douglas", "Annandale", "Mount Louisa", "Idalia"],
    notes: "North QLD regional capital — extremely affordable entry for FHBs under the $800k threshold." },
  { slug: "cairns", name: "Cairns", state: "QLD", stateName: "Queensland",
    median: 540000, medianHouse: 580000, medianUnit: 380000,
    exampleSuburbs: ["Trinity Beach", "Edge Hill", "Manunda", "Mount Sheridan", "Kewarra Beach"],
    notes: "Far North QLD city; QLD FHB exemption removes duty entirely for most local first-home purchases." },
  { slug: "toowoomba", name: "Toowoomba", state: "QLD", stateName: "Queensland",
    median: 565000, medianHouse: 595000, medianUnit: 415000,
    exampleSuburbs: ["Centenary Heights", "Rangeville", "Glenvale", "Kearneys Spring", "Wilsonton"],
    notes: "Darling Downs regional hub, popular with FHBs given the QLD $800k stamp duty exemption." },
  { slug: "mackay", name: "Mackay", state: "QLD", stateName: "Queensland",
    median: 510000, medianHouse: 540000, medianUnit: 360000,
    exampleSuburbs: ["North Mackay", "Andergrove", "Glenella", "Beaconsfield", "Ooralea"],
    notes: "Resource-sector QLD city with affordability and FHB benefits below the $800k cap." },
  { slug: "rockhampton", name: "Rockhampton", state: "QLD", stateName: "Queensland",
    median: 425000, medianHouse: 455000, medianUnit: 305000,
    exampleSuburbs: ["Norman Gardens", "Frenchville", "Park Avenue", "Berserker", "Gracemere"],
    notes: "Central QLD beef capital with one of the lowest median prices on the east coast." },
  { slug: "bundaberg", name: "Bundaberg", state: "QLD", stateName: "Queensland",
    median: 470000, medianHouse: 495000, medianUnit: 335000,
    exampleSuburbs: ["Bundaberg North", "Bundaberg South", "Bargara", "Avoca", "Kalkie"],
    notes: "Wide Bay coastal city offering strong FHB affordability under the QLD exemption cap." },

  // WA regional (4)
  { slug: "mandurah", name: "Mandurah", state: "WA", stateName: "Western Australia",
    median: 595000, medianHouse: 640000, medianUnit: 410000,
    exampleSuburbs: ["Mandurah", "Halls Head", "Greenfields", "Meadow Springs", "Falcon"],
    notes: "Coastal WA city south of Perth; FHBs may qualify for the $10,000 WA First Home Owner Grant on new builds." },
  { slug: "bunbury", name: "Bunbury", state: "WA", stateName: "Western Australia",
    median: 520000, medianHouse: 555000, medianUnit: 365000,
    exampleSuburbs: ["Bunbury", "South Bunbury", "Eaton", "Australind", "Withers"],
    notes: "South-west WA regional capital with strong FHB demand and the $10k WA FHOG for new builds." },
  { slug: "geraldton", name: "Geraldton", state: "WA", stateName: "Western Australia",
    median: 410000, medianHouse: 435000, medianUnit: 290000,
    exampleSuburbs: ["Geraldton", "Wandina", "Beachlands", "Mount Tarcoola", "Strathalbyn"],
    notes: "Mid-West WA coastal city — comfortably below the WA $450k FHB exemption ceiling." },
  { slug: "kalgoorlie", name: "Kalgoorlie", state: "WA", stateName: "Western Australia",
    median: 395000, medianHouse: 420000, medianUnit: 285000,
    exampleSuburbs: ["Lamington", "Hannans", "South Kalgoorlie", "Boulder", "Somerville"],
    notes: "Goldfields mining hub with rental yields among the highest in Australia and entry-level FHB pricing." },

  // SA regional (3)
  { slug: "mount-gambier", name: "Mount Gambier", state: "SA", stateName: "South Australia",
    median: 445000, medianHouse: 470000, medianUnit: 320000,
    exampleSuburbs: ["Mount Gambier", "Worrolong", "Compton", "Suttontown", "OB Flat"],
    notes: "South-east SA regional centre; FHB exemption applies for most local purchases." },
  { slug: "whyalla", name: "Whyalla", state: "SA", stateName: "South Australia",
    median: 285000, medianHouse: 305000, medianUnit: 210000,
    exampleSuburbs: ["Whyalla Norrie", "Whyalla Stuart", "Whyalla Playford", "Whyalla Jenkins", "Whyalla"],
    notes: "Eyre Peninsula industrial city — Australia's most affordable mid-sized centre and SA FHB-eligible." },
  { slug: "victor-harbor", name: "Victor Harbor", state: "SA", stateName: "South Australia",
    median: 595000, medianHouse: 630000, medianUnit: 425000,
    exampleSuburbs: ["Victor Harbor", "Encounter Bay", "Hayborough", "McCracken", "Mount Compass"],
    notes: "Fleurieu Peninsula coastal market within commuter reach of Adelaide and SA FHB-eligible." },

  // TAS regional (3)
  { slug: "launceston", name: "Launceston", state: "TAS", stateName: "Tasmania",
    median: 525000, medianHouse: 555000, medianUnit: 395000,
    exampleSuburbs: ["Kings Meadows", "Newnham", "Riverside", "Prospect", "Mowbray"],
    notes: "Northern Tasmanian capital with TAS FHB exemption applying up to $750k." },
  { slug: "devonport", name: "Devonport", state: "TAS", stateName: "Tasmania",
    median: 460000, medianHouse: 485000, medianUnit: 350000,
    exampleSuburbs: ["Devonport", "East Devonport", "Miandetta", "Don", "Quoiba"],
    notes: "North-west TAS port city; affordable entry for first-home buyers under the $750k cap." },
  { slug: "burnie", name: "Burnie", state: "TAS", stateName: "Tasmania",
    median: 410000, medianHouse: 435000, medianUnit: 310000,
    exampleSuburbs: ["Burnie", "Park Grove", "Upper Burnie", "Acton", "Romaine"],
    notes: "North-west TAS coastal city offering Australia's most affordable harbourside living." },

  // NT regional (2)
  { slug: "alice-springs", name: "Alice Springs", state: "NT", stateName: "Northern Territory",
    median: 470000, medianHouse: 495000, medianUnit: 340000,
    exampleSuburbs: ["Araluen", "East Side", "Gillen", "Larapinta", "Sadadeen"],
    notes: "Central Australia regional centre; NT BuildBonus and HomeGrown Territory grants apply." },
  { slug: "katherine", name: "Katherine", state: "NT", stateName: "Northern Territory",
    median: 365000, medianHouse: 385000, medianUnit: 265000,
    exampleSuburbs: ["Katherine East", "Katherine South", "Cossack", "Casuarina", "Lansdowne"],
    notes: "Top End regional town with affordable entry and full NT FHB eligibility." },

  // ACT regional (1)
  { slug: "queanbeyan", name: "Queanbeyan", state: "NSW", stateName: "New South Wales",
    median: 745000, medianHouse: 805000, medianUnit: 555000,
    exampleSuburbs: ["Queanbeyan", "Jerrabomberra", "Karabar", "Crestwood", "Googong"],
    notes: "NSW border city to Canberra — uses NSW stamp duty rules with the $800k FHB exemption." },

  // Lifestyle / coastal extras (7)
  { slug: "ballina", name: "Ballina", state: "NSW", stateName: "New South Wales",
    median: 850000, medianHouse: 920000, medianUnit: 640000,
    exampleSuburbs: ["Ballina", "Lennox Head", "East Ballina", "West Ballina", "Wollongbar"],
    notes: "Northern Rivers NSW lifestyle market just south of Byron Bay." },
  { slug: "port-macquarie", name: "Port Macquarie", state: "NSW", stateName: "New South Wales",
    median: 745000, medianHouse: 800000, medianUnit: 580000,
    exampleSuburbs: ["Port Macquarie", "Lake Cathie", "Wauchope", "Sancrox", "Settlement Point"],
    notes: "Mid-North Coast NSW city with strong retiree and FHB demand." },
  { slug: "lismore", name: "Lismore", state: "NSW", stateName: "New South Wales",
    median: 540000, medianHouse: 570000, medianUnit: 405000,
    exampleSuburbs: ["Lismore", "Goonellabah", "East Lismore", "South Lismore", "Girards Hill"],
    notes: "Northern Rivers regional service centre offering strong FHB affordability." },
  { slug: "dubbo", name: "Dubbo", state: "NSW", stateName: "New South Wales",
    median: 510000, medianHouse: 540000, medianUnit: 375000,
    exampleSuburbs: ["Dubbo", "Delroy", "South Dubbo", "West Dubbo", "Keswick Estate"],
    notes: "Western NSW regional city well under the NSW $800k FHB cap." },
  { slug: "orange", name: "Orange", state: "NSW", stateName: "New South Wales",
    median: 595000, medianHouse: 630000, medianUnit: 435000,
    exampleSuburbs: ["Orange", "Glenroi", "Calare", "East Orange", "North Orange"],
    notes: "Central Tablelands NSW city with growing tree-change demand from Sydney." },
  { slug: "bathurst", name: "Bathurst", state: "NSW", stateName: "New South Wales",
    median: 575000, medianHouse: 610000, medianUnit: 420000,
    exampleSuburbs: ["Bathurst", "Kelso", "West Bathurst", "South Bathurst", "Eglinton"],
    notes: "Historic Central West NSW university and regional services hub." },
  { slug: "armidale", name: "Armidale", state: "NSW", stateName: "New South Wales",
    median: 510000, medianHouse: 540000, medianUnit: 380000,
    exampleSuburbs: ["Armidale", "Newling", "South Armidale", "North Armidale", "Girraween"],
    notes: "New England university city offering strong rental demand and FHB affordability." },
];

// Sanity: enforce 50 cities for AU
if (AU_CITIES.length !== 50) {
  // eslint-disable-next-line no-console
  console.warn(`[countryCatalogue] Expected 50 AU cities, found ${AU_CITIES.length}.`);
}

export const COUNTRIES: CountryRecord[] = [
  {
    code: "au",
    name: "Australia",
    currency: "AUD",
    currencyLocale: "en-AU",
    cashRate: 0.041,
    avgMortgageRate: 0.0614,
    fhbCapByState: AU_FHB_CAPS,
    cities: AU_CITIES,
  },
];
