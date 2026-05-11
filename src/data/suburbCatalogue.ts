/**
 * Suburb catalogue — 200 Australian suburbs used to generate the
 * /suburbs/<topic>-<slug> programmatic page surface.
 *
 * Schema mirrors CityRecord but adds parentCity linkage so each suburb
 * page can internally link back to its parent /guides/<topic>-<city>.
 *
 * Medians are CoreLogic/Domain ballpark figures (2026) — illustrative
 * only, not authoritative. All slugs are globally unique within this file.
 */

export interface SuburbRecord {
  slug: string;
  name: string;
  state: "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
  stateName: string;
  parentCitySlug: string; // matches city slug in countryCatalogue.ts
  parentCityName: string;
  median: number;
}

const NSW_NAME = "New South Wales";
const VIC_NAME = "Victoria";
const QLD_NAME = "Queensland";
const WA_NAME = "Western Australia";
const SA_NAME = "South Australia";
const TAS_NAME = "Tasmania";
const ACT_NAME = "Australian Capital Territory";
const NT_NAME = "Northern Territory";

const NSW: Pick<SuburbRecord, "state" | "stateName"> = { state: "NSW", stateName: NSW_NAME };
const VIC: Pick<SuburbRecord, "state" | "stateName"> = { state: "VIC", stateName: VIC_NAME };
const QLD: Pick<SuburbRecord, "state" | "stateName"> = { state: "QLD", stateName: QLD_NAME };
const WA:  Pick<SuburbRecord, "state" | "stateName"> = { state: "WA",  stateName: WA_NAME };
const SA:  Pick<SuburbRecord, "state" | "stateName"> = { state: "SA",  stateName: SA_NAME };
const TAS: Pick<SuburbRecord, "state" | "stateName"> = { state: "TAS", stateName: TAS_NAME };
const ACT: Pick<SuburbRecord, "state" | "stateName"> = { state: "ACT", stateName: ACT_NAME };
const NT:  Pick<SuburbRecord, "state" | "stateName"> = { state: "NT",  stateName: NT_NAME };

const sydney = { parentCitySlug: "sydney", parentCityName: "Sydney" };
const melbourne = { parentCitySlug: "melbourne", parentCityName: "Melbourne" };
const brisbane = { parentCitySlug: "brisbane", parentCityName: "Brisbane" };
const goldCoast = { parentCitySlug: "gold-coast", parentCityName: "Gold Coast" };
const sunshineCoast = { parentCitySlug: "sunshine-coast", parentCityName: "Sunshine Coast" };
const perth = { parentCitySlug: "perth", parentCityName: "Perth" };
const adelaide = { parentCitySlug: "adelaide", parentCityName: "Adelaide" };
const hobart = { parentCitySlug: "hobart", parentCityName: "Hobart" };
const canberra = { parentCitySlug: "canberra", parentCityName: "Canberra" };
const darwin = { parentCitySlug: "darwin", parentCityName: "Darwin" };
const newcastle = { parentCitySlug: "newcastle", parentCityName: "Newcastle" };
const wollongong = { parentCitySlug: "wollongong", parentCityName: "Wollongong" };
const centralCoast = { parentCitySlug: "central-coast", parentCityName: "Central Coast" };
const geelong = { parentCitySlug: "geelong", parentCityName: "Geelong" };
const bendigo = { parentCitySlug: "bendigo", parentCityName: "Bendigo" };
const ballarat = { parentCitySlug: "ballarat", parentCityName: "Ballarat" };

export const SUBURB_CATALOGUE: SuburbRecord[] = [
  // ───────── NSW — SYDNEY (original 20) ─────────
  { slug: "parramatta", name: "Parramatta", ...NSW, ...sydney, median: 920000 },
  { slug: "blacktown", name: "Blacktown", ...NSW, ...sydney, median: 850000 },
  { slug: "liverpool", name: "Liverpool", ...NSW, ...sydney, median: 870000 },
  { slug: "penrith", name: "Penrith", ...NSW, ...sydney, median: 780000 },
  { slug: "castle-hill", name: "Castle Hill", ...NSW, ...sydney, median: 1450000 },
  { slug: "chatswood", name: "Chatswood", ...NSW, ...sydney, median: 1680000 },
  { slug: "bondi", name: "Bondi", ...NSW, ...sydney, median: 2100000 },
  { slug: "manly", name: "Manly", ...NSW, ...sydney, median: 2400000 },
  { slug: "cronulla", name: "Cronulla", ...NSW, ...sydney, median: 1750000 },
  { slug: "campbelltown", name: "Campbelltown", ...NSW, ...sydney, median: 720000 },
  { slug: "hornsby", name: "Hornsby", ...NSW, ...sydney, median: 1350000 },
  { slug: "hurstville", name: "Hurstville", ...NSW, ...sydney, median: 1250000 },
  { slug: "auburn", name: "Auburn", ...NSW, ...sydney, median: 880000 },
  { slug: "ryde", name: "Ryde", ...NSW, ...sydney, median: 1420000 },
  { slug: "sutherland", name: "Sutherland", ...NSW, ...sydney, median: 1180000 },
  { slug: "kellyville", name: "Kellyville", ...NSW, ...sydney, median: 1390000 },
  { slug: "baulkham-hills", name: "Baulkham Hills", ...NSW, ...sydney, median: 1520000 },
  { slug: "marsden-park", name: "Marsden Park", ...NSW, ...sydney, median: 840000 },
  { slug: "oran-park", name: "Oran Park", ...NSW, ...sydney, median: 810000 },
  { slug: "schofields", name: "Schofields", ...NSW, ...sydney, median: 870000 },
  // NSW Sydney expansion (+25)
  { slug: "mascot", name: "Mascot", ...NSW, ...sydney, median: 1100000 },
  { slug: "redfern", name: "Redfern", ...NSW, ...sydney, median: 1350000 },
  { slug: "newtown", name: "Newtown", ...NSW, ...sydney, median: 1450000 },
  { slug: "surry-hills", name: "Surry Hills", ...NSW, ...sydney, median: 1750000 },
  { slug: "alexandria", name: "Alexandria", ...NSW, ...sydney, median: 1480000 },
  { slug: "randwick", name: "Randwick", ...NSW, ...sydney, median: 2050000 },
  { slug: "coogee", name: "Coogee", ...NSW, ...sydney, median: 2350000 },
  { slug: "maroubra", name: "Maroubra", ...NSW, ...sydney, median: 1950000 },
  { slug: "rockdale", name: "Rockdale", ...NSW, ...sydney, median: 1180000 },
  { slug: "kogarah", name: "Kogarah", ...NSW, ...sydney, median: 1320000 },
  { slug: "bankstown", name: "Bankstown", ...NSW, ...sydney, median: 940000 },
  { slug: "fairfield", name: "Fairfield", ...NSW, ...sydney, median: 850000 },
  { slug: "mount-druitt", name: "Mount Druitt", ...NSW, ...sydney, median: 760000 },
  { slug: "marrickville", name: "Marrickville", ...NSW, ...sydney, median: 1380000 },
  { slug: "windsor-nsw", name: "Windsor NSW", ...NSW, ...sydney, median: 830000 },
  { slug: "dee-why", name: "Dee Why", ...NSW, ...sydney, median: 1650000 },
  { slug: "mona-vale", name: "Mona Vale", ...NSW, ...sydney, median: 2150000 },
  { slug: "north-sydney", name: "North Sydney", ...NSW, ...sydney, median: 2250000 },
  { slug: "crows-nest", name: "Crows Nest", ...NSW, ...sydney, median: 2100000 },
  { slug: "lane-cove", name: "Lane Cove", ...NSW, ...sydney, median: 2200000 },
  { slug: "north-epping", name: "North Epping", ...NSW, ...sydney, median: 1750000 },
  { slug: "carlingford", name: "Carlingford", ...NSW, ...sydney, median: 1620000 },
  { slug: "pennant-hills", name: "Pennant Hills", ...NSW, ...sydney, median: 1850000 },
  { slug: "five-dock", name: "Five Dock", ...NSW, ...sydney, median: 1880000 },
  { slug: "strathfield", name: "Strathfield", ...NSW, ...sydney, median: 2280000 },
  // NSW regional (+5)
  { slug: "charlestown", name: "Charlestown", ...NSW, ...newcastle, median: 750000 },
  { slug: "merewether", name: "Merewether", ...NSW, ...newcastle, median: 1280000 },
  { slug: "figtree", name: "Figtree", ...NSW, ...wollongong, median: 920000 },
  { slug: "shellharbour", name: "Shellharbour", ...NSW, ...wollongong, median: 850000 },
  { slug: "gosford", name: "Gosford", ...NSW, ...centralCoast, median: 780000 },

  // ───────── VIC — MELBOURNE (original 20) ─────────
  { slug: "frankston", name: "Frankston", ...VIC, ...melbourne, median: 680000 },
  { slug: "dandenong", name: "Dandenong", ...VIC, ...melbourne, median: 650000 },
  { slug: "ringwood", name: "Ringwood", ...VIC, ...melbourne, median: 820000 },
  { slug: "box-hill", name: "Box Hill", ...VIC, ...melbourne, median: 1050000 },
  { slug: "werribee", name: "Werribee", ...VIC, ...melbourne, median: 590000 },
  { slug: "craigieburn", name: "Craigieburn", ...VIC, ...melbourne, median: 620000 },
  { slug: "south-yarra", name: "South Yarra", ...VIC, ...melbourne, median: 1150000 },
  { slug: "st-kilda", name: "St Kilda", ...VIC, ...melbourne, median: 980000 },
  { slug: "richmond", name: "Richmond", ...VIC, ...melbourne, median: 1080000 },
  { slug: "brunswick", name: "Brunswick", ...VIC, ...melbourne, median: 890000 },
  { slug: "footscray", name: "Footscray", ...VIC, ...melbourne, median: 720000 },
  { slug: "point-cook", name: "Point Cook", ...VIC, ...melbourne, median: 680000 },
  { slug: "hoppers-crossing", name: "Hoppers Crossing", ...VIC, ...melbourne, median: 570000 },
  { slug: "epping", name: "Epping", ...VIC, ...melbourne, median: 640000 },
  { slug: "berwick", name: "Berwick", ...VIC, ...melbourne, median: 710000 },
  { slug: "pakenham", name: "Pakenham", ...VIC, ...melbourne, median: 620000 },
  { slug: "tarneit", name: "Tarneit", ...VIC, ...melbourne, median: 580000 },
  { slug: "glen-waverley", name: "Glen Waverley", ...VIC, ...melbourne, median: 1180000 },
  { slug: "doncaster", name: "Doncaster", ...VIC, ...melbourne, median: 1250000 },
  { slug: "moonee-ponds", name: "Moonee Ponds", ...VIC, ...melbourne, median: 1020000 },
  // VIC Melbourne expansion (+25)
  { slug: "carlton", name: "Carlton", ...VIC, ...melbourne, median: 920000 },
  { slug: "fitzroy", name: "Fitzroy", ...VIC, ...melbourne, median: 1180000 },
  { slug: "collingwood", name: "Collingwood", ...VIC, ...melbourne, median: 980000 },
  { slug: "north-melbourne", name: "North Melbourne", ...VIC, ...melbourne, median: 920000 },
  { slug: "southbank", name: "Southbank", ...VIC, ...melbourne, median: 720000 },
  { slug: "docklands", name: "Docklands", ...VIC, ...melbourne, median: 680000 },
  { slug: "prahran", name: "Prahran", ...VIC, ...melbourne, median: 1080000 },
  { slug: "toorak", name: "Toorak", ...VIC, ...melbourne, median: 2950000 },
  { slug: "malvern", name: "Malvern", ...VIC, ...melbourne, median: 2150000 },
  { slug: "kew", name: "Kew", ...VIC, ...melbourne, median: 2280000 },
  { slug: "camberwell", name: "Camberwell", ...VIC, ...melbourne, median: 2050000 },
  { slug: "hawthorn", name: "Hawthorn", ...VIC, ...melbourne, median: 2180000 },
  { slug: "caulfield", name: "Caulfield", ...VIC, ...melbourne, median: 1320000 },
  { slug: "elsternwick", name: "Elsternwick", ...VIC, ...melbourne, median: 1850000 },
  { slug: "bentleigh", name: "Bentleigh", ...VIC, ...melbourne, median: 1280000 },
  { slug: "mentone", name: "Mentone", ...VIC, ...melbourne, median: 1180000 },
  { slug: "cheltenham", name: "Cheltenham", ...VIC, ...melbourne, median: 1120000 },
  { slug: "mordialloc", name: "Mordialloc", ...VIC, ...melbourne, median: 1050000 },
  { slug: "altona", name: "Altona", ...VIC, ...melbourne, median: 980000 },
  { slug: "williamstown", name: "Williamstown", ...VIC, ...melbourne, median: 1350000 },
  { slug: "essendon", name: "Essendon", ...VIC, ...melbourne, median: 1280000 },
  { slug: "pascoe-vale", name: "Pascoe Vale", ...VIC, ...melbourne, median: 920000 },
  { slug: "preston", name: "Preston", ...VIC, ...melbourne, median: 890000 },
  { slug: "coburg", name: "Coburg", ...VIC, ...melbourne, median: 980000 },
  { slug: "thornbury", name: "Thornbury", ...VIC, ...melbourne, median: 1050000 },
  // VIC regional (+5)
  { slug: "ocean-grove", name: "Ocean Grove", ...VIC, ...geelong, median: 980000 },
  { slug: "belmont-vic", name: "Belmont", ...VIC, ...geelong, median: 720000 },
  { slug: "torquay", name: "Torquay", ...VIC, ...geelong, median: 1280000 },
  { slug: "castlemaine", name: "Castlemaine", ...VIC, ...bendigo, median: 750000 },
  { slug: "daylesford", name: "Daylesford", ...VIC, ...ballarat, median: 880000 },

  // ───────── QLD (original 20) ─────────
  { slug: "springfield", name: "Springfield", ...QLD, ...brisbane, median: 620000 },
  { slug: "ipswich", name: "Ipswich", ...QLD, ...brisbane, median: 520000 },
  { slug: "logan-central", name: "Logan Central", ...QLD, ...brisbane, median: 490000 },
  { slug: "carindale", name: "Carindale", ...QLD, ...brisbane, median: 890000 },
  { slug: "chermside", name: "Chermside", ...QLD, ...brisbane, median: 720000 },
  { slug: "indooroopilly", name: "Indooroopilly", ...QLD, ...brisbane, median: 980000 },
  { slug: "paddington", name: "Paddington", ...QLD, ...brisbane, median: 1150000 },
  { slug: "newstead", name: "Newstead", ...QLD, ...brisbane, median: 920000 },
  { slug: "coomera", name: "Coomera", ...QLD, ...goldCoast, median: 720000 },
  { slug: "robina", name: "Robina", ...QLD, ...goldCoast, median: 850000 },
  { slug: "southport", name: "Southport", ...QLD, ...goldCoast, median: 780000 },
  { slug: "burleigh-heads", name: "Burleigh Heads", ...QLD, ...goldCoast, median: 1200000 },
  { slug: "broadbeach", name: "Broadbeach", ...QLD, ...goldCoast, median: 1050000 },
  { slug: "helensvale", name: "Helensvale", ...QLD, ...goldCoast, median: 870000 },
  { slug: "noosa-heads", name: "Noosa Heads", ...QLD, ...sunshineCoast, median: 1450000 },
  { slug: "maroochydore", name: "Maroochydore", ...QLD, ...sunshineCoast, median: 780000 },
  { slug: "caloundra", name: "Caloundra", ...QLD, ...sunshineCoast, median: 720000 },
  { slug: "buderim", name: "Buderim", ...QLD, ...sunshineCoast, median: 850000 },
  { slug: "mudgeeraba", name: "Mudgeeraba", ...QLD, ...goldCoast, median: 920000 },
  { slug: "upper-coomera", name: "Upper Coomera", ...QLD, ...goldCoast, median: 690000 },
  // QLD expansion (+20)
  { slug: "west-end", name: "West End", ...QLD, ...brisbane, median: 1180000 },
  { slug: "new-farm", name: "New Farm", ...QLD, ...brisbane, median: 1480000 },
  { slug: "teneriffe", name: "Teneriffe", ...QLD, ...brisbane, median: 1380000 },
  { slug: "bulimba", name: "Bulimba", ...QLD, ...brisbane, median: 1620000 },
  { slug: "toowong", name: "Toowong", ...QLD, ...brisbane, median: 1180000 },
  { slug: "st-lucia", name: "St Lucia", ...QLD, ...brisbane, median: 1450000 },
  { slug: "kelvin-grove", name: "Kelvin Grove", ...QLD, ...brisbane, median: 920000 },
  { slug: "ashgrove", name: "Ashgrove", ...QLD, ...brisbane, median: 1320000 },
  { slug: "everton-park", name: "Everton Park", ...QLD, ...brisbane, median: 880000 },
  { slug: "aspley", name: "Aspley", ...QLD, ...brisbane, median: 850000 },
  { slug: "mt-gravatt", name: "Mount Gravatt", ...QLD, ...brisbane, median: 880000 },
  { slug: "sunnybank", name: "Sunnybank", ...QLD, ...brisbane, median: 1080000 },
  { slug: "forest-lake", name: "Forest Lake", ...QLD, ...brisbane, median: 720000 },
  { slug: "surfers-paradise", name: "Surfers Paradise", ...QLD, ...goldCoast, median: 920000 },
  { slug: "palm-beach", name: "Palm Beach", ...QLD, ...goldCoast, median: 1380000 },
  { slug: "currumbin", name: "Currumbin", ...QLD, ...goldCoast, median: 1250000 },
  { slug: "coolangatta", name: "Coolangatta", ...QLD, ...goldCoast, median: 1050000 },
  { slug: "nerang", name: "Nerang", ...QLD, ...goldCoast, median: 780000 },
  { slug: "mooloolaba", name: "Mooloolaba", ...QLD, ...sunshineCoast, median: 1180000 },
  { slug: "coolum-beach", name: "Coolum Beach", ...QLD, ...sunshineCoast, median: 1080000 },

  // ───────── WA — PERTH (original 20) ─────────
  { slug: "joondalup", name: "Joondalup", ...WA, ...perth, median: 620000 },
  { slug: "rockingham", name: "Rockingham", ...WA, ...perth, median: 490000 },
  { slug: "armadale", name: "Armadale", ...WA, ...perth, median: 450000 },
  { slug: "midland", name: "Midland", ...WA, ...perth, median: 480000 },
  { slug: "fremantle", name: "Fremantle", ...WA, ...perth, median: 890000 },
  { slug: "cottesloe", name: "Cottesloe", ...WA, ...perth, median: 2100000 },
  { slug: "subiaco", name: "Subiaco", ...WA, ...perth, median: 1350000 },
  { slug: "scarborough", name: "Scarborough", ...WA, ...perth, median: 980000 },
  { slug: "baldivis", name: "Baldivis", ...WA, ...perth, median: 520000 },
  { slug: "ellenbrook", name: "Ellenbrook", ...WA, ...perth, median: 540000 },
  { slug: "karrinyup", name: "Karrinyup", ...WA, ...perth, median: 1050000 },
  { slug: "canning-vale", name: "Canning Vale", ...WA, ...perth, median: 680000 },
  { slug: "melville", name: "Melville", ...WA, ...perth, median: 980000 },
  { slug: "stirling", name: "Stirling", ...WA, ...perth, median: 850000 },
  { slug: "butler", name: "Butler", ...WA, ...perth, median: 510000 },
  { slug: "wellard", name: "Wellard", ...WA, ...perth, median: 490000 },
  { slug: "byford", name: "Byford", ...WA, ...perth, median: 530000 },
  { slug: "harrisdale", name: "Harrisdale", ...WA, ...perth, median: 620000 },
  { slug: "applecross", name: "Applecross", ...WA, ...perth, median: 1450000 },
  { slug: "nedlands", name: "Nedlands", ...WA, ...perth, median: 1680000 },
  // WA expansion (+15)
  { slug: "north-perth", name: "North Perth", ...WA, ...perth, median: 920000 },
  { slug: "mount-lawley", name: "Mount Lawley", ...WA, ...perth, median: 1180000 },
  { slug: "east-perth", name: "East Perth", ...WA, ...perth, median: 680000 },
  { slug: "victoria-park", name: "Victoria Park", ...WA, ...perth, median: 850000 },
  { slug: "como", name: "Como", ...WA, ...perth, median: 1250000 },
  { slug: "south-perth", name: "South Perth", ...WA, ...perth, median: 1380000 },
  { slug: "claremont", name: "Claremont", ...WA, ...perth, median: 1850000 },
  { slug: "mosman-park", name: "Mosman Park", ...WA, ...perth, median: 1520000 },
  { slug: "duncraig", name: "Duncraig", ...WA, ...perth, median: 850000 },
  { slug: "hillarys", name: "Hillarys", ...WA, ...perth, median: 920000 },
  { slug: "kingsley", name: "Kingsley", ...WA, ...perth, median: 780000 },
  { slug: "woodvale", name: "Woodvale", ...WA, ...perth, median: 810000 },
  { slug: "ballajura", name: "Ballajura", ...WA, ...perth, median: 620000 },
  { slug: "thornlie", name: "Thornlie", ...WA, ...perth, median: 580000 },
  { slug: "gosnells", name: "Gosnells", ...WA, ...perth, median: 520000 },

  // ───────── SA — ADELAIDE (original 8) ─────────
  { slug: "norwood", name: "Norwood", ...SA, ...adelaide, median: 980000 },
  { slug: "glenelg", name: "Glenelg", ...SA, ...adelaide, median: 870000 },
  { slug: "modbury", name: "Modbury", ...SA, ...adelaide, median: 580000 },
  { slug: "salisbury", name: "Salisbury", ...SA, ...adelaide, median: 490000 },
  { slug: "morphett-vale", name: "Morphett Vale", ...SA, ...adelaide, median: 460000 },
  { slug: "mount-barker", name: "Mount Barker", ...SA, ...adelaide, median: 550000 },
  { slug: "hallett-cove", name: "Hallett Cove", ...SA, ...adelaide, median: 620000 },
  { slug: "happy-valley", name: "Happy Valley", ...SA, ...adelaide, median: 580000 },
  // SA expansion (+10)
  { slug: "prospect", name: "Prospect", ...SA, ...adelaide, median: 920000 },
  { slug: "unley", name: "Unley", ...SA, ...adelaide, median: 1280000 },
  { slug: "mitcham", name: "Mitcham", ...SA, ...adelaide, median: 850000 },
  { slug: "west-lakes", name: "West Lakes", ...SA, ...adelaide, median: 920000 },
  { slug: "henley-beach", name: "Henley Beach", ...SA, ...adelaide, median: 1180000 },
  { slug: "semaphore", name: "Semaphore", ...SA, ...adelaide, median: 820000 },
  { slug: "magill", name: "Magill", ...SA, ...adelaide, median: 880000 },
  { slug: "aldgate", name: "Aldgate", ...SA, ...adelaide, median: 1080000 },
  { slug: "gawler", name: "Gawler", ...SA, ...adelaide, median: 480000 },
  { slug: "elizabeth", name: "Elizabeth", ...SA, ...adelaide, median: 420000 },

  // ───────── TAS / ACT / NT (original 4 + 3 expansion) ─────────
  { slug: "sandy-bay", name: "Sandy Bay", ...TAS, ...hobart, median: 890000 },
  { slug: "kingston", name: "Kingston", ...TAS, ...hobart, median: 680000 },
  { slug: "battery-point", name: "Battery Point", ...TAS, ...hobart, median: 1180000 },
  { slug: "gungahlin", name: "Gungahlin", ...ACT, ...canberra, median: 720000 },
  { slug: "tuggeranong", name: "Tuggeranong", ...ACT, ...canberra, median: 650000 },
  { slug: "belconnen", name: "Belconnen", ...ACT, ...canberra, median: 720000 },
  { slug: "larrakeyah", name: "Larrakeyah", ...NT, ...darwin, median: 720000 },
];

export const SUBURB_BY_SLUG: Record<string, SuburbRecord> = Object.fromEntries(
  SUBURB_CATALOGUE.map((s) => [s.slug, s]),
);
