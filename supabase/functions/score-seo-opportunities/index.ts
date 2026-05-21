import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifyKeyword } from "../_shared/seoQuality.ts";
import { matchPatterns, hasEnoughLearningData, INSUFFICIENT_LEARNING_DATA, type WinningPattern } from "../_shared/patternMatch.ts";
import { buildReasoning } from "../_shared/decisionIntelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-triggered-by",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type KeywordRow = {
  id: string;
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_clicks_28d: number | null;
  calcy_impressions_28d: number | null;
  calcy_ctr_28d: number | null;
  monthly_search_volume: number | null;
  trend_direction: string | null;
  content_gap_notes: string | null;
  last_synced_at: string | null;
};

type DraftRow = {
  target_keyword: string | null;
  slug: string | null;
  status: string;
};

type Opportunity = {
  keyword: string;
  target_url: string;
  score: number;
  priority: "high" | "medium" | "low";
  reason: string;
  recommended_action: string;
  source_keyword_id: string;
  signals: Record<string, unknown>;
};

type PageStats = {
  keywordCount: number;
  impressions: number;
  clicks: number;
  positionDrops: number;
  weightedPositionSum: number;
  weakContentSignals: number;
};

const HIGH_VALUE_TOPICS = [
  "mortgage",
  "home loan",
  "repayment",
  "borrowing power",
  "stamp duty",
  "transfer duty",
  "lmi",
  "lenders mortgage insurance",
  "hecs",
  "help debt",
  "refinance",
  "extra repayment",
  "offset",
  "first home buyer",
  "investment property",
  "rba",
  "interest rate",
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function expectedCtr(position: number | null): number {
  if (position == null) return 0.02;
  if (position <= 1) return 0.28;
  if (position <= 2) return 0.16;
  if (position <= 3) return 0.11;
  if (position <= 5) return 0.07;
  if (position <= 10) return 0.035;
  if (position <= 20) return 0.015;
  return 0.008;
}

function priorityFor(score: number): "high" | "medium" | "low" {
  if (score >= 72) return "high";
  if (score >= 46) return "medium";
  return "low";
}

function normaliseTargetUrl(targetPage: string | null, category: string | null): string {
  if (targetPage?.startsWith("/")) return targetPage;
  const map: Record<string, string> = {
    mortgage: "/mortgage-calculator",
    stamp_duty: "/stamp-duty-calculator",
    lmi: "/lmi-calculator",
    borrowing_power: "/borrowing-power-calculator",
    refinance: "/refinance-calculator",
    rent_vs_buy: "/rent-vs-buy-calculator",
    extra_repayments: "/extra-repayments-calculator",
    loan_comparison: "/loan-comparison-calculator",
  };
  return map[category || ""] || "/guides";
}

function highValueTopic(keyword: string, category: string | null) {
  const text = `${keyword} ${category || ""}`.toLowerCase();
  return HIGH_VALUE_TOPICS.find((topic) => text.includes(topic)) || null;
}

function keywordMatchesTarget(keyword: string, targetUrl: string) {
  if (!targetUrl || targetUrl === "/guides") return false;
  const targetText = targetUrl.replace(/[-/]/g, " ").toLowerCase();
  return keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 3)
    .some((part) => targetText.includes(part));
}

function actionPartsFor(signals: string[]) {
  const parts: string[] = [];
  if (signals.includes("high_impressions_low_ctr") || signals.includes("near_page_1")) {
    parts.push("strengthen the title/meta description and above-the-fold answer");
  }
  if (signals.includes("ranking_8_to_20")) {
    parts.push("add a focused comparison table or answer block");
  }
  if (signals.includes("needs_content_refresh") || signals.includes("page_declining")) {
    parts.push("refresh assumptions, source notes and reviewed date");
  }
  if (signals.includes("keyword_without_strong_matching_content")) {
    parts.push("add a dedicated section or admin-reviewed content brief");
  }
  if (signals.includes("weak_internal_linking")) {
    parts.push("add contextual internal links from related calculators and guides");
  }
  if (signals.includes("high_value_finance_topic")) {
    parts.push("prioritise this as a finance money-topic opportunity");
  }
  return [...new Set(parts)];
}

function pageLabel(url: string): string {
  if (url.includes("mortgage")) return "Mortgage Calculator";
  if (url.includes("borrowing-power")) return "Borrowing Power Calculator";
  if (url.includes("stamp-duty")) return "Stamp Duty Calculator";
  if (url.includes("lmi")) return "LMI Calculator";
  if (url.includes("hecs")) return "HECS Borrowing Power Calculator";
  if (url.includes("refinance")) return "Refinance Calculator";
  if (url.includes("extra-repayments")) return "Extra Repayments Calculator";
  if (url.includes("loan-comparison")) return "Loan Comparison Calculator";
  if (url.includes("rent-vs-buy")) return "Rent vs Buy Calculator";
  return "Australian Finance page";
}

function buildRecommendation(
  row: KeywordRow,
  targetUrl: string,
  signals: string[],
  quality: { intent: string; financeScore: number; confidence: string },
): string {
  const position = row.calcy_position ?? 99;
  const label = pageLabel(targetUrl);
  const actions = actionPartsFor(signals);
  if (quality.intent === "calculator" || quality.intent === "transactional") {
    actions.unshift(`align ${label} above-the-fold copy to ${quality.intent} intent for "${row.keyword}"`);
  } else if (quality.intent === "comparison") {
    actions.unshift(`add or expand a comparison/options table relevant to "${row.keyword}"`);
  }
  if (quality.financeScore >= 8) {
    actions.push("add FAQ schema with 3-5 finance-specific Q&As and clear Australian assumptions");
  }
  const actionText = actions.length > 0 ? actions.join("; ") : "review intent match and internal links";
  return `${row.keyword} ranks ~position ${position.toFixed(1)} on ${label} (${targetUrl}) with ${(row.calcy_impressions_28d ?? 0).toLocaleString()} impressions and ${((row.calcy_ctr_28d ?? 0) * 100).toFixed(1)}% CTR (confidence: ${quality.confidence}). Recommended: ${actionText}. Admin-only suggestion — do not auto-publish or change URLs.`;
}

function scoreKeyword(row: KeywordRow, draftKeywords: Set<string>, pageStats: Map<string, PageStats>): Opportunity | null {
  const impressions = row.calcy_impressions_28d ?? 0;
  const clicks = row.calcy_clicks_28d ?? 0;
  const ctr = row.calcy_ctr_28d ?? (impressions > 0 ? clicks / impressions : 0);
  const position = row.calcy_position;

  const quality = classifyKeyword({
    keyword: row.keyword,
    category: row.category,
    impressions,
    clicks,
    ctr,
    position,
  });

  // Hard gate: drop noisy / non-finance / navigational keywords entirely.
  if (quality.isNoise) return null;
  if (!quality.isFinance && quality.intent !== "calculator") return null;
  if (quality.intent === "navigational") return null;

  const previous = row.calcy_position_previous;
  const targetUrl = normaliseTargetUrl(row.target_page, row.category);
  const expected = expectedCtr(position);
  const ctrGap = Math.max(0, expected - ctr);
  const positionDrop = previous != null && position != null ? position - previous : 0;
  const syncedAt = row.last_synced_at ? new Date(row.last_synced_at).getTime() : 0;
  const daysSinceSync = syncedAt ? Math.floor((Date.now() - syncedAt) / 86400000) : 999;
  const hasDraft = draftKeywords.has(row.keyword.toLowerCase());
  const topic = highValueTopic(row.keyword, row.category);
  const page = pageStats.get(targetUrl);
  const pageAvgPosition = page && page.impressions > 0 ? page.weightedPositionSum / page.impressions : null;
  const hasStrongMatchingContent = keywordMatchesTarget(row.keyword, targetUrl);
  const signals: string[] = [];

  let score = 0;

  if (position != null && position >= 8 && position <= 12) {
    signals.push("near_page_1");
    score += 22 + (12 - position) * 2;
  }

  if (position != null && position >= 8 && position <= 20) {
    signals.push("ranking_8_to_20");
    score += clamp(30 - (position - 8) * 1.4, 10, 30);
  }

  if (impressions >= 50 && ctr < expected * 0.75) {
    signals.push("high_impressions_low_ctr");
    score += clamp(Math.log10(impressions + 1) * 11 + ctrGap * 220, 8, 32);
  }

  if (topic) {
    signals.push("high_value_finance_topic");
    score += 12;
  }

  if (positionDrop >= 2 || row.trend_direction === "falling" || (page?.positionDrops || 0) >= 2) {
    signals.push("page_declining");
    score += clamp(Math.max(positionDrop, page?.positionDrops || 0) * 5, 10, 24);
  }

  if (daysSinceSync > 30) {
    signals.push("needs_content_refresh");
    score += daysSinceSync > 90 ? 18 : daysSinceSync > 60 ? 14 : 9;
  }

  if (targetUrl === "/guides" || row.content_gap_notes || !row.target_page || !hasStrongMatchingContent) {
    signals.push("keyword_without_strong_matching_content");
    score += hasDraft ? 8 : 18;
  }

  if (impressions >= 50 && targetUrl !== "/" && targetUrl !== "/guides" && position != null && position > 7) {
    signals.push("weak_internal_linking");
    score += 10;
  }

  // Finance intent + CPC boost
  score += quality.financeScore * 1.5;
  if (quality.intent === "calculator" || quality.intent === "transactional") score += 8;
  if (quality.intent === "comparison") score += 5;

  if (signals.length === 0 || score < 28) return null;

  const roundedScore = Math.round(clamp(score));
  const reasonParts = signals.map((signal) => {
    if (signal === "near_page_1") return `near page 1 at average position ${position?.toFixed(1)}`;
    if (signal === "ranking_8_to_20") return `ranking position ${position?.toFixed(1)} is within the 8-20 improvement band`;
    if (signal === "high_impressions_low_ctr") return `${impressions.toLocaleString()} impressions with ${(ctr * 100).toFixed(1)}% CTR below expected ${(expected * 100).toFixed(1)}%`;
    if (signal === "high_value_finance_topic") return topic ? `high-value Australian finance topic: ${topic}` : "high-value finance topic";
    if (signal === "page_declining") return previous != null && position != null ? `position declined from ${previous.toFixed(1)} to ${position.toFixed(1)}` : `${targetUrl} has multiple ranking drops`;
    if (signal === "needs_content_refresh") return daysSinceSync === 999 ? "keyword has no recent sync timestamp" : `content/data signal is ${daysSinceSync} days old`;
    if (signal === "weak_internal_linking") return `target page ${targetUrl} likely needs stronger contextual internal links`;
    return hasDraft ? "existing draft should be reviewed against this keyword" : "keyword does not strongly match the current target content";
  });

  return {
    keyword: row.keyword,
    target_url: targetUrl,
    score: roundedScore,
    priority: priorityFor(roundedScore),
    reason: reasonParts.join("; "),
    recommended_action: buildRecommendation(row, targetUrl, signals, quality),
    source_keyword_id: row.id,
    signals: {
      signals,
      intent: quality.intent,
      confidence: quality.confidence,
      finance_relevance_score: quality.financeScore,
      quality_score: quality.qualityScore,
      category: row.category,
      impressions_28d: impressions,
      clicks_28d: clicks,
      ctr_28d: ctr,
      expected_ctr: expected,
      position,
      average_position: position,
      previous_position: previous,
      position_drop: positionDrop,
      days_since_sync: daysSinceSync,
      has_existing_draft: hasDraft,
      high_value_topic: topic,
      target_has_strong_match: hasStrongMatchingContent,
      page_keyword_count: page?.keywordCount || 0,
      page_impressions_28d: page?.impressions || impressions,
      page_clicks_28d: page?.clicks || clicks,
      page_average_position: pageAvgPosition,
      page_position_drops: page?.positionDrops || 0,
      monthly_search_volume: row.monthly_search_volume,
    },
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
  const startedAt = new Date();

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "seo_opportunity_scoring",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: keywordRows, error: keywordError }, { data: drafts, error: draftError }, { data: patternsData }] = await Promise.all([
      supabase.from("seo_keywords").select("*").eq("is_active", true),
      supabase.from("content_drafts").select("target_keyword, slug, status"),
      supabase.from("seo_winning_patterns").select("*").in("status", ["winning", "risky"]),
    ]);

    if (keywordError) throw keywordError;
    if (draftError) throw draftError;

    const draftKeywords = new Set(
      ((drafts as DraftRow[] | null) || [])
        .map((draft) => draft.target_keyword?.trim().toLowerCase())
        .filter((keyword): keyword is string => Boolean(keyword)),
    );

    const allKeywords = (keywordRows as KeywordRow[] | null) || [];

    // Pre-filter pass: drop noisy / non-finance keywords from pageStats AND scoring.
    const filterLog: { keyword: string; reason: string }[] = [];
    const cleanKeywords: KeywordRow[] = [];
    for (const row of allKeywords) {
      const q = classifyKeyword({
        keyword: row.keyword,
        category: row.category,
        impressions: row.calcy_impressions_28d,
        clicks: row.calcy_clicks_28d,
        ctr: row.calcy_ctr_28d,
        position: row.calcy_position,
      });
      if (q.isNoise) {
        filterLog.push({ keyword: row.keyword, reason: q.noiseReason || "noise" });
        continue;
      }
      if (!q.isFinance && q.intent !== "calculator") {
        filterLog.push({ keyword: row.keyword, reason: "non_finance_irrelevant" });
        continue;
      }
      if (q.intent === "navigational") {
        filterLog.push({ keyword: row.keyword, reason: "navigational_branded" });
        continue;
      }
      cleanKeywords.push(row);
    }

    const pageStats = new Map<string, PageStats>();
    for (const row of cleanKeywords) {
      const targetUrl = normaliseTargetUrl(row.target_page, row.category);
      const impressions = row.calcy_impressions_28d ?? 0;
      const clicks = row.calcy_clicks_28d ?? 0;
      const position = row.calcy_position ?? 99;
      const previous = row.calcy_position_previous;
      const positionDrop = previous != null && row.calcy_position != null ? row.calcy_position - previous : 0;
      const current = pageStats.get(targetUrl) || {
        keywordCount: 0,
        impressions: 0,
        clicks: 0,
        positionDrops: 0,
        weightedPositionSum: 0,
        weakContentSignals: 0,
      };
      current.keywordCount += 1;
      current.impressions += impressions;
      current.clicks += clicks;
      current.weightedPositionSum += position * Math.max(impressions, 1);
      if (positionDrop >= 2 || row.trend_direction === "falling") current.positionDrops += 1;
      if (!keywordMatchesTarget(row.keyword, targetUrl)) current.weakContentSignals += 1;
      pageStats.set(targetUrl, current);
    }

    const patterns = (patternsData as WinningPattern[] | null) || [];
    const patternsReady = hasEnoughLearningData(patterns);

    const opportunities = cleanKeywords
      .map((row) => scoreKeyword(row, draftKeywords, pageStats))
      .filter((row): row is Opportunity => Boolean(row))
      .map((opp) => {
        const sig = opp.signals as Record<string, unknown>;
        if (!patternsReady) {
          (sig as any).pattern_match_score = 0;
          (sig as any).matched_pattern_ids = [];
          (sig as any).pattern_reason = INSUFFICIENT_LEARNING_DATA;
          (sig as any).risk_pattern_warning = null;
          (sig as any).reasoning = buildReasoning({
            kind: "opportunity",
            keyword: opp.keyword,
            target_url: opp.target_url,
            intent: String(sig.intent || ""),
            confidence: String(sig.confidence || ""),
            score: opp.score,
            priority: opp.priority,
            impressions_28d: Number(sig.impressions_28d || 0),
            clicks_28d: Number(sig.clicks_28d || 0),
            ctr_28d: Number(sig.ctr_28d || 0),
            expected_ctr: Number(sig.expected_ctr || 0),
            position: sig.position == null ? null : Number(sig.position),
            previous_position: sig.previous_position == null ? null : Number(sig.previous_position),
            learning_data_ready: false,
            signals: Array.isArray(sig.signals) ? (sig.signals as string[]) : [],
          });
          return opp;
        }
        const match = matchPatterns(patterns, {
          url: opp.target_url,
          keywordIntent: String(sig.intent || ""),
        });
        // Adjust score by up to +/-10 based on pattern match
        const adjusted = Math.max(0, Math.min(100, opp.score + Math.round(match.pattern_match_score * 10)));
        (sig as any).pattern_match_score = match.pattern_match_score;
        (sig as any).matched_pattern_ids = match.matched_pattern_ids;
        (sig as any).pattern_reason = match.pattern_reason;
        (sig as any).risk_pattern_warning = match.risk_pattern_warning;
        (sig as any).reasoning = buildReasoning({
          kind: "opportunity",
          keyword: opp.keyword,
          target_url: opp.target_url,
          intent: String(sig.intent || ""),
          confidence: String(sig.confidence || ""),
          score: adjusted,
          priority: opp.priority,
          impressions_28d: Number(sig.impressions_28d || 0),
          clicks_28d: Number(sig.clicks_28d || 0),
          ctr_28d: Number(sig.ctr_28d || 0),
          expected_ctr: Number(sig.expected_ctr || 0),
          position: sig.position == null ? null : Number(sig.position),
          previous_position: sig.previous_position == null ? null : Number(sig.previous_position),
          pattern_match_score: match.pattern_match_score,
          pattern_reason: match.pattern_reason,
          risk_pattern_warning: match.risk_pattern_warning,
          matched_pattern_ids: match.matched_pattern_ids,
          learning_data_ready: true,
          signals: Array.isArray(sig.signals) ? (sig.signals as string[]) : [],
        });
        return { ...opp, score: adjusted };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    if (opportunities.length > 0) {
      const { error: upsertError } = await supabase
        .from("seo_opportunities")
        .upsert(
          opportunities.map((opportunity) => ({
            ...opportunity,
            status: "open",
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "keyword,target_url" },
        );
      if (upsertError) throw upsertError;
    }

    const summary = {
      total_keywords_checked: allKeywords.length,
      noisy_keywords_filtered: filterLog.length,
      finance_keywords_evaluated: cleanKeywords.length,
      opportunities_scored: opportunities.length,
      high_priority: opportunities.filter((item) => item.priority === "high").length,
      medium_priority: opportunities.filter((item) => item.priority === "medium").length,
      low_priority: opportunities.filter((item) => item.priority === "low").length,
      high_confidence: opportunities.filter((o) => (o.signals as Record<string, unknown>).confidence === "high").length,
      ignored_sample: filterLog.slice(0, 25),
    };

    await supabase.from("seo_reports").insert({
      report_type: "opportunity_scoring",
      total_keywords_tracked: summary.total_keywords_checked,
      top_opportunities: opportunities.slice(0, 20),
      content_recommendations: opportunities.slice(0, 20).map((item) => ({
        keyword: item.keyword,
        target_url: item.target_url,
        score: item.score,
        priority: item.priority,
        reason: item.reason,
        action: item.recommended_action,
      })),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: summary.total_keywords_checked,
      records_updated: opportunities.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, opportunities: opportunities.slice(0, 20) }), {
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
