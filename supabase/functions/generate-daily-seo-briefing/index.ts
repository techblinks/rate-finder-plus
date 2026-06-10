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

type Priority = "high" | "medium" | "low";
type Risk = "low" | "medium" | "high";

type SeoOpportunity = {
  id: string;
  keyword: string;
  target_url: string;
  score: number;
  priority: Priority;
  reason: string;
  recommended_action: string;
  signals: Record<string, unknown> | null;
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

type MoneyPageScore = {
  id: string;
  page_url: string;
  page_title: string;
  money_score: number;
  reason: string;
  recommended_action: string;
};

type InternalLinkOpportunity = {
  id: string;
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  reason: string;
  priority: Priority;
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
  is_quick_win: boolean;
};

type FreshnessRecommendation = {
  id: string;
  page_url: string;
  page_title: string;
  freshness_score: number;
  priority_level: Priority;
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
  answer_confidence_score: number;
  priority_level: Priority;
  recommended_improvements: unknown;
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

type WeeklyTask = {
  id: string;
  task_title: string;
  task_type: string;
  affected_url: string;
  expected_impact: string;
  expected_traffic_impact: string | null;
  expected_revenue_impact: string | null;
  risk_level: Risk;
  priority_level: Priority | null;
  priority_score: number;
  approval_status: string;
  suggested_implementation_prompt: string;
};

type KeywordRow = {
  id: string;
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_impressions_28d: number | null;
  calcy_clicks_28d: number | null;
  opportunity_score: number | null;
  trend_direction: string | null;
};

type QueueItem = {
  task: string;
  source: string;
  url: string;
  priority_score: number;
  priority_level: Priority;
  risk_level: Risk;
  expected_traffic_impact: string;
  expected_revenue_impact: string;
  prompt: string;
  approval_status: "pending";
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function scoreToPriority(score: number): Priority {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function priorityWeight(priority: string) {
  if (priority === "high") return 88;
  if (priority === "medium") return 68;
  return 48;
}

function revenueImpact(score: number, url: string, context = "") {
  const text = `${url} ${context}`.toLowerCase();
  if (score >= 80 || text.includes("mortgage") || text.includes("refinance") || text.includes("borrowing")) {
    return "High RPM potential: mortgage and finance calculator intent can materially lift AdSense revenue.";
  }
  if (score >= 60 || text.includes("stamp duty") || text.includes("lmi") || text.includes("hecs")) {
    return "Medium-high RPM potential: finance topic supports qualified organic traffic.";
  }
  return "Medium RPM potential: supports topical authority and downstream calculator discovery.";
}

function trafficImpact(impressions = 0, missedClicks = 0) {
  if (missedClicks >= 100) return `High: estimated ${Math.round(missedClicks).toLocaleString()} recoverable missed clicks.`;
  if (impressions >= 1000) return `High: ${impressions.toLocaleString()} recent impressions create meaningful upside.`;
  if (impressions >= 200) return `Medium: ${impressions.toLocaleString()} recent impressions create testable upside.`;
  return "Low-medium: supports authority, crawl depth and future rankings.";
}

function pageLabel(url: string) {
  const cleaned = url.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/|\/$/g, "");
  return cleaned ? cleaned.replaceAll("-", " ").replaceAll("/", " / ") : "home page";
}

function prompt(action: string, url: string, context: string) {
  return [
    `Implement this admin-approved daily SEO task for ${url}.`,
    `Action: ${action}`,
    `Context: ${context}`,
    "Do not auto-publish. Preserve URLs, sitemap, schema, metadata, canonicals, routes, calculator logic, accessibility, performance and mobile UX.",
    "Return exact proposed file changes before modifying public content.",
  ].join(" ");
}

function addQueue(queue: Map<string, QueueItem>, item: QueueItem) {
  const key = `${item.source}|${item.url}|${item.task}`;
  const existing = queue.get(key);
  if (!existing || item.priority_score > existing.priority_score) queue.set(key, item);
}

function findWinningPattern(queue: QueueItem[], moneyPages: MoneyPageScore[], gaps: ContentGapOpportunity[]) {
  const calculatorTasks = queue.filter((item) => item.url.includes("calculator"));
  if (calculatorTasks.length >= 3) {
    return {
      pattern: "Calculator-led SEO opportunities are dominating the queue.",
      evidence: calculatorTasks.slice(0, 5).map((item) => ({ task: item.task, url: item.url, score: item.priority_score })),
      recommended_response: "Prioritize calculator pages with high RPM and add supporting FAQs, internal links and concise answer blocks.",
    };
  }

  const quickWins = gaps.filter((gap) => gap.is_quick_win);
  if (quickWins.length > 0) {
    return {
      pattern: "Quick-win content gaps are available.",
      evidence: quickWins.slice(0, 5).map((gap) => ({ topic: gap.keyword_topic, url: gap.affected_url, score: gap.priority_score })),
      recommended_response: "Resolve quick-win gaps first when they support a money page or page-one opportunity.",
    };
  }

  const topMoney = moneyPages[0];
  return {
    pattern: topMoney ? `${topMoney.page_title} remains the strongest money-page signal.` : "No clear winning pattern yet.",
    evidence: topMoney ? [{ url: topMoney.page_url, score: topMoney.money_score, reason: topMoney.reason }] : [],
    recommended_response: topMoney ? topMoney.recommended_action : "Run the source engines to build enough signal for reliable pattern detection.",
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

  const jobId = crypto.randomUUID();
  const startedAt = Date.now();
  const briefingDate = todayIso();

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "daily_seo_briefing",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [
      { data: opportunities },
      { data: ctr },
      { data: moneyPages },
      { data: links },
      { data: gaps },
      { data: freshness },
      { data: aeo },
      { data: competitors },
      { data: weeklyTasks },
      { data: keywords },
    ] = await Promise.all([
      supabase.from("seo_opportunities").select("id, keyword, target_url, score, priority, reason, recommended_action, signals").eq("status", "open").order("score", { ascending: false }).limit(80),
      supabase.from("ctr_optimizations").select("id, page_url, primary_keyword, impressions_28d, clicks_28d, ctr_28d, position, estimated_missed_clicks, priority_score, reason, suggested_title, suggested_meta_description").eq("status", "open").order("priority_score", { ascending: false }).limit(80),
      supabase.from("money_page_scores").select("id, page_url, page_title, money_score, reason, recommended_action").eq("status", "open").order("money_score", { ascending: false }).limit(50),
      supabase.from("internal_link_opportunities").select("id, source_page, target_page, suggested_anchor_text, reason, priority").eq("status", "open").limit(120),
      supabase.from("content_gap_opportunities").select("id, gap_type, affected_url, keyword_topic, suggested_fix, priority_score, estimated_traffic_opportunity, suggested_content_type, is_quick_win").eq("status", "open").order("priority_score", { ascending: false }).limit(100),
      supabase.from("auto_refresh_recommendations").select("id, page_url, page_title, freshness_score, priority_level, outdated_sections, recommended_updates").eq("status", "open").order("freshness_score", { ascending: true }).limit(80),
      supabase.from("aeo_optimizations").select("id, page_url, page_title, primary_topic, aeo_score, snippet_readiness_score, answer_confidence_score, priority_level, recommended_improvements").eq("status", "open").order("aeo_score", { ascending: true }).limit(80),
      supabase.from("competitor_tracking_insights").select("id, competitor_domain, detected_topic, insight_type, estimated_opportunity, recommended_response, priority_score").eq("status", "open").order("priority_score", { ascending: false }).limit(80),
      supabase.from("weekly_seo_tasks").select("id, task_title, task_type, affected_url, expected_impact, expected_traffic_impact, expected_revenue_impact, risk_level, priority_level, priority_score, approval_status, suggested_implementation_prompt").eq("approval_status", "pending").order("priority_score", { ascending: false }).limit(40),
      supabase.from("seo_keywords").select("id, keyword, category, target_page, calcy_position, calcy_position_previous, calcy_impressions_28d, calcy_clicks_28d, opportunity_score, trend_direction").eq("is_active", true).limit(1200),
    ]);

    const opportunityRows = (opportunities as SeoOpportunity[] | null) || [];
    const ctrRows = (ctr as CtrOptimization[] | null) || [];
    const moneyRows = (moneyPages as MoneyPageScore[] | null) || [];
    const linkRows = (links as InternalLinkOpportunity[] | null) || [];
    const gapRows = (gaps as ContentGapOpportunity[] | null) || [];
    const freshnessRows = (freshness as FreshnessRecommendation[] | null) || [];
    const aeoRows = (aeo as AeoOptimization[] | null) || [];
    const competitorRows = (competitors as CompetitorInsight[] | null) || [];
    const weeklyRows = (weeklyTasks as WeeklyTask[] | null) || [];
    const keywordRows = (keywords as KeywordRow[] | null) || [];

    const queue = new Map<string, QueueItem>();

    for (const item of opportunityRows.slice(0, 20)) {
      const impressions = Number((item.signals?.impressions_28d as number | undefined) || 0);
      addQueue(queue, {
        task: `Improve ranking opportunity for ${item.keyword}`,
        source: "Opportunity Radar",
        url: item.target_url,
        priority_score: item.score,
        priority_level: scoreToPriority(item.score),
        risk_level: "medium",
        expected_traffic_impact: trafficImpact(impressions),
        expected_revenue_impact: revenueImpact(item.score, item.target_url, item.keyword),
        prompt: prompt(item.recommended_action, item.target_url, item.reason),
        approval_status: "pending",
      });
    }

    for (const item of ctrRows.slice(0, 20)) {
      addQueue(queue, {
        task: `Lift CTR for ${pageLabel(item.page_url)}`,
        source: "CTR Engine",
        url: item.page_url,
        priority_score: item.priority_score,
        priority_level: scoreToPriority(item.priority_score),
        risk_level: "low",
        expected_traffic_impact: trafficImpact(item.impressions_28d, item.estimated_missed_clicks),
        expected_revenue_impact: "Medium-high: captures more clicks without waiting for ranking movement.",
        prompt: prompt(`Review title "${item.suggested_title}" and meta "${item.suggested_meta_description}" for approval.`, item.page_url, item.reason),
        approval_status: "pending",
      });
    }

    for (const item of moneyRows.slice(0, 16)) {
      addQueue(queue, {
        task: `Prioritize high-RPM page ${item.page_title}`,
        source: "Money Pages",
        url: item.page_url,
        priority_score: item.money_score,
        priority_level: scoreToPriority(item.money_score),
        risk_level: "medium",
        expected_traffic_impact: "Medium-high: improves a calculator page with revenue and engagement upside.",
        expected_revenue_impact: revenueImpact(item.money_score, item.page_url, item.page_title),
        prompt: prompt(item.recommended_action, item.page_url, item.reason),
        approval_status: "pending",
      });
    }

    for (const item of gapRows.slice(0, 18)) {
      addQueue(queue, {
        task: `Close content gap: ${item.keyword_topic || item.gap_type}`,
        source: "Content Gaps",
        url: item.affected_url,
        priority_score: item.priority_score,
        priority_level: scoreToPriority(item.priority_score),
        risk_level: item.gap_type.includes("suburb") || item.gap_type.includes("state") ? "high" : "medium",
        expected_traffic_impact: item.estimated_traffic_opportunity > 0 ? `High: estimated ${item.estimated_traffic_opportunity.toLocaleString()} monthly visits available.` : trafficImpact(0),
        expected_revenue_impact: revenueImpact(item.priority_score, item.affected_url, item.keyword_topic || item.suggested_content_type),
        prompt: prompt(item.suggested_fix, item.affected_url, `Gap type: ${item.gap_type}. Suggested content type: ${item.suggested_content_type}.`),
        approval_status: "pending",
      });
    }

    for (const item of linkRows.slice(0, 24)) {
      const score = priorityWeight(item.priority);
      addQueue(queue, {
        task: `Add internal link to ${pageLabel(item.target_page)}`,
        source: "Internal Linking",
        url: item.source_page,
        priority_score: score,
        priority_level: scoreToPriority(score),
        risk_level: "low",
        expected_traffic_impact: "Medium: improves crawl depth and topical authority.",
        expected_revenue_impact: revenueImpact(score, item.target_page),
        prompt: prompt(`Add contextual link to ${item.target_page} using anchor "${item.suggested_anchor_text}".`, item.source_page, item.reason),
        approval_status: "pending",
      });
    }

    for (const item of freshnessRows.slice(0, 16)) {
      const score = clamp(100 - item.freshness_score);
      addQueue(queue, {
        task: `Refresh stale finance content for ${item.page_title}`,
        source: "Freshness Engine",
        url: item.page_url,
        priority_score: score,
        priority_level: scoreToPriority(score),
        risk_level: "low",
        expected_traffic_impact: "Medium: freshness protects trust and finance ranking stability.",
        expected_revenue_impact: "Medium: protects finance RPM by keeping trust-sensitive content current.",
        prompt: prompt(asStrings(item.recommended_updates).join(" ") || "Review stale finance assumptions and update after approval.", item.page_url, `Freshness score ${item.freshness_score}/100. Outdated sections: ${asStrings(item.outdated_sections).join(", ") || "review required"}.`),
        approval_status: "pending",
      });
    }

    for (const item of aeoRows.slice(0, 16)) {
      const score = clamp(100 - item.aeo_score + Math.max(0, 70 - item.snippet_readiness_score) / 2);
      addQueue(queue, {
        task: `Improve answer readiness for ${item.page_title}`,
        source: "AEO signals",
        url: item.page_url,
        priority_score: score,
        priority_level: scoreToPriority(score),
        risk_level: "low",
        expected_traffic_impact: "Medium: improves AI Overview, snippet and conversational-search eligibility.",
        expected_revenue_impact: "Medium: protects calculator discovery as AI search usage grows.",
        prompt: prompt(asStrings(item.recommended_improvements).join(" ") || "Add concise answer blocks, FAQs and semantic headings after approval.", item.page_url, `AEO ${item.aeo_score}/100, snippet readiness ${item.snippet_readiness_score}/100, confidence ${item.answer_confidence_score}/100.`),
        approval_status: "pending",
      });
    }

    for (const item of competitorRows.slice(0, 16)) {
      addQueue(queue, {
        task: `Respond to competitor movement: ${item.detected_topic}`,
        source: "Competitor Tracking",
        url: "/guides",
        priority_score: item.priority_score,
        priority_level: scoreToPriority(item.priority_score),
        risk_level: "medium",
        expected_traffic_impact: "Medium-high: responds before competitor topic gaps widen.",
        expected_revenue_impact: revenueImpact(item.priority_score, "/guides", item.detected_topic),
        prompt: prompt(item.recommended_response, "/guides", `${item.competitor_domain}: ${item.estimated_opportunity}`),
        approval_status: "pending",
      });
    }

    for (const item of weeklyRows.slice(0, 10)) {
      addQueue(queue, {
        task: item.task_title,
        source: "Weekly Plans",
        url: item.affected_url,
        priority_score: item.priority_score,
        priority_level: scoreToPriority(item.priority_score),
        risk_level: item.risk_level,
        expected_traffic_impact: item.expected_traffic_impact || "Derived from weekly plan.",
        expected_revenue_impact: item.expected_revenue_impact || revenueImpact(item.priority_score, item.affected_url),
        prompt: item.suggested_implementation_prompt,
        approval_status: "pending",
      });
    }

    for (const row of keywordRows) {
      if (row.calcy_position == null || row.calcy_position_previous == null) continue;
      const decline = row.calcy_position - row.calcy_position_previous;
      if (decline < 3 || (row.calcy_impressions_28d || 0) < 20) continue;
      const score = clamp(60 + Math.min(20, decline * 3) + Math.min(20, (row.calcy_impressions_28d || 0) / 100));
      addQueue(queue, {
        task: `Review traffic decline for ${row.keyword}`,
        source: "Impact Tracking",
        url: row.target_page || "/guides",
        priority_score: score,
        priority_level: scoreToPriority(score),
        risk_level: "medium",
        expected_traffic_impact: trafficImpact(row.calcy_impressions_28d || 0),
        expected_revenue_impact: revenueImpact(score, row.target_page || "", row.category || row.keyword),
        prompt: prompt(`Audit ranking decline for "${row.keyword}".`, row.target_page || "/guides", `Position moved from ${row.calcy_position_previous} to ${row.calcy_position}.`),
        approval_status: "pending",
      });
    }

    const sortedQueue = Array.from(queue.values()).sort((a, b) => b.priority_score - a.priority_score);
    const topUrgent = sortedQueue.filter((item) => item.priority_level === "high" || item.risk_level !== "low").slice(0, 3);
    const highestRoi = sortedQueue[0] || null;
    const fastestPageOne = opportunityRows
      .filter((row) => {
        const position = Number(row.signals?.position || 99);
        return position >= 4 && position <= 12;
      })
      .sort((a, b) => b.score - a.score)[0] || null;
    const highestConfidence = sortedQueue
      .map((item) => ({ ...item, confidence: clamp(item.priority_score - (item.risk_level === "high" ? 20 : item.risk_level === "medium" ? 8 : 0)) }))
      .sort((a, b) => b.confidence - a.confidence)[0] || null;
    const biggestDecline = keywordRows
      .filter((row) => row.calcy_position != null && row.calcy_position_previous != null)
      .map((row) => ({ ...row, decline: (row.calcy_position || 0) - (row.calcy_position_previous || 0) }))
      .filter((row) => row.decline > 0)
      .sort((a, b) => (b.decline * ((b.calcy_impressions_28d || 0) + 1)) - (a.decline * ((a.calcy_impressions_28d || 0) + 1)))[0] || null;
    const highestRpm = moneyRows[0] || null;
    const winningPattern = findWinningPattern(sortedQueue, moneyRows, gapRows);
    const riskAlerts = [
      ...freshnessRows.filter((item) => item.freshness_score < 55).slice(0, 4).map((item) => ({ type: "freshness", url: item.page_url, message: `${item.page_title} freshness score is ${item.freshness_score}/100.` })),
      ...keywordRows.filter((row) => row.calcy_position != null && row.calcy_position_previous != null && row.calcy_position - row.calcy_position_previous >= 3).slice(0, 4).map((row) => ({ type: "traffic_decline", url: row.target_page, message: `${row.keyword} dropped from ${row.calcy_position_previous} to ${row.calcy_position}.` })),
      ...aeoRows.filter((item) => item.aeo_score < 55).slice(0, 3).map((item) => ({ type: "aeo", url: item.page_url, message: `${item.page_title} AEO score is ${item.aeo_score}/100.` })),
    ].slice(0, 10);

    const estimatedTraffic = Math.round(
      ctrRows.slice(0, 10).reduce((sum, row) => sum + (row.estimated_missed_clicks || 0), 0) +
      gapRows.slice(0, 10).reduce((sum, row) => sum + (row.estimated_traffic_opportunity || 0), 0) +
      opportunityRows.slice(0, 10).reduce((sum, row) => sum + Number(row.signals?.impressions_28d || 0) * 0.04, 0),
    );
    const confidenceScore = clamp(45 + Math.min(25, sortedQueue.length * 2) + Math.min(15, opportunityRows.length + ctrRows.length + moneyRows.length) - (riskAlerts.length > 6 ? 5 : 0));

    const briefing = {
      briefing_date: briefingDate,
      daily_summary: sortedQueue.length > 0
        ? `Daily SEO briefing generated ${sortedQueue.length} candidate actions. Focus today on ${topUrgent.map((item) => item.source).join(", ") || "monitoring"} with ${confidenceScore}/100 confidence.`
        : "No daily SEO actions generated yet. Run the source engines first to produce enough signal.",
      top_urgent_actions: topUrgent,
      highest_roi_opportunity: highestRoi || {},
      fastest_page_one_opportunity: fastestPageOne ? {
        keyword: fastestPageOne.keyword,
        url: fastestPageOne.target_url,
        score: fastestPageOne.score,
        reason: fastestPageOne.reason,
        position: fastestPageOne.signals?.position ?? null,
        recommended_action: fastestPageOne.recommended_action,
      } : {},
      highest_confidence_recommendation: highestConfidence || {},
      biggest_traffic_decline: biggestDecline ? {
        keyword: biggestDecline.keyword,
        url: biggestDecline.target_page,
        previous_position: biggestDecline.calcy_position_previous,
        current_position: biggestDecline.calcy_position,
        impressions_28d: biggestDecline.calcy_impressions_28d,
      } : {},
      highest_rpm_opportunity: highestRpm ? {
        page_url: highestRpm.page_url,
        page_title: highestRpm.page_title,
        money_score: highestRpm.money_score,
        recommended_action: highestRpm.recommended_action,
      } : {},
      best_winning_pattern: winningPattern,
      risk_alerts: riskAlerts,
      suggested_implementation_queue: sortedQueue.slice(0, 10),
      confidence_score: confidenceScore,
      estimated_traffic_opportunity: estimatedTraffic,
      estimated_revenue_opportunity: estimatedTraffic > 0 ? `Indicative: ${estimatedTraffic.toLocaleString()} visits/month at finance RPM could materially improve AdSense revenue. Validate RPM in AdSense before forecasting.` : "Not enough traffic estimate data yet.",
      seo_trend_overview: {
        tracked_keywords: keywordRows.length,
        rising_keywords: keywordRows.filter((row) => row.trend_direction === "rising").slice(0, 8).map((row) => row.keyword),
        ranking_declines: riskAlerts.filter((alert) => alert.type === "traffic_decline").length,
        open_opportunities: opportunityRows.length,
        open_ctr_items: ctrRows.length,
        open_content_gaps: gapRows.length,
      },
      data_sources: {
        opportunity_radar: opportunityRows.length,
        weekly_plans: weeklyRows.length,
        winning_patterns: winningPattern.evidence.length,
        impact_tracking: keywordRows.filter((row) => row.calcy_position !== row.calcy_position_previous).length,
        ctr_engine: ctrRows.length,
        content_gaps: gapRows.length,
        internal_linking: linkRows.length,
        money_pages: moneyRows.length,
        aeo_signals: aeoRows.length,
        freshness_engine: freshnessRows.length,
        competitor_tracking: competitorRows.length,
        decision_intelligence_reasoning: sortedQueue.length,
      },
      approval_status: "pending",
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("daily_seo_briefings")
      .upsert(briefing, { onConflict: "briefing_date" });
    if (error) throw error;

    await supabase.from("seo_reports").insert({
      report_type: "daily_seo_briefing",
      content_recommendations: sortedQueue.slice(0, 10),
      competitor_alerts: competitorRows.slice(0, 5),
      full_report_data: briefing,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      records_checked: opportunityRows.length + ctrRows.length + moneyRows.length + linkRows.length + gapRows.length + freshnessRows.length + aeoRows.length + competitorRows.length + weeklyRows.length + keywordRows.length,
      records_updated: sortedQueue.slice(0, 10).length,
      summary: {
        briefing_date: briefingDate,
        confidence_score: confidenceScore,
        estimated_traffic_opportunity: estimatedTraffic,
        queue_items: sortedQueue.length,
        urgent_actions: topUrgent.length,
      },
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, briefing }), {
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
