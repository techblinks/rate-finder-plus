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

type KeywordRow = {
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_clicks_28d: number | null;
  calcy_impressions_28d: number | null;
  calcy_ctr_28d: number | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  trend_direction: string | null;
};

type CtrSuggestion = {
  page_url: string;
  primary_keyword: string;
  impressions_28d: number;
  clicks_28d: number;
  ctr_28d: number;
  position: number | null;
  estimated_missed_clicks: number;
  ctr_opportunity_score: number;
  suggested_title: string;
  suggested_meta_description: string;
  suggested_intro: string;
  suggested_faq_snippet: string;
  suggested_featured_snippet_answer: string;
  suggested_emotional_trigger: string;
  suggested_semantic_improvements: string;
  suggested_search_intent_match: string;
  reason: string;
  priority_score: number;
  signals: Record<string, unknown>;
};

type PageCtrStats = {
  page: string;
  rows: KeywordRow[];
  impressions: number;
  clicks: number;
  ctr: number;
  position: number | null;
  expectedCtr: number;
  missedClicks: number;
  topKeyword: KeywordRow;
  decliningClicks: boolean;
};

function expectedCtr(position: number | null): number {
  if (position == null) return 0.02;
  if (position <= 1) return 0.3;
  if (position <= 2) return 0.17;
  if (position <= 3) return 0.115;
  if (position <= 5) return 0.075;
  if (position <= 7) return 0.052;
  if (position <= 10) return 0.035;
  if (position <= 15) return 0.022;
  if (position <= 20) return 0.014;
  return 0.008;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function targetPageFor(row: KeywordRow) {
  if (row.target_page?.startsWith("/")) return row.target_page.replace(/\/$/, "") || "/";
  const map: Record<string, string> = {
    mortgage: "/mortgage-calculator",
    borrowing_power: "/borrowing-power-calculator",
    stamp_duty: "/stamp-duty-calculator",
    lmi: "/lmi-calculator",
    refinance: "/refinance-calculator",
    extra_repayments: "/extra-repayments-calculator",
    loan_comparison: "/loan-comparison-calculator",
    rent_vs_buy: "/rent-vs-buy-calculator",
  };
  return map[row.category || ""] || "/guides";
}

function titleCaseKeyword(keyword: string) {
  return keyword
    .split(/\s+/)
    .map((part) => part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pageLabel(url: string) {
  if (url.includes("mortgage")) return "Mortgage Calculator";
  if (url.includes("borrowing-power")) return "Borrowing Power Calculator";
  if (url.includes("stamp-duty")) return "Stamp Duty Calculator";
  if (url.includes("lmi")) return "LMI Calculator";
  if (url.includes("hecs")) return "HECS Borrowing Power Calculator";
  if (url.includes("refinance")) return "Refinance Calculator";
  if (url.includes("extra-repayments")) return "Extra Repayments Calculator";
  if (url.includes("loan-comparison")) return "Loan Comparison Calculator";
  if (url.includes("rent-vs-buy")) return "Rent vs Buy Calculator";
  return "Australian Finance Guide";
}

function categoryIntent(category: string | null, keyword: string) {
  const lower = `${category || ""} ${keyword}`.toLowerCase();
  if (lower.includes("stamp")) return "upfront buying cost";
  if (lower.includes("borrow")) return "borrowing capacity";
  if (lower.includes("lmi")) return "deposit and LMI cost";
  if (lower.includes("refinance")) return "switching and savings";
  if (lower.includes("extra")) return "paying off the loan faster";
  if (lower.includes("hecs") || lower.includes("help")) return "study debt borrowing impact";
  return "repayment planning";
}

function titleFor(stats: PageCtrStats) {
  const keyword = titleCaseKeyword(stats.topKeyword.keyword);
  const label = pageLabel(stats.page);
  const base = `${keyword} Australia - ${label} | Calcy`;
  if (base.length <= 65) return base;
  const shorter = `${label}: ${keyword} | Calcy`;
  return shorter.length <= 65 ? shorter : `${keyword} | Calcy`;
}

function metaFor(stats: PageCtrStats) {
  const intent = categoryIntent(stats.topKeyword.category, stats.topKeyword.keyword);
  const label = pageLabel(stats.page).replace(" Calculator", " calculator");
  return `Estimate ${stats.topKeyword.keyword} with Calcy's ${label}. Clear Australian assumptions for ${intent}, useful FAQs, and no sign-up required.`;
}

function introFor(stats: PageCtrStats) {
  return `Use this ${pageLabel(stats.page).toLowerCase()} to estimate ${stats.topKeyword.keyword} with Australian assumptions. Compare scenarios, check the key limitations, and treat the result as a planning estimate rather than financial advice.`;
}

function faqFor(stats: PageCtrStats) {
  const keyword = stats.topKeyword.keyword;
  return `Why does ${keyword} vary? It depends on your loan size, deposit, property state, interest rate, lender policy and timing. Use Calcy to estimate the range, then confirm details with your lender or adviser.`;
}

function featuredAnswerFor(stats: PageCtrStats) {
  const label = pageLabel(stats.page).toLowerCase();
  return `${titleCaseKeyword(stats.topKeyword.keyword)} can be estimated by entering the relevant loan, rate, deposit and property details into Calcy's ${label}. The result is an Australian planning estimate and should be checked against current lender or government rules.`;
}

function emotionalTrigger(stats: PageCtrStats) {
  const intent = categoryIntent(stats.topKeyword.category, stats.topKeyword.keyword);
  if (intent.includes("cost")) return "Make the SERP copy reduce uncertainty around upfront costs and clearly say the estimate is fast, transparent and Australian.";
  if (intent.includes("capacity")) return "Emphasise confidence and budget clarity without implying approval certainty.";
  if (intent.includes("savings")) return "Frame the page around finding possible savings while avoiding guaranteed savings claims.";
  return "Use calm, practical wording that promises clarity, not financial advice or guaranteed outcomes.";
}

function semanticImprovements(stats: PageCtrStats) {
  const related = stats.rows
    .slice()
    .sort((a, b) => (b.calcy_impressions_28d || 0) - (a.calcy_impressions_28d || 0))
    .slice(0, 5)
    .map((row) => row.keyword);
  return `Reflect related query language in headings/snippets: ${related.join(", ")}. Keep the primary page intent focused on ${stats.topKeyword.keyword}.`;
}

function searchIntentMatch(stats: PageCtrStats) {
  const intent = categoryIntent(stats.topKeyword.category, stats.topKeyword.keyword);
  return `Match ${intent} intent explicitly in the title, meta description, intro answer and FAQ snippet so searchers understand what the page calculates before clicking.`;
}

function buildStats(page: string, rows: KeywordRow[]): PageCtrStats | null {
  const impressions = rows.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  if (impressions <= 0) return null;
  const clicks = rows.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0);
  const ctr = clicks / impressions;
  const weightedPosition = rows.reduce((sum, row) => sum + ((row.calcy_position || 99) * (row.calcy_impressions_28d || 0)), 0) / impressions;
  const position = Number(weightedPosition.toFixed(1));
  const expected = expectedCtr(position);
  const missedClicks = Math.max(0, Math.round((expected - ctr) * impressions));
  const topKeyword = rows.slice().sort((a, b) => (b.calcy_impressions_28d || 0) - (a.calcy_impressions_28d || 0))[0];
  const decliningClicks = rows.some((row) => row.trend_direction === "falling" || ((row.calcy_position || 0) - (row.calcy_position_previous || row.calcy_position || 0)) > 2);
  return { page, rows, impressions, clicks, ctr, position, expectedCtr: expected, missedClicks, topKeyword, decliningClicks };
}

function shouldFlag(stats: PageCtrStats) {
  const highImpressionsLowCtr = stats.impressions >= 80 && stats.ctr < stats.expectedCtr * 0.78;
  const pageThreeToFifteen = stats.position != null && stats.position >= 3 && stats.position <= 15 && stats.ctr < stats.expectedCtr * 0.9;
  const decliningClicks = stats.decliningClicks && stats.impressions >= 30;
  return highImpressionsLowCtr || pageThreeToFifteen || decliningClicks || stats.missedClicks >= 5;
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
    job_type: "ctr_optimization",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const { data, error } = await supabase
      .from("seo_keywords")
      .select("keyword, category, target_page, calcy_clicks_28d, calcy_impressions_28d, calcy_ctr_28d, calcy_position, calcy_position_previous, trend_direction")
      .eq("is_active", true);

    if (error) throw error;

    const keywordRows = (data as KeywordRow[] | null) || [];
    const pageMap = new Map<string, KeywordRow[]>();

    for (const row of keywordRows) {
      const page = targetPageFor(row);
      pageMap.set(page, [...(pageMap.get(page) || []), row]);
    }

    const suggestions: CtrSuggestion[] = [];

    for (const [page, rows] of pageMap.entries()) {
      const stats = buildStats(page, rows);
      if (!stats || !shouldFlag(stats)) continue;

      const ctrGap = Math.max(0, stats.expectedCtr - stats.ctr);
      const positionBoost = stats.position != null && stats.position >= 3 && stats.position <= 15 ? 14 : 0;
      const declineBoost = stats.decliningClicks ? 8 : 0;
      const opportunityScore = clamp(38 + Math.min(26, stats.impressions / 450) + Math.min(22, stats.missedClicks * 2.5) + ctrGap * 160 + positionBoost + declineBoost);

      suggestions.push({
        page_url: page,
        primary_keyword: stats.topKeyword.keyword,
        impressions_28d: stats.impressions,
        clicks_28d: stats.clicks,
        ctr_28d: Number(stats.ctr.toFixed(4)),
        position: stats.position,
        estimated_missed_clicks: stats.missedClicks,
        ctr_opportunity_score: opportunityScore,
        suggested_title: titleFor(stats),
        suggested_meta_description: metaFor(stats),
        suggested_intro: introFor(stats),
        suggested_faq_snippet: faqFor(stats),
        suggested_featured_snippet_answer: featuredAnswerFor(stats),
        suggested_emotional_trigger: emotionalTrigger(stats),
        suggested_semantic_improvements: semanticImprovements(stats),
        suggested_search_intent_match: searchIntentMatch(stats),
        reason: `${pageLabel(page)} ranks around position ${stats.position?.toFixed(1) ?? "unknown"} with ${stats.impressions.toLocaleString()} impressions and ${(stats.ctr * 100).toFixed(1)}% CTR. Expected CTR is ${(stats.expectedCtr * 100).toFixed(1)}%, leaving an estimated ${stats.missedClicks.toLocaleString()} missed clicks.`,
        priority_score: opportunityScore,
        signals: {
          keyword_count: rows.length,
          top_keywords: rows
            .slice()
            .sort((a, b) => (b.calcy_impressions_28d || 0) - (a.calcy_impressions_28d || 0))
            .slice(0, 10)
            .map((row) => ({
              keyword: row.keyword,
              impressions_28d: row.calcy_impressions_28d || 0,
              clicks_28d: row.calcy_clicks_28d || 0,
              ctr_28d: row.calcy_ctr_28d || 0,
              position: row.calcy_position,
            })),
          expected_ctr: stats.expectedCtr,
          ctr_gap: ctrGap,
          estimated_missed_clicks: stats.missedClicks,
          position_3_to_15: stats.position != null && stats.position >= 3 && stats.position <= 15,
          declining_clicks_or_rank: stats.decliningClicks,
          detection_signals: [
            stats.impressions >= 80 && stats.ctr < stats.expectedCtr * 0.78 ? "high_impressions_low_ctr" : null,
            stats.position != null && stats.position >= 3 && stats.position <= 15 ? "position_3_to_15" : null,
            stats.decliningClicks ? "declining_clicks_or_rank" : null,
          ].filter(Boolean),
        },
      });
    }

    const finalSuggestions = suggestions.sort((a, b) => b.ctr_opportunity_score - a.ctr_opportunity_score).slice(0, 120);

    if (finalSuggestions.length > 0) {
      const { error: upsertError } = await supabase
        .from("ctr_optimizations")
        .upsert(
          finalSuggestions.map((suggestion) => ({
            ...suggestion,
            status: "open",
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "page_url,primary_keyword" },
        );
      if (upsertError) throw upsertError;
    }

    const summary = {
      keywords_checked: keywordRows.length,
      pages_checked: pageMap.size,
      pages_flagged: finalSuggestions.length,
      estimated_missed_clicks: finalSuggestions.reduce((sum, item) => sum + item.estimated_missed_clicks, 0),
      high_priority: finalSuggestions.filter((item) => item.ctr_opportunity_score >= 70).length,
    };

    await supabase.from("seo_reports").insert({
      report_type: "ctr_optimization",
      content_recommendations: finalSuggestions.slice(0, 40),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: keywordRows.length,
      records_updated: finalSuggestions.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, suggestions: finalSuggestions.slice(0, 40) }), {
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
