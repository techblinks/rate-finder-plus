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

type CompetitorPageRow = {
  domain: string;
  url: string;
  page_title: string | null;
  page_description: string | null;
  category: string | null;
  keywords_ranking_for: unknown;
  estimated_monthly_traffic: number | null;
  domain_authority_estimate: number | null;
  last_crawled_at: string | null;
  updated_at: string | null;
};

type KeywordRow = {
  keyword: string;
  category: string;
  target_page: string | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  calcy_impressions_28d: number | null;
  calcy_clicks_28d: number | null;
  monthly_search_volume: number | null;
  opportunity_score: number | null;
  trend_direction: string | null;
  top_competitor_domain: string | null;
  top_competitor_url: string | null;
  top_competitor_position: number | null;
  calcy_vs_competitor_gap: number | null;
};

type GapRow = {
  gap_type: string;
  affected_url: string;
  keyword_topic: string | null;
  priority_score: number;
  estimated_traffic_opportunity: number;
  suggested_fix: string;
};

type InsightType = "competitor_growth" | "new_topic" | "content_trend" | "ranking_opportunity" | "content_gap";

type CompetitorInsight = {
  competitor_domain: string;
  competitor_url: string | null;
  detected_topic: string;
  insight_type: InsightType;
  estimated_opportunity: string;
  recommended_response: string;
  priority_score: number;
  competitor_growth_alerts: string[];
  new_topic_alerts: string[];
  content_trend_alerts: string[];
  ranking_opportunity_alerts: string[];
  content_gap_opportunities: Array<{ topic: string; affected_url: string; suggested_fix: string; score: number }>;
  signals: Record<string, unknown>;
};

const highValueTopics: Record<string, { label: string; terms: string[]; responseUrl: string; commercialWeight: number }> = {
  mortgage: {
    label: "mortgage calculators",
    terms: ["mortgage", "repayment", "home loan", "interest rate"],
    responseUrl: "/mortgage-calculator",
    commercialWeight: 96,
  },
  borrowing_power: {
    label: "borrowing power",
    terms: ["borrowing power", "serviceability", "income", "expenses"],
    responseUrl: "/borrowing-power-calculator",
    commercialWeight: 92,
  },
  refinance: {
    label: "refinancing",
    terms: ["refinance", "refinancing", "switch home loan", "cashback"],
    responseUrl: "/refinance-calculator",
    commercialWeight: 94,
  },
  hecs: {
    label: "HECS borrowing power",
    terms: ["hecs", "help debt", "student debt"],
    responseUrl: "/hecs-borrowing-power",
    commercialWeight: 86,
  },
  lmi: {
    label: "LMI",
    terms: ["lmi", "lenders mortgage insurance", "deposit", "lvr"],
    responseUrl: "/lmi-calculator",
    commercialWeight: 88,
  },
  stamp_duty: {
    label: "stamp duty",
    terms: ["stamp duty", "transfer duty", "first home buyer", "concession"],
    responseUrl: "/stamp-duty-calculator",
    commercialWeight: 90,
  },
  australian_finance: {
    label: "Australian finance SEO",
    terms: ["rba", "cash rate", "property", "first home buyer", "home loans"],
    responseUrl: "/guides",
    commercialWeight: 80,
  },
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function topicForText(text: string, fallback: string | null) {
  const lower = text.toLowerCase();
  const match = Object.entries(highValueTopics).find(([, topic]) => topic.terms.some((term) => lower.includes(term)));
  if (match) return match[0];
  if (fallback && highValueTopics[fallback]) return fallback;
  return "australian_finance";
}

function topicLabel(topicKey: string) {
  return highValueTopics[topicKey]?.label || topicKey.replaceAll("_", " ");
}

function topicResponse(topicKey: string) {
  return highValueTopics[topicKey]?.responseUrl || "/guides";
}

function competitorKeywords(row: CompetitorPageRow) {
  if (!Array.isArray(row.keywords_ranking_for)) return [];
  return row.keywords_ranking_for.filter((item): item is string => typeof item === "string").slice(0, 12);
}

function pageFreshnessDays(row: CompetitorPageRow) {
  const date = row.last_crawled_at || row.updated_at;
  if (!date) return null;
  const value = new Date(date).getTime();
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.floor((Date.now() - value) / 86_400_000));
}

function estimatedOpportunity(topicKey: string, impressions: number, gap: number, competitorAuthority: number, traffic: number) {
  const demand = impressions > 1000 ? "high search demand" : impressions > 200 ? "moderate search demand" : "early search demand";
  const competitiveGap = gap >= 10 ? "large ranking gap" : gap >= 4 ? "visible ranking gap" : "content coverage gap";
  const authority = competitorAuthority >= 75 ? "high-authority competitor" : competitorAuthority >= 60 ? "established competitor" : "niche competitor";
  const trafficText = traffic > 0 ? ` and estimated competitor page traffic around ${traffic.toLocaleString()}/mo` : "";
  return `${topicLabel(topicKey)} shows ${demand}, ${competitiveGap}, ${authority}${trafficText}.`;
}

function recommendedResponse(topicKey: string, insightType: InsightType, gapRows: GapRow[]) {
  const responseUrl = topicResponse(topicKey);
  const matchingGap = gapRows.find((gap) => {
    const text = `${gap.keyword_topic || ""} ${gap.suggested_fix} ${gap.affected_url}`.toLowerCase();
    return highValueTopics[topicKey]?.terms.some((term) => text.includes(term));
  });

  if (insightType === "ranking_opportunity") {
    return `Strengthen ${responseUrl} with comparison sections, current examples, stronger FAQs, and contextual internal links before changing metadata.`;
  }
  if (insightType === "content_trend") {
    return `Create an admin-approved content brief around ${topicLabel(topicKey)} trends, then link it back to ${responseUrl}.`;
  }
  if (insightType === "new_topic") {
    return `Review whether Calcy needs a supporting guide or calculator explainer for ${topicLabel(topicKey)}. Avoid thin pages; require unique Australian finance value.`;
  }
  if (insightType === "content_gap" && matchingGap) {
    return `${matchingGap.suggested_fix} Keep changes scoped to ${matchingGap.affected_url}.`;
  }
  return `Audit ${responseUrl} against competitor coverage and prepare an admin-approved update plan.`;
}

function addInsight(insights: Map<string, CompetitorInsight>, item: CompetitorInsight) {
  const key = `${item.competitor_domain}|${item.detected_topic}|${item.insight_type}`;
  const existing = insights.get(key);
  if (!existing || item.priority_score > existing.priority_score) {
    insights.set(key, item);
  }
}

function buildInsights(competitors: CompetitorPageRow[], keywords: KeywordRow[], gaps: GapRow[]) {
  const insights = new Map<string, CompetitorInsight>();

  const competitorGroups = competitors.reduce((map, row) => {
    const list = map.get(row.domain) || [];
    list.push(row);
    map.set(row.domain, list);
    return map;
  }, new Map<string, CompetitorPageRow[]>());

  for (const [domain, pages] of competitorGroups) {
    const categories = new Set(pages.map((page) => page.category || topicForText(`${page.page_title || ""} ${page.url}`, page.category)));
    const authority = Math.max(...pages.map((page) => page.domain_authority_estimate || 0), 0);
    const totalTraffic = pages.reduce((sum, page) => sum + (page.estimated_monthly_traffic || 0), 0);

    for (const category of categories) {
      const topicKey = topicForText(category, category);
      const topicPages = pages.filter((page) => topicForText(`${page.page_title || ""} ${page.page_description || ""} ${page.url}`, page.category) === topicKey);
      const topicKeywords = keywords.filter((row) =>
        row.top_competitor_domain === domain ||
        row.category === topicKey ||
        highValueTopics[topicKey]?.terms.some((term) => row.keyword.toLowerCase().includes(term))
      );
      const impressions = topicKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
      const bestCompetitorPosition = Math.min(...topicKeywords.map((row) => row.top_competitor_position || 99), 99);
      const avgGap = topicKeywords.length
        ? topicKeywords.reduce((sum, row) => sum + Math.max(0, row.calcy_vs_competitor_gap || ((row.calcy_position || 99) - (row.top_competitor_position || 99))), 0) / topicKeywords.length
        : 0;
      const risingCount = topicKeywords.filter((row) => row.trend_direction === "rising").length;
      const newishPages = topicPages.filter((page) => {
        const age = pageFreshnessDays(page);
        return age !== null && age <= 45;
      });
      const representative = topicPages[0] || pages[0];
      const priority = clamp(
        highValueTopics[topicKey]?.commercialWeight * 0.35 +
        Math.min(28, impressions / 120) +
        Math.min(18, avgGap * 1.5) +
        Math.min(10, totalTraffic / 1500) +
        Math.min(8, authority / 12) +
        (risingCount > 0 ? 8 : 0) +
        (newishPages.length > 0 ? 6 : 0) +
        (bestCompetitorPosition <= 5 ? 5 : 0),
      );

      if (priority >= 45) {
        const insightType: InsightType = avgGap >= 4 || bestCompetitorPosition <= 10 ? "ranking_opportunity" : risingCount > 0 ? "content_trend" : "competitor_growth";
        addInsight(insights, {
          competitor_domain: domain,
          competitor_url: representative?.url || null,
          detected_topic: topicLabel(topicKey),
          insight_type: insightType,
          estimated_opportunity: estimatedOpportunity(topicKey, impressions, avgGap, authority, totalTraffic),
          recommended_response: recommendedResponse(topicKey, insightType, gaps),
          priority_score: priority,
          competitor_growth_alerts: [
            `${domain} has ${topicPages.length || pages.length} tracked ${topicLabel(topicKey)} page${(topicPages.length || pages.length) === 1 ? "" : "s"}.`,
            authority ? `Estimated domain authority signal: ${authority}/100.` : "",
          ].filter(Boolean),
          new_topic_alerts: newishPages.map((page) => `Recently observed page: ${page.page_title || page.url}`).slice(0, 4),
          content_trend_alerts: topicKeywords.filter((row) => row.trend_direction === "rising").map((row) => `Rising query: ${row.keyword}`).slice(0, 5),
          ranking_opportunity_alerts: topicKeywords
            .filter((row) => (row.calcy_vs_competitor_gap || 0) >= 3 || (row.top_competitor_position || 99) <= 10)
            .map((row) => `${row.keyword}: competitor position ${row.top_competitor_position ?? "unknown"}, Calcy position ${row.calcy_position ?? "unknown"}`)
            .slice(0, 6),
          content_gap_opportunities: gaps
            .filter((gap) => highValueTopics[topicKey]?.terms.some((term) => `${gap.keyword_topic || ""} ${gap.suggested_fix}`.toLowerCase().includes(term)))
            .slice(0, 5)
            .map((gap) => ({ topic: gap.keyword_topic || topicLabel(topicKey), affected_url: gap.affected_url, suggested_fix: gap.suggested_fix, score: gap.priority_score })),
          signals: {
            source: "existing_competitor_pages_and_gsc_data",
            no_live_scraping: true,
            competitor_page_count: topicPages.length || pages.length,
            total_estimated_competitor_traffic: totalTraffic,
            impressions_28d: impressions,
            average_competitor_gap: Number(avgGap.toFixed(1)),
            best_competitor_position: bestCompetitorPosition === 99 ? null : bestCompetitorPosition,
            representative_keywords: topicKeywords.slice(0, 10).map((row) => row.keyword),
            competitor_keywords: topicPages.flatMap(competitorKeywords).slice(0, 12),
          },
        });
      }
    }
  }

  const domainsFromKeywords = new Set(keywords.map((row) => row.top_competitor_domain).filter((domain): domain is string => Boolean(domain)));
  for (const domain of domainsFromKeywords) {
    const rows = keywords.filter((row) => row.top_competitor_domain === domain);
    const grouped = new Map<string, KeywordRow[]>();
    for (const row of rows) {
      const topicKey = topicForText(row.keyword, row.category);
      grouped.set(topicKey, [...(grouped.get(topicKey) || []), row]);
    }

    for (const [topicKey, topicRows] of grouped) {
      const impressions = topicRows.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
      const avgGap = topicRows.reduce((sum, row) => sum + Math.max(0, row.calcy_vs_competitor_gap || ((row.calcy_position || 99) - (row.top_competitor_position || 99))), 0) / Math.max(1, topicRows.length);
      if (impressions < 50 && avgGap < 4) continue;

      const priority = clamp((highValueTopics[topicKey]?.commercialWeight || 70) * 0.3 + Math.min(32, impressions / 90) + Math.min(24, avgGap * 1.8) + Math.min(10, topicRows.length * 2));
      addInsight(insights, {
        competitor_domain: domain,
        competitor_url: topicRows.find((row) => row.top_competitor_url)?.top_competitor_url || null,
        detected_topic: topicLabel(topicKey),
        insight_type: "ranking_opportunity",
        estimated_opportunity: estimatedOpportunity(topicKey, impressions, avgGap, 0, 0),
        recommended_response: recommendedResponse(topicKey, "ranking_opportunity", gaps),
        priority_score: priority,
        competitor_growth_alerts: [],
        new_topic_alerts: [],
        content_trend_alerts: topicRows.filter((row) => row.trend_direction === "rising").map((row) => `Rising query: ${row.keyword}`).slice(0, 5),
        ranking_opportunity_alerts: topicRows.map((row) => `${row.keyword}: competitor position ${row.top_competitor_position ?? "unknown"}, Calcy position ${row.calcy_position ?? "unknown"}`).slice(0, 6),
        content_gap_opportunities: gaps
          .filter((gap) => highValueTopics[topicKey]?.terms.some((term) => `${gap.keyword_topic || ""} ${gap.suggested_fix}`.toLowerCase().includes(term)))
          .slice(0, 5)
          .map((gap) => ({ topic: gap.keyword_topic || topicLabel(topicKey), affected_url: gap.affected_url, suggested_fix: gap.suggested_fix, score: gap.priority_score })),
        signals: {
          source: "seo_keywords_competitor_fields",
          no_live_scraping: true,
          impressions_28d: impressions,
          average_competitor_gap: Number(avgGap.toFixed(1)),
          tracked_keyword_count: topicRows.length,
          representative_keywords: topicRows.slice(0, 12).map((row) => row.keyword),
        },
      });
    }
  }

  for (const gap of gaps.slice(0, 40)) {
    const topicKey = topicForText(`${gap.keyword_topic || ""} ${gap.suggested_fix}`, null);
    if (gap.priority_score < 60) continue;
    const competitor = competitors.find((page) => topicForText(`${page.page_title || ""} ${page.url}`, page.category) === topicKey);
    addInsight(insights, {
      competitor_domain: competitor?.domain || "market pattern",
      competitor_url: competitor?.url || null,
      detected_topic: topicLabel(topicKey),
      insight_type: "content_gap",
      estimated_opportunity: `${topicLabel(topicKey)} has a ${gap.priority_score}/100 content gap and ${gap.estimated_traffic_opportunity.toLocaleString()} estimated monthly visits available.`,
      recommended_response: recommendedResponse(topicKey, "content_gap", [gap]),
      priority_score: clamp(gap.priority_score),
      competitor_growth_alerts: [],
      new_topic_alerts: [],
      content_trend_alerts: [],
      ranking_opportunity_alerts: [],
      content_gap_opportunities: [{ topic: gap.keyword_topic || topicLabel(topicKey), affected_url: gap.affected_url, suggested_fix: gap.suggested_fix, score: gap.priority_score }],
      signals: {
        source: "content_gap_opportunities",
        no_live_scraping: true,
        gap_type: gap.gap_type,
        estimated_traffic_opportunity: gap.estimated_traffic_opportunity,
      },
    });
  }

  return Array.from(insights.values())
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 120);
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

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "competitor_tracking",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: competitors }, { data: keywords }, { data: gaps }] = await Promise.all([
      supabase.from("competitor_pages").select("domain, url, page_title, page_description, category, keywords_ranking_for, estimated_monthly_traffic, domain_authority_estimate, last_crawled_at, updated_at").eq("is_active", true).limit(500),
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_position, calcy_position_previous, calcy_impressions_28d, calcy_clicks_28d, monthly_search_volume, opportunity_score, trend_direction, top_competitor_domain, top_competitor_url, top_competitor_position, calcy_vs_competitor_gap").eq("is_active", true).limit(1200),
      supabase.from("content_gap_opportunities").select("gap_type, affected_url, keyword_topic, priority_score, estimated_traffic_opportunity, suggested_fix").eq("status", "open").limit(200),
    ]);

    const insights = buildInsights(
      (competitors as CompetitorPageRow[] | null) || [],
      (keywords as KeywordRow[] | null) || [],
      (gaps as GapRow[] | null) || [],
    );

    if (insights.length > 0) {
      const { error } = await supabase
        .from("competitor_tracking_insights")
        .upsert(insights, { onConflict: "competitor_domain,detected_topic,insight_type" });
      if (error) throw error;
    }

    await supabase.from("seo_reports").insert({
      report_type: "competitor_tracking",
      total_keywords_tracked: (keywords as KeywordRow[] | null)?.length || 0,
      competitor_alerts: insights.slice(0, 25),
      content_recommendations: insights.slice(0, 20).map((item) => ({
        competitor: item.competitor_domain,
        topic: item.detected_topic,
        action: item.recommended_response,
        score: item.priority_score,
      })),
      full_report_data: {
        generated_count: insights.length,
        no_live_scraping: true,
        tracked_competitors: new Set(((competitors as CompetitorPageRow[] | null) || []).map((row) => row.domain)).size,
        high_priority: insights.filter((item) => item.priority_score >= 75).length,
      },
    });

    await supabase
      .from("sync_jobs")
      .update({ status: "success", completed_at: new Date().toISOString(), records_updated: insights.length })
      .eq("id", jobId);

    return new Response(JSON.stringify({ success: true, count: insights.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    await supabase
      .from("sync_jobs")
      .update({ status: "failed", completed_at: new Date().toISOString(), error_log: { message: String((err as Error).message || err) } })
      .eq("id", jobId);

    return new Response(JSON.stringify({ success: false, error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
