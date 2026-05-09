// Public sitemap of programmatic pages (auto-generated from DB).
// Submit this URL to Google Search Console as an additional sitemap:
//   https://<project-ref>.supabase.co/functions/v1/sitemap-programmatic
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://calcy.com.au";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("programmatic_pages")
    .select("url_path,updated_at")
    .eq("is_active", true);

  if (error) {
    return new Response(`<!-- ${error.message} -->`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }

  const urls = (data ?? [])
    .map((p) => {
      const lastmod = p.updated_at ? String(p.updated_at).split("T")[0] : "";
      return `  <url>
    <loc>${SITE}${p.url_path}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join("\n");

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
