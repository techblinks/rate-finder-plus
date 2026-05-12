import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const start = Date.now();
  try {
    // Lightweight DB ping — just read one row from rate_data
    const { data, error } = await supabase
      .from("rate_data")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const latencyMs = Date.now() - start;
    const connected = data !== null;

    return new Response(
      JSON.stringify({
        status: connected ? "healthy" : "degraded",
        latencyMs,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const latencyMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);

    return new Response(
      JSON.stringify({
        status: "unhealthy",
        error: message,
        latencyMs,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
