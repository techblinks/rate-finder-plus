// Public sitemap of /suburbs/<topic>-<suburb> programmatic suburb pages.
// Enumerates the 200-suburb × 3-topic catalogue (600 URLs) — no DB read.
// Served at https://calcy.com.au/sitemap-suburbs.xml via _redirects rewrite.
//
// The suburb slug list is duplicated here (vs imported from src/data) because
// Edge Functions run on Deno and can't import the React app's TS modules.
// When adding suburbs in src/data/suburbCatalogue.ts, mirror the slugs here.

const SITE = "https://calcy.com.au";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBURB_SLUGS = [
  // NSW Sydney (45)
  "parramatta", "blacktown", "liverpool", "penrith", "castle-hill", "chatswood", "bondi", "manly",
  "cronulla", "campbelltown", "hornsby", "hurstville", "auburn", "ryde", "sutherland", "kellyville",
  "baulkham-hills", "marsden-park", "oran-park", "schofields",
  "mascot", "redfern", "newtown", "surry-hills", "alexandria", "randwick", "coogee", "maroubra",
  "rockdale", "kogarah", "bankstown", "fairfield", "mount-druitt", "marrickville", "windsor-nsw",
  "dee-why", "mona-vale", "north-sydney", "crows-nest", "lane-cove", "north-epping", "carlingford",
  "pennant-hills", "five-dock", "strathfield",
  // NSW regional (5)
  "charlestown", "merewether", "figtree", "shellharbour", "gosford",
  // VIC Melbourne (45)
  "frankston", "dandenong", "ringwood", "box-hill", "werribee", "craigieburn", "south-yarra",
  "st-kilda", "richmond", "brunswick", "footscray", "point-cook", "hoppers-crossing", "epping",
  "berwick", "pakenham", "tarneit", "glen-waverley", "doncaster", "moonee-ponds",
  "carlton", "fitzroy", "collingwood", "north-melbourne", "southbank", "docklands", "prahran",
  "toorak", "malvern", "kew", "camberwell", "hawthorn", "caulfield", "elsternwick", "bentleigh",
  "mentone", "cheltenham", "mordialloc", "altona", "williamstown", "essendon", "pascoe-vale",
  "preston", "coburg", "thornbury",
  // VIC regional (5)
  "ocean-grove", "belmont-vic", "torquay", "castlemaine", "daylesford",
  // QLD (40)
  "springfield", "ipswich", "logan-central", "carindale", "chermside", "indooroopilly",
  "paddington", "newstead", "coomera", "robina", "southport", "burleigh-heads", "broadbeach",
  "helensvale", "noosa-heads", "maroochydore", "caloundra", "buderim", "mudgeeraba", "upper-coomera",
  "west-end", "new-farm", "teneriffe", "bulimba", "toowong", "st-lucia", "kelvin-grove", "ashgrove",
  "everton-park", "aspley", "mt-gravatt", "sunnybank", "forest-lake", "surfers-paradise",
  "palm-beach", "currumbin", "coolangatta", "nerang", "mooloolaba", "coolum-beach",
  // WA (35)
  "joondalup", "rockingham", "armadale", "midland", "fremantle", "cottesloe", "subiaco",
  "scarborough", "baldivis", "ellenbrook", "karrinyup", "canning-vale", "melville", "stirling",
  "butler", "wellard", "byford", "harrisdale", "applecross", "nedlands",
  "north-perth", "mount-lawley", "east-perth", "victoria-park", "como", "south-perth", "claremont",
  "mosman-park", "duncraig", "hillarys", "kingsley", "woodvale", "ballajura", "thornlie", "gosnells",
  // SA (18)
  "norwood", "glenelg", "modbury", "salisbury", "morphett-vale", "mount-barker", "hallett-cove",
  "happy-valley",
  "prospect", "unley", "mitcham", "west-lakes", "henley-beach", "semaphore", "magill", "aldgate",
  "gawler", "elizabeth",
  // TAS/ACT/NT (7)
  "sandy-bay", "kingston", "battery-point", "gungahlin", "tuggeranong", "belconnen", "larrakeyah",
];

const TOPICS = ["mortgage-calculator", "lmi-calculator", "stamp-duty-calculator"];

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = SUBURB_SLUGS.flatMap((sub) =>
    TOPICS.map(
      (topic) => `  <url>
    <loc>${SITE}/suburbs/${topic}-${sub}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ),
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
