import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-triggered-by",
};

const GSC_CLIENT_ID = Deno.env.get("GSC_CLIENT_ID")!;
const GSC_CLIENT_SECRET = Deno.env.get("GSC_CLIENT_SECRET")!;
const GSC_SITE_URL = "sc-domain:calcy.com.au";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DAY = 86_400_000;
const fmt = (d: Date) => d.toISOString().split("T")[0];
const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p;

async function getAccessToken(): Promise<string> {
  const { data: tokenData } = await admin
    .from("gsc_oauth_tokens")
    .select("*")
    .eq("is_active", true)
    .eq("site_url", GSC_SITE_URL)
    .maybeSingle();
  if (!tokenData) throw new Error("No GSC token found. Connect Google Search Console in admin.");

  const expiresAt = new Date(tokenData.expires_at);
  if (expiresAt > new Date(Date.now() + 60_000)) return tokenData.access_token;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GSC_CLIENT_ID,
      client_secret: GSC_CLIENT_SECRET,
      refresh_token: tokenData.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const refreshed = await r.json();
  if (refreshed.error) throw new Error(`Token refresh failed: ${refreshed.error}`);

  await admin.from("gsc_oauth_tokens").update({
    access_token: refreshed.access_token,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
  }).eq("site_url", GSC_SITE_URL);

  return refreshed.access_token;
}

type GscWindow = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  rows: number;
};

function pathOf(url: string): string {
  try { return new URL(url).pathname; } catch { return url.startsWith("/") ? url : `/${url}`; }
}

async function queryWindow(
  token: string,
  pagePath: string,
  keyword: string | null,
  start: Date,
  end: Date,
): Promise<GscWindow> {
  if (end <= start) return { clicks: 0, impressions: 0, ctr: 0, position: null, rows: 0 };

  const filters: any[] = [
    { dimension: "page", operator: "contains", expression: pagePath },
  ];
  if (keyword) filters.push({ dimension: "query", operator: "equals", expression: keyword.toLowerCase() });

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ["page"],
        dimensionFilterGroups: [{ filters }],
        rowLimit: 25,
      }),
    },
  );
  const j = await res.json();
  if (j.error) throw new Error(`GSC: ${JSON.stringify(j.error)}`);
  const rows = (j.rows || []) as Array<{ clicks: number; impressions: number; ctr: number; position: number }>;
  if (rows.length === 0) return { clicks: 0, impressions: 0, ctr: 0, position: null, rows: 0 };

  let clicks = 0, impressions = 0, posWeighted = 0;
  for (const r of rows) { clicks += r.clicks; impressions += r.impressions; posWeighted += r.position * r.impressions; }
  const position = impressions > 0 ? posWeighted / impressions : null;
  const ctr = impressions > 0 ? clicks / impressions : 0;
  return { clicks, impressions, ctr: round(ctr, 4), position: position ? round(position, 1) : null, rows: rows.length };
}

function classify(
  baseline: GscWindow,
  after7: GscWindow | null,
  after30: GscWindow | null,
  daysSince: number,
): { status: string; confidence: string } {
  const window = after30?.impressions ? after30 : after7;
  if (!window) return { status: "awaiting_data", confidence: "low" };
  if (daysSince < 7) return { status: "awaiting_data", confidence: "low" };
  if (baseline.impressions < 30 && window.impressions < 30) {
    return { status: "insufficient_data", confidence: "low" };
  }
  const clicksDelta = window.clicks - baseline.clicks;
  const posDelta = (window.position ?? 99) - (baseline.position ?? 99); // negative = better
  const ctrDeltaPct = baseline.ctr > 0 ? (window.ctr - baseline.ctr) / baseline.ctr : (window.ctr > 0 ? 1 : 0);

  const improving = (clicksDelta >= 3 && clicksDelta / Math.max(baseline.clicks, 1) >= 0.1)
    || posDelta <= -1.0
    || ctrDeltaPct >= 0.15;
  const declining = (clicksDelta <= -3 && clicksDelta / Math.max(baseline.clicks, 1) <= -0.1)
    || posDelta >= 1.5
    || ctrDeltaPct <= -0.20;

  if (improving && !declining) return { status: "improving", confidence: daysSince >= 30 ? "high" : "medium" };
  if (declining && !improving) return { status: "declining", confidence: daysSince >= 30 ? "high" : "medium" };
  return { status: "neutral", confidence: daysSince >= 30 ? "medium" : "low" };
}

async function trackOne(token: string, draft: any) {
  if (!draft.applied_at || !draft.target_url) {
    return { draft_id: draft.id, skipped: "not_applied_or_no_url" };
  }
  const appliedAt = new Date(draft.applied_at);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - appliedAt.getTime()) / DAY);
  const pagePath = pathOf(draft.target_url);
  const keyword = (draft.target_keyword || "").trim() || null;

  // Baseline: 28d ending day before apply
  const baselineEnd = new Date(appliedAt.getTime() - DAY);
  const baselineStart = new Date(baselineEnd.getTime() - 27 * DAY);
  const baseline = await queryWindow(token, pagePath, keyword, baselineStart, baselineEnd);

  let after7: GscWindow | null = null;
  let after30: GscWindow | null = null;
  let after7Start: Date | null = null, after7End: Date | null = null;
  let after30Start: Date | null = null, after30End: Date | null = null;

  if (daysSince >= 7) {
    after7Start = appliedAt;
    after7End = new Date(appliedAt.getTime() + 7 * DAY);
    after7 = await queryWindow(token, pagePath, keyword, after7Start, after7End);
  }
  if (daysSince >= 30) {
    after30Start = appliedAt;
    after30End = new Date(appliedAt.getTime() + 30 * DAY);
    after30 = await queryWindow(token, pagePath, keyword, after30Start, after30End);
  }

  const { status, confidence } = classify(baseline, after7, after30, daysSince);

  // Estimated impact (monthly projection from best available window)
  const evalWin = after30 ?? after7;
  let estTraffic: number | null = null;
  let rpm: number | null = null;
  let estRevenue: number | null = null;
  if (evalWin) {
    const winDays = after30 ? 30 : 7;
    const baseDaily = baseline.clicks / 28;
    const afterDaily = evalWin.clicks / winDays;
    estTraffic = Math.round((afterDaily - baseDaily) * 30);

    // Pull keyword CPC estimate if available
    if (keyword) {
      const { data: kw } = await admin
        .from("seo_keywords")
        .select("adsense_cpc_estimate")
        .eq("keyword", keyword.toLowerCase())
        .maybeSingle();
      if (kw?.adsense_cpc_estimate) rpm = Number(kw.adsense_cpc_estimate) * 1000 * 0.02; // ~2% CTR on ads, rough
    }
    if (rpm == null) rpm = 8; // conservative finance RPM fallback
    estRevenue = round((estTraffic / 1000) * rpm, 2);
  }

  const row: any = {
    draft_id: draft.id,
    task_id: draft.task_id,
    target_url: draft.target_url,
    target_keyword: keyword,
    draft_type: draft.draft_type,
    applied_at: appliedAt.toISOString(),

    baseline_start: fmt(baselineStart),
    baseline_end: fmt(baselineEnd),
    baseline_clicks: baseline.clicks,
    baseline_impressions: baseline.impressions,
    baseline_ctr: baseline.ctr,
    baseline_position: baseline.position,

    after_7d_start: after7Start ? fmt(after7Start) : null,
    after_7d_end: after7End ? fmt(after7End) : null,
    after_7d_clicks: after7?.clicks ?? null,
    after_7d_impressions: after7?.impressions ?? null,
    after_7d_ctr: after7?.ctr ?? null,
    after_7d_position: after7?.position ?? null,

    after_30d_start: after30Start ? fmt(after30Start) : null,
    after_30d_end: after30End ? fmt(after30End) : null,
    after_30d_clicks: after30?.clicks ?? null,
    after_30d_impressions: after30?.impressions ?? null,
    after_30d_ctr: after30?.ctr ?? null,
    after_30d_position: after30?.position ?? null,

    clicks_delta_7d: after7 ? after7.clicks - baseline.clicks : null,
    impressions_delta_7d: after7 ? after7.impressions - baseline.impressions : null,
    ctr_delta_7d: after7 ? round(after7.ctr - baseline.ctr, 4) : null,
    position_delta_7d: after7 && after7.position != null && baseline.position != null
      ? round(after7.position - baseline.position, 1) : null,

    clicks_delta_30d: after30 ? after30.clicks - baseline.clicks : null,
    impressions_delta_30d: after30 ? after30.impressions - baseline.impressions : null,
    ctr_delta_30d: after30 ? round(after30.ctr - baseline.ctr, 4) : null,
    position_delta_30d: after30 && after30.position != null && baseline.position != null
      ? round(after30.position - baseline.position, 1) : null,

    estimated_traffic_impact: estTraffic,
    estimated_revenue_impact: estRevenue,
    rpm_estimate: rpm,

    impact_status: status,
    confidence,
    notes: null,
    signals: {
      page_path: pagePath,
      keyword_filter: keyword,
      days_since_apply: daysSince,
      baseline_rows: baseline.rows,
      after_7d_rows: after7?.rows ?? null,
      after_30d_rows: after30?.rows ?? null,
    },
    last_computed_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("seo_draft_impact")
    .upsert(row, { onConflict: "draft_id" });
  if (error) throw error;

  return { draft_id: draft.id, status, days_since: daysSince };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const jobId = crypto.randomUUID();
  const startedAt = new Date();
  await admin.from("sync_jobs").insert({
    id: jobId, job_type: "seo_draft_impact",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running", started_at: startedAt.toISOString(),
  });

  try {
    const body = await req.json().catch(() => ({}));
    const onlyDraftId: string | undefined = body?.draftId;

    let q = admin
      .from("weekly_seo_task_drafts")
      .select("*")
      .eq("approval_status", "applied")
      .not("applied_at", "is", null);
    if (onlyDraftId) q = q.eq("id", onlyDraftId);
    const { data: drafts, error: draftsErr } = await q;
    if (draftsErr) throw draftsErr;

    if (!drafts || drafts.length === 0) {
      await admin.from("sync_jobs").update({
        status: "completed", completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt.getTime(),
        records_checked: 0, records_updated: 0,
        summary: { message: "No applied drafts to track." },
      }).eq("id", jobId);
      return new Response(JSON.stringify({ success: true, processed: 0, message: "No applied drafts." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = await getAccessToken();
    const results: any[] = [];
    const errors: any[] = [];
    for (const d of drafts) {
      try {
        const r = await trackOne(token, d);
        results.push(r);
      } catch (e) {
        errors.push({ draft_id: d.id, error: e instanceof Error ? e.message : String(e) });
      }
    }

    const winners = results.filter((r) => r.status === "improving").length;
    const losers = results.filter((r) => r.status === "declining").length;

    await admin.from("sync_jobs").update({
      status: errors.length === results.length && results.length > 0 ? "failed" : "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: drafts.length,
      records_updated: results.length,
      records_failed: errors.length,
      error_log: errors.length ? errors : null,
      summary: { winners, losers, total: results.length },
    }).eq("id", jobId);

    return new Response(JSON.stringify({
      success: true, processed: results.length, winners, losers, errors,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin.from("sync_jobs").update({
      status: "failed", completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      error_log: [{ error: msg }],
    }).eq("id", jobId);
    return new Response(JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
