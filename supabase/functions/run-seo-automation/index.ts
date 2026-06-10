import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-triggered-by",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

type Frequency = "daily" | "weekly" | "manual";
type Schedule = {
  id: string;
  job_key: string;
  job_name: string;
  function_name: string | null;
  enabled: boolean;
  frequency: Frequency;
  next_run_at: string | null;
  config: Record<string, unknown> | null;
};

const allowedFunctions = new Set([
  "sync-gsc-data",
  "score-seo-opportunities",
  "optimize-ctr",
  "analyze-content-gaps",
  "score-internal-links",
  "score-money-pages",
  "auto-refresh-content",
  "track-competitors",
  "generate-daily-seo-briefing",
  "generate-weekly-seo-plan",
]);

function nextRunAt(frequency: Frequency, from = new Date()) {
  if (frequency === "manual") return null;
  const next = new Date(from);
  if (frequency === "daily") next.setUTCDate(next.getUTCDate() + 1);
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  return next.toISOString();
}

function numberFromPath(value: unknown, keys: string[]) {
  let current: any = value;
  for (const key of keys) current = current?.[key];
  return typeof current === "number" && Number.isFinite(current) ? current : 0;
}

function extractRunCounts(result: unknown) {
  const rowsProcessed =
    numberFromPath(result, ["summary", "records_checked"]) ||
    numberFromPath(result, ["summary", "records_processed"]) ||
    numberFromPath(result, ["summary", "queue_items"]) ||
    numberFromPath(result, ["briefing", "data_sources", "decision_intelligence_reasoning"]) ||
    numberFromPath(result, ["plan", "data_sources", "source_items"]);

  const rowsCreated =
    numberFromPath(result, ["summary", "records_updated"]) ||
    numberFromPath(result, ["summary", "records_created"]) ||
    numberFromPath(result, ["summary", "urgent_actions"]) ||
    numberFromPath(result, ["briefing", "suggested_implementation_queue", "length"]) ||
    numberFromPath(result, ["plan", "top_tasks", "length"]);

  return { rowsProcessed, rowsCreated };
}

async function invokeSeoFunction(functionName: string, schedule: Schedule, triggerType: string) {
  if (!allowedFunctions.has(functionName)) {
    throw new Error(`Unsupported SEO automation function: ${functionName}`);
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
      "x-triggered-by": `seo_automation:${triggerType}`,
    },
    body: JSON.stringify({
      triggered_by: "seo_automation",
      schedule_id: schedule.id,
      job_key: schedule.job_key,
      safe_mode: true,
      auto_publish: false,
      auto_apply: false,
    }),
  });

  const text = await response.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw_response: text };
  }

  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data ? String((data as any).error) : text;
    throw new Error(message || `${functionName} failed with HTTP ${response.status}`);
  }

  return data;
}

async function runSchedule(schedule: Schedule, triggerType: "manual" | "scheduled" | "system") {
  const startedAt = Date.now();
  const runId = crypto.randomUUID();

  await supabase.from("seo_automation_runs").insert({
    id: runId,
    schedule_id: schedule.id,
    job_key: schedule.job_key,
    job_name: schedule.job_name,
    function_name: schedule.function_name,
    trigger_type: triggerType,
    status: "running",
  });

  if (!schedule.function_name) {
    await supabase.from("seo_automation_runs").update({
      status: "skipped",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      result: { reason: "No function mapped for this schedule." },
    }).eq("id", runId);
    return { schedule, status: "skipped", rowsProcessed: 0, rowsCreated: 0 };
  }

  await supabase.from("seo_automation_schedules").update({
    status: "running",
    last_error: null,
  }).eq("id", schedule.id);

  try {
    const result = await invokeSeoFunction(schedule.function_name, schedule, triggerType);
    const { rowsProcessed, rowsCreated } = extractRunCounts(result);
    const completedAt = new Date().toISOString();

    await supabase.from("seo_automation_runs").update({
      status: "success",
      completed_at: completedAt,
      duration_ms: Date.now() - startedAt,
      rows_processed: rowsProcessed,
      rows_created: rowsCreated,
      result,
    }).eq("id", runId);

    await supabase.from("seo_automation_schedules").update({
      status: schedule.enabled ? "success" : "idle",
      last_run_at: completedAt,
      next_run_at: schedule.enabled ? nextRunAt(schedule.frequency, new Date(completedAt)) : null,
      last_error: null,
      rows_processed: rowsProcessed,
      rows_created: rowsCreated,
    }).eq("id", schedule.id);

    return { schedule, status: "success", rowsProcessed, rowsCreated };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("seo_automation_runs").update({
      status: "error",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      error_message: message,
      result: { error: message },
    }).eq("id", runId);

    await supabase.from("seo_automation_schedules").update({
      status: "error",
      last_run_at: new Date().toISOString(),
      next_run_at: schedule.enabled ? nextRunAt(schedule.frequency) : null,
      last_error: message,
    }).eq("id", schedule.id);

    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const triggerType = body?.run_due ? "scheduled" : "manual";
    let query = supabase.from("seo_automation_schedules").select("*");

    if (body?.schedule_id) query = query.eq("id", body.schedule_id);
    else if (body?.job_key) query = query.eq("job_key", body.job_key);
    else if (body?.run_due) query = query.eq("enabled", true).lte("next_run_at", new Date().toISOString());
    else throw new Error("Provide schedule_id, job_key, or run_due.");

    const { data, error } = await query.order("next_run_at", { ascending: true, nullsFirst: false }).limit(body?.run_due ? 10 : 1);
    if (error) throw error;

    const schedules = (data as Schedule[] | null) || [];
    if (schedules.length === 0) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "No matching SEO automation schedules." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];
    for (const schedule of schedules) {
      if (triggerType === "scheduled" && (!schedule.enabled || schedule.frequency === "manual")) continue;
      results.push(await runSchedule(schedule, triggerType));
    }

    return new Response(JSON.stringify({ success: true, trigger_type: triggerType, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
