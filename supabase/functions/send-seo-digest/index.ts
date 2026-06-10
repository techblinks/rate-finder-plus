import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-triggered-by",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const fromEmail = Deno.env.get("SEO_DIGEST_FROM_EMAIL") || "Calcy SEO <notifications@calcy.com.au>";
const supabase = createClient(supabaseUrl, serviceRoleKey);

type DigestType = "daily" | "weekly";
type DigestPreference = {
  id: string;
  daily_enabled: boolean;
  weekly_enabled: boolean;
  email_enabled: boolean;
  admin_notifications_enabled: boolean;
  recipient_email: string | null;
};

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function first<T>(value: T[] | null | undefined): T | null {
  return Array.isArray(value) && value.length > 0 ? value[0] : null;
}

function plainLine(label: string, value: unknown) {
  if (value == null || value === "") return `${label}: Not available`;
  return `${label}: ${String(value)}`;
}

function itemTitle(item: any) {
  return item?.task || item?.task_title || item?.keyword || item?.primary_keyword || item?.page_title || item?.detected_topic || item?.gap_type || "Untitled item";
}

function itemUrl(item: any) {
  return item?.url || item?.target_url || item?.page_url || item?.affected_url || item?.target_page || "";
}

function buildTextDigest(payload: any) {
  const lines = [
    payload.subject,
    "",
    payload.summary,
    "",
    "Top 3 SEO opportunities",
    ...payload.top_opportunities.map((item: any, index: number) => `${index + 1}. ${itemTitle(item)} ${itemUrl(item) ? `(${itemUrl(item)})` : ""}`),
    "",
    plainLine("Highest ROI task", itemTitle(payload.highest_roi_task)),
    plainLine("Biggest CTR issue", itemTitle(payload.biggest_ctr_issue)),
    plainLine("Biggest traffic decline", itemTitle(payload.biggest_traffic_decline)),
    "",
    "Freshness warnings",
    ...(payload.freshness_warnings.length > 0 ? payload.freshness_warnings.map((item: any) => `- ${itemTitle(item)} ${itemUrl(item) ? `(${itemUrl(item)})` : ""}`) : ["- None detected"]),
    "",
    "Draft impact winners",
    ...(payload.draft_impact_winners.length > 0 ? payload.draft_impact_winners.map((item: any) => `- ${item.keyword || item.task || "Winner"} ${item.target_page ? `(${item.target_page})` : ""}`) : ["- None detected"]),
    "",
    "Draft impact losers",
    ...(payload.draft_impact_losers.length > 0 ? payload.draft_impact_losers.map((item: any) => `- ${item.keyword || item.task || "Loser"} ${item.target_page ? `(${item.target_page})` : ""}`) : ["- None detected"]),
    "",
    plainLine("Pending approvals", payload.pending_approvals_count),
    "",
    "Daily briefing summary",
    payload.daily_briefing_summary || "Not available",
    "",
    "Weekly briefing summary",
    payload.weekly_briefing_summary || "Not available",
  ];

  return lines.join("\n");
}

async function sendEmail(to: string, subject: string, text: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
    }),
  });

  const body = await response.text();
  if (!response.ok) throw new Error(body || `Email provider returned HTTP ${response.status}`);
  return body ? JSON.parse(body) : {};
}

async function buildDigestPayload(digestType: DigestType) {
  const [
    { data: opportunities },
    { data: ctr },
    { data: freshness },
    { data: keywords },
    { data: weeklyBriefings },
    { data: dailyBriefings },
    { data: weeklyTasks },
    { data: contentGaps },
    { data: internalLinks },
    { data: moneyPages },
    { data: automationRuns },
  ] = await Promise.all([
    supabase.from("seo_opportunities").select("keyword, target_url, score, priority, reason, recommended_action").eq("status", "open").order("score", { ascending: false }).limit(10),
    supabase.from("ctr_optimizations").select("page_url, primary_keyword, impressions_28d, clicks_28d, ctr_28d, position, estimated_missed_clicks, priority_score, reason").eq("status", "open").order("priority_score", { ascending: false }).limit(10),
    supabase.from("auto_refresh_recommendations").select("page_url, page_title, freshness_score, priority_level, outdated_sections, recommended_updates").eq("status", "open").order("freshness_score", { ascending: true }).limit(10),
    supabase.from("seo_keywords").select("keyword, category, target_page, calcy_position, calcy_position_previous, calcy_impressions_28d, trend_direction").eq("is_active", true).limit(1200),
    supabase.from("weekly_seo_briefings").select("*").order("week_start", { ascending: false }).limit(1),
    supabase.from("daily_seo_briefings").select("*").order("briefing_date", { ascending: false }).limit(1),
    supabase.from("weekly_seo_tasks").select("approval_status, priority_score").limit(200),
    supabase.from("content_gap_opportunities").select("status").eq("status", "open").limit(200),
    supabase.from("internal_link_opportunities").select("status").eq("status", "open").limit(200),
    supabase.from("money_page_scores").select("page_url, page_title, money_score, recommended_action").eq("status", "open").order("money_score", { ascending: false }).limit(5),
    supabase.from("seo_automation_runs").select("job_key, job_name, rows_processed, rows_created, status, started_at").eq("status", "success").order("started_at", { ascending: false }).limit(20),
  ]);

  const opportunityRows = opportunities || [];
  const ctrRows = ctr || [];
  const freshnessRows = freshness || [];
  const keywordRows = keywords || [];
  const latestWeekly = first(weeklyBriefings || []);
  const latestDaily = first(dailyBriefings || []);
  const latestMoney = first(moneyPages || []);

  const trafficDeclines = keywordRows
    .filter((row: any) => row.calcy_position != null && row.calcy_position_previous != null && row.calcy_position > row.calcy_position_previous)
    .map((row: any) => ({ ...row, decline: row.calcy_position - row.calcy_position_previous }))
    .sort((a: any, b: any) => (b.decline * ((b.calcy_impressions_28d || 0) + 1)) - (a.decline * ((a.calcy_impressions_28d || 0) + 1)));

  const draftWinners = keywordRows
    .filter((row: any) => row.calcy_position != null && row.calcy_position_previous != null && row.calcy_position < row.calcy_position_previous)
    .map((row: any) => ({ ...row, improvement: row.calcy_position_previous - row.calcy_position }))
    .sort((a: any, b: any) => b.improvement - a.improvement)
    .slice(0, 3);

  const draftLosers = trafficDeclines.slice(0, 3);
  const pendingApprovals =
    (weeklyTasks || []).filter((item: any) => item.approval_status === "pending").length +
    (contentGaps || []).length +
    (internalLinks || []).length +
    asArray(latestDaily?.suggested_implementation_queue).length;

  const highestRoiTask = latestDaily?.highest_roi_opportunity || latestMoney || first(opportunityRows);
  const biggestCtrIssue = first(ctrRows);
  const biggestTrafficDecline = first(trafficDeclines);

  const subject = digestType === "weekly"
    ? `Calcy weekly SEO digest - ${new Date().toLocaleDateString("en-AU")}`
    : `Calcy daily SEO digest - ${new Date().toLocaleDateString("en-AU")}`;

  const summary = digestType === "weekly"
    ? latestWeekly?.executive_summary || `Weekly SEO digest generated with ${opportunityRows.length} open opportunities and ${pendingApprovals} pending approvals.`
    : latestDaily?.daily_summary || `Daily SEO digest generated with ${opportunityRows.length} open opportunities and ${pendingApprovals} pending approvals.`;

  return {
    subject,
    digest_type: digestType,
    summary,
    top_opportunities: opportunityRows.slice(0, 3),
    highest_roi_task: highestRoiTask || {},
    biggest_ctr_issue: biggestCtrIssue || {},
    biggest_traffic_decline: biggestTrafficDecline || {},
    freshness_warnings: freshnessRows.slice(0, 5),
    draft_impact_winners: draftWinners,
    draft_impact_losers: draftLosers,
    weekly_briefing_summary: latestWeekly?.executive_summary || "",
    daily_briefing_summary: latestDaily?.daily_summary || "",
    pending_approvals_count: pendingApprovals,
    recent_successful_automation_runs: automationRuns || [],
  };
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
    const digestType: DigestType = body?.digest_type === "weekly" ? "weekly" : "daily";
    const force = Boolean(body?.force);
    const scheduled = Boolean(body?.scheduled);

    const { data: prefs, error: prefError } = await supabase
      .from("seo_digest_preferences")
      .select("*")
      .eq("preference_key", "admin_seo_digest")
      .limit(1);
    if (prefError) throw prefError;

    let preference = first(prefs as DigestPreference[] | null);
    if (!preference) {
      const { data, error } = await supabase
        .from("seo_digest_preferences")
        .insert({ preference_key: "admin_seo_digest" })
        .select("*")
        .single();
      if (error) throw error;
      preference = data as DigestPreference;
    }

    const digestEnabled = digestType === "weekly" ? preference.weekly_enabled : preference.daily_enabled;
    if (scheduled && !digestEnabled) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: `${digestType} digest is disabled.` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!force && !scheduled && !digestEnabled && !preference.admin_notifications_enabled) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: `${digestType} digest is disabled.` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await buildDigestPayload(digestType);
    const text = buildTextDigest(payload);
    const providerConfigured = Boolean(resendApiKey);
    const logs = [];

    const shouldLogAdminNotification = force || preference.admin_notifications_enabled || !providerConfigured;
    if (shouldLogAdminNotification) {
      const { data, error } = await supabase.from("seo_digest_logs").insert({
        preference_id: preference.id,
        digest_type: digestType,
        channel: "admin_notification",
        status: "created",
        subject: payload.subject,
        email_provider_configured: providerConfigured,
        message: providerConfigured ? "Admin notification digest created." : "Email provider not configured. Admin notification log saved.",
        digest_payload: payload,
      }).select("*").single();
      if (error) throw error;
      logs.push(data);
    }

    if (preference.email_enabled && digestEnabled) {
      if (!preference.recipient_email) {
        const { data, error } = await supabase.from("seo_digest_logs").insert({
          preference_id: preference.id,
          digest_type: digestType,
          channel: "email",
          status: "skipped",
          subject: payload.subject,
          email_provider_configured: providerConfigured,
          message: "Recipient email not configured.",
          digest_payload: payload,
        }).select("*").single();
        if (error) throw error;
        logs.push(data);
      } else if (!providerConfigured) {
        const { data, error } = await supabase.from("seo_digest_logs").insert({
          preference_id: preference.id,
          digest_type: digestType,
          channel: "email",
          status: "skipped",
          subject: payload.subject,
          recipient_email: preference.recipient_email,
          email_provider_configured: false,
          message: "Email provider not configured.",
          digest_payload: payload,
        }).select("*").single();
        if (error) throw error;
        logs.push(data);
      } else {
        try {
          const emailResult = await sendEmail(preference.recipient_email, payload.subject, text);
          const { data, error } = await supabase.from("seo_digest_logs").insert({
            preference_id: preference.id,
            digest_type: digestType,
            channel: "email",
            status: "sent",
            subject: payload.subject,
            recipient_email: preference.recipient_email,
            email_provider_configured: true,
            message: "Email digest sent.",
            digest_payload: { ...payload, email_result: emailResult },
            sent_at: new Date().toISOString(),
          }).select("*").single();
          if (error) throw error;
          logs.push(data);

          await supabase.from("seo_digest_preferences").update({
            [digestType === "weekly" ? "last_weekly_sent_at" : "last_daily_sent_at"]: new Date().toISOString(),
            last_error: null,
          }).eq("id", preference.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const { data, error: logError } = await supabase.from("seo_digest_logs").insert({
            preference_id: preference.id,
            digest_type: digestType,
            channel: "email",
            status: "error",
            subject: payload.subject,
            recipient_email: preference.recipient_email,
            email_provider_configured: true,
            message: "Email digest failed.",
            digest_payload: payload,
            error_message: message,
          }).select("*").single();
          if (logError) throw logError;
          logs.push(data);
          await supabase.from("seo_digest_preferences").update({ last_error: message }).eq("id", preference.id);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      email_provider_configured: providerConfigured,
      message: providerConfigured ? "SEO digest generated." : "Email provider not configured. Admin notification log saved.",
      digest: payload,
      logs,
    }), {
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
