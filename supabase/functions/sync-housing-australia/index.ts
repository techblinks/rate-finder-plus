// Verifies Housing Australia First Home Guarantee scheme details from the public page.
// Conservative HTML scraping — falls back to "verified, no change" if patterns don't match.
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
    job_type: "housing_australia",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const response = await fetch(
      "https://www.housingaustralia.gov.au/support-buy-home/first-home-guarantee",
      { headers: { "User-Agent": "Calcy/1.0 (calcy.com.au)" } },
    );
    if (!response.ok) throw new Error(`HA fetch failed: ${response.status}`);
    const html = await response.text();

    const incomeSingleMatch =
      html.match(/individual[^$]*\$([0-9,]+)/i) ||
      html.match(/single[^$]*income[^$]*\$([0-9,]+)/i);
    const incomeCoupleMatch =
      html.match(/couple[^$]*\$([0-9,]+)/i) ||
      html.match(/joint[^$]*income[^$]*\$([0-9,]+)/i);

    const { data: currentData } = await supabase
      .from("rate_data")
      .select("*")
      .eq("category", "hia_scheme")
      .eq("key", "first_home_guarantee")
      .maybeSingle();

    const currentValue = (currentData?.value ?? {}) as Record<string, unknown>;
    const singleIncome = incomeSingleMatch
      ? parseInt(incomeSingleMatch[1].replace(/,/g, ""))
      : (currentValue.individual_income_cap as number | undefined);
    const coupleIncome = incomeCoupleMatch
      ? parseInt(incomeCoupleMatch[1].replace(/,/g, ""))
      : (currentValue.couple_income_cap as number | undefined);

    let updates = 0;
    const changes: Record<string, unknown> = {};

    const changed =
      (singleIncome !== undefined && singleIncome !== currentValue.individual_income_cap) ||
      (coupleIncome !== undefined && coupleIncome !== currentValue.couple_income_cap);

    if (changed) {
      const newValue = {
        ...currentValue,
        individual_income_cap: singleIncome,
        couple_income_cap: coupleIncome,
      };
      await supabase
        .from("rate_data")
        .update({
          value: newValue,
          previous_value: currentValue,
          last_verified_at: new Date().toISOString(),
          last_changed_at: new Date().toISOString(),
        })
        .eq("category", "hia_scheme")
        .eq("key", "first_home_guarantee");

      await supabase.from("rate_audit_log").insert({
        rate_data_id: currentData?.id,
        category: "hia_scheme",
        key: "first_home_guarantee",
        old_value: currentValue,
        new_value: newValue,
        changed_by: "auto_sync",
        change_source:
          "https://www.housingaustralia.gov.au/support-buy-home/first-home-guarantee",
        change_note: "Income caps updated from scrape",
      });

      changes.income_caps = {
        old: {
          single: currentValue.individual_income_cap,
          couple: currentValue.couple_income_cap,
        },
        new: { single: singleIncome, couple: coupleIncome },
      };
      updates = 1;
    } else {
      await supabase
        .from("rate_data")
        .update({ last_verified_at: new Date().toISOString() })
        .eq("category", "hia_scheme")
        .eq("key", "first_home_guarantee");
    }

    await supabase
      .from("sync_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
        records_checked: 1,
        records_updated: updates,
        summary: changes,
      })
      .eq("id", jobId);

    return new Response(JSON.stringify({ success: true, updates, changes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
