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
  calcy_position: number | null;
  intent: string | null;
};

type ProgrammaticPageRow = {
  url_path: string;
  page_type: string;
  target_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  intro_text: string | null;
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
};

type ContentOptimizationRow = {
  page_url: string;
  primary_topic: string;
  direct_answers: unknown;
  ai_overview_sections: unknown;
  faq_additions: unknown;
  semantic_keywords: unknown;
  optimization_score: number;
  status: string;
};

type ContentGapRow = {
  affected_url: string;
  gap_type: string;
  keyword_topic: string | null;
  priority_score: number;
  status: string;
};

type PageProfile = {
  page_url: string;
  page_title: string;
  primary_topic: string;
  page_type: "calculator" | "programmatic" | "article";
  headings: string[];
  bodyText: string;
  wordCount: number;
  hasDirectAnswer: boolean;
  hasFaqs: boolean;
  hasStructuredAnswer: boolean;
  hasConciseSummary: boolean;
  hasSchemaSignals: boolean;
  hasConversationalCoverage: boolean;
  hasSnippetParagraph: boolean;
  impressions: number;
  clicks: number;
  position: number | null;
  keywords: KeywordRow[];
};

type AeoSuggestion = {
  page_url: string;
  page_title: string;
  primary_topic: string;
  aeo_score: number;
  snippet_readiness_score: number;
  answer_confidence_score: number;
  priority_level: "high" | "medium" | "low";
  missing_semantic_elements: string[];
  direct_answer_blocks: string[];
  ai_overview_summaries: string[];
  featured_snippet_paragraphs: string[];
  faq_improvements: string[];
  semantic_heading_improvements: string[];
  conversational_search_queries: string[];
  recommended_improvements: string[];
  signals: Record<string, unknown>;
};

const corePages: PageProfile[] = [
  {
    page_url: "/mortgage-calculator",
    page_title: "Mortgage Calculator",
    primary_topic: "mortgage repayments",
    page_type: "calculator",
    headings: ["How mortgage repayments are calculated", "Repayment frequency", "Interest and loan term", "Extra repayments", "Mortgage FAQs"],
    bodyText: "Australian mortgage repayment calculator with loan amount rate term repayment frequency extra repayments amortisation direct answers FAQs and examples.",
    wordCount: 1650,
    hasDirectAnswer: true,
    hasFaqs: true,
    hasStructuredAnswer: true,
    hasConciseSummary: true,
    hasSchemaSignals: true,
    hasConversationalCoverage: true,
    hasSnippetParagraph: true,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/borrowing-power-calculator",
    page_title: "Borrowing Power Calculator",
    primary_topic: "borrowing power",
    page_type: "calculator",
    headings: ["How borrowing power is estimated", "Income and expenses", "Interest rate buffer", "Debt and dependants"],
    bodyText: "Australian borrowing power calculator covering income expenses dependants debts buffers and serviceability with examples.",
    wordCount: 1250,
    hasDirectAnswer: true,
    hasFaqs: true,
    hasStructuredAnswer: true,
    hasConciseSummary: true,
    hasSchemaSignals: true,
    hasConversationalCoverage: false,
    hasSnippetParagraph: true,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/stamp-duty-calculator",
    page_title: "Stamp Duty Calculator",
    primary_topic: "stamp duty",
    page_type: "calculator",
    headings: ["Stamp duty rates by state", "First home buyer exemptions", "Upfront costs", "State comparison", "Stamp duty FAQs"],
    bodyText: "Australian stamp duty calculator with state rates first home buyer exemptions transfer duty upfront costs FAQs direct answer and state comparison.",
    wordCount: 2100,
    hasDirectAnswer: true,
    hasFaqs: true,
    hasStructuredAnswer: true,
    hasConciseSummary: true,
    hasSchemaSignals: true,
    hasConversationalCoverage: true,
    hasSnippetParagraph: true,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/lmi-calculator",
    page_title: "LMI Calculator",
    primary_topic: "lenders mortgage insurance",
    page_type: "calculator",
    headings: ["How LMI is calculated", "LVR and deposit", "Ways to avoid LMI", "LMI examples"],
    bodyText: "LMI calculator for Australian buyers with LVR deposit lenders mortgage insurance costs examples and ways to avoid LMI.",
    wordCount: 1450,
    hasDirectAnswer: true,
    hasFaqs: true,
    hasStructuredAnswer: true,
    hasConciseSummary: false,
    hasSchemaSignals: true,
    hasConversationalCoverage: false,
    hasSnippetParagraph: true,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/hecs-borrowing-power",
    page_title: "HECS Borrowing Power Calculator",
    primary_topic: "HECS borrowing power",
    page_type: "calculator",
    headings: ["How HECS affects borrowing power", "Income thresholds", "Repayment impact"],
    bodyText: "HECS HELP debt borrowing power calculator for Australian home loan serviceability.",
    wordCount: 900,
    hasDirectAnswer: false,
    hasFaqs: false,
    hasStructuredAnswer: false,
    hasConciseSummary: false,
    hasSchemaSignals: true,
    hasConversationalCoverage: false,
    hasSnippetParagraph: false,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/refinance-calculator",
    page_title: "Refinance Calculator",
    primary_topic: "refinancing",
    page_type: "calculator",
    headings: ["When refinancing makes sense", "Switching costs", "Break-even months", "Cashback offers"],
    bodyText: "Refinance calculator for home loan switching costs break-even savings cashback and interest rate comparison.",
    wordCount: 1550,
    hasDirectAnswer: true,
    hasFaqs: true,
    hasStructuredAnswer: true,
    hasConciseSummary: true,
    hasSchemaSignals: true,
    hasConversationalCoverage: false,
    hasSnippetParagraph: true,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
  {
    page_url: "/extra-repayments-calculator",
    page_title: "Extra Repayments Calculator",
    primary_topic: "extra repayments",
    page_type: "calculator",
    headings: ["How extra repayments reduce interest", "Repayment frequency", "Loan term impact"],
    bodyText: "Extra repayments calculator for paying off a home loan faster and estimating interest saved.",
    wordCount: 1100,
    hasDirectAnswer: false,
    hasFaqs: true,
    hasStructuredAnswer: false,
    hasConciseSummary: false,
    hasSchemaSignals: true,
    hasConversationalCoverage: false,
    hasSnippetParagraph: false,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
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
  return map[category || ""] || "/guides";
}

function countWords(text: string | null | undefined) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function weightedPosition(keywords: KeywordRow[]) {
  const impressions = keywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  if (!impressions) return null;
  return Number((keywords.reduce((sum, row) => sum + ((row.calcy_position || 99) * (row.calcy_impressions_28d || 0)), 0) / impressions).toFixed(1));
}

function titleFromUrl(url: string) {
  return url.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase()) || "Calcy Page";
}

function hasQuestionLanguage(text: string, keywords: KeywordRow[]) {
  const lower = text.toLowerCase();
  return /\b(what|how|why|when|can|does|is|should)\b/.test(lower) || keywords.some((row) => /^(what|how|why|when|can|does|is|should)\b/i.test(row.keyword));
}

function profileFromProgrammatic(row: ProgrammaticPageRow, keywords: KeywordRow[]): PageProfile {
  const text = `${row.meta_title || ""} ${row.meta_description || ""} ${row.h1 || ""} ${row.intro_text || ""}`;
  const lower = text.toLowerCase();
  return {
    page_url: normaliseUrl(row.url_path),
    page_title: row.h1 || row.meta_title || titleFromUrl(row.url_path),
    primary_topic: row.target_keyword || row.page_type.replaceAll("_", " "),
    page_type: "programmatic",
    headings: [row.h1 || ""].filter(Boolean),
    bodyText: text,
    wordCount: countWords(text),
    hasDirectAnswer: (row.intro_text || "").length >= 120,
    hasFaqs: lower.includes("faq") || lower.includes("question"),
    hasStructuredAnswer: lower.includes("calculator") && lower.includes("estimate"),
    hasConciseSummary: (row.meta_description || "").length >= 90,
    hasSchemaSignals: true,
    hasConversationalCoverage: hasQuestionLanguage(text, keywords),
    hasSnippetParagraph: (row.intro_text || "").length >= 80 && (row.intro_text || "").length <= 450,
    impressions: row.impressions_28d || 0,
    clicks: row.clicks_28d || 0,
    position: row.position,
    keywords,
  };
}

function profileFromArticle(row: NewsArticleRow, keywords: KeywordRow[]): PageProfile {
  const text = `${row.title} ${row.excerpt || ""} ${row.body || ""}`;
  const lower = text.toLowerCase();
  const headings = [...text.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>|^#{2,3}\s+(.+)$/gim)]
    .map((match) => String(match[1] || match[2] || "").replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .slice(0, 12);
  return {
    page_url: `/news/${row.slug}`,
    page_title: row.title,
    primary_topic: row.title,
    page_type: "article",
    headings,
    bodyText: text,
    wordCount: countWords(text),
    hasDirectAnswer: lower.includes("quick answer") || lower.includes("in short") || lower.includes("what this means"),
    hasFaqs: lower.includes("faq") || lower.includes("frequently asked"),
    hasStructuredAnswer: headings.length >= 3 && lower.includes("summary"),
    hasConciseSummary: (row.excerpt || "").length >= 80,
    hasSchemaSignals: true,
    hasConversationalCoverage: hasQuestionLanguage(text, keywords),
    hasSnippetParagraph: lower.includes("answer") || lower.includes("means"),
    impressions: keywords.reduce((sum, keyword) => sum + (keyword.calcy_impressions_28d || 0), 0),
    clicks: keywords.reduce((sum, keyword) => sum + (keyword.calcy_clicks_28d || 0), 0),
    position: weightedPosition(keywords),
    keywords,
  };
}

function applyKeywordStats(profile: PageProfile, keywordRows: KeywordRow[]) {
  const pageKeywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === profile.page_url || categoryTarget(row.category) === profile.page_url);
  return {
    ...profile,
    impressions: pageKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0),
    clicks: pageKeywords.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0),
    position: weightedPosition(pageKeywords),
    keywords: pageKeywords,
  };
}

function priorityFromScore(score: number): "high" | "medium" | "low" {
  if (score < 55) return "high";
  if (score < 75) return "medium";
  return "low";
}

function questionQueries(profile: PageProfile) {
  const topic = profile.primary_topic;
  const querySeeds = [
    `what is ${topic}`,
    `how does ${topic} work in Australia`,
    `how do I calculate ${topic}`,
    `why does ${topic} change`,
    `is ${topic} different by state`,
    `what affects ${topic}`,
  ];
  const gscQuestions = profile.keywords
    .filter((row) => /^(what|how|why|when|can|does|is|should)\b/i.test(row.keyword))
    .sort((a, b) => (b.calcy_impressions_28d || 0) - (a.calcy_impressions_28d || 0))
    .map((row) => row.keyword);
  return [...new Set([...gscQuestions, ...querySeeds])].slice(0, 10);
}

function semanticElements(profile: PageProfile, contentOpt: ContentOptimizationRow | undefined, gaps: ContentGapRow[]) {
  const missing: string[] = [];
  if (!profile.hasDirectAnswer) missing.push("direct answer block");
  if (!profile.hasFaqs) missing.push("FAQ answer set");
  if (!profile.hasStructuredAnswer) missing.push("structured answer section");
  if (!profile.hasConciseSummary) missing.push("concise summary");
  if (!profile.hasSnippetParagraph) missing.push("featured snippet paragraph");
  if (!profile.hasConversationalCoverage) missing.push("conversational query coverage");
  if (!profile.hasSchemaSignals) missing.push("schema completeness review");
  if (profile.headings.length < 4) missing.push("semantic H2/H3 coverage");
  if (profile.wordCount < 800) missing.push("supporting explanation depth");
  if (contentOpt?.ai_overview_sections && Array.isArray(contentOpt.ai_overview_sections) && contentOpt.ai_overview_sections.length === 0) missing.push("AI Overview-ready section");
  if (gaps.some((gap) => gap.gap_type.includes("schema"))) missing.push("schema opportunity");
  return [...new Set(missing)];
}

function buildDirectAnswer(profile: PageProfile) {
  return `${profile.page_title} helps estimate ${profile.primary_topic} using Australian assumptions. Enter the relevant loan, income, deposit, rate, property or repayment details, then use the result as an educational planning estimate and confirm important decisions with a lender or qualified professional.`;
}

function buildAiOverview(profile: PageProfile) {
  return `${profile.primary_topic} in Australia depends on the inputs used, current rules or lender policy, and the user's scenario. Calcy should answer this with a short definition, the main calculation inputs, common limitations, and a practical next step without presenting personal financial advice.`;
}

function buildSnippet(profile: PageProfile) {
  return `${profile.primary_topic} is estimated by combining the relevant Australian finance inputs, such as loan amount, rate, income, deposit, property value, state rules or repayment settings. The result is a planning estimate, not a lender approval or financial advice.`;
}

function makeSuggestion(
  profile: PageProfile,
  contentOptRows: ContentOptimizationRow[],
  gapRows: ContentGapRow[],
): AeoSuggestion | null {
  const contentOpt = contentOptRows.find((row) => normaliseUrl(row.page_url) === profile.page_url);
  const pageGaps = gapRows.filter((row) => normaliseUrl(row.affected_url) === profile.page_url);
  const missing = semanticElements(profile, contentOpt, pageGaps);

  const directAnswerScore = profile.hasDirectAnswer ? 18 : 4;
  const faqScore = profile.hasFaqs ? 14 : 3;
  const clarityScore = profile.headings.length >= 4 ? 14 : Math.max(4, profile.headings.length * 3);
  const snippetScore = profile.hasSnippetParagraph ? 18 : 5;
  const summaryScore = profile.hasConciseSummary ? 12 : 4;
  const schemaScore = profile.hasSchemaSignals ? 10 : 2;
  const conversationalScore = profile.hasConversationalCoverage ? 14 : 4;
  const aeoScore = clamp(directAnswerScore + faqScore + clarityScore + snippetScore + summaryScore + schemaScore + conversationalScore);
  const snippetReadiness = clamp((profile.hasDirectAnswer ? 25 : 8) + (profile.hasSnippetParagraph ? 25 : 8) + (profile.hasConciseSummary ? 18 : 8) + (profile.headings.length >= 4 ? 17 : 6) + (profile.position != null && profile.position <= 20 ? 15 : 5));
  const confidence = clamp((profile.hasSchemaSignals ? 20 : 5) + (profile.hasFaqs ? 18 : 5) + (profile.wordCount >= 900 ? 17 : 7) + (profile.hasStructuredAnswer ? 18 : 5) + (profile.keywords.length > 0 ? 12 : 5) + (profile.hasConversationalCoverage ? 15 : 5));

  if (aeoScore >= 86 && snippetReadiness >= 82 && missing.length <= 1) return null;

  const improvements: string[] = [];
  if (!profile.hasDirectAnswer) improvements.push("Add a 40-70 word direct answer block near the top of the page.");
  if (!profile.hasFaqs) improvements.push("Add concise FAQs that answer conversational Australian finance queries.");
  if (!profile.hasSnippetParagraph) improvements.push("Add a featured-snippet paragraph that defines the calculation and key inputs.");
  if (!profile.hasConciseSummary) improvements.push("Add a short AI Overview summary covering definition, inputs, limitations and next step.");
  if (!profile.hasConversationalCoverage) improvements.push("Add question-led headings that match voice search and answer engine phrasing.");
  if (profile.headings.length < 4) improvements.push("Improve semantic heading structure so answer engines can parse the page sections.");
  if (pageGaps.some((gap) => gap.gap_type.includes("schema"))) improvements.push("Review schema completeness before applying any content changes.");

  return {
    page_url: profile.page_url,
    page_title: profile.page_title,
    primary_topic: profile.primary_topic,
    aeo_score: aeoScore,
    snippet_readiness_score: snippetReadiness,
    answer_confidence_score: confidence,
    priority_level: priorityFromScore(aeoScore),
    missing_semantic_elements: missing,
    direct_answer_blocks: [buildDirectAnswer(profile)],
    ai_overview_summaries: [buildAiOverview(profile)],
    featured_snippet_paragraphs: [buildSnippet(profile)],
    faq_improvements: questionQueries(profile).slice(0, 5).map((query) => `${query}? Answer in 35-55 words with Australian assumptions and no advice claims.`),
    semantic_heading_improvements: [
      `What is ${profile.primary_topic}?`,
      `How ${profile.primary_topic} is calculated in Australia`,
      `What affects ${profile.primary_topic}?`,
      `What this estimate does not include`,
      `Next steps after using ${profile.page_title}`,
    ],
    conversational_search_queries: questionQueries(profile),
    recommended_improvements: improvements,
    signals: {
      page_type: profile.page_type,
      impressions_28d: profile.impressions,
      clicks_28d: profile.clicks,
      average_position: profile.position,
      word_count: profile.wordCount,
      headings_count: profile.headings.length,
      related_content_optimization_score: contentOpt?.optimization_score || 0,
      related_content_gaps: pageGaps.map((gap) => ({ gap_type: gap.gap_type, priority_score: gap.priority_score })),
      answer_engine_targets: ["Google AI Overviews", "ChatGPT", "Gemini", "Perplexity", "voice search"],
      quality_flags: {
        missing_direct_answer: !profile.hasDirectAnswer,
        missing_faqs: !profile.hasFaqs,
        weak_structured_answer: !profile.hasStructuredAnswer,
        weak_concise_summary: !profile.hasConciseSummary,
        weak_snippet_paragraph: !profile.hasSnippetParagraph,
        weak_conversational_coverage: !profile.hasConversationalCoverage,
        weak_heading_structure: profile.headings.length < 4,
      },
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
    job_type: "aeo_optimization",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [keywordsRes, programmaticRes, articlesRes, contentOptRes, gapsRes] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_clicks_28d, calcy_impressions_28d, calcy_position, intent").eq("is_active", true).limit(2000),
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, meta_title, meta_description, h1, intro_text, impressions_28d, clicks_28d, position").eq("is_active", true).limit(1200),
      supabase.from("news_articles").select("slug, title, excerpt, body, is_published, published_at").eq("is_published", true).limit(250),
      supabase.from("content_optimizations").select("page_url, primary_topic, direct_answers, ai_overview_sections, faq_additions, semantic_keywords, optimization_score, status").eq("status", "open").limit(300),
      supabase.from("content_gap_opportunities").select("affected_url, gap_type, keyword_topic, priority_score, status").eq("status", "open").limit(1000),
    ]);

    for (const result of [keywordsRes, programmaticRes, articlesRes, contentOptRes, gapsRes]) {
      if (result.error) throw result.error;
    }

    const keywordRows = (keywordsRes.data as KeywordRow[] | null) || [];
    const contentOptRows = (contentOptRes.data as ContentOptimizationRow[] | null) || [];
    const gapRows = (gapsRes.data as ContentGapRow[] | null) || [];
    const profiles = new Map<string, PageProfile>();

    for (const page of corePages) {
      const withStats = applyKeywordStats(page, keywordRows);
      profiles.set(withStats.page_url, withStats);
    }

    for (const page of ((programmaticRes.data as ProgrammaticPageRow[] | null) || [])) {
      const url = normaliseUrl(page.url_path);
      const pageKeywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === url);
      if (!profiles.has(url)) profiles.set(url, profileFromProgrammatic(page, pageKeywords));
    }

    for (const article of ((articlesRes.data as NewsArticleRow[] | null) || [])) {
      const articleKeywords = keywordRows.filter((row) => article.title.toLowerCase().includes(row.keyword.toLowerCase()) || row.keyword.toLowerCase().includes(article.title.toLowerCase().slice(0, 20)));
      const profile = profileFromArticle(article, articleKeywords);
      if (!profiles.has(profile.page_url)) profiles.set(profile.page_url, profile);
    }

    const suggestions = [...profiles.values()]
      .map((profile) => makeSuggestion(profile, contentOptRows, gapRows))
      .filter((item): item is AeoSuggestion => Boolean(item))
      .sort((a, b) => (a.aeo_score - b.aeo_score) || (b.snippet_readiness_score - a.snippet_readiness_score))
      .slice(0, 150);

    if (suggestions.length > 0) {
      const { error: upsertError } = await supabase
        .from("aeo_optimizations")
        .upsert(
          suggestions.map((suggestion) => ({
            ...suggestion,
            status: "open",
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "page_url" },
        );
      if (upsertError) throw upsertError;
    }

    const summary = {
      pages_checked: profiles.size,
      suggestions_generated: suggestions.length,
      high_priority: suggestions.filter((item) => item.priority_level === "high").length,
      average_aeo_score: suggestions.length ? Math.round(suggestions.reduce((sum, item) => sum + item.aeo_score, 0) / suggestions.length) : 0,
      keywords_checked: keywordRows.length,
    };

    await supabase.from("seo_reports").insert({
      report_type: "aeo_optimization",
      content_recommendations: suggestions.slice(0, 40),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: profiles.size,
      records_updated: suggestions.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, suggestions: suggestions.slice(0, 40) }), {
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
