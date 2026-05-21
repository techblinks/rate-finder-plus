import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildReasoning } from "../_shared/decisionIntelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type TaskRow = {
  id: string;
  week_start: string;
  task_type: string;
  task_title: string;
  affected_url: string;
  expected_impact: string | null;
  expected_traffic_impact: string | null;
  expected_revenue_impact: string | null;
  risk_level: string;
  priority_level: string | null;
  suggested_implementation_prompt: string;
  source_refs: any;
};

const SYSTEM_PROMPT = `You are an Australian finance SEO content strategist for calcy.com.au.
You produce small, surgical, admin-review-only DRAFT improvements. Drafts are NEVER auto-published.
You output STRICT JSON only. No markdown, no prose, no code fences.
All copy must use Australian English, reference Australian context (AU lenders, RBA, states), and be safe to ship behind admin approval.`;

function pickDraftTypes(task: TaskRow): string[] {
  const t = (task.task_type || "").toLowerCase();
  const types = new Set<string>();
  if (t.includes("ctr") || t.includes("title") || t.includes("meta")) types.add("title_meta");
  if (t.includes("aeo") || t.includes("answer") || t.includes("snippet")) {
    types.add("aeo_answer");
    types.add("faq");
  }
  if (t.includes("content_gap") || t.includes("optim") || t.includes("refresh") || t.includes("freshness")) {
    types.add("content_refresh");
    types.add("faq");
  }
  if (t.includes("internal_link") || t.includes("link")) types.add("internal_link");
  if (t.includes("comparison") || t.includes("money") || t.includes("competitor")) types.add("comparison_table");
  if (types.size === 0) {
    types.add("title_meta");
    types.add("faq");
    types.add("internal_link");
  }
  return Array.from(types);
}

async function aiJSON(userPrompt: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`AI gateway ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ success: false, error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const taskId = body?.taskId;
    if (!taskId) {
      return new Response(JSON.stringify({ success: false, error: "taskId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: task, error: taskErr } = await admin
      .from("weekly_seo_tasks")
      .select("*")
      .eq("id", taskId)
      .maybeSingle();
    if (taskErr || !task) {
      return new Response(JSON.stringify({ success: false, error: "Task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t = task as TaskRow;
    const draftTypes = pickDraftTypes(t);

    // Optional context: fetch nearby signals for the affected URL + winning patterns
    const [{ data: ctr }, { data: opt }, { data: aeo }, { data: link }, { data: patternsData }] = await Promise.all([
      admin.from("ctr_optimizations").select("primary_keyword,position,impressions_28d,ctr_28d,suggested_title,suggested_meta_description,suggested_faq_snippet,suggested_featured_snippet_answer").eq("page_url", t.affected_url).limit(1),
      admin.from("content_optimizations").select("page_title,primary_topic,faq_additions,direct_answers,semantic_keywords,comparison_tables").eq("page_url", t.affected_url).limit(1),
      admin.from("aeo_optimizations").select("page_title,featured_snippet_paragraphs,direct_answer_blocks,faq_improvements,conversational_search_queries").eq("page_url", t.affected_url).limit(1),
      admin.from("internal_link_opportunities").select("source_page,target_page,suggested_anchor_text,reason").or(`source_page.eq.${t.affected_url},target_page.eq.${t.affected_url}`).limit(5),
      admin.from("seo_winning_patterns").select("*").in("status", ["winning", "risky"]),
    ]);

    // Build pattern hints for the prompt
    const patterns = (patternsData as any[]) || [];
    const patternHints = patterns
      .filter((p) => draftTypes.includes((p.draft_type || "").toLowerCase()) || p.pattern_type === "page_type" || p.pattern_type === "keyword_intent")
      .slice(0, 8)
      .map((p) => `- [${p.status}/${p.confidence_level}] ${p.pattern_type} ${p.draft_type ?? ""} ${p.page_type ?? ""} ${p.keyword_intent ?? ""}: ${p.recommendation ?? ""}`)
      .join("\n");
    const patternHintsBlock = patternHints
      ? `\nLearned winning/risky patterns to bias style, tone and structure (DO NOT mention this section in output):\n${patternHints}\n`
      : `\n(Learning data not sufficient yet — use generic best practices.)\n`;

    const userPrompt = `Generate admin-review-only DRAFTS for this weekly SEO task. Return STRICT JSON with shape:
{
  "drafts": [
    {
      "draft_type": "title_meta" | "faq" | "internal_link" | "aeo_answer" | "content_refresh" | "comparison_table",
      "proposed_change": "1-2 sentence summary of the change",
      "before_text": "current text if known, else empty string",
      "after_text": "proposed replacement text",
      "expected_seo_impact": "short estimate (e.g. 'CTR +0.5-1.2%, 30-80 extra clicks/month')",
      "risk_level": "low" | "medium" | "high",
      "payload": { /* structured details depending on draft_type */ }
    }
  ]
}

Draft types required (only include those listed): ${draftTypes.join(", ")}.

Per-type payload guidance:
- title_meta: payload { title: string (<=60 chars), meta_description: string (<=155 chars), keyword: string }
- faq: payload { questions: [{ q: string, a: string (<=320 chars, AU finance) }] (3-5 items) }
- internal_link: payload { suggestions: [{ source_url, target_url, anchor_text, reason }] }
- aeo_answer: payload { direct_answer: string (<=320 chars), featured_snippet: string (<=320 chars), entities: string[] }
- content_refresh: payload { section_heading: string, refreshed_snippet: string (<=600 chars), data_points: string[] }
- comparison_table: payload { caption: string, columns: string[], rows: string[][] }

Task context:
- Title: ${t.task_title}
- Type: ${t.task_type}
- URL: ${t.affected_url}
- Risk level (current): ${t.risk_level}
- Priority: ${t.priority_level ?? "n/a"}
- Expected impact: ${t.expected_impact ?? ""}
- Implementation prompt: ${t.suggested_implementation_prompt ?? ""}
- Source refs: ${JSON.stringify(t.source_refs ?? {}).slice(0, 1200)}

Live page signals (may be empty):
- CTR optimization: ${JSON.stringify(ctr?.[0] ?? null).slice(0, 1200)}
- Content optimization: ${JSON.stringify(opt?.[0] ?? null).slice(0, 1200)}
- AEO optimization: ${JSON.stringify(aeo?.[0] ?? null).slice(0, 1200)}
- Internal link signals: ${JSON.stringify(link ?? []).slice(0, 800)}
${patternHintsBlock}
Rules:
- Stay strictly within scope of the task.
- Drafts must be safe behind admin approval; never instruct to remove existing content.
- Australian English. Mention AU states/RBA only when relevant.
- Bias style, tone, and structure toward the learned winning patterns above (if any), and avoid the risky ones.
- Do NOT produce more than 6 drafts total.`;

    let aiResult: any;
    try {
      aiResult = await aiJSON(userPrompt);
    } catch (e) {
      console.error("AI generation failed:", e);
      return new Response(JSON.stringify({ success: false, error: `AI generation failed: ${(e as Error).message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const drafts = Array.isArray(aiResult?.drafts) ? aiResult.drafts.slice(0, 6) : [];
    if (drafts.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "AI returned no drafts" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetKeyword =
      (t.source_refs && (t.source_refs.keyword || t.source_refs.primary_keyword)) ||
      ctr?.[0]?.primary_keyword ||
      null;

    const rows = drafts
      .filter((d: any) => d && d.draft_type && d.proposed_change)
      .map((d: any) => ({
        task_id: t.id,
        week_start: t.week_start,
        draft_type: String(d.draft_type),
        target_url: t.affected_url,
        target_keyword: targetKeyword,
        proposed_change: String(d.proposed_change).slice(0, 1000),
        before_text: d.before_text ? String(d.before_text).slice(0, 2000) : null,
        after_text: d.after_text ? String(d.after_text).slice(0, 4000) : null,
        payload: {
          ...(d.payload ?? {}),
          matched_pattern_ids: patterns
            .filter((p: any) => (p.draft_type || "").toLowerCase() === String(d.draft_type).toLowerCase())
            .slice(0, 5)
            .map((p: any) => p.id),
          pattern_reason: patterns.length === 0 ? "Learning data not sufficient yet." : null,
          reasoning: buildReasoning({
            kind: "draft",
            keyword: targetKeyword,
            target_url: t.affected_url,
            draft_type: String(d.draft_type),
            task_type: t.task_type,
            intent: (t.source_refs && t.source_refs.intent) || null,
            confidence: (t.source_refs && t.source_refs.confidence) || null,
            score: Number((t.source_refs && t.source_refs.priority_score) || 60),
            priority: t.priority_level,
            risk_level: ["low", "medium", "high"].includes(d.risk_level) ? d.risk_level : (t.risk_level || "low"),
            pattern_match_score: Number((t.source_refs && t.source_refs.pattern_match_score) || 0),
            pattern_reason: (t.source_refs && t.source_refs.pattern_reason) || null,
            risk_pattern_warning: (t.source_refs && t.source_refs.risk_pattern_warning) || null,
            matched_pattern_ids: (t.source_refs && t.source_refs.matched_pattern_ids) || [],
            learning_data_ready: patterns.length > 0,
            notes: d.expected_seo_impact ? String(d.expected_seo_impact) : null,
          }),
        },
        expected_seo_impact: d.expected_seo_impact ? String(d.expected_seo_impact).slice(0, 500) : null,
        risk_level: ["low", "medium", "high"].includes(d.risk_level) ? d.risk_level : t.risk_level || "low",
        approval_status: "pending",
        generated_by: "ai:google/gemini-2.5-flash",
      }));

    const { data: inserted, error: insErr } = await admin
      .from("weekly_seo_task_drafts")
      .insert(rows)
      .select();
    if (insErr) throw insErr;

    // Audit trail entry
    await admin.from("sync_jobs").insert({
      job_type: "weekly_seo_task_drafts",
      status: "completed",
      triggered_by: userData.user.email || userData.user.id,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_updated: inserted?.length ?? 0,
      summary: { task_id: t.id, draft_types: draftTypes, count: inserted?.length ?? 0 },
    });

    return new Response(JSON.stringify({
      success: true,
      task_id: t.id,
      inserted: inserted?.length ?? 0,
      drafts: inserted,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-task-draft error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
