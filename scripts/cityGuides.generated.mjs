// src/data/countryCatalogue.ts
var AU_FHB_CAPS = {
  NSW: 8e5,
  VIC: 6e5,
  QLD: 8e5,
  WA: 45e4,
  SA: 65e4,
  TAS: 75e4,
  ACT: 1e6,
  NT: 65e4
};
var AU_CITIES = [
  // 8 capitals
  {
    slug: "sydney",
    name: "Sydney",
    state: "NSW",
    stateName: "New South Wales",
    median: 119e4,
    medianHouse: 148e4,
    medianUnit: 845e3,
    exampleSuburbs: ["Parramatta", "Blacktown", "Liverpool", "Bondi", "Chatswood"],
    notes: "Australia's most expensive capital, where typical buyers face full LMI exposure and significant stamp duty.",
    isCapital: true
  },
  {
    slug: "melbourne",
    name: "Melbourne",
    state: "VIC",
    stateName: "Victoria",
    median: 78e4,
    medianHouse: 935e3,
    medianUnit: 615e3,
    exampleSuburbs: ["Footscray", "Sunshine", "Dandenong", "Frankston", "Reservoir"],
    notes: "Victoria's First Home Owner Grant ($10,000 in regional VIC) and concessional duty up to $750k make outer suburbs FHB-friendly.",
    isCapital: true
  },
  {
    slug: "brisbane",
    name: "Brisbane",
    state: "QLD",
    stateName: "Queensland",
    median: 88e4,
    medianHouse: 99e4,
    medianUnit: 615e3,
    exampleSuburbs: ["Logan", "Ipswich", "Redcliffe", "Moreton Bay", "Carindale"],
    notes: "QLD raised the FHB stamp duty exemption to $800k in 2024 \u2014 buyers under that threshold pay $0 duty.",
    isCapital: true
  },
  {
    slug: "perth",
    name: "Perth",
    state: "WA",
    stateName: "Western Australia",
    median: 77e4,
    medianHouse: 825e3,
    medianUnit: 51e4,
    exampleSuburbs: ["Joondalup", "Mandurah", "Rockingham", "Armadale", "Midland"],
    notes: "Perth's median has surged 70% since 2020 but remains below Sydney/Melbourne, with WA's $10,000 First Home Owner Grant still available.",
    isCapital: true
  },
  {
    slug: "adelaide",
    name: "Adelaide",
    state: "SA",
    stateName: "South Australia",
    median: 79e4,
    medianHouse: 855e3,
    medianUnit: 525e3,
    exampleSuburbs: ["Salisbury", "Elizabeth", "Marion", "Tea Tree Gully", "Norwood"],
    notes: "SA abolished stamp duty entirely for eligible first-home buyers on new homes from June 2024.",
    isCapital: true
  },
  {
    slug: "hobart",
    name: "Hobart",
    state: "TAS",
    stateName: "Tasmania",
    median: 66e4,
    medianHouse: 705e3,
    medianUnit: 555e3,
    exampleSuburbs: ["Glenorchy", "Kingston", "Sandy Bay", "Bellerive", "New Town"],
    notes: "Tasmania offers a 50% stamp duty discount for established homes up to $750k and a $10k FHOG for new builds.",
    isCapital: true
  },
  {
    slug: "canberra",
    name: "Canberra",
    state: "ACT",
    stateName: "Australian Capital Territory",
    median: 845e3,
    medianHouse: 985e3,
    medianUnit: 58e4,
    exampleSuburbs: ["Belconnen", "Tuggeranong", "Gungahlin", "Woden", "Inner North"],
    notes: "ACT uses the Home Buyer Concession Scheme \u2014 income-tested $0 stamp duty for properties under ~$1m.",
    isCapital: true
  },
  {
    slug: "darwin",
    name: "Darwin",
    state: "NT",
    stateName: "Northern Territory",
    median: 51e4,
    medianHouse: 59e4,
    medianUnit: 365e3,
    exampleSuburbs: ["Palmerston", "Casuarina", "Nightcliff", "Karama", "Coconut Grove"],
    notes: "Australia's most affordable capital; NT BuildBonus and HomeGrown Territory Grants stack with the FHOG for new builds.",
    isCapital: true
  },
  // NSW regional (8)
  {
    slug: "newcastle",
    name: "Newcastle",
    state: "NSW",
    stateName: "New South Wales",
    median: 88e4,
    medianHouse: 945e3,
    medianUnit: 705e3,
    exampleSuburbs: ["Hamilton", "Merewether", "Mayfield", "Charlestown", "New Lambton"],
    notes: "NSW's second-largest city and a high-growth coastal corridor north of Sydney."
  },
  {
    slug: "wollongong",
    name: "Wollongong",
    state: "NSW",
    stateName: "New South Wales",
    median: 92e4,
    medianHouse: 105e4,
    medianUnit: 7e5,
    exampleSuburbs: ["Wollongong CBD", "Figtree", "Corrimal", "Fairy Meadow", "Dapto"],
    notes: "Coastal Illawarra city benefiting from Sydney commuter spillover and the NSW FHB exemption up to $800k."
  },
  {
    slug: "central-coast",
    name: "Central Coast",
    state: "NSW",
    stateName: "New South Wales",
    median: 845e3,
    medianHouse: 92e4,
    medianUnit: 66e4,
    exampleSuburbs: ["Gosford", "Wyong", "Terrigal", "Erina", "The Entrance"],
    notes: "Lifestyle-driven NSW market between Sydney and Newcastle with strong owner-occupier demand."
  },
  {
    slug: "byron-bay",
    name: "Byron Bay",
    state: "NSW",
    stateName: "New South Wales",
    median: 185e4,
    medianHouse: 21e5,
    medianUnit: 11e5,
    exampleSuburbs: ["Byron Bay", "Suffolk Park", "Bangalow", "Mullumbimby", "Ocean Shores"],
    notes: "Northern Rivers premium coastal market \u2014 among the most expensive non-capital postcodes in Australia."
  },
  {
    slug: "coffs-harbour",
    name: "Coffs Harbour",
    state: "NSW",
    stateName: "New South Wales",
    median: 72e4,
    medianHouse: 76e4,
    medianUnit: 545e3,
    exampleSuburbs: ["Sawtell", "Toormina", "Boambee", "Korora", "Park Beach"],
    notes: "Mid-North Coast lifestyle city offering NSW FHB benefits well under the $800k cap."
  },
  {
    slug: "wagga-wagga",
    name: "Wagga Wagga",
    state: "NSW",
    stateName: "New South Wales",
    median: 525e3,
    medianHouse: 555e3,
    medianUnit: 38e4,
    exampleSuburbs: ["Kooringal", "Tolland", "Lake Albert", "Estella", "Glenfield Park"],
    notes: "Riverina regional centre with affordable entry pricing and broad FHB eligibility."
  },
  {
    slug: "albury",
    name: "Albury",
    state: "NSW",
    stateName: "New South Wales",
    median: 555e3,
    medianHouse: 595e3,
    medianUnit: 41e4,
    exampleSuburbs: ["East Albury", "Lavington", "Glenroy", "Thurgoona", "West Albury"],
    notes: "Border city paired with Wodonga (VIC) \u2014 buyers can choose either NSW or VIC duty rules depending on side of the river."
  },
  {
    slug: "tamworth",
    name: "Tamworth",
    state: "NSW",
    stateName: "New South Wales",
    median: 48e4,
    medianHouse: 51e4,
    medianUnit: 35e4,
    exampleSuburbs: ["South Tamworth", "North Tamworth", "Hillvue", "Calala", "Westdale"],
    notes: "New England regional hub; well below the NSW FHB exemption cap, attracting strong first-home buyer demand."
  },
  // VIC regional (6)
  {
    slug: "geelong",
    name: "Geelong",
    state: "VIC",
    stateName: "Victoria",
    median: 72e4,
    medianHouse: 77e4,
    medianUnit: 545e3,
    exampleSuburbs: ["Belmont", "Newtown", "Highton", "Grovedale", "Armstrong Creek"],
    notes: "Victoria's second city and a major Melbourne overflow market with the regional VIC FHOG of $20,000 (new builds)."
  },
  {
    slug: "ballarat",
    name: "Ballarat",
    state: "VIC",
    stateName: "Victoria",
    median: 56e4,
    medianHouse: 595e3,
    medianUnit: 42e4,
    exampleSuburbs: ["Wendouree", "Sebastopol", "Delacombe", "Alfredton", "Mount Pleasant"],
    notes: "Goldfields city with strong commuter rail to Melbourne and regional VIC FHOG eligibility."
  },
  {
    slug: "bendigo",
    name: "Bendigo",
    state: "VIC",
    stateName: "Victoria",
    median: 545e3,
    medianHouse: 58e4,
    medianUnit: 41e4,
    exampleSuburbs: ["Strathfieldsaye", "Kangaroo Flat", "Eaglehawk", "Golden Square", "Epsom"],
    notes: "Central VIC regional centre, FHB-friendly with concessional duty up to $750k."
  },
  {
    slug: "mornington-peninsula",
    name: "Mornington Peninsula",
    state: "VIC",
    stateName: "Victoria",
    median: 985e3,
    medianHouse: 109e4,
    medianUnit: 72e4,
    exampleSuburbs: ["Mornington", "Mount Eliza", "Rosebud", "Sorrento", "Dromana"],
    notes: "Premium VIC coastal lifestyle market within commuter reach of Melbourne CBD."
  },
  {
    slug: "shepparton",
    name: "Shepparton",
    state: "VIC",
    stateName: "Victoria",
    median: 46e4,
    medianHouse: 49e4,
    medianUnit: 34e4,
    exampleSuburbs: ["Shepparton", "Mooroopna", "Kialla", "Tatura", "Wyndham North"],
    notes: "Goulburn Valley regional centre with strong FHB participation under VIC concessions."
  },
  {
    slug: "warrnambool",
    name: "Warrnambool",
    state: "VIC",
    stateName: "Victoria",
    median: 54e4,
    medianHouse: 575e3,
    medianUnit: 405e3,
    exampleSuburbs: ["East Warrnambool", "Dennington", "North Warrnambool", "Russells Creek", "Allansford"],
    notes: "South-west VIC coastal city; FHB exempt under the $600k cap on most established stock."
  },
  // QLD regional (8)
  {
    slug: "gold-coast",
    name: "Gold Coast",
    state: "QLD",
    stateName: "Queensland",
    median: 97e4,
    medianHouse: 11e5,
    medianUnit: 745e3,
    exampleSuburbs: ["Southport", "Robina", "Burleigh Heads", "Coomera", "Helensvale"],
    notes: "Australia's sixth-largest urban area; QLD's $800k FHB exemption opens doors in outer suburbs."
  },
  {
    slug: "sunshine-coast",
    name: "Sunshine Coast",
    state: "QLD",
    stateName: "Queensland",
    median: 92e4,
    medianHouse: 105e4,
    medianUnit: 72e4,
    exampleSuburbs: ["Maroochydore", "Caloundra", "Mooloolaba", "Buderim", "Sippy Downs"],
    notes: "Fast-growing QLD coastal market driven by interstate migration and 2032 Olympics infrastructure."
  },
  {
    slug: "townsville",
    name: "Townsville",
    state: "QLD",
    stateName: "Queensland",
    median: 47e4,
    medianHouse: 495e3,
    medianUnit: 34e4,
    exampleSuburbs: ["Kirwan", "Douglas", "Annandale", "Mount Louisa", "Idalia"],
    notes: "North QLD regional capital \u2014 extremely affordable entry for FHBs under the $800k threshold."
  },
  {
    slug: "cairns",
    name: "Cairns",
    state: "QLD",
    stateName: "Queensland",
    median: 54e4,
    medianHouse: 58e4,
    medianUnit: 38e4,
    exampleSuburbs: ["Trinity Beach", "Edge Hill", "Manunda", "Mount Sheridan", "Kewarra Beach"],
    notes: "Far North QLD city; QLD FHB exemption removes duty entirely for most local first-home purchases."
  },
  {
    slug: "toowoomba",
    name: "Toowoomba",
    state: "QLD",
    stateName: "Queensland",
    median: 565e3,
    medianHouse: 595e3,
    medianUnit: 415e3,
    exampleSuburbs: ["Centenary Heights", "Rangeville", "Glenvale", "Kearneys Spring", "Wilsonton"],
    notes: "Darling Downs regional hub, popular with FHBs given the QLD $800k stamp duty exemption."
  },
  {
    slug: "mackay",
    name: "Mackay",
    state: "QLD",
    stateName: "Queensland",
    median: 51e4,
    medianHouse: 54e4,
    medianUnit: 36e4,
    exampleSuburbs: ["North Mackay", "Andergrove", "Glenella", "Beaconsfield", "Ooralea"],
    notes: "Resource-sector QLD city with affordability and FHB benefits below the $800k cap."
  },
  {
    slug: "rockhampton",
    name: "Rockhampton",
    state: "QLD",
    stateName: "Queensland",
    median: 425e3,
    medianHouse: 455e3,
    medianUnit: 305e3,
    exampleSuburbs: ["Norman Gardens", "Frenchville", "Park Avenue", "Berserker", "Gracemere"],
    notes: "Central QLD beef capital with one of the lowest median prices on the east coast."
  },
  {
    slug: "bundaberg",
    name: "Bundaberg",
    state: "QLD",
    stateName: "Queensland",
    median: 47e4,
    medianHouse: 495e3,
    medianUnit: 335e3,
    exampleSuburbs: ["Bundaberg North", "Bundaberg South", "Bargara", "Avoca", "Kalkie"],
    notes: "Wide Bay coastal city offering strong FHB affordability under the QLD exemption cap."
  },
  // WA regional (4)
  {
    slug: "mandurah",
    name: "Mandurah",
    state: "WA",
    stateName: "Western Australia",
    median: 595e3,
    medianHouse: 64e4,
    medianUnit: 41e4,
    exampleSuburbs: ["Mandurah", "Halls Head", "Greenfields", "Meadow Springs", "Falcon"],
    notes: "Coastal WA city south of Perth; FHBs may qualify for the $10,000 WA First Home Owner Grant on new builds."
  },
  {
    slug: "bunbury",
    name: "Bunbury",
    state: "WA",
    stateName: "Western Australia",
    median: 52e4,
    medianHouse: 555e3,
    medianUnit: 365e3,
    exampleSuburbs: ["Bunbury", "South Bunbury", "Eaton", "Australind", "Withers"],
    notes: "South-west WA regional capital with strong FHB demand and the $10k WA FHOG for new builds."
  },
  {
    slug: "geraldton",
    name: "Geraldton",
    state: "WA",
    stateName: "Western Australia",
    median: 41e4,
    medianHouse: 435e3,
    medianUnit: 29e4,
    exampleSuburbs: ["Geraldton", "Wandina", "Beachlands", "Mount Tarcoola", "Strathalbyn"],
    notes: "Mid-West WA coastal city \u2014 comfortably below the WA $450k FHB exemption ceiling."
  },
  {
    slug: "kalgoorlie",
    name: "Kalgoorlie",
    state: "WA",
    stateName: "Western Australia",
    median: 395e3,
    medianHouse: 42e4,
    medianUnit: 285e3,
    exampleSuburbs: ["Lamington", "Hannans", "South Kalgoorlie", "Boulder", "Somerville"],
    notes: "Goldfields mining hub with rental yields among the highest in Australia and entry-level FHB pricing."
  },
  // SA regional (3)
  {
    slug: "mount-gambier",
    name: "Mount Gambier",
    state: "SA",
    stateName: "South Australia",
    median: 445e3,
    medianHouse: 47e4,
    medianUnit: 32e4,
    exampleSuburbs: ["Mount Gambier", "Worrolong", "Compton", "Suttontown", "OB Flat"],
    notes: "South-east SA regional centre; FHB exemption applies for most local purchases."
  },
  {
    slug: "whyalla",
    name: "Whyalla",
    state: "SA",
    stateName: "South Australia",
    median: 285e3,
    medianHouse: 305e3,
    medianUnit: 21e4,
    exampleSuburbs: ["Whyalla Norrie", "Whyalla Stuart", "Whyalla Playford", "Whyalla Jenkins", "Whyalla"],
    notes: "Eyre Peninsula industrial city \u2014 Australia's most affordable mid-sized centre and SA FHB-eligible."
  },
  {
    slug: "victor-harbor",
    name: "Victor Harbor",
    state: "SA",
    stateName: "South Australia",
    median: 595e3,
    medianHouse: 63e4,
    medianUnit: 425e3,
    exampleSuburbs: ["Victor Harbor", "Encounter Bay", "Hayborough", "McCracken", "Mount Compass"],
    notes: "Fleurieu Peninsula coastal market within commuter reach of Adelaide and SA FHB-eligible."
  },
  // TAS regional (3)
  {
    slug: "launceston",
    name: "Launceston",
    state: "TAS",
    stateName: "Tasmania",
    median: 525e3,
    medianHouse: 555e3,
    medianUnit: 395e3,
    exampleSuburbs: ["Kings Meadows", "Newnham", "Riverside", "Prospect", "Mowbray"],
    notes: "Northern Tasmanian capital with TAS FHB exemption applying up to $750k."
  },
  {
    slug: "devonport",
    name: "Devonport",
    state: "TAS",
    stateName: "Tasmania",
    median: 46e4,
    medianHouse: 485e3,
    medianUnit: 35e4,
    exampleSuburbs: ["Devonport", "East Devonport", "Miandetta", "Don", "Quoiba"],
    notes: "North-west TAS port city; affordable entry for first-home buyers under the $750k cap."
  },
  {
    slug: "burnie",
    name: "Burnie",
    state: "TAS",
    stateName: "Tasmania",
    median: 41e4,
    medianHouse: 435e3,
    medianUnit: 31e4,
    exampleSuburbs: ["Burnie", "Park Grove", "Upper Burnie", "Acton", "Romaine"],
    notes: "North-west TAS coastal city offering Australia's most affordable harbourside living."
  },
  // NT regional (2)
  {
    slug: "alice-springs",
    name: "Alice Springs",
    state: "NT",
    stateName: "Northern Territory",
    median: 47e4,
    medianHouse: 495e3,
    medianUnit: 34e4,
    exampleSuburbs: ["Araluen", "East Side", "Gillen", "Larapinta", "Sadadeen"],
    notes: "Central Australia regional centre; NT BuildBonus and HomeGrown Territory grants apply."
  },
  {
    slug: "katherine",
    name: "Katherine",
    state: "NT",
    stateName: "Northern Territory",
    median: 365e3,
    medianHouse: 385e3,
    medianUnit: 265e3,
    exampleSuburbs: ["Katherine East", "Katherine South", "Cossack", "Casuarina", "Lansdowne"],
    notes: "Top End regional town with affordable entry and full NT FHB eligibility."
  },
  // ACT regional (1)
  {
    slug: "queanbeyan",
    name: "Queanbeyan",
    state: "NSW",
    stateName: "New South Wales",
    median: 745e3,
    medianHouse: 805e3,
    medianUnit: 555e3,
    exampleSuburbs: ["Queanbeyan", "Jerrabomberra", "Karabar", "Crestwood", "Googong"],
    notes: "NSW border city to Canberra \u2014 uses NSW stamp duty rules with the $800k FHB exemption."
  },
  // Lifestyle / coastal extras (7)
  {
    slug: "ballina",
    name: "Ballina",
    state: "NSW",
    stateName: "New South Wales",
    median: 85e4,
    medianHouse: 92e4,
    medianUnit: 64e4,
    exampleSuburbs: ["Ballina", "Lennox Head", "East Ballina", "West Ballina", "Wollongbar"],
    notes: "Northern Rivers NSW lifestyle market just south of Byron Bay."
  },
  {
    slug: "port-macquarie",
    name: "Port Macquarie",
    state: "NSW",
    stateName: "New South Wales",
    median: 745e3,
    medianHouse: 8e5,
    medianUnit: 58e4,
    exampleSuburbs: ["Port Macquarie", "Lake Cathie", "Wauchope", "Sancrox", "Settlement Point"],
    notes: "Mid-North Coast NSW city with strong retiree and FHB demand."
  },
  {
    slug: "lismore",
    name: "Lismore",
    state: "NSW",
    stateName: "New South Wales",
    median: 54e4,
    medianHouse: 57e4,
    medianUnit: 405e3,
    exampleSuburbs: ["Lismore", "Goonellabah", "East Lismore", "South Lismore", "Girards Hill"],
    notes: "Northern Rivers regional service centre offering strong FHB affordability."
  },
  {
    slug: "dubbo",
    name: "Dubbo",
    state: "NSW",
    stateName: "New South Wales",
    median: 51e4,
    medianHouse: 54e4,
    medianUnit: 375e3,
    exampleSuburbs: ["Dubbo", "Delroy", "South Dubbo", "West Dubbo", "Keswick Estate"],
    notes: "Western NSW regional city well under the NSW $800k FHB cap."
  },
  {
    slug: "orange",
    name: "Orange",
    state: "NSW",
    stateName: "New South Wales",
    median: 595e3,
    medianHouse: 63e4,
    medianUnit: 435e3,
    exampleSuburbs: ["Orange", "Glenroi", "Calare", "East Orange", "North Orange"],
    notes: "Central Tablelands NSW city with growing tree-change demand from Sydney."
  },
  {
    slug: "bathurst",
    name: "Bathurst",
    state: "NSW",
    stateName: "New South Wales",
    median: 575e3,
    medianHouse: 61e4,
    medianUnit: 42e4,
    exampleSuburbs: ["Bathurst", "Kelso", "West Bathurst", "South Bathurst", "Eglinton"],
    notes: "Historic Central West NSW university and regional services hub."
  },
  {
    slug: "armidale",
    name: "Armidale",
    state: "NSW",
    stateName: "New South Wales",
    median: 51e4,
    medianHouse: 54e4,
    medianUnit: 38e4,
    exampleSuburbs: ["Armidale", "Newling", "South Armidale", "North Armidale", "Girraween"],
    notes: "New England university city offering strong rental demand and FHB affordability."
  }
];
if (AU_CITIES.length !== 50) {
  console.warn(`[countryCatalogue] Expected 50 AU cities, found ${AU_CITIES.length}.`);
}
var COUNTRIES = [
  {
    code: "au",
    name: "Australia",
    currency: "AUD",
    currencyLocale: "en-AU",
    cashRate: 0.041,
    avgMortgageRate: 0.0614,
    fhbCapByState: AU_FHB_CAPS,
    cities: AU_CITIES
  }
];

// src/data/cityGuides.ts
var p = (text) => ({ type: "p", text });
var h3 = (text) => ({ type: "h3", text });
var ul = (...items) => ({ type: "list", items });
var money = (country, n) => new Intl.NumberFormat(country.currencyLocale, {
  style: "currency",
  currency: country.currency,
  maximumFractionDigits: 0
}).format(Math.round(n));
var slugBase = (country, topic, city) => country.code === "au" ? `${topic}-${city.slug}` : `${topic}-${country.code}-${city.slug}`;
function tuneDesc(base, tails) {
  let out = base.trim().replace(/\s+/g, " ");
  if (out.length > 160) {
    return out.slice(0, 157).replace(/[\s,;:.\-—]+$/, "") + "\u2026";
  }
  for (const tail of tails) {
    if (out.length >= 150) break;
    const candidate = (out + " " + tail.trim()).replace(/\s+/g, " ");
    if (candidate.length <= 160) out = candidate;
    else if (out.length < 150) {
      const room = 160 - out.length - 1;
      if (room > 8) out = out + " " + tail.slice(0, room).trim();
    }
  }
  return out;
}
function mortgageGuide(country, c) {
  const slug = slugBase(country, "mortgage-calculator", c);
  const r = country.avgMortgageRate;
  const monthly = c.median * 0.8 * (r / 12) / (1 - Math.pow(1 + r / 12, -360));
  const repay = Math.round(monthly);
  const fhbCap = country.fhbCapByState[c.state] ?? 0;
  const fmt = (n) => money(country, n);
  const sections = [
    {
      h2: `${c.name} property market in 2026`,
      blocks: [
        p(`The median dwelling value across ${c.name} sits at approximately ${fmt(c.median)} in 2026 (houses ${fmt(c.medianHouse)}, units ${fmt(c.medianUnit)}). ${c.notes}`),
        p(`Popular ${c.name} suburbs for owner-occupiers include ${c.exampleSuburbs.join(", ")} \u2014 each with a distinct price point, school catchment, and commute profile that influences mortgage size.`)
      ]
    },
    {
      h2: `Typical mortgage repayments in ${c.name}`,
      blocks: [
        p(`Assuming a 20% deposit, a 30-year principal-and-interest loan at the current average owner-occupier rate of ${(r * 100).toFixed(2)}% on the ${c.name} median (${fmt(c.median)}) produces a monthly repayment near ${fmt(repay)} \u2014 equivalent to roughly ${fmt(repay / 2)} fortnightly.`),
        h3(`How central-bank rate moves change your repayment`),
        p(`Every 0.25% policy rate move shifts a typical ${c.name} mortgage by roughly $40\u2013$70 per month per $100k borrowed. Use the mortgage calculator with the \u201Crate change\u201D toggle to model future scenarios.`),
        ul(
          `Stress-test repayments at +3% above today's rate \u2014 APRA's serviceability buffer.`,
          `Compare fortnightly vs monthly schedules: fortnightly cuts ~5 years off a typical ${c.name} 30-year loan.`,
          `Factor strata levies (units), council rates, and home insurance \u2014 typically $4k\u2013$7k/yr in ${c.name}.`
        )
      ]
    },
    {
      h2: `Deposit and LMI in ${c.name}`,
      blocks: [
        p(`A 20% deposit on the ${c.name} median means saving ${fmt(c.median * 0.2)} plus ${fmt(c.median * 0.05)} for stamp duty, legal, and moving costs. Most first-home buyers in ${c.name} purchase with a 5\u201310% deposit and pay Lender's Mortgage Insurance (LMI) \u2014 often ${fmt(c.median * 0.025)}\u2013${fmt(c.median * 0.035)} on a ${c.state} purchase.`),
        p(`Eligible ${c.name} buyers can avoid LMI via the federal Home Guarantee Scheme (5% deposit, government guarantees the rest) \u2014 places are limited and re-issue each July.`)
      ]
    },
    {
      h2: `${c.state} grants and concessions worth knowing`,
      blocks: [
        p(`${c.notes} Combine state-level concessions with the federal First Home Guarantee for the strongest entry into the ${c.name} market.`),
        p(`Use our ${c.stateName} stamp duty calculator and ${c.name} borrowing power calculator together to model your real out-of-pocket cost before signing a contract.`)
      ]
    }
  ];
  return {
    slug,
    title: `${c.name} mortgage guide 2026: repayments, deposits & ${c.state} rules`,
    metaTitle: `${c.name} Mortgage Calculator & Guide 2026 (${c.state}) | Calcy`,
    metaDescription: tuneDesc(
      `2026 ${c.name} mortgage guide: repayments on the ${fmt(c.median)} median, ${c.state} stamp duty, LMI and grants. Free ${c.name} mortgage calculator.`,
      [
        `Updated for current ${country.name} rates.`,
        `Includes deposit, repayment and serviceability tips for ${c.name} buyers.`,
        `See worked examples for ${c.exampleSuburbs[0]} and ${c.exampleSuburbs[1] || c.name}.`
      ]
    ),
    category: `${c.name} mortgages`,
    readMins: 9,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `Everything ${c.name} home buyers need in 2026: typical repayments on the ${fmt(c.median)} median, ${c.state} stamp duty rules, grants, and how to size a deposit that works in this market.`,
    sections,
    keyTakeaways: [
      `${c.name} median dwelling value: ${fmt(c.median)} (houses ${fmt(c.medianHouse)}, units ${fmt(c.medianUnit)}).`,
      `Typical 30-yr P&I monthly repayment at ${(r * 100).toFixed(2)}%: ~${fmt(repay)}.`,
      `${c.state} FHB stamp duty exemption applies up to ${fmt(fhbCap)}.`,
      `Stress-test at +3% above today's rate before signing.`
    ],
    relatedCalculator: { to: "/mortgage-calculator", label: "Open the mortgage calculator" },
    relatedGuides: ["fixed-vs-variable-rate", "borrowing-power-australia"],
    faqs: [
      {
        question: `What is the average mortgage repayment in ${c.name}?`,
        answer: `On the ${c.name} median dwelling value (${fmt(c.median)}) with a 20% deposit and a 30-year loan at ${(r * 100).toFixed(2)}%, the monthly repayment is around ${fmt(repay)}.`
      },
      {
        question: `How much deposit do I need to buy in ${c.name}?`,
        answer: `A 20% deposit on the ${c.name} median is ${fmt(c.median * 0.2)}. Buyers entering with 5\u201310% can use the federal Home Guarantee Scheme to avoid LMI, subject to caps.`
      },
      {
        question: `Are mortgage rates different in ${c.name} vs the rest of ${country.name}?`,
        answer: `Lender rates are set nationally, not by city. However loan size, LVR, and ${c.state}-specific incentives can change your effective cost in ${c.name}.`
      }
    ]
  };
}
function lmiGuide(country, c) {
  const slug = slugBase(country, "lmi-calculator", c);
  const lmi5 = Math.round(c.median * 0.95 * 0.038);
  const lmi10 = Math.round(c.median * 0.9 * 0.022);
  const fmt = (n) => money(country, n);
  const sections = [
    {
      h2: `Why LMI matters more in ${c.name}`,
      blocks: [
        p(`With ${c.name}'s median dwelling value at ${fmt(c.median)}, a 20% deposit means saving ${fmt(c.median * 0.2)} \u2014 out of reach for many buyers. That's why a large share of ${c.name} purchases settle with LMI on the loan.`),
        p(`${c.notes}`)
      ]
    },
    {
      h2: `Estimated LMI cost in ${c.name}`,
      blocks: [
        p(`On the ${c.name} median (${fmt(c.median)}):`),
        ul(
          `5% deposit (95% LVR): LMI \u2248 ${fmt(lmi5)}.`,
          `10% deposit (90% LVR): LMI \u2248 ${fmt(lmi10)}.`,
          `15% deposit (85% LVR): LMI \u2248 ${fmt(Math.round(c.median * 0.85 * 0.011))}.`,
          `20%+ deposit: $0 LMI.`
        ),
        p(`These are illustrative \u2014 exact LMI varies by lender (Helia/QBE), loan amount, and whether you are a first-home buyer or investor.`)
      ]
    },
    {
      h2: `How ${c.name} buyers avoid LMI`,
      blocks: [
        h3("Federal Home Guarantee Scheme"),
        p(`Eligible ${c.name} first-home buyers can purchase with a 5% deposit and have the government guarantee the gap, removing LMI entirely. ${c.state} property price caps apply each financial year.`),
        h3("Professional waivers"),
        p(`Doctors, lawyers, accountants and select other professions can borrow up to 90% LVR LMI-free with several lenders \u2014 useful in higher-priced ${c.name} suburbs like ${c.exampleSuburbs[3] || c.exampleSuburbs[0]}.`),
        h3("Family guarantor loans"),
        p(`A parent can pledge equity in their ${c.state} property as additional security, allowing the buyer to settle a ${c.name} home without LMI even at a 0% deposit.`)
      ]
    }
  ];
  return {
    slug,
    title: `LMI in ${c.name} 2026: how much it costs & how to avoid it`,
    metaTitle: `${c.name} LMI Calculator 2026 \u2014 Lender's Mortgage Insurance | Calcy`,
    metaDescription: tuneDesc(
      `Estimate Lender's Mortgage Insurance for a ${c.name} home loan in 2026. See LMI on the ${fmt(c.median)} ${c.state} median at 5%, 10% and 15% deposits.`,
      [
        `Includes ways ${c.name} first-home buyers can avoid LMI entirely.`,
        `Compare lender premiums for ${c.exampleSuburbs[0]} and ${c.exampleSuburbs[1] || c.name}.`,
        `Free ${c.name} LMI calculator updated for ${country.name} buyers.`
      ]
    ),
    category: `${c.name} LMI`,
    readMins: 7,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `Lender's Mortgage Insurance (LMI) is one of the largest hidden costs for ${c.name} buyers. Here's what LMI typically costs in ${c.name} and the legitimate ways to avoid it.`,
    sections,
    keyTakeaways: [
      `LMI on the ${c.name} median at 5% deposit: ~${fmt(lmi5)}.`,
      `LMI is a one-off premium that protects the lender, not you.`,
      `Federal Home Guarantee Scheme can remove LMI for eligible ${c.name} FHBs.`,
      `Higher deposits drop LMI rapidly \u2014 every 5% LVR saved cuts the premium meaningfully.`
    ],
    relatedCalculator: { to: "/lmi-calculator", label: "Open the LMI calculator" },
    relatedGuides: ["what-is-lmi", "first-home-buyer-grants-2026"],
    faqs: [
      {
        question: `How much is LMI on a typical ${c.name} home?`,
        answer: `On the ${c.name} median (${fmt(c.median)}) with a 5% deposit, LMI is approximately ${fmt(lmi5)}. With a 10% deposit it falls to roughly ${fmt(lmi10)}.`
      },
      {
        question: `Can ${c.name} first-home buyers avoid LMI?`,
        answer: `Yes \u2014 the federal Home Guarantee Scheme allows eligible ${c.state} buyers to settle with a 5% deposit and no LMI, subject to property price caps that change each July.`
      },
      {
        question: `Is LMI tax-deductible in ${c.name}?`,
        answer: `For owner-occupiers, no. Investors purchasing in ${c.name} can usually claim LMI as a borrowing expense, deducted over five years or the loan term, whichever is shorter.`
      }
    ]
  };
}
function stampDutyGuide(country, c) {
  const slug = slugBase(country, "stamp-duty-calculator", c);
  const fhbCap = country.fhbCapByState[c.state] ?? 0;
  const dutyMedian = Math.round(c.median * 0.045);
  const fmt = (n) => money(country, n);
  const sections = [
    {
      h2: `${c.state} stamp duty rules that apply in ${c.name}`,
      blocks: [
        p(`Stamp duty (transfer duty) in ${c.name} is set by the ${c.stateName} government and is one of the largest upfront costs of buying property. ${c.notes}`),
        p(`On the ${c.name} median dwelling value (${fmt(c.median)}), a typical owner-occupier pays approximately ${fmt(dutyMedian)} in transfer duty \u2014 significantly less if you qualify for a first-home buyer exemption or concession.`)
      ]
    },
    {
      h2: `${c.name} first-home buyer concessions`,
      blocks: [
        p(`The ${c.state} government offers concessions for first-home buyers in ${c.name}:`),
        ul(
          `Full exemption typically applies up to ${fmt(fhbCap)} (purchase price thresholds vary by year).`,
          `Partial concessions usually phase out shortly above that cap.`,
          `Off-the-plan and new-build purchases often attract additional discounts.`
        ),
        p(`Always confirm the current threshold with ${c.stateName} Revenue before signing \u2014 caps are reviewed in each state budget.`)
      ]
    },
    {
      h2: `Worked example for a ${c.name} purchase`,
      blocks: [
        p(`Buying a ${fmt(c.median)} home in ${c.exampleSuburbs[0]}:`),
        ul(
          `Standard owner-occupier duty: ~${fmt(dutyMedian)}.`,
          `Eligible FHB under ${fmt(fhbCap)}: $0 (or close to it).`,
          `Investor purchase: same as standard duty plus surcharge if foreign resident.`,
          `Mortgage registration & transfer fees in ${c.state}: ~$300\u2013$500.`
        )
      ]
    },
    {
      h2: `When stamp duty is payable in ${c.state}`,
      blocks: [
        p(`In ${c.stateName}, stamp duty is generally payable within 30 days of settlement. Most ${c.name} buyers arrange for their conveyancer to remit duty directly via PEXA at settlement so the title can transfer cleanly.`),
        p(`Use our ${c.state} stamp duty calculator and combine it with the ${c.name} mortgage calculator to see your true total cost \u2014 duty plus deposit plus loan repayments.`)
      ]
    }
  ];
  return {
    slug,
    title: `${c.name} stamp duty 2026: ${c.state} rules, FHB exemptions & worked examples`,
    metaTitle: `${c.name} Stamp Duty Calculator 2026 (${c.state}) | Calcy`,
    metaDescription: tuneDesc(
      `Calculate ${c.name} stamp duty in 2026. ${c.state} rates, FHB exemptions up to ${fmt(fhbCap)}, worked examples on the ${fmt(c.median)} ${c.name} median.`,
      [
        `Free ${c.name} stamp duty calculator for owner-occupiers and investors.`,
        `Includes ${c.exampleSuburbs[0]} pricing and ${c.state} concession rules.`,
        `Updated for ${country.name} buyers in 2026.`
      ]
    ),
    category: `${c.name} stamp duty`,
    readMins: 8,
    datePublished: "2026-05-01",
    dateModified: "2026-05-06",
    intro: `${c.stateName} stamp duty rules apply to every ${c.name} purchase. Here's how much owner-occupiers, first-home buyers and investors typically pay in ${c.name} in 2026.`,
    sections,
    keyTakeaways: [
      `${c.name} owner-occupier duty on the median: ~${fmt(dutyMedian)}.`,
      `${c.state} FHB exemption typically applies up to ${fmt(fhbCap)}.`,
      `Duty is generally payable within 30 days of ${c.state} settlement.`,
      `Always use a ${c.state}-specific stamp duty calculator \u2014 rates differ across states.`
    ],
    relatedCalculator: {
      to: `/stamp-duty-calculator/${c.state.toLowerCase()}`,
      label: `${c.state} stamp duty calculator`
    },
    relatedGuides: ["stamp-duty-australia-2026", "first-home-buyer-grants-2026"],
    faqs: [
      {
        question: `How much is stamp duty in ${c.name}?`,
        answer: `On the ${c.name} median (${fmt(c.median)}), an owner-occupier pays approximately ${fmt(dutyMedian)} in ${c.state} transfer duty. First-home buyers under ${fmt(fhbCap)} typically pay $0.`
      },
      {
        question: `Do first-home buyers pay stamp duty in ${c.name}?`,
        answer: `Eligible ${c.name} first-home buyers usually pay no stamp duty under the ${c.state} threshold of ${fmt(fhbCap)}, with phased concessions just above that cap.`
      },
      {
        question: `When do I have to pay stamp duty after settlement in ${c.state}?`,
        answer: `${c.stateName} requires stamp duty to be paid within 30 days of settlement. Your conveyancer normally arranges this through PEXA at settlement.`
      }
    ]
  };
}
var CITY_GUIDES = COUNTRIES.flatMap(
  (country) => country.cities.flatMap((c) => [
    mortgageGuide(country, c),
    lmiGuide(country, c),
    stampDutyGuide(country, c)
  ])
);
var CITIES = COUNTRIES.flatMap(
  (country) => country.cities.map((c) => ({ ...c, country: country.code }))
);
export {
  CITIES,
  CITY_GUIDES,
  COUNTRIES
};
