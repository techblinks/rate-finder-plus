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

type ProgrammaticPageRow = {
  url_path: string;
  page_type: string;
  target_keyword: string | null;
  h1: string | null;
  meta_title: string | null;
  meta_description: string | null;
  intro_text: string | null;
  updated_at: string | null;
  impressions_28d: number | null;
  clicks_28d: number | null;
  position: number | null;
};

type NewsArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
};

type KeywordRow = {
  keyword: string;
  target_page: string | null;
  category: string | null;
  calcy_impressions_28d: number | null;
  calcy_clicks_28d: number | null;
  calcy_position: number | null;
  calcy_position_previous: number | null;
  trend_direction: string | null;
};

type RateDataRow = {
  category: string;
  state: string | null;
  key: string;
  display_label: string | null;
  last_verified_at: string | null;
  updated_at: string | null;
  value: unknown;
};

type PageProfile = {
  page_url: string;
  page_title: string;
  page_type: "calculator" | "programmatic" | "article" | "guide";
  primary_topic: string;
  last_updated_date: string | null;
  bodyText: string;
  impressions: number;
  clicks: number;
  position: number | null;
  keywords: KeywordRow[];
};

type RefreshRecommendation = {
  page_url: string;
  page_title: string;
  page_type: string;
  freshness_score: number;
  priority_level: "high" | "medium" | "low";
  last_updated_date: string | null;
  outdated_sections: string[];
  stale_content_alerts: string[];
  recommended_updates: string[];
  suggested_updates: string[];
  last_updated_management: Record<string, unknown>;
  freshness_signals: Record<string, unknown>;
};

const corePages: PageProfile[] = [
  {
    page_url: "/mortgage-calculator",
    page_title: "Mortgage Calculator",
    page_type: "calculator",
    primary_topic: "mortgage repayments",
    last_updated_date: null,
    bodyText: "Mortgage rates repayment examples RBA cash rate loan term extra repayments interest rate assumptions amortisation FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/borrowing-power-calculator",
    page_title: "Borrowing Power Calculator",
    page_type: "calculator",
    primary_topic: "borrowing power",
    last_updated_date: null,
    bodyText: "Borrowing assumptions serviceability income expenses assessment rate buffer HECS dependants FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/stamp-duty-calculator",
    page_title: "Stamp Duty Calculator",
    page_type: "calculator",
    primary_topic: "stamp duty",
    last_updated_date: null,
    bodyText: "Stamp duty state regulations concessions transfer duty first home buyer thresholds state examples FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/lmi-calculator",
    page_title: "LMI Calculator",
    page_type: "calculator",
    primary_topic: "lenders mortgage insurance",
    last_updated_date: null,
    bodyText: "LMI lender references LVR deposit assumptions lender mortgage insurance premium examples FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/hecs-borrowing-power",
    page_title: "HECS Borrowing Power Calculator",
    page_type: "calculator",
    primary_topic: "HECS borrowing power",
    last_updated_date: null,
    bodyText: "HECS HELP tax thresholds repayment rates borrowing assumptions income examples FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/refinance-calculator",
    page_title: "Refinance Calculator",
    page_type: "calculator",
    primary_topic: "refinancing",
    last_updated_date: null,
    bodyText: "Refinance rates lender references switching costs cashback offers break even assumptions examples FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/extra-repayments-calculator",
    page_title: "Extra Repayments Calculator",
    page_type: "calculator",
    primary_topic: "extra repayments",
    last_updated_date: null,
    bodyText: "Extra repayments interest saved mortgage rates examples repayment frequency FAQs.",
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
];

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function daysSince(date: string | null) {
  if (!date) return null;
  const value = new Date(date).getTime();
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.floor((Date.now() - value) / 86_400_000));
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function categoryTarget(category: string | null) {
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
  return map[category || ""] || "";
}

function textIncludes(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function topicTerms(profile: PageProfile) {
  const topic = `${profile.primary_topic} ${profile.page_title} ${profile.bodyText}`.toLowerCase();
  return {
    rates: textIncludes(topic, ["rate", "interest", "rba", "mortgage"]),
    examples: textIncludes(topic, ["example", "repayment", "cost", "saving"]),
    faqs: textIncludes(topic, ["faq", "question"]),
    lenders: textIncludes(topic, ["lender", "bank", "cashback", "lmi"]),
    taxRules: textIncludes(topic, ["tax", "hecs", "help", "threshold"]),
    stateRegulations: textIncludes(topic, ["stamp duty", "transfer duty", "state", "concession", "nsw", "vic", "qld"]),
    borrowingAssumptions: textIncludes(topic, ["borrowing", "serviceability", "assessment", "buffer", "income", "expenses"]),
  };
}

function matchKeywords(profile: PageProfile, keywordRows: KeywordRow[]) {
  const url = normaliseUrl(profile.page_url);
  const terms = `${profile.page_title} ${profile.primary_topic}`.toLowerCase().split(/\s+/).filter((term) => term.length > 3);
  return keywordRows.filter((row) => {
    const target = normaliseUrl(row.target_page) || categoryTarget(row.category);
    return target === url || terms.some((term) => row.keyword.toLowerCase().includes(term));
  });
}

function rateFreshness(rateRows: RateDataRow[]) {
  const activeDates = rateRows.map((row) => row.last_verified_at || row.updated_at).filter(Boolean) as string[];
  if (activeDates.length === 0) return { staleCount: 0, oldestDays: null as number | null, newestDate: null as string | null };
  const dayValues = activeDates.map(daysSince).filter((value): value is number => value !== null);
  const newestDate = activeDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;
  return {
    staleCount: dayValues.filter((days) => days > 30).length,
    oldestDays: dayValues.length ? Math.max(...dayValues) : null,
    newestDate,
  };
}

function buildProfiles(programmaticRows: ProgrammaticPageRow[], articleRows: NewsArticleRow[], keywordRows: KeywordRow[]) {
  const dynamicProfiles: PageProfile[] = [
    ...programmaticRows.slice(0, 80).map((row) => ({
      page_url: normaliseUrl(row.url_path),
      page_title: row.h1 || row.meta_title || row.target_keyword || row.url_path,
      page_type: "programmatic" as const,
      primary_topic: row.target_keyword || row.page_type,
      last_updated_date: row.updated_at,
      bodyText: `${row.meta_title || ""} ${row.meta_description || ""} ${row.h1 || ""} ${row.intro_text || ""}`,
      impressions: row.impressions_28d || 0,
      clicks: row.clicks_28d || 0,
      position: row.position,
      keywords: [],
    })),
    ...articleRows.filter((row) => row.is_published).slice(0, 40).map((row) => ({
      page_url: `/news/${row.slug}`,
      page_title: row.title,
      page_type: "article" as const,
      primary_topic: row.title,
      last_updated_date: row.published_at || row.created_at,
      bodyText: `${row.title} ${row.excerpt || ""} ${row.body || ""}`,
      impressions: 0,
      clicks: 0,
      position: null,
      keywords: [],
    })),
  ];

  return [...corePages, ...dynamicProfiles].map((profile) => {
    const keywords = matchKeywords(profile, keywordRows);
    return {
      ...profile,
      keywords,
      impressions: profile.impressions || keywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0),
      clicks: profile.clicks || keywords.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0),
      position: profile.position ?? Math.min(...keywords.map((row) => row.calcy_position || 99), 99),
    };
  });
}

function evaluateFreshness(profile: PageProfile, rateState: ReturnType<typeof rateFreshness>): RefreshRecommendation {
  const sections = topicTerms(profile);
  const ageDays = daysSince(profile.last_updated_date);
  const outdatedSections: string[] = [];
  const alerts: string[] = [];
  const recommendedUpdates: string[] = [];
  const suggestedUpdates: string[] = [];
  let penalty = 0;

  if (ageDays === null) {
    penalty += 24;
    alerts.push("Missing reliable last updated date.");
    recommendedUpdates.push("Add or verify an admin-managed last reviewed/updated date before publishing any visible freshness label.");
  } else if (ageDays > 180) {
    penalty += 24;
    alerts.push(`Page has not been refreshed for ${ageDays} days.`);
  } else if (ageDays > 90) {
    penalty += 14;
    alerts.push(`Page freshness is ageing at ${ageDays} days since last update.`);
  }

  if (sections.rates && (rateState.oldestDays === null || rateState.oldestDays > 30)) {
    penalty += 18;
    outdatedSections.push("mortgage rates");
    alerts.push("Rate-sensitive content depends on rate data that needs verification.");
    suggestedUpdates.push("Verify RBA cash rate, example mortgage rate assumptions, and repayment examples.");
  }

  if (sections.examples && (ageDays === null || ageDays > 90)) {
    penalty += 10;
    outdatedSections.push("finance examples");
    recommendedUpdates.push("Refresh worked examples using current Australian mortgage assumptions and clearly label them as estimates.");
  }

  if (sections.faqs && (ageDays === null || ageDays > 120)) {
    penalty += 10;
    outdatedSections.push("FAQs");
    recommendedUpdates.push("Review FAQ answers for current thresholds, rate assumptions, lender terminology, and answer-engine clarity.");
  }

  if (sections.lenders && (ageDays === null || ageDays > 60)) {
    penalty += 12;
    outdatedSections.push("lender references");
    recommendedUpdates.push("Review lender references, cashback mentions, LMI assumptions, and avoid naming offers unless verified.");
  }

  if (sections.taxRules && (ageDays === null || ageDays > 120)) {
    penalty += 16;
    outdatedSections.push("tax rules");
    recommendedUpdates.push("Check HECS/HELP repayment thresholds and tax-year wording before approving updates.");
  }

  if (sections.stateRegulations && (ageDays === null || ageDays > 90)) {
    penalty += 16;
    outdatedSections.push("state regulations");
    recommendedUpdates.push("Verify state stamp duty thresholds, concessions, first-home-buyer rules, and effective dates.");
  }

  if (sections.borrowingAssumptions && (ageDays === null || ageDays > 90)) {
    penalty += 12;
    outdatedSections.push("borrowing assumptions");
    recommendedUpdates.push("Review serviceability buffer, expense assumptions, HECS treatment, and borrowing-power examples.");
  }

  const decliningKeywords = profile.keywords.filter((row) => {
    if (row.calcy_position == null || row.calcy_position_previous == null) return false;
    return row.calcy_position - row.calcy_position_previous >= 3;
  });
  if (decliningKeywords.length > 0) {
    penalty += Math.min(16, decliningKeywords.length * 4);
    alerts.push(`${decliningKeywords.length} tracked keyword${decliningKeywords.length === 1 ? "" : "s"} declined since the previous sync.`);
    recommendedUpdates.push("Refresh the intro, examples, FAQ answers, and internal links for declining tracked queries.");
  }

  if (profile.impressions > 500 && (ageDays === null || ageDays > 60)) {
    penalty += 8;
    alerts.push("High-impression page should have a visible review cadence.");
  }

  if (recommendedUpdates.length === 0) {
    recommendedUpdates.push("Keep current content. Re-check live data and examples during the next scheduled finance refresh.");
  }
  if (suggestedUpdates.length === 0) {
    suggestedUpdates.push("Confirm the page still reflects current Australian finance assumptions before approving visible update labels.");
  }

  const freshnessScore = clamp(100 - penalty);
  const priorityLevel = freshnessScore < 55 ? "high" : freshnessScore < 75 ? "medium" : "low";

  return {
    page_url: profile.page_url,
    page_title: profile.page_title,
    page_type: profile.page_type,
    freshness_score: freshnessScore,
    priority_level: priorityLevel,
    last_updated_date: profile.last_updated_date,
    outdated_sections: Array.from(new Set(outdatedSections)),
    stale_content_alerts: Array.from(new Set(alerts)),
    recommended_updates: Array.from(new Set(recommendedUpdates)),
    suggested_updates: Array.from(new Set(suggestedUpdates)),
    last_updated_management: {
      current_last_updated: profile.last_updated_date,
      days_since_update: ageDays,
      requires_admin_approval: true,
      visible_label_guidance: "Only update public last-updated text after a human verifies the relevant finance assumptions.",
    },
    freshness_signals: {
      impressions_28d: profile.impressions,
      clicks_28d: profile.clicks,
      average_position: profile.position && profile.position !== 99 ? profile.position : null,
      matched_keywords: profile.keywords.slice(0, 8).map((row) => row.keyword),
      declining_keywords: decliningKeywords.map((row) => row.keyword),
      rate_data_stale_count: rateState.staleCount,
      rate_data_oldest_days: rateState.oldestDays,
      newest_rate_verification: rateState.newestDate,
      detected_sections: sections,
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

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "auto_refresh_engine",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: programmatic }, { data: articles }, { data: keywords }, { data: rates }] = await Promise.all([
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, h1, meta_title, meta_description, intro_text, updated_at, impressions_28d, clicks_28d, position").order("updated_at", { ascending: true }).limit(150),
      supabase.from("news_articles").select("slug, title, excerpt, body, is_published, published_at, created_at").order("created_at", { ascending: true }).limit(80),
      supabase.from("seo_keywords").select("keyword, target_page, category, calcy_impressions_28d, calcy_clicks_28d, calcy_position, calcy_position_previous, trend_direction").eq("is_active", true).limit(800),
      supabase.from("rate_data").select("category, state, key, display_label, last_verified_at, updated_at, value").eq("is_active", true),
    ]);

    const rateState = rateFreshness((rates as RateDataRow[] | null) || []);
    const profiles = buildProfiles(
      (programmatic as ProgrammaticPageRow[] | null) || [],
      (articles as NewsArticleRow[] | null) || [],
      (keywords as KeywordRow[] | null) || [],
    );

    const recommendations = profiles
      .map((profile) => evaluateFreshness(profile, rateState))
      .filter((item) => item.freshness_score < 92 || item.stale_content_alerts.length > 0 || item.outdated_sections.length > 0)
      .sort((a, b) => a.freshness_score - b.freshness_score)
      .slice(0, 120);

    if (recommendations.length > 0) {
      const { error } = await supabase
        .from("auto_refresh_recommendations")
        .upsert(recommendations, { onConflict: "page_url" });
      if (error) throw error;
    }

    await supabase.from("seo_reports").insert({
      report_type: "auto_refresh_engine",
      total_keywords_tracked: (keywords as KeywordRow[] | null)?.length || 0,
      content_recommendations: recommendations.slice(0, 25).map((item) => ({
        url: item.page_url,
        score: item.freshness_score,
        action: item.recommended_updates[0],
        outdated_sections: item.outdated_sections,
      })),
      full_report_data: {
        generated_count: recommendations.length,
        rate_data: rateState,
        high_priority: recommendations.filter((item) => item.priority_level === "high").length,
      },
    });

    await supabase
      .from("sync_jobs")
      .update({ status: "success", completed_at: new Date().toISOString(), records_updated: recommendations.length })
      .eq("id", jobId);

    return new Response(JSON.stringify({ success: true, count: recommendations.length }), {
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
