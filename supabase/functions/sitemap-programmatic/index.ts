// Public sitemap of /guides/<topic>-<city> programmatic city-guide URLs.
// Enumerates the 50-city × 3-topic catalogue (150 URLs) — no DB read.
// Served at https://calcy.com.au/sitemap-programmatic.xml via _redirects rewrite.

const SITE = "https://calcy.com.au";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 50 Australian cities (8 capitals + 42 regional). Kept in sync with
// src/data/countryCatalogue.ts → AU_CITIES — when adding cities there,
// also add them here.
const CITY_SLUGS = [
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "hobart", "canberra", "darwin",
  "gold-coast", "sunshine-coast", "newcastle", "wollongong", "central-coast", "byron-bay",
  "coffs-harbour", "wagga-wagga", "albury", "tamworth", "geelong", "ballarat", "bendigo",
  "mornington-peninsula", "shepparton", "warrnambool", "townsville", "cairns", "toowoomba",
  "mackay", "rockhampton", "bundaberg", "mandurah", "bunbury", "geraldton", "kalgoorlie",
  "mount-gambier", "whyalla", "victor-harbor", "launceston", "devonport", "burnie",
  "alice-springs", "katherine", "queanbeyan", "ballina", "port-macquarie", "lismore",
  "dubbo", "orange", "bathurst", "armidale",
];

const TOPICS = ["mortgage-calculator", "lmi-calculator", "stamp-duty-calculator"];

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = CITY_SLUGS.flatMap((city) =>
    TOPICS.map(
      (topic) => `  <url>
    <loc>${SITE}/guides/${topic}-${city}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
