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
  intent: string | null;
  adsense_cpc_estimate: number | null;
  monthly_search_volume: number | null;
  calcy_clicks_28d: number | null;
  calcy_impressions_28d: number | null;
  calcy_ctr_28d: number | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  opportunity_score: number | null;
};

type InternalLinkRow = {
  source_page: string;
  target_page: string;
  priority: "high" | "medium" | "low";
  suggested_anchor_text: string;
};

type MoneyPage = {
  page_url: string;
  page_title: string;
  topics: string[];
  baseFinanceValue: number;
  rpmPotential: number;
  cpcPotential: number;
  commercialIntent: number;
  engagementValue: number;
  desiredLinks: string[];
};

type MoneyPageScore = {
  page_url: string;
  page_title: string;
  money_score: number;
  reason: string;
  recommended_action: string;
  related_internal_links_needed: Array<{ target: string; anchor: string; reason: string }>;
  signals: Record<string, unknown>;
  status: "open";
  generated_at: string;
  updated_at: string;
};

const MONEY_PAGES: MoneyPage[] = [
  {
    page_url: "/mortgage-calculator",
    page_title: "Mortgage Calculator",
    topics: ["mortgage", "home loan", "repayment", "interest rate", "amortisation"],
    baseFinanceValue: 96,
    rpmPotential: 92,
    cpcPotential: 88,
    commercialIntent: 90,
    engagementValue: 96,
    desiredLinks: ["/borrowing-power-calculator", "/stamp-duty-calculator", "/lmi-calculator", "/extra-repayments-calculator", "/refinance-calculator"],
  },
  {
    page_url: "/borrowing-power-calculator",
    page_title: "Borrowing Power Calculator",
    topics: ["borrowing power", "borrow", "serviceability", "income", "expenses"],
    baseFinanceValue: 94,
    rpmPotential: 90,
    cpcPotential: 86,
    commercialIntent: 88,
    engagementValue: 92,
    desiredLinks: ["/mortgage-calculator", "/stamp-duty-calculator", "/lmi-calculator", "/hecs-borrowing-power"],
  },
  {
    page_url: "/stamp-duty-calculator",
    page_title: "Stamp Duty Calculator",
    topics: ["stamp duty", "transfer duty", "first home buyer", "upfront costs"],
    baseFinanceValue: 92,
    rpmPotential: 86,
    cpcPotential: 80,
    commercialIntent: 84,
    engagementValue: 90,
    desiredLinks: ["/mortgage-calculator", "/borrowing-power-calculator", "/lmi-calculator", "/extra-repayments-calculator"],
  },
  {
    page_url: "/lmi-calculator",
    page_title: "LMI Calculator",
    topics: ["lmi", "lenders mortgage insurance", "deposit", "lvr", "first home buyer"],
    baseFinanceValue: 88,
    rpmPotential: 84,
    cpcPotential: 82,
    commercialIntent: 84,
    engagementValue: 86,
    desiredLinks: ["/mortgage-calculator", "/borrowing-power-calculator", "/stamp-duty-calculator"],
  },
  {
    page_url: "/hecs-borrowing-power",
    page_title: "HECS Borrowing Power Calculator",
    topics: ["hecs", "help debt", "student debt", "borrowing power", "income"],
    baseFinanceValue: 80,
    rpmPotential: 76,
    cpcPotential: 66,
    commercialIntent: 72,
    engagementValue: 82,
    desiredLinks: ["/borrowing-power-calculator", "/mortgage-calculator", "/lmi-calculator"],
  },
  {
    page_url: "/refinance-calculator",
    page_title: "Refinance Calculator",
    topics: ["refinance", "switch home loan", "interest saving", "cashback", "break even"],
    baseFinanceValue: 90,
    rpmPotential: 90,
    cpcPotential: 92,
    commercialIntent: 94,
    engagementValue: 88,
    desiredLinks: ["/mortgage-calculator", "/extra-repayments-calculator", "/lmi-calculator", "/best-home-loans-australia"],
  },
  {
    page_url: "/extra-repayments-calculator",
    page_title: "Extra Repayments Calculator",
    topics: ["extra repayments", "pay off loan faster", "interest saved", "offset"],
    baseFinanceValue: 78,
    rpmPotential: 78,
    cpcPotential: 68,
    commercialIntent: 72,
    engagementValue: 88,
    desiredLinks: ["/mortgage-calculator", "/refinance-calculator", "/borrowing-power-calculator"],
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizedUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function keywordMatchesPage(keyword: KeywordRow, page: MoneyPage) {
  const haystack = `${keyword.keyword} ${keyword.category || ""} ${keyword.intent || ""}`.toLowerCase();
  const target = normalizedUrl(keyword.target_page);
  return target === page.page_url || page.topics.some((topic) => haystack.includes(topic));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rankingOpportunityScore(rows: KeywordRow[]) {
  if (rows.length === 0) return 35;
  const nearPageOne = rows.filter((row) => {
    const position = row.calcy_position ?? 99;
    return position >= 8 && position <= 20;
  });
  const weighted = nearPageOne.reduce((sum, row) => {
    const position = row.calcy_position ?? 20;
    const impressions = row.calcy_impressions_28d ?? 0;
    const positionLift = position <= 12 ? 28 : 18;
    return sum + positionLift + Math.min(22, impressions / 80);
  }, 0);
  return clamp(35 + Math.min(45, weighted / Math.max(1, rows.length)) + Math.min(20, rows.reduce((sum, row) => sum + ((row.opportunity_score ?? 0) * 4), 0) / Math.max(1, rows.length)));
}

function trafficPotentialScore(rows: KeywordRow[]) {
  const impressions = rows.reduce((sum, row) => sum + (row.calcy_impressions_28d ?? 0), 0);
  const searchVolume = rows.reduce((sum, row) => sum + (row.monthly_search_volume ?? 0), 0);
  return clamp(30 + Math.min(42, impressions / 70) + Math.min(28, searchVolume / 900));
}

function internalLinkImportanceScore(page: MoneyPage, linkRows: InternalLinkRow[]) {
  const inboundSuggestions = linkRows.filter((row) => normalizedUrl(row.target_page) === page.page_url);
  const desiredCoverage = page.desiredLinks.filter((link) =>
    linkRows.some((row) => normalizedUrl(row.source_page) === link && normalizedUrl(row.target_page) === page.page_url),
  ).length;
  return clamp(52 + Math.min(28, inboundSuggestions.length * 5) + Math.min(20, desiredCoverage * 7));
}

function relatedLinksNeeded(page: MoneyPage, linkRows: InternalLinkRow[]) {
  return page.desiredLinks
    .filter((source) => !linkRows.some((row) => normalizedUrl(row.source_page) === source && normalizedUrl(row.target_page) === page.page_url))
    .map((source) => ({
      target: source,
      anchor: page.page_title.toLowerCase(),
      reason: `${source} is a relevant journey page that should send contextual authority to ${page.page_title}.`,
    }))
    .slice(0, 5);
}

function recommendation(page: MoneyPage, score: number, rows: KeywordRow[], linksNeeded: MoneyPageScore["related_internal_links_needed"]) {
  const positions = rows.map((row) => row.calcy_position).filter((position): position is number => typeof position === "number");
  const avgPosition = positions.length ? average(positions) : null;
  const topKeyword = [...rows].sort((a, b) => (b.calcy_impressions_28d ?? 0) - (a.calcy_impressions_28d ?? 0))[0]?.keyword;
  const linkAction = linksNeeded.length > 0
    ? `add internal links from ${linksNeeded.map((link) => link.target).join(", ")}`
    : "review internal links and keep the calculator mesh strong";
  const contentAction = avgPosition && avgPosition > 8
    ? "tighten title/H1 alignment, strengthen intro intent match, add comparison/FAQ content where useful"
    : "protect current intent match, refresh supporting copy, and improve calculator-to-calculator journeys";
  return `${page.page_title} scores ${score}/100 as a money page${topKeyword ? `, led by "${topKeyword}" demand` : ""}. ${contentAction}; ${linkAction}. Admin suggestion only; do not change public content automatically.`;
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
    job_type: "money_page_scoring",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: keywords }, { data: internalLinks }] = await Promise.all([
      supabase
        .from("seo_keywords")
        .select("keyword, category, target_page, intent, adsense_cpc_estimate, monthly_search_volume, calcy_clicks_28d, calcy_impressions_28d, calcy_ctr_28d, calcy_position, calcy_position_previous, opportunity_score")
        .eq("is_active", true)
        .limit(1000),
      supabase
        .from("internal_link_opportunities")
        .select("source_page, target_page, priority, suggested_anchor_text")
        .eq("status", "open")
        .limit(500),
    ]);

    const keywordRows = (keywords as KeywordRow[] | null) || [];
    const linkRows = (internalLinks as InternalLinkRow[] | null) || [];
    const generatedAt = new Date().toISOString();

    const scores: MoneyPageScore[] = MONEY_PAGES.map((page) => {
      const pageKeywords = keywordRows.filter((row) => keywordMatchesPage(row, page));
      const impressions = pageKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d ?? 0), 0);
      const clicks = pageKeywords.reduce((sum, row) => sum + (row.calcy_clicks_28d ?? 0), 0);
      const avgPosition = average(pageKeywords.map((row) => row.calcy_position).filter((position): position is number => typeof position === "number"));
      const avgCpc = average(pageKeywords.map((row) => row.adsense_cpc_estimate).filter((cpc): cpc is number => typeof cpc === "number"));
      const commercialRows = pageKeywords.filter((row) => ["commercial", "transactional"].includes((row.intent || "").toLowerCase())).length;
      const rankingOpportunity = rankingOpportunityScore(pageKeywords);
      const trafficPotential = trafficPotentialScore(pageKeywords);
      const internalLinkImportance = internalLinkImportanceScore(page, linkRows);
      const financeTopicValue = page.baseFinanceValue;
      const cpcEstimate = clamp(page.cpcPotential * 0.7 + Math.min(100, avgCpc * 16) * 0.3);
      const commercialIntent = clamp(page.commercialIntent * 0.75 + Math.min(100, commercialRows * 16) * 0.25);
      const adsenseRpm = page.rpmPotential;
      const calculatorEngagement = page.engagementValue;

      const moneyScore = clamp(
        adsenseRpm * 0.14 +
          cpcEstimate * 0.14 +
          financeTopicValue * 0.17 +
          commercialIntent * 0.14 +
          rankingOpportunity * 0.16 +
          trafficPotential * 0.13 +
          internalLinkImportance * 0.06 +
          calculatorEngagement * 0.06,
      );
      const linksNeeded = relatedLinksNeeded(page, linkRows);

      return {
        page_url: page.page_url,
        page_title: page.page_title,
        money_score: moneyScore,
        reason: `${page.page_title} combines finance topic value ${financeTopicValue}/100, RPM potential ${adsenseRpm}/100, CPC/commercial intent ${Math.round((cpcEstimate + commercialIntent) / 2)}/100, ranking opportunity ${rankingOpportunity}/100, traffic potential ${trafficPotential}/100, and calculator engagement ${calculatorEngagement}/100.`,
        recommended_action: recommendation(page, moneyScore, pageKeywords, linksNeeded),
        related_internal_links_needed: linksNeeded,
        signals: {
          adsense_rpm_potential: adsenseRpm,
          cpc_commercial_intent_estimate: cpcEstimate,
          commercial_intent: commercialIntent,
          finance_topic_value: financeTopicValue,
          ranking_opportunity: rankingOpportunity,
          traffic_potential: trafficPotential,
          internal_link_importance: internalLinkImportance,
          calculator_conversion_engagement_value: calculatorEngagement,
          keyword_count: pageKeywords.length,
          impressions_28d: impressions,
          clicks_28d: clicks,
          average_ctr_28d: impressions > 0 ? clicks / impressions : 0,
          average_position: avgPosition || null,
          average_cpc_estimate: avgCpc || null,
          related_links_needed_count: linksNeeded.length,
          topics: page.topics,
        },
        status: "open",
        generated_at: generatedAt,
        updated_at: generatedAt,
      };
    }).sort((a, b) => b.money_score - a.money_score);

    const { error: upsertError } = await supabase
      .from("money_page_scores")
      .upsert(scores, { onConflict: "page_url" });
    if (upsertError) throw upsertError;

    const summary = {
      pages_scored: scores.length,
      high_value_pages: scores.filter((score) => score.money_score >= 80).length,
      average_money_score: clamp(average(scores.map((score) => score.money_score))),
    };

    await supabase.from("seo_reports").insert({
      report_type: "money_page_scoring",
      content_recommendations: scores,
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: MONEY_PAGES.length,
      records_updated: scores.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, scores }), {
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
