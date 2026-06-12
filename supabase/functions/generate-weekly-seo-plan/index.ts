import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-triggered-by",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type RiskLevel = "low" | "medium" | "high";
type PriorityLevel = "low" | "medium" | "high";
type TaskType = "opportunity" | "ctr" | "internal_link" | "content_gap" | "ranking_drop" | "freshness" | "money_page" | "competitor" | "aeo" | "schema";

type SeoOpportunity = {
  id: string;
  keyword: string;
  target_url: string;
  score: number;
  priority: string;
  reason: string;
  recommended_action: string;
  signals: Record<string, unknown> | null;
};

type MoneyPageScore = {
  id: string;
  page_url: string;
  page_title: string;
  money_score: number;
  reason: string;
  recommended_action: string;
  related_internal_links_needed: unknown;
};

type InternalLinkOpportunity = {
  id: string;
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  reason: string;
  priority: string;
};

type ContentGapOpportunity = {
  id: string;
  gap_type: string;
  affected_url: string;
  keyword_topic: string | null;
  suggested_fix: string;
  priority_score: number;
  estimated_traffic_opportunity: number;
  suggested_content_type: string;
};

type CtrOptimization = {
  id: string;
  page_url: string;
  primary_keyword: string;
  impressions_28d: number;
  clicks_28d: number;
  ctr_28d: number;
  position: number | null;
  estimated_missed_clicks: number;
  priority_score: number;
  reason: string;
  suggested_title: string;
  suggested_meta_description: string;
};

type CompetitorInsight = {
  id: string;
  competitor_domain: string;
  detected_topic: string;
  insight_type: string;
  estimated_opportunity: string;
  recommended_response: string;
  priority_score: number;
};

type FreshnessRecommendation = {
  id: string;
  page_url: string;
  page_title: string;
  freshness_score: number;
  priority_level: string;
  outdated_sections: unknown;
  recommended_updates: unknown;
};

type AeoOptimization = {
  id: string;
  page_url: string;
  page_title: string;
  primary_topic: string;
  aeo_score: number;
  snippet_readiness_score: number;
  priority_level: string;
  recommended_improvements: unknown;
  missing_semantic_elements: unknown;
};

type KeywordRow = {
  id: string;
  keyword: string;
  target_page: string | null;
  category: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_impressions_28d: number | null;
  calcy_clicks_28d: number | null;
  opportunity_score: number | null;
  trend_direction: string | null;
};

type WeeklyTask = {
  week_start: string;
  task_title: string;
  task_type: TaskType;
  affected_url: string;
  expected_impact: string;
  expected_traffic_impact: string;
  expected_revenue_impact: string;
  risk_level: RiskLevel;
  priority_level: PriorityLevel;
  suggested_implementation_prompt: string;
  approval_status: "pending";
  priority_score: number;
  source_refs: Record<string, unknown>;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function weekStart(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

function pageLabel(url: string) {
  const cleaned = url.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/|\/$/g, "");
  if (!cleaned) return "home page";
  return cleaned.replaceAll("-", " ").replaceAll("/", " / ");
}

function priorityLevel(score: number): PriorityLevel {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function priorityWeight(priority: string) {
  if (priority === "high") return 88;
  if (priority === "medium") return 68;
  return 48;
}

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function moneyTier(score: number) {
  if (score >= 80) return "High RPM potential: finance calculator traffic can be worth materially more than general content.";
  if (score >= 60) return "Medium RPM potential: likely to support AdSense revenue and future lead capture.";
  return "Low-medium RPM potential: supports topical authority more than direct revenue.";
}

function trafficImpact(impressions: number, missedClicks = 0) {
  if (missedClicks >= 100) return `High: estimated ${Math.round(missedClicks).toLocaleString()} missed clicks recoverable from SERP improvements.`;
  if (impressions >= 1000) return `High: ${impressions.toLocaleString()} recent impressions create meaningful upside.`;
  if (impressions >= 200) return `Medium: ${impressions.toLocaleString()} recent impressions create testable upside.`;
  return "Low-medium: primarily supports authority, crawl depth, and future rankings.";
}

function implementationPrompt(task: {
  taskType: string;
  affectedUrl: string;
  action: string;
  context: string;
}) {
  return [
    `Implement an admin-approved SEO refinement for ${task.affectedUrl}.`,
    `Task type: ${task.taskType}.`,
    `Action: ${task.action}`,
    `Context: ${task.context}`,
    "Preserve existing URLs, sitemap logic, metadata/schema contracts, calculator logic, accessibility, performance, Core Web Vitals and mobile UX.",
    "Do not auto-publish content. Keep changes scoped and require admin approval before applying public content changes.",
  ].join(" ");
}

function addTask(tasks: Map<string, WeeklyTask>, task: WeeklyTask) {
  const key = `${task.task_type}|${task.affected_url}|${task.task_title}`;
  const existing = tasks.get(key);
  if (!existing || task.priority_score > existing.priority_score) {
    tasks.set(key, task);
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

  const jobId = crypto.randomUUID();
  const startedAt = new Date();
  const currentWeek = weekStart();

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "weekly_seo_briefing",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [
      { data: opportunities },
      { data: moneyPages },
      { data: links },
      { data: gaps },
      { data: ctr },
      { data: competitors },
      { data: freshness },
      { data: aeo },
      { data: keywords },
    ] = await Promise.all([
      supabase.from("seo_opportunities").select("id, keyword, target_url, score, priority, reason, recommended_action, signals").eq("status", "open").order("score", { ascending: false }).limit(80),
      supabase.from("money_page_scores").select("id, page_url, page_title, money_score, reason, recommended_action, related_internal_links_needed").eq("status", "open").order("money_score", { ascending: false }).limit(40),
      supabase.from("internal_link_opportunities").select("id, source_page, target_page, suggested_anchor_text, reason, priority").eq("status", "open").limit(120),
      supabase.from("content_gap_opportunities").select("id, gap_type, affected_url, keyword_topic, suggested_fix, priority_score, estimated_traffic_opportunity, suggested_content_type").eq("status", "open").order("priority_score", { ascending: false }).limit(80),
      supabase.from("ctr_optimizations").select("id, page_url, primary_keyword, impressions_28d, clicks_28d, ctr_28d, position, estimated_missed_clicks, priority_score, reason, suggested_title, suggested_meta_description").eq("status", "open").order("priority_score", { ascending: false }).limit(80),
      supabase.from("competitor_tracking_insights").select("id, competitor_domain, detected_topic, insight_type, estimated_opportunity, recommended_response, priority_score").eq("status", "open").order("priority_score", { ascending: false }).limit(80),
      supabase.from("auto_refresh_recommendations").select("id, page_url, page_title, freshness_score, priority_level, outdated_sections, recommended_updates").eq("status", "open").order("freshness_score", { ascending: true }).limit(80),
      supabase.from("aeo_optimizations").select("id, page_url, page_title, primary_topic, aeo_score, snippet_readiness_score, priority_level, recommended_improvements, missing_semantic_elements").eq("status", "open").order("aeo_score", { ascending: true }).limit(80),
      supabase.from("seo_keywords").select("id, keyword, target_page, category, calcy_position, calcy_position_previous, calcy_impressions_28d, calcy_clicks_28d, opportunity_score, trend_direction").eq("is_active", true).limit(1200),
    ]);

    const opportunityRows = (opportunities as SeoOpportunity[] | null) || [];
    const moneyRows = (moneyPages as MoneyPageScore[] | null) || [];
    const linkRows = (links as InternalLinkOpportunity[] | null) || [];
    const gapRows = (gaps as ContentGapOpportunity[] | null) || [];
    const ctrRows = (ctr as CtrOptimization[] | null) || [];
    const competitorRows = (competitors as CompetitorInsight[] | null) || [];
    const freshnessRows = (freshness as FreshnessRecommendation[] | null) || [];
    const aeoRows = (aeo as AeoOptimization[] | null) || [];
    const keywordRows = (keywords as KeywordRow[] | null) || [];

    const tasks = new Map<string, WeeklyTask>();

    for (const item of opportunityRows.slice(0, 24)) {
      const impressions = Number((item.signals?.impressions_28d as number | undefined) || 0);
      const score = clamp(item.score);
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Improve ${item.keyword} opportunity`,
        task_type: "opportunity",
        affected_url: item.target_url,
        expected_impact: `${priorityLevel(score)} ROI: ${item.reason}`,
        expected_traffic_impact: trafficImpact(impressions),
        expected_revenue_impact: moneyTier(score),
        risk_level: "medium",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Opportunity Radar",
          affectedUrl: item.target_url,
          action: item.recommended_action,
          context: item.reason,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { seo_opportunity_id: item.id, keyword: item.keyword, priority: item.priority },
      });
    }

    for (const item of moneyRows.slice(0, 16)) {
      const score = clamp(item.money_score);
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Prioritize money page ${item.page_title}`,
        task_type: "money_page",
        affected_url: item.page_url,
        expected_impact: `High-value finance page with ${score}/100 money score.`,
        expected_traffic_impact: "Medium-high: improves the page most likely to convert calculator intent into repeat visits and revenue.",
        expected_revenue_impact: moneyTier(score),
        risk_level: "medium",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Money Pages Scoring",
          affectedUrl: item.page_url,
          action: item.recommended_action,
          context: item.reason,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { money_page_score_id: item.id, related_internal_links_needed: item.related_internal_links_needed },
      });
    }

    for (const item of ctrRows.slice(0, 20)) {
      const score = clamp(item.priority_score);
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Lift CTR for ${pageLabel(item.page_url)}`,
        task_type: "ctr",
        affected_url: item.page_url,
        expected_impact: `${item.impressions_28d.toLocaleString()} impressions at ${(item.ctr_28d * 100).toFixed(1)}% CTR, average position ${item.position?.toFixed(1) ?? "unknown"}.`,
        expected_traffic_impact: trafficImpact(item.impressions_28d, item.estimated_missed_clicks),
        expected_revenue_impact: "Medium-high: CTR gains can increase AdSense revenue without requiring ranking movement.",
        risk_level: "low",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "CTR Engine",
          affectedUrl: item.page_url,
          action: `Review title "${item.suggested_title}" and meta "${item.suggested_meta_description}" for admin approval.`,
          context: item.reason,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { ctr_optimization_id: item.id, keyword: item.primary_keyword },
      });
    }

    for (const item of linkRows.slice(0, 30)) {
      const score = priorityWeight(item.priority);
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Add internal link to ${pageLabel(item.target_page)}`,
        task_type: "internal_link",
        affected_url: item.source_page,
        expected_impact: "Strengthens crawl paths, semantic context and money-page authority.",
        expected_traffic_impact: "Medium: supports crawl depth and ranking stability across related pages.",
        expected_revenue_impact: "Medium: helps distribute authority toward revenue-sensitive calculator pages.",
        risk_level: "low",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Internal Linking Engine",
          affectedUrl: item.source_page,
          action: `Add a contextual link to ${item.target_page} using anchor text "${item.suggested_anchor_text}".`,
          context: item.reason,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { internal_link_opportunity_id: item.id, target_page: item.target_page, priority: item.priority },
      });
    }

    for (const item of gapRows.slice(0, 24)) {
      const score = clamp(item.priority_score);
      const taskType: TaskType = item.gap_type.toLowerCase().includes("schema") ? "schema" : "content_gap";
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Resolve ${item.gap_type.replaceAll("_", " ")}`,
        task_type: taskType,
        affected_url: item.affected_url,
        expected_impact: `Closes a ${score}/100 content gap for ${item.keyword_topic || item.suggested_content_type}.`,
        expected_traffic_impact: item.estimated_traffic_opportunity > 0
          ? `High: estimated ${item.estimated_traffic_opportunity.toLocaleString()} monthly visits available.`
          : trafficImpact(0),
        expected_revenue_impact: item.affected_url.includes("calculator") ? "High: calculator-intent content can lift finance RPM." : "Medium: supports topical authority and internal discovery.",
        risk_level: ["missing_calculator_page", "state_opportunity", "suburb_opportunity"].includes(item.gap_type) ? "high" : "medium",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: taskType === "schema" ? "Schema improvement" : "Content Gap Analyzer",
          affectedUrl: item.affected_url,
          action: item.suggested_fix,
          context: `Gap type: ${item.gap_type}. Suggested content type: ${item.suggested_content_type}.`,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { content_gap_opportunity_id: item.id, gap_type: item.gap_type, keyword_topic: item.keyword_topic },
      });
    }

    for (const item of competitorRows.slice(0, 18)) {
      const score = clamp(item.priority_score);
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Respond to ${item.detected_topic} competitor movement`,
        task_type: "competitor",
        affected_url: "/guides",
        expected_impact: item.estimated_opportunity,
        expected_traffic_impact: "Medium-high: responds to competitor movement before the gap widens.",
        expected_revenue_impact: item.detected_topic.toLowerCase().includes("mortgage") || item.detected_topic.toLowerCase().includes("refinance") ? "High: finance competitor topics can carry strong RPM." : "Medium: supports authority and future monetization.",
        risk_level: "medium",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Competitor Tracking",
          affectedUrl: "/guides",
          action: item.recommended_response,
          context: `${item.competitor_domain} - ${item.insight_type}.`,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { competitor_tracking_insight_id: item.id, competitor: item.competitor_domain, topic: item.detected_topic },
      });
    }

    for (const item of freshnessRows.slice(0, 18)) {
      const score = clamp(100 - item.freshness_score);
      const updates = asStrings(item.recommended_updates).join(" ");
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Refresh ${item.page_title}`,
        task_type: "freshness",
        affected_url: item.page_url,
        expected_impact: `Freshness score is ${item.freshness_score}/100; outdated sections: ${asStrings(item.outdated_sections).join(", ") || "review required"}.`,
        expected_traffic_impact: "Medium: finance freshness supports trust, rankings and AI answer eligibility.",
        expected_revenue_impact: "Medium: protects finance RPM by keeping trust-sensitive content current.",
        risk_level: "low",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Auto Refresh Engine",
          affectedUrl: item.page_url,
          action: updates || "Review freshness signals and update stale finance assumptions after admin approval.",
          context: `Current freshness score ${item.freshness_score}/100.`,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { auto_refresh_recommendation_id: item.id, freshness_score: item.freshness_score },
      });
    }

    for (const item of aeoRows.slice(0, 18)) {
      const score = clamp(100 - item.aeo_score + Math.max(0, 70 - item.snippet_readiness_score) / 2);
      const improvements = asStrings(item.recommended_improvements).join(" ");
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Improve AEO readiness for ${item.page_title}`,
        task_type: "aeo",
        affected_url: item.page_url,
        expected_impact: `AEO score ${item.aeo_score}/100 and snippet readiness ${item.snippet_readiness_score}/100.`,
        expected_traffic_impact: "Medium: improves eligibility for AI Overviews, featured snippets and conversational discovery.",
        expected_revenue_impact: "Medium: AEO visibility can protect calculator discovery as search behavior shifts.",
        risk_level: "low",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "AEO Optimizer",
          affectedUrl: item.page_url,
          action: improvements || "Add concise answer blocks, stronger FAQs and semantic headings after admin approval.",
          context: `Primary topic: ${item.primary_topic}. Missing elements: ${asStrings(item.missing_semantic_elements).join(", ") || "review suggested"}.`,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { aeo_optimization_id: item.id, primary_topic: item.primary_topic },
      });
    }

    for (const row of keywordRows) {
      const current = row.calcy_position;
      const previous = row.calcy_position_previous;
      const impressions = row.calcy_impressions_28d || 0;
      if (current == null || previous == null) continue;
      const drop = current - previous;
      if (drop < 3 || impressions < 20) continue;
      const target = row.target_page || "/guides";
      const score = clamp(58 + Math.min(22, impressions / 120) + Math.min(20, drop * 3));
      addTask(tasks, {
        week_start: currentWeek,
        task_title: `Investigate ranking drop for ${row.keyword}`,
        task_type: "ranking_drop",
        affected_url: target,
        expected_impact: `${row.keyword} dropped ${drop.toFixed(1)} positions with ${impressions.toLocaleString()} recent impressions.`,
        expected_traffic_impact: trafficImpact(impressions),
        expected_revenue_impact: row.category?.includes("mortgage") ? "High: mortgage ranking recovery can protect high-RPM traffic." : "Medium: ranking recovery protects organic traffic.",
        risk_level: "medium",
        priority_level: priorityLevel(score),
        suggested_implementation_prompt: implementationPrompt({
          taskType: "Ranking drop",
          affectedUrl: target,
          action: `Audit intent match, internal links, freshness, CTR, schema, AEO blocks and competitor movement for "${row.keyword}".`,
          context: `Previous position ${previous.toFixed(1)}, current position ${current.toFixed(1)}.`,
        }),
        approval_status: "pending",
        priority_score: score,
        source_refs: { keyword_id: row.id, keyword: row.keyword, previous_position: previous, current_position: current },
      });
    }

    const topTasks = [...tasks.values()]
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 10);

    if (topTasks.length > 0) {
      const { error: upsertError } = await supabase
        .from("weekly_seo_tasks")
        .upsert(
          topTasks.map((task) => ({
            ...task,
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "week_start,task_type,affected_url,task_title" },
        );
      if (upsertError) throw upsertError;
    }

    const totalImpressions = keywordRows.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
    const rankingDrops = keywordRows.filter((row) => row.calcy_position != null && row.calcy_position_previous != null && row.calcy_position - row.calcy_position_previous >= 3);
    const risingKeywords = keywordRows.filter((row) => row.trend_direction === "rising");

    const briefing = {
      week_start: currentWeek,
      executive_summary: `Generated ${topTasks.length} approval-required SEO tasks from ${tasks.size} candidates. Focus this week: ${topTasks.slice(0, 3).map((task) => task.task_type.replaceAll("_", " ")).join(", ") || "monitoring"}.`,
      seo_trend_overview: {
        tracked_keywords: keywordRows.length,
        recent_impressions: totalImpressions,
        ranking_drops: rankingDrops.length,
        rising_keywords: risingKeywords.slice(0, 8).map((row) => row.keyword),
        top_task_types: topTasks.reduce((acc, task) => ({ ...acc, [task.task_type]: ((acc as Record<string, number>)[task.task_type] || 0) + 1 }), {} as Record<string, number>),
      },
      growth_opportunities: [
        ...opportunityRows.slice(0, 4).map((item) => ({ source: "Opportunity Radar", topic: item.keyword, url: item.target_url, score: item.score })),
        ...ctrRows.slice(0, 3).map((item) => ({ source: "CTR Engine", topic: item.primary_keyword, url: item.page_url, score: item.priority_score })),
        ...competitorRows.slice(0, 3).map((item) => ({ source: "Competitor Tracking", topic: item.detected_topic, url: null, score: item.priority_score })),
      ].slice(0, 10),
      warnings_issues: [
        ...rankingDrops.slice(0, 5).map((row) => ({ type: "ranking_drop", keyword: row.keyword, url: row.target_page, current_position: row.calcy_position, previous_position: row.calcy_position_previous })),
        ...freshnessRows.filter((item) => item.freshness_score < 60).slice(0, 5).map((item) => ({ type: "freshness", url: item.page_url, score: item.freshness_score })),
        ...aeoRows.filter((item) => item.aeo_score < 60).slice(0, 5).map((item) => ({ type: "aeo", url: item.page_url, score: item.aeo_score })),
      ].slice(0, 10),
      money_page_priorities: moneyRows.slice(0, 8).map((item) => ({
        url: item.page_url,
        title: item.page_title,
        money_score: item.money_score,
        recommended_action: item.recommended_action,
      })),
      top_tasks: topTasks,
      data_sources: {
        opportunity_radar: opportunityRows.length,
        money_pages: moneyRows.length,
        internal_links: linkRows.length,
        content_gaps: gapRows.length,
        ctr: ctrRows.length,
        competitor_tracking: competitorRows.length,
        freshness: freshnessRows.length,
        aeo: aeoRows.length,
        keywords: keywordRows.length,
      },
      approval_status: "pending",
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: briefingError } = await supabase
      .from("weekly_seo_briefings")
      .upsert(briefing, { onConflict: "week_start" });
    if (briefingError) throw briefingError;

    await supabase.from("seo_reports").insert({
      report_type: "weekly_seo_briefing",
      content_recommendations: topTasks,
      full_report_data: briefing,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: opportunityRows.length + moneyRows.length + linkRows.length + gapRows.length + ctrRows.length + competitorRows.length + freshnessRows.length + aeoRows.length + keywordRows.length,
      records_updated: topTasks.length,
      summary: {
        week_start: currentWeek,
        candidate_tasks: tasks.size,
        tasks_generated: topTasks.length,
        high_priority: topTasks.filter((task) => task.priority_level === "high").length,
        pending_approval: topTasks.length,
      },
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, briefing, tasks: topTasks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("sync_jobs").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_log: { message },
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
