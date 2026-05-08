// Public read endpoint that returns all live rate data, nested by category and state.
// Cached at the edge for 1 hour. Calculators call this (or query the table directly via the hook).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role to bypass RLS for public read
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const state = url.searchParams.get("state");

  try {
    let query = supabase
      .from("rate_data")
      .select("category, state, key, value, last_verified_at, last_changed_at")
      .eq("is_active", true);

    if (category) query = query.eq("category", category);
    if (state) query = query.or(`state.eq.${state},state.is.null`);

    const { data, error } = await query;
    if (error) throw error;

    const rates: Record<string, Record<string, Record<string, unknown>>> = {};
    for (const row of data || []) {
      const stateKey = row.state || "national";
      rates[row.category] ??= {};
      rates[row.category][stateKey] ??= {};
      rates[row.category][stateKey][row.key] = {
        ...(row.value as Record<string, unknown>),
        _meta: {
          last_verified: row.last_verified_at,
          last_changed: row.last_changed_at,
        },
      };
    }

    return new Response(JSON.stringify({ success: true, rates }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
