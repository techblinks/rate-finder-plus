import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-triggered-by",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const round = (n: number, p = 3) => Math.round(n * 10 ** p) / 10 ** p;

function inferPageType(url: string | null): string {
  if (!url) return "unknown";
  const u = url.toLowerCase();
  if (u.includes("/calculator") || u.match(/\/(mortgage|loan|borrowing|refinance|stamp-duty|lmi|extra-repayments|rent-vs-buy|hecs)/)) return "calculator";
  if (u.includes("/guide") || u.includes("/guides")) return "guide";
  if (u.includes("/news")) return "news";
  if (u.includes("/suburb") || u.includes("/city")) return "location";
  if (u.includes("/state") || u.match(/\/(nsw|vic|qld|wa|sa|tas|act|nt)/)) return "state";
  if (u === "/" || u.endsWith("/index")) return "home";
  return "other";
}

type Impact = any;

function classifyImpact(i: Impact): "win" | "loss" | "neutral" | "skip" {
  if (i.impact_status === "improving") return "win";
  if (i.impact_status === "declining") return "loss";
  if (i.impact_status === "neutral") return "neutral";
  return "skip"; // awaiting_data / insufficient_data
}

type Bucket = {
  pattern_type: string;
  pattern_key: string;
  draft_type: string | null;
  page_type: string | null;
  keyword_intent: string | null;
  wins: Impact[];
  losses: Impact[];
  neutrals: Impact[];
};

function avgDelta(items: Impact[], field: string): number | null {
  const vals = items
    .map((i) => i[`${field}_30d`] ?? i[`${field}_7d`])
    .filter((v) => v != null && Number.isFinite(Number(v)));
  if (!vals.length) return null;
  return round(vals.reduce((a, b) => a + Number(b), 0) / vals.length, 3);
}

function confidenceFor(total: number, winRate: number): string {
  if (total >= 8 && (winRate >= 0.75 || winRate <= 0.25)) return "high";
  if (total >= 4 && (winRate >= 0.6 || winRate <= 0.4)) return "medium";
  return "low";
}

function recommendationFor(bucket: Bucket, winRate: number, ctrDelta: number | null): string {
  const total = bucket.wins.length + bucket.losses.length + bucket.neutrals.length;
  const label = [bucket.draft_type, bucket.page_type, bucket.keyword_intent].filter(Boolean).join(" · ") || bucket.pattern_key;
  if (winRate >= 0.6) {
    return `Prioritize ${label} in future Weekly Plans — ${bucket.wins.length}/${total} applied drafts improved performance${ctrDelta != null ? `, avg CTR Δ ${(ctrDelta * 100).toFixed(2)}pp` : ""}.`;
  }
  if (winRate <= 0.25 && bucket.losses.length >= 2) {
    return `Avoid or manually review ${label} — ${bucket.losses.length}/${total} applied drafts declined. Tighten quality filters before generating.`;
  }
  return `Neutral signal for ${label} — keep generating but require stronger evidence before scaling.`;
}

async function fetchKeywordIntents(keywords: string[]): Promise<Record<string, string | null>> {
  if (!keywords.length) return {};
  const { data } = await admin
    .from("seo_keywords")
    .select("keyword, intent")
    .in("keyword", keywords);
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) map[(row as any).keyword?.toLowerCase()] = (row as any).intent ?? null;
  return map;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const jobId = crypto.randomUUID();
  const startedAt = new Date();
  await admin.from("sync_jobs").insert({
    id: jobId,
    job_type: "seo_winning_patterns",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
    started_at: startedAt.toISOString(),
  });

  try {
    const { data: impacts, error } = await admin
      .from("seo_draft_impact")
      .select("*")
      .order("last_computed_at", { ascending: false })
      .limit(2000);
    if (error) throw error;

    const usable = (impacts ?? []).filter((i: Impact) =>
      ["improving", "declining", "neutral"].includes(i.impact_status),
    );

    // Enrich with intent + page_type
    const kws = Array.from(new Set(usable.map((i: Impact) => (i.target_keyword || "").toLowerCase()).filter(Boolean)));
    const intentMap = await fetchKeywordIntents(kws);

    const enriched = usable.map((i: Impact) => ({
      ...i,
      _page_type: inferPageType(i.target_url),
      _keyword_intent: intentMap[(i.target_keyword || "").toLowerCase()] ?? null,
    }));

    // Build buckets across several pattern axes
    const buckets = new Map<string, Bucket>();
    const addTo = (key: string, partial: Omit<Bucket, "wins" | "losses" | "neutrals">, imp: Impact) => {
      let b = buckets.get(key);
      if (!b) {
        b = { ...partial, wins: [], losses: [], neutrals: [] };
        buckets.set(key, b);
      }
      const cls = classifyImpact(imp);
      if (cls === "win") b.wins.push(imp);
      else if (cls === "loss") b.losses.push(imp);
      else if (cls === "neutral") b.neutrals.push(imp);
    };

    for (const i of enriched) {
      const dt = i.draft_type || "unknown";
      const pt = i._page_type;
      const it = i._keyword_intent || "unknown";

      addTo(`draft_type:${dt}`, { pattern_type: "draft_type", pattern_key: `draft_type:${dt}`, draft_type: dt, page_type: null, keyword_intent: null }, i);
      addTo(`page_type:${pt}`, { pattern_type: "page_type", pattern_key: `page_type:${pt}`, draft_type: null, page_type: pt, keyword_intent: null }, i);
      addTo(`keyword_intent:${it}`, { pattern_type: "keyword_intent", pattern_key: `keyword_intent:${it}`, draft_type: null, page_type: null, keyword_intent: it }, i);
      addTo(`combo:${dt}|${pt}`, { pattern_type: "draft_type_x_page_type", pattern_key: `combo:${dt}|${pt}`, draft_type: dt, page_type: pt, keyword_intent: null }, i);
      addTo(`combo:${dt}|${it}`, { pattern_type: "draft_type_x_intent", pattern_key: `combo:${dt}|${it}`, draft_type: dt, page_type: null, keyword_intent: it }, i);
    }

    const upserts: any[] = [];
    for (const [, b] of buckets) {
      const total = b.wins.length + b.losses.length + b.neutrals.length;
      if (total < 2) continue; // need minimum sample
      const winRate = total > 0 ? b.wins.length / total : 0;
      const ctrDelta = avgDelta([...b.wins, ...b.losses, ...b.neutrals], "ctr_delta");
      const clickDelta = avgDelta([...b.wins, ...b.losses, ...b.neutrals], "clicks_delta");
      const posDelta = avgDelta([...b.wins, ...b.losses, ...b.neutrals], "position_delta");
      const confidence = confidenceFor(total, winRate);
      const status = winRate >= 0.6 ? "winning" : winRate <= 0.25 && b.losses.length >= 2 ? "risky" : "neutral";
      const sampleIds = [...b.wins, ...b.losses, ...b.neutrals]
        .slice(0, 10)
        .map((i) => i.draft_id);

      upserts.push({
        pattern_key: b.pattern_key,
        pattern_type: b.pattern_type,
        draft_type: b.draft_type,
        page_type: b.page_type,
        keyword_intent: b.keyword_intent,
        confidence_level: confidence,
        average_ctr_delta: ctrDelta,
        average_click_delta: clickDelta,
        average_position_delta: posDelta,
        success_count: b.wins.length,
        failure_count: b.losses.length,
        neutral_count: b.neutrals.length,
        sample_draft_ids: sampleIds,
        recommendation: recommendationFor(b, winRate, ctrDelta),
        signals: {
          win_rate: round(winRate, 3),
          total_samples: total,
        },
        status,
        updated_at: new Date().toISOString(),
      });
    }

    if (upserts.length) {
      const { error: upErr } = await admin
        .from("seo_winning_patterns")
        .upsert(upserts, { onConflict: "pattern_key" });
      if (upErr) throw upErr;
    }

    const winning = upserts.filter((p) => p.status === "winning").length;
    const risky = upserts.filter((p) => p.status === "risky").length;

    await admin.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: usable.length,
      records_updated: upserts.length,
      summary: { patterns: upserts.length, winning, risky, neutral: upserts.length - winning - risky },
    }).eq("id", jobId);

    return new Response(JSON.stringify({
      success: true, patterns: upserts.length, winning, risky, analyzed: usable.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin.from("sync_jobs").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      error_log: [{ error: msg }],
    }).eq("id", jobId);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
