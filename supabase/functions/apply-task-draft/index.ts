import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORTED_PHASE1 = new Set(["title_meta", "faq"]);

function clip(v: unknown, max: number): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ success: false, error: "Admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const adminLabel = userData.user.email || userData.user.id;

    const body = await req.json().catch(() => ({}));
    const draftId = body?.draftId;
    if (!draftId) {
      return new Response(JSON.stringify({ success: false, error: "draftId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: draft, error: draftErr } = await admin
      .from("weekly_seo_task_drafts").select("*").eq("id", draftId).maybeSingle();
    if (draftErr || !draft) {
      return new Response(JSON.stringify({ success: false, error: "Draft not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (draft.approval_status !== "approved") {
      return new Response(JSON.stringify({ success: false, error: `Only approved drafts can be applied (current: ${draft.approval_status}).` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!SUPPORTED_PHASE1.has(draft.draft_type)) {
      return new Response(JSON.stringify({ success: false, error: `Apply not supported for "${draft.draft_type}" in Phase 1. Manual review only.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!draft.target_url) {
      return new Response(JSON.stringify({ success: false, error: "Draft has no target_url; cannot apply." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Snapshot existing override (or null) for rollback
    const { data: existingOverride } = await admin
      .from("seo_page_overrides").select("*").eq("url", draft.target_url).maybeSingle();

    const rollbackSnapshot = {
      taken_at: new Date().toISOString(),
      previous_override: existingOverride ?? null,
      previous_draft_approval_status: draft.approval_status,
    };

    // Build next override row
    const baseRow = existingOverride
      ? {
          meta_title: existingOverride.meta_title ?? null,
          meta_description: existingOverride.meta_description ?? null,
          faq_additions: Array.isArray(existingOverride.faq_additions) ? existingOverride.faq_additions : [],
        }
      : { meta_title: null as string | null, meta_description: null as string | null, faq_additions: [] as any[] };

    let appliedSummary: Record<string, unknown> = {};

    if (draft.draft_type === "title_meta") {
      const payload = (draft.payload && typeof draft.payload === "object") ? draft.payload : {};
      const title = clip(payload.title ?? draft.after_text, 60);
      const desc = clip(payload.meta_description ?? null, 160);
      if (!title && !desc) {
        return new Response(JSON.stringify({ success: false, error: "title_meta draft has no title or description to apply." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (title) baseRow.meta_title = title;
      if (desc) baseRow.meta_description = desc;
      appliedSummary = { applied_title: title, applied_meta_description: desc };
    } else if (draft.draft_type === "faq") {
      const payload = (draft.payload && typeof draft.payload === "object") ? draft.payload : {};
      const rawQs = Array.isArray(payload.questions) ? payload.questions : [];
      const additions = rawQs
        .map((q: any) => ({ q: clip(q?.q, 200), a: clip(q?.a, 1200) }))
        .filter((x: any) => x.q && x.a)
        .slice(0, 8);
      if (additions.length === 0) {
        return new Response(JSON.stringify({ success: false, error: "faq draft has no valid questions to apply." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const merged = [...baseRow.faq_additions];
      const seen = new Set(merged.map((x: any) => String(x?.q || "").toLowerCase()));
      for (const item of additions) {
        const key = String(item.q).toLowerCase();
        if (!seen.has(key)) { merged.push(item); seen.add(key); }
      }
      baseRow.faq_additions = merged;
      appliedSummary = { added_faqs: additions.length, total_faqs_after: merged.length };
    }

    // Upsert the override (admin-only table; never modifies routes/sitemap/schema)
    const upsertRow: any = {
      url: draft.target_url,
      meta_title: baseRow.meta_title,
      meta_description: baseRow.meta_description,
      faq_additions: baseRow.faq_additions,
      applied_draft_id: draft.id,
      source_task_id: draft.task_id,
      updated_by: adminLabel,
    };
    const { error: upErr } = await admin
      .from("seo_page_overrides").upsert(upsertRow, { onConflict: "url" });
    if (upErr) throw upErr;

    // Mark draft as applied with snapshot for rollback
    const { error: draftUpErr } = await admin
      .from("weekly_seo_task_drafts")
      .update({
        approval_status: "applied",
        applied_at: new Date().toISOString(),
        applied_by: adminLabel,
        rollback_snapshot: rollbackSnapshot,
      })
      .eq("id", draft.id);
    if (draftUpErr) throw draftUpErr;

    // Audit trail
    await admin.from("sync_jobs").insert({
      job_type: "weekly_seo_task_draft_apply",
      status: "completed",
      triggered_by: adminLabel,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_updated: 1,
      summary: {
        draft_id: draft.id,
        task_id: draft.task_id,
        draft_type: draft.draft_type,
        target_url: draft.target_url,
        applied: appliedSummary,
        had_previous_override: !!existingOverride,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id,
      target_url: draft.target_url,
      draft_type: draft.draft_type,
      applied: appliedSummary,
      rollback_available: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("apply-task-draft error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
