// Syncs the RBA cash rate from the official RBA F1 statistics CSV.
// Triggered daily by pg_cron (or manually from the admin Live Data panel).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-triggered-by",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const jobId = crypto.randomUUID();
  const startedAt = Date.now();

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "rba_rate",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const rbaResponse = await fetch(
      "https://www.rba.gov.au/statistics/tables/csv/f1-data.csv",
      { headers: { "User-Agent": "Calcy/1.0 (calcy.com.au)" } },
    );
    if (!rbaResponse.ok) throw new Error(`RBA fetch failed: ${rbaResponse.status}`);

    const csvText = await rbaResponse.text();
    const lines = csvText.split("\n");

    let cashRate: number | null = null;
    let effectiveDate: string | null = null;

    // Walk from the bottom to find the most recent date,value row.
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(",");
      if (parts.length < 2) continue;
      const dateStr = parts[0].trim();
      const rateStr = parts[1].trim();
      if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateStr) && rateStr !== "") {
        const parsed = parseFloat(rateStr);
        if (!isNaN(parsed)) {
          cashRate = parsed;
          effectiveDate = dateStr;
          break;
        }
      }
    }
    if (cashRate === null) throw new Error("Could not parse cash rate from RBA CSV");

    const { data: currentData } = await supabase
      .from("rate_data")
      .select("value, id")
      .eq("category", "rba_cash_rate")
      .eq("key", "cash_rate")
      .maybeSingle();

    const currentValue = (currentData?.value ?? {}) as Record<string, unknown>;
    const currentRate = currentValue.rate as number | undefined;
    const rateChanged = currentRate !== cashRate;

    if (rateChanged) {
      const newValue = {
        rate: cashRate,
        effective_date: effectiveDate,
        previous_rate: currentRate ?? null,
        next_meeting: currentValue.next_meeting ?? null,
      };
      await supabase
        .from("rate_data")
        .update({
          value: newValue,
          previous_value: currentValue,
          last_verified_at: new Date().toISOString(),
          last_changed_at: new Date().toISOString(),
        })
        .eq("category", "rba_cash_rate")
        .eq("key", "cash_rate");

      await supabase.from("rate_audit_log").insert({
        rate_data_id: currentData?.id,
        category: "rba_cash_rate",
        key: "cash_rate",
        old_value: currentValue,
        new_value: newValue,
        changed_by: "auto_sync",
        change_source: "https://www.rba.gov.au/statistics/tables/csv/f1-data.csv",
        change_note: `Rate changed from ${currentRate}% to ${cashRate}%`,
      });
    } else {
      await supabase
        .from("rate_data")
        .update({ last_verified_at: new Date().toISOString() })
        .eq("category", "rba_cash_rate")
        .eq("key", "cash_rate");
    }

    await supabase
      .from("sync_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
        records_checked: 1,
        records_updated: rateChanged ? 1 : 0,
        summary: {
          rba_rate: { current: cashRate, changed: rateChanged, previous: currentRate ?? null },
        },
      })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({ success: true, rate: cashRate, changed: rateChanged, previous: currentRate ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("sync_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
        error_log: { message },
      })
      .eq("id", jobId);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
