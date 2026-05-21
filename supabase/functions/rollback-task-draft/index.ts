import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (draft.approval_status !== "applied") {
      return new Response(JSON.stringify({ success: false, error: `Draft is not in 'applied' state (current: ${draft.approval_status}).` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!draft.rollback_snapshot) {
      return new Response(JSON.stringify({ success: false, error: "No rollback snapshot available." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const snap = draft.rollback_snapshot as any;
    const prev = snap?.previous_override ?? null;

    if (prev) {
      // Restore previous override row
      const restore: any = {
        url: draft.target_url,
        meta_title: prev.meta_title ?? null,
        meta_description: prev.meta_description ?? null,
        faq_additions: Array.isArray(prev.faq_additions) ? prev.faq_additions : [],
        applied_draft_id: prev.applied_draft_id ?? null,
        source_task_id: prev.source_task_id ?? null,
        updated_by: adminLabel,
      };
      const { error: upErr } = await admin
        .from("seo_page_overrides").upsert(restore, { onConflict: "url" });
      if (upErr) throw upErr;
    } else {
      // No prior override existed — delete the one we created
      const { error: delErr } = await admin
        .from("seo_page_overrides").delete().eq("url", draft.target_url);
      if (delErr) throw delErr;
    }

    // Revert draft back to approved so admin can re-apply or edit
    const { error: draftUpErr } = await admin
      .from("weekly_seo_task_drafts")
      .update({
        approval_status: "approved",
        applied_at: null,
        applied_by: null,
        rollback_snapshot: null,
      })
      .eq("id", draft.id);
    if (draftUpErr) throw draftUpErr;

    // Audit trail
    await admin.from("sync_jobs").insert({
      job_type: "weekly_seo_task_draft_rollback",
      status: "completed",
      triggered_by: adminLabel,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      records_updated: 1,
      summary: {
        draft_id: draft.id,
        task_id: draft.task_id,
        target_url: draft.target_url,
        restored_previous_override: !!prev,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      draft_id: draft.id,
      target_url: draft.target_url,
      restored_previous_override: !!prev,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("rollback-task-draft error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
