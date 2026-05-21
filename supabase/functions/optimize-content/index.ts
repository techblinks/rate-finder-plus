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
  calcy_position_previous: number | null;
  trend_direction: string | null;
  opportunity_score: number | null;
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

type DraftRow = {
  slug: string | null;
  title: string;
  target_keyword: string | null;
  category: string | null;
  content: string | null;
  status: string;
  word_count: number | null;
  updated_at: string | null;
};

type NewsArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  is_published: boolean;
  published_at: string | null;
};

type LinkRow = {
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  priority: "high" | "medium" | "low";
  relationship_type: string | null;
  status: string;
};

type ContentGapRow = {
  affected_url: string;
  gap_type: string;
  keyword_topic: string | null;
  priority_score: number;
  suggested_fix: string;
  suggested_related_pages: unknown;
  is_quick_win: boolean;
  status: string;
};

type CtrRow = {
  page_url: string;
  primary_keyword: string;
  ctr_opportunity_score: number;
  estimated_missed_clicks: number;
  suggested_title: string;
  suggested_meta_description: string;
  suggested_featured_snippet_answer: string;
  status: string;
};

type PageProfile = {
  page_url: string;
  page_title: string;
  primary_topic: string;
  page_type: "calculator" | "programmatic" | "article" | "guide";
  headings: string[];
  hasFaqs: boolean;
  hasComparison: boolean;
  hasDirectAnswer: boolean;
  hasExamples: boolean;
  hasCalculatorExplanation: boolean;
  hasAiOverviewSection: boolean;
  hasSchemaSignals: boolean;
  bodyText: string;
  wordCount: number;
  freshnessDays: number | null;
  impressions: number;
  clicks: number;
  position: number | null;
  keywords: KeywordRow[];
};

type Suggestion = {
  page_url: string;
  page_title: string;
  primary_topic: string;
  optimization_score: number;
  priority_level: "high" | "medium" | "low";
  estimated_impact: string;
  recommended_improvements: string[];
  improved_headings: string[];
  faq_additions: string[];
  semantic_keywords: string[];
  comparison_tables: string[];
  snippet_sections: string[];
  direct_answers: string[];
  finance_examples: string[];
  calculator_explanation_improvements: string[];
  internal_linking_suggestions: Array<{ target: string; anchor: string; reason: string }>;
  ai_overview_sections: string[];
  signals: Record<string, unknown>;
};

const corePages: PageProfile[] = [
  {
    page_url: "/mortgage-calculator",
    page_title: "Mortgage Calculator",
    primary_topic: "mortgage repayments",
    page_type: "calculator",
    headings: ["How mortgage repayments are calculated", "Repayment frequency", "Interest and loan term", "Extra repayments", "Mortgage FAQs"],
    hasFaqs: true,
    hasComparison: true,
    hasDirectAnswer: true,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: true,
    hasSchemaSignals: true,
    bodyText: "Australian mortgage repayment calculator with loan amount rate term repayment frequency extra repayments amortisation and repayment planning examples.",
    wordCount: 1650,
    freshnessDays: 35,
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
    hasFaqs: true,
    hasComparison: false,
    hasDirectAnswer: true,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: true,
    hasSchemaSignals: true,
    bodyText: "Australian borrowing power calculator covering income expenses dependants debts buffers and serviceability.",
    wordCount: 1250,
    freshnessDays: 70,
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
    hasFaqs: true,
    hasComparison: true,
    hasDirectAnswer: true,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: true,
    hasSchemaSignals: true,
    bodyText: "Australian stamp duty calculator with state rates first home buyer exemptions transfer duty and upfront property costs.",
    wordCount: 2100,
    freshnessDays: 18,
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
    hasFaqs: true,
    hasComparison: true,
    hasDirectAnswer: true,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: true,
    hasSchemaSignals: true,
    bodyText: "LMI calculator for Australian buyers with LVR deposit lenders mortgage insurance costs and ways to avoid LMI.",
    wordCount: 1450,
    freshnessDays: 85,
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
    hasFaqs: false,
    hasComparison: false,
    hasDirectAnswer: false,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: false,
    hasSchemaSignals: true,
    bodyText: "HECS HELP debt borrowing power calculator for Australian home loan serviceability.",
    wordCount: 900,
    freshnessDays: 130,
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
    hasFaqs: true,
    hasComparison: true,
    hasDirectAnswer: true,
    hasExamples: false,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: true,
    hasSchemaSignals: true,
    bodyText: "Refinance calculator for home loan switching costs break-even savings cashback and interest rate comparison.",
    wordCount: 1550,
    freshnessDays: 95,
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
    hasFaqs: true,
    hasComparison: false,
    hasDirectAnswer: false,
    hasExamples: true,
    hasCalculatorExplanation: true,
    hasAiOverviewSection: false,
    hasSchemaSignals: true,
    bodyText: "Extra repayments calculator for paying off a home loan faster and estimating interest saved.",
    wordCount: 1100,
    freshnessDays: 115,
    impressions: 0,
    clicks: 0,
    position: null,
    keywords: [],
  },
];

const competitorCoverageTopics = [
  "eligibility assumptions",
  "current rate context",
  "state-based differences",
  "worked example",
  "comparison table",
  "limitations and exclusions",
  "next-step checklist",
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

function daysSince(date: string | null) {
  if (!date) return null;
  const ms = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.round(ms / 86_400_000));
}

function countWords(text: string | null | undefined) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function titleFromUrl(url: string) {
  return url
    .replace(/^\//, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase()) || "Calcy Page";
}

function semanticTerms(topic: string, keywords: KeywordRow[]) {
  const seed = [
    topic,
    "Australia",
    "calculator assumptions",
    "worked example",
    "eligibility",
    "fees and costs",
    "limitations",
    "next steps",
  ];
  const fromKeywords = keywords
    .slice()
    .sort((a, b) => (b.calcy_impressions_28d || 0) - (a.calcy_impressions_28d || 0))
    .slice(0, 8)
    .map((row) => row.keyword);
  return [...new Set([...fromKeywords, ...seed])].slice(0, 12);
}

function estimateImpact(profile: PageProfile, score: number) {
  const impressions = profile.impressions;
  if (score >= 78 && impressions >= 500) return "High: likely ranking, CTR and AEO upside because this page has search demand and multiple content quality gaps.";
  if (score >= 65) return "Medium-high: should improve topical completeness, snippets and engagement once reviewed and applied.";
  if (impressions >= 200) return "Medium: page has existing visibility, so targeted content refinement may increase qualified clicks.";
  return "Low-medium: useful quality improvement, but impact depends on future search demand and internal links.";
}

function priorityFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function relatedPagesFor(topic: string) {
  const lower = topic.toLowerCase();
  const related = corePages
    .filter((page) => page.primary_topic !== topic && (
      lower.includes(page.primary_topic.toLowerCase()) ||
      page.primary_topic.toLowerCase().includes(lower) ||
      page.bodyText.toLowerCase().split(/\s+/).some((part) => lower.includes(part) && part.length > 4)
    ))
    .map((page) => page.page_url);
  return [...new Set([...related, "/mortgage-calculator", "/borrowing-power-calculator", "/stamp-duty-calculator"])].slice(0, 4);
}

function buildProfileFromProgrammatic(row: ProgrammaticPageRow, keywords: KeywordRow[]): PageProfile {
  const text = `${row.meta_title || ""} ${row.meta_description || ""} ${row.h1 || ""} ${row.intro_text || ""}`;
  const lower = text.toLowerCase();
  return {
    page_url: normaliseUrl(row.url_path),
    page_title: row.h1 || row.meta_title || titleFromUrl(row.url_path),
    primary_topic: row.target_keyword || row.page_type.replaceAll("_", " "),
    page_type: "programmatic",
    headings: [row.h1 || ""].filter(Boolean),
    hasFaqs: lower.includes("faq") || lower.includes("question"),
    hasComparison: lower.includes("compare") || lower.includes(" vs ") || lower.includes("table"),
    hasDirectAnswer: (row.intro_text || "").length >= 120,
    hasExamples: lower.includes("example") || lower.includes("scenario"),
    hasCalculatorExplanation: lower.includes("calculator") && (lower.includes("enter") || lower.includes("input") || lower.includes("calculate")),
    hasAiOverviewSection: lower.includes("in short") || lower.includes("quick answer") || lower.includes("summary"),
    hasSchemaSignals: true,
    bodyText: text,
    wordCount: countWords(text),
    freshnessDays: null,
    impressions: row.impressions_28d || 0,
    clicks: row.clicks_28d || 0,
    position: row.position,
    keywords,
  };
}

function buildProfileFromDraft(row: DraftRow, keywords: KeywordRow[]): PageProfile | null {
  if (!row.slug || row.status !== "published") return null;
  const text = `${row.title} ${row.target_keyword || ""} ${row.content || ""}`;
  const lower = text.toLowerCase();
  return {
    page_url: `/guides/${row.slug}`,
    page_title: row.title,
    primary_topic: row.target_keyword || row.title,
    page_type: "guide",
    headings: [...text.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => match[1]).slice(0, 12),
    hasFaqs: lower.includes("faq") || lower.includes("frequently asked"),
    hasComparison: lower.includes("compare") || lower.includes(" vs ") || lower.includes("|"),
    hasDirectAnswer: lower.includes("quick answer") || lower.includes("in short") || lower.includes("the short answer"),
    hasExamples: lower.includes("example") || lower.includes("scenario"),
    hasCalculatorExplanation: lower.includes("calculator") && lower.includes("use"),
    hasAiOverviewSection: lower.includes("ai overview") || lower.includes("summary") || lower.includes("answer"),
    hasSchemaSignals: true,
    bodyText: text,
    wordCount: row.word_count || countWords(row.content),
    freshnessDays: daysSince(row.updated_at),
    impressions: keywords.reduce((sum, keyword) => sum + (keyword.calcy_impressions_28d || 0), 0),
    clicks: keywords.reduce((sum, keyword) => sum + (keyword.calcy_clicks_28d || 0), 0),
    position: weightedPosition(keywords),
    keywords,
  };
}

function buildProfileFromArticle(row: NewsArticleRow, keywords: KeywordRow[]): PageProfile {
  const text = `${row.title} ${row.excerpt || ""} ${row.body || ""}`;
  const lower = text.toLowerCase();
  return {
    page_url: `/news/${row.slug}`,
    page_title: row.title,
    primary_topic: row.title,
    page_type: "article",
    headings: [...text.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => match[1]).slice(0, 12),
    hasFaqs: lower.includes("faq") || lower.includes("frequently asked"),
    hasComparison: lower.includes("compare") || lower.includes(" vs ") || lower.includes("table"),
    hasDirectAnswer: lower.includes("quick answer") || lower.includes("in short") || lower.includes("what this means"),
    hasExamples: lower.includes("example") || lower.includes("scenario"),
    hasCalculatorExplanation: lower.includes("calculator") || lower.includes("estimate"),
    hasAiOverviewSection: lower.includes("summary") || lower.includes("answer"),
    hasSchemaSignals: true,
    bodyText: text,
    wordCount: countWords(text),
    freshnessDays: daysSince(row.published_at),
    impressions: keywords.reduce((sum, keyword) => sum + (keyword.calcy_impressions_28d || 0), 0),
    clicks: keywords.reduce((sum, keyword) => sum + (keyword.calcy_clicks_28d || 0), 0),
    position: weightedPosition(keywords),
    keywords,
  };
}

function weightedPosition(keywords: KeywordRow[]) {
  const impressions = keywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  if (!impressions) return null;
  return Number((keywords.reduce((sum, row) => sum + ((row.calcy_position || 99) * (row.calcy_impressions_28d || 0)), 0) / impressions).toFixed(1));
}

function applyKeywordStats(profile: PageProfile, keywordRows: KeywordRow[]) {
  const pageKeywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === profile.page_url || categoryTarget(row.category) === profile.page_url);
  const impressions = pageKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  const clicks = pageKeywords.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0);
  return {
    ...profile,
    impressions,
    clicks,
    position: weightedPosition(pageKeywords),
    keywords: pageKeywords,
  };
}

function makeSuggestion(
  profile: PageProfile,
  links: LinkRow[],
  gaps: ContentGapRow[],
  ctrRows: CtrRow[],
): Suggestion | null {
  const pageGaps = gaps.filter((gap) => normaliseUrl(gap.affected_url) === profile.page_url);
  const inboundLinks = links.filter((link) => normaliseUrl(link.target_page) === profile.page_url);
  const outboundLinks = links.filter((link) => normaliseUrl(link.source_page) === profile.page_url);
  const ctr = ctrRows.find((row) => normaliseUrl(row.page_url) === profile.page_url);
  const headingsWeak = profile.headings.length < 4 || profile.headings.some((heading) => heading.length < 14);
  const semanticWeak = semanticTerms(profile.primary_topic, profile.keywords).length < 7 || profile.wordCount < 900;
  const freshnessWeak = profile.freshnessDays != null && profile.freshnessDays > 90;
  const readabilityWeak = profile.wordCount > 2600 || profile.wordCount < 700;
  const internalLinksWeak = inboundLinks.length < 2 || outboundLinks.length < 2;
  const competitorGaps = competitorCoverageTopics.filter((topic) => !profile.bodyText.toLowerCase().includes(topic.split(" ")[0]));

  const flags = {
    headingsWeak,
    missingFaqs: !profile.hasFaqs,
    semanticWeak,
    freshnessWeak,
    internalLinksWeak,
    snippetWeak: !profile.hasDirectAnswer,
    aiOverviewWeak: !profile.hasAiOverviewSection,
    readabilityWeak,
    topicalCompletenessWeak: pageGaps.length > 0 || competitorGaps.length >= 3,
    missingComparison: !profile.hasComparison,
    missingExamples: !profile.hasExamples,
    calculatorExplanationWeak: !profile.hasCalculatorExplanation,
    ctrOpportunity: Boolean(ctr && ctr.ctr_opportunity_score >= 55),
  };

  const riskCount = Object.values(flags).filter(Boolean).length;
  const demandBoost = Math.min(18, profile.impressions / 400);
  const positionBoost = profile.position != null && profile.position <= 20 ? 10 : 0;
  const score = clamp(30 + riskCount * 5.5 + demandBoost + positionBoost + (ctr?.ctr_opportunity_score || 0) * 0.12 + Math.min(10, pageGaps.length * 2));
  if (score < 45 && riskCount < 4) return null;

  const semanticKeywords = semanticTerms(profile.primary_topic, profile.keywords);
  const related = relatedPagesFor(profile.primary_topic);
  const recommended: string[] = [];
  if (flags.headingsWeak) recommended.push("Strengthen H2/H3 structure so the page covers calculation method, assumptions, examples, limitations and next steps.");
  if (flags.missingFaqs) recommended.push("Add admin-reviewed FAQs that answer real Australian finance questions without keyword stuffing.");
  if (flags.semanticWeak) recommended.push("Expand semantic coverage naturally using related query language from GSC and finance intent terms.");
  if (flags.freshnessWeak) recommended.push("Refresh date-sensitive assumptions, rates, thresholds and examples before promoting the page.");
  if (flags.internalLinksWeak) recommended.push("Add contextual internal links to and from related calculators, guides and programmatic pages.");
  if (flags.snippetWeak) recommended.push("Add a concise direct-answer block near the top of the page for featured snippets and AI answers.");
  if (flags.aiOverviewWeak) recommended.push("Add an AI Overview-ready summary that explains what the page calculates, key inputs, limits and next step.");
  if (flags.missingComparison) recommended.push("Add a compact comparison table where it helps users compare options, costs, states or scenarios.");
  if (flags.missingExamples) recommended.push("Add realistic Australian finance examples using transparent assumptions.");
  if (flags.calculatorExplanationWeak) recommended.push("Improve the calculator explanation so users understand inputs, outputs and limitations.");
  if (ctr) recommended.push(`Review CTR suggestions for "${ctr.primary_keyword}" before changing title, meta or snippet copy.`);

  return {
    page_url: profile.page_url,
    page_title: profile.page_title,
    primary_topic: profile.primary_topic,
    optimization_score: score,
    priority_level: priorityFromScore(score),
    estimated_impact: estimateImpact(profile, score),
    recommended_improvements: recommended.slice(0, 10),
    improved_headings: [
      `How ${profile.primary_topic} is calculated in Australia`,
      `Key assumptions that change your ${profile.primary_topic} estimate`,
      `${profile.page_title} example scenarios`,
      `What this calculator does not include`,
      `Next steps after using this calculator`,
    ],
    faq_additions: [
      `What information do I need to estimate ${profile.primary_topic}?`,
      `Why can ${profile.primary_topic} vary between lenders or states?`,
      `Is this ${profile.page_title.toLowerCase()} financial advice?`,
      `How often should I update my assumptions?`,
    ],
    semantic_keywords: semanticKeywords,
    comparison_tables: [
      `${profile.primary_topic} by scenario, borrower type or state`,
      "Inputs, assumptions and outputs comparison",
    ],
    snippet_sections: [
      `Add a 40-60 word answer for: What is ${profile.primary_topic}?`,
      "Add a bullet summary of inputs, outputs and limitations above the long-form content.",
    ],
    direct_answers: [
      `${profile.page_title} helps estimate ${profile.primary_topic} using Australian assumptions. Enter the relevant loan, income, deposit, rate or property details, then compare the result against lender or government rules before making decisions.`,
    ],
    finance_examples: [
      `Example: show ${profile.primary_topic} for a typical first-home buyer scenario with transparent assumptions.`,
      `Example: compare a conservative and stretched scenario so users understand sensitivity.`,
    ],
    calculator_explanation_improvements: [
      "Explain which inputs have the biggest impact on the result.",
      "State what the calculator excludes and when users should confirm details externally.",
    ],
    internal_linking_suggestions: related.map((target) => ({
      target,
      anchor: target.replace(/^\//, "").replace(/-/g, " "),
      reason: `Supports topical authority around ${profile.primary_topic} and gives users a natural next step.`,
    })),
    ai_overview_sections: [
      `Quick answer: ${profile.primary_topic} in Australia depends on inputs, assumptions and timing.`,
      "Include a short limitations paragraph that avoids advice language and explains verification steps.",
    ],
    signals: {
      page_type: profile.page_type,
      impressions_28d: profile.impressions,
      clicks_28d: profile.clicks,
      average_position: profile.position,
      word_count: profile.wordCount,
      freshness_days: profile.freshnessDays,
      inbound_link_suggestions: inboundLinks.length,
      outbound_link_suggestions: outboundLinks.length,
      related_content_gaps: pageGaps.map((gap) => ({ gap_type: gap.gap_type, score: gap.priority_score })),
      ctr_opportunity_score: ctr?.ctr_opportunity_score || 0,
      competitor_coverage_gaps: competitorGaps.slice(0, 6),
      quality_flags: flags,
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
    job_type: "content_optimization",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [keywordsRes, programmaticRes, draftsRes, articlesRes, linksRes, gapsRes, ctrRes] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_clicks_28d, calcy_impressions_28d, calcy_position, calcy_position_previous, trend_direction, opportunity_score").eq("is_active", true).limit(2000),
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, meta_title, meta_description, h1, intro_text, impressions_28d, clicks_28d, position").eq("is_active", true).limit(1200),
      supabase.from("content_drafts").select("slug, title, target_keyword, category, content, status, word_count, updated_at").in("status", ["published", "approved", "draft"]).limit(500),
      supabase.from("news_articles").select("slug, title, excerpt, body, is_published, published_at").eq("is_published", true).limit(250),
      supabase.from("internal_link_opportunities").select("source_page, target_page, suggested_anchor_text, priority, relationship_type, status").eq("status", "open").limit(1000),
      supabase.from("content_gap_opportunities").select("affected_url, gap_type, keyword_topic, priority_score, suggested_fix, suggested_related_pages, is_quick_win, status").eq("status", "open").limit(1000),
      supabase.from("ctr_optimizations").select("page_url, primary_keyword, ctr_opportunity_score, estimated_missed_clicks, suggested_title, suggested_meta_description, suggested_featured_snippet_answer, status").eq("status", "open").limit(300),
    ]);

    for (const result of [keywordsRes, programmaticRes, draftsRes, articlesRes, linksRes, gapsRes, ctrRes]) {
      if (result.error) throw result.error;
    }

    const keywordRows = (keywordsRes.data as KeywordRow[] | null) || [];
    const linkRows = (linksRes.data as LinkRow[] | null) || [];
    const gapRows = (gapsRes.data as ContentGapRow[] | null) || [];
    const ctrRows = (ctrRes.data as CtrRow[] | null) || [];

    const profiles = new Map<string, PageProfile>();
    for (const page of corePages) {
      const withStats = applyKeywordStats(page, keywordRows);
      profiles.set(withStats.page_url, withStats);
    }

    for (const page of ((programmaticRes.data as ProgrammaticPageRow[] | null) || [])) {
      const url = normaliseUrl(page.url_path);
      const pageKeywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === url);
      if (!profiles.has(url)) profiles.set(url, buildProfileFromProgrammatic(page, pageKeywords));
    }

    for (const draft of ((draftsRes.data as DraftRow[] | null) || [])) {
      const relatedKeywords = keywordRows.filter((row) => row.keyword.toLowerCase().includes((draft.target_keyword || draft.title).toLowerCase()));
      const profile = buildProfileFromDraft(draft, relatedKeywords);
      if (profile && !profiles.has(profile.page_url)) profiles.set(profile.page_url, profile);
    }

    for (const article of ((articlesRes.data as NewsArticleRow[] | null) || [])) {
      const relatedKeywords = keywordRows.filter((row) => article.title.toLowerCase().includes(row.keyword.toLowerCase()) || row.keyword.toLowerCase().includes(article.title.toLowerCase().slice(0, 20)));
      const profile = buildProfileFromArticle(article, relatedKeywords);
      if (!profiles.has(profile.page_url)) profiles.set(profile.page_url, profile);
    }

    const suggestions = [...profiles.values()]
      .map((profile) => makeSuggestion(profile, linkRows, gapRows, ctrRows))
      .filter((item): item is Suggestion => Boolean(item))
      .sort((a, b) => b.optimization_score - a.optimization_score)
      .slice(0, 150);

    if (suggestions.length > 0) {
      const { error: upsertError } = await supabase
        .from("content_optimizations")
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
      keywords_checked: keywordRows.length,
      content_gaps_used: gapRows.length,
      ctr_opportunities_used: ctrRows.length,
    };

    await supabase.from("seo_reports").insert({
      report_type: "content_optimization",
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
