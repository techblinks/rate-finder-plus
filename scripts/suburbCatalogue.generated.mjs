// src/data/suburbCatalogue.ts
var NSW_NAME = "New South Wales";
var VIC_NAME = "Victoria";
var QLD_NAME = "Queensland";
var WA_NAME = "Western Australia";
var SA_NAME = "South Australia";
var TAS_NAME = "Tasmania";
var ACT_NAME = "Australian Capital Territory";
var NT_NAME = "Northern Territory";
var NSW = { state: "NSW", stateName: NSW_NAME };
var VIC = { state: "VIC", stateName: VIC_NAME };
var QLD = { state: "QLD", stateName: QLD_NAME };
var WA = { state: "WA", stateName: WA_NAME };
var SA = { state: "SA", stateName: SA_NAME };
var TAS = { state: "TAS", stateName: TAS_NAME };
var ACT = { state: "ACT", stateName: ACT_NAME };
var NT = { state: "NT", stateName: NT_NAME };
var sydney = { parentCitySlug: "sydney", parentCityName: "Sydney" };
var melbourne = { parentCitySlug: "melbourne", parentCityName: "Melbourne" };
var brisbane = { parentCitySlug: "brisbane", parentCityName: "Brisbane" };
var goldCoast = { parentCitySlug: "gold-coast", parentCityName: "Gold Coast" };
var sunshineCoast = { parentCitySlug: "sunshine-coast", parentCityName: "Sunshine Coast" };
var perth = { parentCitySlug: "perth", parentCityName: "Perth" };
var adelaide = { parentCitySlug: "adelaide", parentCityName: "Adelaide" };
var hobart = { parentCitySlug: "hobart", parentCityName: "Hobart" };
var canberra = { parentCitySlug: "canberra", parentCityName: "Canberra" };
var darwin = { parentCitySlug: "darwin", parentCityName: "Darwin" };
var newcastle = { parentCitySlug: "newcastle", parentCityName: "Newcastle" };
var wollongong = { parentCitySlug: "wollongong", parentCityName: "Wollongong" };
var centralCoast = { parentCitySlug: "central-coast", parentCityName: "Central Coast" };
var geelong = { parentCitySlug: "geelong", parentCityName: "Geelong" };
var bendigo = { parentCitySlug: "bendigo", parentCityName: "Bendigo" };
var ballarat = { parentCitySlug: "ballarat", parentCityName: "Ballarat" };
var SUBURB_CATALOGUE = [
  // ───────── NSW — SYDNEY (original 20) ─────────
  { slug: "parramatta", name: "Parramatta", ...NSW, ...sydney, median: 92e4 },
  { slug: "blacktown", name: "Blacktown", ...NSW, ...sydney, median: 85e4 },
  { slug: "liverpool", name: "Liverpool", ...NSW, ...sydney, median: 87e4 },
  { slug: "penrith", name: "Penrith", ...NSW, ...sydney, median: 78e4 },
  { slug: "castle-hill", name: "Castle Hill", ...NSW, ...sydney, median: 145e4 },
  { slug: "chatswood", name: "Chatswood", ...NSW, ...sydney, median: 168e4 },
  { slug: "bondi", name: "Bondi", ...NSW, ...sydney, median: 21e5 },
  { slug: "manly", name: "Manly", ...NSW, ...sydney, median: 24e5 },
  { slug: "cronulla", name: "Cronulla", ...NSW, ...sydney, median: 175e4 },
  { slug: "campbelltown", name: "Campbelltown", ...NSW, ...sydney, median: 72e4 },
  { slug: "hornsby", name: "Hornsby", ...NSW, ...sydney, median: 135e4 },
  { slug: "hurstville", name: "Hurstville", ...NSW, ...sydney, median: 125e4 },
  { slug: "auburn", name: "Auburn", ...NSW, ...sydney, median: 88e4 },
  { slug: "ryde", name: "Ryde", ...NSW, ...sydney, median: 142e4 },
  { slug: "sutherland", name: "Sutherland", ...NSW, ...sydney, median: 118e4 },
  { slug: "kellyville", name: "Kellyville", ...NSW, ...sydney, median: 139e4 },
  { slug: "baulkham-hills", name: "Baulkham Hills", ...NSW, ...sydney, median: 152e4 },
  { slug: "marsden-park", name: "Marsden Park", ...NSW, ...sydney, median: 84e4 },
  { slug: "oran-park", name: "Oran Park", ...NSW, ...sydney, median: 81e4 },
  { slug: "schofields", name: "Schofields", ...NSW, ...sydney, median: 87e4 },
  // NSW Sydney expansion (+25)
  { slug: "mascot", name: "Mascot", ...NSW, ...sydney, median: 11e5 },
  { slug: "redfern", name: "Redfern", ...NSW, ...sydney, median: 135e4 },
  { slug: "newtown", name: "Newtown", ...NSW, ...sydney, median: 145e4 },
  { slug: "surry-hills", name: "Surry Hills", ...NSW, ...sydney, median: 175e4 },
  { slug: "alexandria", name: "Alexandria", ...NSW, ...sydney, median: 148e4 },
  { slug: "randwick", name: "Randwick", ...NSW, ...sydney, median: 205e4 },
  { slug: "coogee", name: "Coogee", ...NSW, ...sydney, median: 235e4 },
  { slug: "maroubra", name: "Maroubra", ...NSW, ...sydney, median: 195e4 },
  { slug: "rockdale", name: "Rockdale", ...NSW, ...sydney, median: 118e4 },
  { slug: "kogarah", name: "Kogarah", ...NSW, ...sydney, median: 132e4 },
  { slug: "bankstown", name: "Bankstown", ...NSW, ...sydney, median: 94e4 },
  { slug: "fairfield", name: "Fairfield", ...NSW, ...sydney, median: 85e4 },
  { slug: "mount-druitt", name: "Mount Druitt", ...NSW, ...sydney, median: 76e4 },
  { slug: "marrickville", name: "Marrickville", ...NSW, ...sydney, median: 138e4 },
  { slug: "windsor-nsw", name: "Windsor NSW", ...NSW, ...sydney, median: 83e4 },
  { slug: "dee-why", name: "Dee Why", ...NSW, ...sydney, median: 165e4 },
  { slug: "mona-vale", name: "Mona Vale", ...NSW, ...sydney, median: 215e4 },
  { slug: "north-sydney", name: "North Sydney", ...NSW, ...sydney, median: 225e4 },
  { slug: "crows-nest", name: "Crows Nest", ...NSW, ...sydney, median: 21e5 },
  { slug: "lane-cove", name: "Lane Cove", ...NSW, ...sydney, median: 22e5 },
  { slug: "north-epping", name: "North Epping", ...NSW, ...sydney, median: 175e4 },
  { slug: "carlingford", name: "Carlingford", ...NSW, ...sydney, median: 162e4 },
  { slug: "pennant-hills", name: "Pennant Hills", ...NSW, ...sydney, median: 185e4 },
  { slug: "five-dock", name: "Five Dock", ...NSW, ...sydney, median: 188e4 },
  { slug: "strathfield", name: "Strathfield", ...NSW, ...sydney, median: 228e4 },
  // NSW regional (+5)
  { slug: "charlestown", name: "Charlestown", ...NSW, ...newcastle, median: 75e4 },
  { slug: "merewether", name: "Merewether", ...NSW, ...newcastle, median: 128e4 },
  { slug: "figtree", name: "Figtree", ...NSW, ...wollongong, median: 92e4 },
  { slug: "shellharbour", name: "Shellharbour", ...NSW, ...wollongong, median: 85e4 },
  { slug: "gosford", name: "Gosford", ...NSW, ...centralCoast, median: 78e4 },
  // ───────── VIC — MELBOURNE (original 20) ─────────
  { slug: "frankston", name: "Frankston", ...VIC, ...melbourne, median: 68e4 },
  { slug: "dandenong", name: "Dandenong", ...VIC, ...melbourne, median: 65e4 },
  { slug: "ringwood", name: "Ringwood", ...VIC, ...melbourne, median: 82e4 },
  { slug: "box-hill", name: "Box Hill", ...VIC, ...melbourne, median: 105e4 },
  { slug: "werribee", name: "Werribee", ...VIC, ...melbourne, median: 59e4 },
  { slug: "craigieburn", name: "Craigieburn", ...VIC, ...melbourne, median: 62e4 },
  { slug: "south-yarra", name: "South Yarra", ...VIC, ...melbourne, median: 115e4 },
  { slug: "st-kilda", name: "St Kilda", ...VIC, ...melbourne, median: 98e4 },
  { slug: "richmond", name: "Richmond", ...VIC, ...melbourne, median: 108e4 },
  { slug: "brunswick", name: "Brunswick", ...VIC, ...melbourne, median: 89e4 },
  { slug: "footscray", name: "Footscray", ...VIC, ...melbourne, median: 72e4 },
  { slug: "point-cook", name: "Point Cook", ...VIC, ...melbourne, median: 68e4 },
  { slug: "hoppers-crossing", name: "Hoppers Crossing", ...VIC, ...melbourne, median: 57e4 },
  { slug: "epping", name: "Epping", ...VIC, ...melbourne, median: 64e4 },
  { slug: "berwick", name: "Berwick", ...VIC, ...melbourne, median: 71e4 },
  { slug: "pakenham", name: "Pakenham", ...VIC, ...melbourne, median: 62e4 },
  { slug: "tarneit", name: "Tarneit", ...VIC, ...melbourne, median: 58e4 },
  { slug: "glen-waverley", name: "Glen Waverley", ...VIC, ...melbourne, median: 118e4 },
  { slug: "doncaster", name: "Doncaster", ...VIC, ...melbourne, median: 125e4 },
  { slug: "moonee-ponds", name: "Moonee Ponds", ...VIC, ...melbourne, median: 102e4 },
  // VIC Melbourne expansion (+25)
  { slug: "carlton", name: "Carlton", ...VIC, ...melbourne, median: 92e4 },
  { slug: "fitzroy", name: "Fitzroy", ...VIC, ...melbourne, median: 118e4 },
  { slug: "collingwood", name: "Collingwood", ...VIC, ...melbourne, median: 98e4 },
  { slug: "north-melbourne", name: "North Melbourne", ...VIC, ...melbourne, median: 92e4 },
  { slug: "southbank", name: "Southbank", ...VIC, ...melbourne, median: 72e4 },
  { slug: "docklands", name: "Docklands", ...VIC, ...melbourne, median: 68e4 },
  { slug: "prahran", name: "Prahran", ...VIC, ...melbourne, median: 108e4 },
  { slug: "toorak", name: "Toorak", ...VIC, ...melbourne, median: 295e4 },
  { slug: "malvern", name: "Malvern", ...VIC, ...melbourne, median: 215e4 },
  { slug: "kew", name: "Kew", ...VIC, ...melbourne, median: 228e4 },
  { slug: "camberwell", name: "Camberwell", ...VIC, ...melbourne, median: 205e4 },
  { slug: "hawthorn", name: "Hawthorn", ...VIC, ...melbourne, median: 218e4 },
  { slug: "caulfield", name: "Caulfield", ...VIC, ...melbourne, median: 132e4 },
  { slug: "elsternwick", name: "Elsternwick", ...VIC, ...melbourne, median: 185e4 },
  { slug: "bentleigh", name: "Bentleigh", ...VIC, ...melbourne, median: 128e4 },
  { slug: "mentone", name: "Mentone", ...VIC, ...melbourne, median: 118e4 },
  { slug: "cheltenham", name: "Cheltenham", ...VIC, ...melbourne, median: 112e4 },
  { slug: "mordialloc", name: "Mordialloc", ...VIC, ...melbourne, median: 105e4 },
  { slug: "altona", name: "Altona", ...VIC, ...melbourne, median: 98e4 },
  { slug: "williamstown", name: "Williamstown", ...VIC, ...melbourne, median: 135e4 },
  { slug: "essendon", name: "Essendon", ...VIC, ...melbourne, median: 128e4 },
  { slug: "pascoe-vale", name: "Pascoe Vale", ...VIC, ...melbourne, median: 92e4 },
  { slug: "preston", name: "Preston", ...VIC, ...melbourne, median: 89e4 },
  { slug: "coburg", name: "Coburg", ...VIC, ...melbourne, median: 98e4 },
  { slug: "thornbury", name: "Thornbury", ...VIC, ...melbourne, median: 105e4 },
  // VIC regional (+5)
  { slug: "ocean-grove", name: "Ocean Grove", ...VIC, ...geelong, median: 98e4 },
  { slug: "belmont-vic", name: "Belmont VIC", ...VIC, ...geelong, median: 72e4 },
  { slug: "torquay", name: "Torquay", ...VIC, ...geelong, median: 128e4 },
  { slug: "castlemaine", name: "Castlemaine", ...VIC, ...bendigo, median: 75e4 },
  { slug: "daylesford", name: "Daylesford", ...VIC, ...ballarat, median: 88e4 },
  // ───────── QLD (original 20) ─────────
  { slug: "springfield", name: "Springfield", ...QLD, ...brisbane, median: 62e4 },
  { slug: "ipswich", name: "Ipswich", ...QLD, ...brisbane, median: 52e4 },
  { slug: "logan-central", name: "Logan Central", ...QLD, ...brisbane, median: 49e4 },
  { slug: "carindale", name: "Carindale", ...QLD, ...brisbane, median: 89e4 },
  { slug: "chermside", name: "Chermside", ...QLD, ...brisbane, median: 72e4 },
  { slug: "indooroopilly", name: "Indooroopilly", ...QLD, ...brisbane, median: 98e4 },
  { slug: "paddington", name: "Paddington", ...QLD, ...brisbane, median: 115e4 },
  { slug: "newstead", name: "Newstead", ...QLD, ...brisbane, median: 92e4 },
  { slug: "coomera", name: "Coomera", ...QLD, ...goldCoast, median: 72e4 },
  { slug: "robina", name: "Robina", ...QLD, ...goldCoast, median: 85e4 },
  { slug: "southport", name: "Southport", ...QLD, ...goldCoast, median: 78e4 },
  { slug: "burleigh-heads", name: "Burleigh Heads", ...QLD, ...goldCoast, median: 12e5 },
  { slug: "broadbeach", name: "Broadbeach", ...QLD, ...goldCoast, median: 105e4 },
  { slug: "helensvale", name: "Helensvale", ...QLD, ...goldCoast, median: 87e4 },
  { slug: "noosa-heads", name: "Noosa Heads", ...QLD, ...sunshineCoast, median: 145e4 },
  { slug: "maroochydore", name: "Maroochydore", ...QLD, ...sunshineCoast, median: 78e4 },
  { slug: "caloundra", name: "Caloundra", ...QLD, ...sunshineCoast, median: 72e4 },
  { slug: "buderim", name: "Buderim", ...QLD, ...sunshineCoast, median: 85e4 },
  { slug: "mudgeeraba", name: "Mudgeeraba", ...QLD, ...goldCoast, median: 92e4 },
  { slug: "upper-coomera", name: "Upper Coomera", ...QLD, ...goldCoast, median: 69e4 },
  // QLD expansion (+20)
  { slug: "west-end", name: "West End", ...QLD, ...brisbane, median: 118e4 },
  { slug: "new-farm", name: "New Farm", ...QLD, ...brisbane, median: 148e4 },
  { slug: "teneriffe", name: "Teneriffe", ...QLD, ...brisbane, median: 138e4 },
  { slug: "bulimba", name: "Bulimba", ...QLD, ...brisbane, median: 162e4 },
  { slug: "toowong", name: "Toowong", ...QLD, ...brisbane, median: 118e4 },
  { slug: "st-lucia", name: "St Lucia", ...QLD, ...brisbane, median: 145e4 },
  { slug: "kelvin-grove", name: "Kelvin Grove", ...QLD, ...brisbane, median: 92e4 },
  { slug: "ashgrove", name: "Ashgrove", ...QLD, ...brisbane, median: 132e4 },
  { slug: "everton-park", name: "Everton Park", ...QLD, ...brisbane, median: 88e4 },
  { slug: "aspley", name: "Aspley", ...QLD, ...brisbane, median: 85e4 },
  { slug: "mount-gravatt", name: "Mount Gravatt", ...QLD, ...brisbane, median: 88e4 },
  { slug: "sunnybank", name: "Sunnybank", ...QLD, ...brisbane, median: 108e4 },
  { slug: "forest-lake", name: "Forest Lake", ...QLD, ...brisbane, median: 72e4 },
  { slug: "surfers-paradise", name: "Surfers Paradise", ...QLD, ...goldCoast, median: 92e4 },
  { slug: "palm-beach", name: "Palm Beach", ...QLD, ...goldCoast, median: 138e4 },
  { slug: "currumbin", name: "Currumbin", ...QLD, ...goldCoast, median: 125e4 },
  { slug: "coolangatta", name: "Coolangatta", ...QLD, ...goldCoast, median: 105e4 },
  { slug: "nerang", name: "Nerang", ...QLD, ...goldCoast, median: 78e4 },
  { slug: "mooloolaba", name: "Mooloolaba", ...QLD, ...sunshineCoast, median: 118e4 },
  { slug: "coolum-beach", name: "Coolum Beach", ...QLD, ...sunshineCoast, median: 108e4 },
  // ───────── WA — PERTH (original 20) ─────────
  { slug: "joondalup", name: "Joondalup", ...WA, ...perth, median: 62e4 },
  { slug: "rockingham", name: "Rockingham", ...WA, ...perth, median: 49e4 },
  { slug: "armadale", name: "Armadale", ...WA, ...perth, median: 45e4 },
  { slug: "midland", name: "Midland", ...WA, ...perth, median: 48e4 },
  { slug: "fremantle", name: "Fremantle", ...WA, ...perth, median: 89e4 },
  { slug: "cottesloe", name: "Cottesloe", ...WA, ...perth, median: 21e5 },
  { slug: "subiaco", name: "Subiaco", ...WA, ...perth, median: 135e4 },
  { slug: "scarborough", name: "Scarborough", ...WA, ...perth, median: 98e4 },
  { slug: "baldivis", name: "Baldivis", ...WA, ...perth, median: 52e4 },
  { slug: "ellenbrook", name: "Ellenbrook", ...WA, ...perth, median: 54e4 },
  { slug: "karrinyup", name: "Karrinyup", ...WA, ...perth, median: 105e4 },
  { slug: "canning-vale", name: "Canning Vale", ...WA, ...perth, median: 68e4 },
  { slug: "melville", name: "Melville", ...WA, ...perth, median: 98e4 },
  { slug: "stirling", name: "Stirling", ...WA, ...perth, median: 85e4 },
  { slug: "butler", name: "Butler", ...WA, ...perth, median: 51e4 },
  { slug: "wellard", name: "Wellard", ...WA, ...perth, median: 49e4 },
  { slug: "byford", name: "Byford", ...WA, ...perth, median: 53e4 },
  { slug: "harrisdale", name: "Harrisdale", ...WA, ...perth, median: 62e4 },
  { slug: "applecross", name: "Applecross", ...WA, ...perth, median: 145e4 },
  { slug: "nedlands", name: "Nedlands", ...WA, ...perth, median: 168e4 },
  // WA expansion (+15)
  { slug: "north-perth", name: "North Perth", ...WA, ...perth, median: 92e4 },
  { slug: "mount-lawley", name: "Mount Lawley", ...WA, ...perth, median: 118e4 },
  { slug: "east-perth", name: "East Perth", ...WA, ...perth, median: 68e4 },
  { slug: "victoria-park", name: "Victoria Park", ...WA, ...perth, median: 85e4 },
  { slug: "como", name: "Como", ...WA, ...perth, median: 125e4 },
  { slug: "south-perth", name: "South Perth", ...WA, ...perth, median: 138e4 },
  { slug: "claremont", name: "Claremont", ...WA, ...perth, median: 185e4 },
  { slug: "mosman-park", name: "Mosman Park", ...WA, ...perth, median: 152e4 },
  { slug: "duncraig", name: "Duncraig", ...WA, ...perth, median: 85e4 },
  { slug: "hillarys", name: "Hillarys", ...WA, ...perth, median: 92e4 },
  { slug: "kingsley", name: "Kingsley", ...WA, ...perth, median: 78e4 },
  { slug: "woodvale", name: "Woodvale", ...WA, ...perth, median: 81e4 },
  { slug: "ballajura", name: "Ballajura", ...WA, ...perth, median: 62e4 },
  { slug: "thornlie", name: "Thornlie", ...WA, ...perth, median: 58e4 },
  { slug: "gosnells", name: "Gosnells", ...WA, ...perth, median: 52e4 },
  // ───────── SA — ADELAIDE (original 8) ─────────
  { slug: "norwood", name: "Norwood", ...SA, ...adelaide, median: 98e4 },
  { slug: "glenelg", name: "Glenelg", ...SA, ...adelaide, median: 87e4 },
  { slug: "modbury", name: "Modbury", ...SA, ...adelaide, median: 58e4 },
  { slug: "salisbury", name: "Salisbury", ...SA, ...adelaide, median: 49e4 },
  { slug: "morphett-vale", name: "Morphett Vale", ...SA, ...adelaide, median: 46e4 },
  { slug: "mount-barker", name: "Mount Barker", ...SA, ...adelaide, median: 55e4 },
  { slug: "hallett-cove", name: "Hallett Cove", ...SA, ...adelaide, median: 62e4 },
  { slug: "happy-valley", name: "Happy Valley", ...SA, ...adelaide, median: 58e4 },
  // SA expansion (+10)
  { slug: "prospect", name: "Prospect", ...SA, ...adelaide, median: 92e4 },
  { slug: "unley", name: "Unley", ...SA, ...adelaide, median: 128e4 },
  { slug: "mitcham", name: "Mitcham", ...SA, ...adelaide, median: 85e4 },
  { slug: "west-lakes", name: "West Lakes", ...SA, ...adelaide, median: 92e4 },
  { slug: "henley-beach", name: "Henley Beach", ...SA, ...adelaide, median: 118e4 },
  { slug: "semaphore", name: "Semaphore", ...SA, ...adelaide, median: 82e4 },
  { slug: "magill", name: "Magill", ...SA, ...adelaide, median: 88e4 },
  { slug: "aldgate", name: "Aldgate", ...SA, ...adelaide, median: 108e4 },
  { slug: "gawler", name: "Gawler", ...SA, ...adelaide, median: 48e4 },
  { slug: "elizabeth", name: "Elizabeth", ...SA, ...adelaide, median: 42e4 },
  // ───────── TAS / ACT / NT (original 4 + 3 expansion) ─────────
  { slug: "sandy-bay", name: "Sandy Bay", ...TAS, ...hobart, median: 89e4 },
  { slug: "kingston", name: "Kingston", ...TAS, ...hobart, median: 68e4 },
  { slug: "battery-point", name: "Battery Point", ...TAS, ...hobart, median: 118e4 },
  { slug: "gungahlin", name: "Gungahlin", ...ACT, ...canberra, median: 72e4 },
  { slug: "tuggeranong", name: "Tuggeranong", ...ACT, ...canberra, median: 65e4 },
  { slug: "belconnen", name: "Belconnen", ...ACT, ...canberra, median: 72e4 },
  { slug: "larrakeyah", name: "Larrakeyah", ...NT, ...darwin, median: 72e4 }
];
var SUBURB_BY_SLUG = Object.fromEntries(
  SUBURB_CATALOGUE.map((s) => [s.slug, s])
);
export {
  SUBURB_BY_SLUG,
  SUBURB_CATALOGUE
};
