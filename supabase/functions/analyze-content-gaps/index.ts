import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_impressions_28d: number | null;
  calcy_position: number | null;
  opportunity_score: number | null;
  content_gap_notes: string | null;
};

type ProgrammaticPageRow = {
  url_path: string;
  page_type: string;
  target_keyword: string | null;
  h1: string | null;
  intro_text: string | null;
  meta_description: string | null;
  impressions_28d: number | null;
  position: number | null;
};

type DraftRow = {
  slug: string | null;
  title: string;
  target_keyword: string | null;
  category: string | null;
  status: string;
  word_count: number | null;
};

type NewsArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  is_published: boolean;
};

type InternalLinkRow = {
  source_page: string;
  target_page: string;
  priority: "high" | "medium" | "low";
  relationship_type: string | null;
};

type Gap = {
  gap_type: string;
  affected_url: string;
  keyword_topic: string | null;
  priority_score: number;
  estimated_traffic_opportunity: number;
  suggested_fix: string;
  suggested_content_type: string;
  suggested_related_pages: string[];
  is_quick_win: boolean;
  signals: Record<string, unknown>;
};

type PageProfile = {
  url: string;
  title: string;
  type: "calculator" | "seo" | "article";
  topics: string[];
  hasFaqs: boolean;
  hasSchema: boolean;
  hasComparison: boolean;
  hasExamples: boolean;
  hasAiOverviewBlock: boolean;
};

const corePages: PageProfile[] = [
  {
    url: "/mortgage-calculator",
    title: "Mortgage Calculator",
    type: "calculator",
    topics: ["mortgage", "home loan", "repayment", "interest rate"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: true,
    hasAiOverviewBlock: true,
  },
  {
    url: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    type: "calculator",
    topics: ["borrowing power", "serviceability", "income", "expenses"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: false,
    hasExamples: true,
    hasAiOverviewBlock: true,
  },
  {
    url: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    type: "calculator",
    topics: ["stamp duty", "transfer duty", "first home buyer", "upfront costs"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: true,
    hasAiOverviewBlock: true,
  },
  {
    url: "/lmi-calculator",
    title: "LMI Calculator",
    type: "calculator",
    topics: ["lmi", "lenders mortgage insurance", "deposit", "lvr"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: true,
    hasAiOverviewBlock: true,
  },
  {
    url: "/hecs-borrowing-power",
    title: "HECS Borrowing Power Calculator",
    type: "calculator",
    topics: ["hecs", "help debt", "student debt", "borrowing power"],
    hasFaqs: false,
    hasSchema: true,
    hasComparison: false,
    hasExamples: true,
    hasAiOverviewBlock: false,
  },
  {
    url: "/refinance-calculator",
    title: "Refinance Calculator",
    type: "calculator",
    topics: ["refinance", "switch home loan", "interest saving", "break even"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: false,
    hasAiOverviewBlock: true,
  },
  {
    url: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    type: "calculator",
    topics: ["extra repayments", "offset", "interest saved", "pay off loan faster"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: false,
    hasExamples: true,
    hasAiOverviewBlock: false,
  },
  {
    url: "/loan-comparison-calculator",
    title: "Loan Comparison Calculator",
    type: "calculator",
    topics: ["loan comparison", "home loan", "interest rate"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: true,
    hasAiOverviewBlock: false,
  },
  {
    url: "/rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator",
    type: "calculator",
    topics: ["rent vs buy", "property affordability", "deposit"],
    hasFaqs: true,
    hasSchema: true,
    hasComparison: true,
    hasExamples: true,
    hasAiOverviewBlock: false,
  },
];

const futureCalculatorGaps = [
  {
    url: "/offset-calculator",
    score: 84,
    fix: "Plan an admin-approved Offset Calculator that compares offset balances, extra repayments and interest saved. Link it from mortgage, refinance and extra repayments pages.",
    topics: ["offset", "offset account", "mortgage interest"],
  },
  {
    url: "/fixed-vs-variable-calculator",
    score: 78,
    fix: "Plan a Fixed vs Variable Calculator with rate assumptions, break-cost notes, scenario examples and links to refinance and loan comparison pages.",
    topics: ["fixed rate", "variable rate", "loan comparison"],
  },
  {
    url: "/property-affordability-calculator",
    score: 74,
    fix: "Plan a Property Affordability Calculator that combines borrowing power, deposit, stamp duty, LMI and suburb context without replacing existing calculators.",
    topics: ["property affordability", "how much house can i afford"],
  },
  {
    url: "/investment-property-calculator",
    score: 70,
    fix: "Plan an Investment Property Calculator for investor cashflow, repayment assumptions, rent yield and holding-cost intent.",
    topics: ["investment property", "rental yield", "negative gearing"],
  },
];

const missingFinanceTopics = [
  { topic: "offset account calculator", url: "/offset-calculator", type: "calculator_page", related: ["/mortgage-calculator", "/extra-repayments-calculator", "/refinance-calculator"] },
  { topic: "redraw vs offset", url: "/guides/redraw-vs-offset", type: "guide", related: ["/mortgage-calculator", "/extra-repayments-calculator"] },
  { topic: "interest only mortgage calculator", url: "/interest-only-calculator", type: "calculator_page", related: ["/mortgage-calculator", "/investment-property-calculator"] },
  { topic: "first home buyer deposit calculator", url: "/first-home-buyer-deposit-calculator", type: "calculator_page", related: ["/stamp-duty-calculator", "/lmi-calculator", "/borrowing-power-calculator"] },
  { topic: "mortgage stress test calculator", url: "/mortgage-stress-test-calculator", type: "calculator_page", related: ["/mortgage-calculator", "/borrowing-power-calculator"] },
];

const stateTerms = ["nsw", "new south wales", "vic", "victoria", "qld", "queensland", "wa", "western australia", "sa", "south australia", "tas", "tasmania", "act", "nt", "northern territory"];
const suburbSignals = ["sydney", "melbourne", "brisbane", "perth", "adelaide", "hobart", "canberra", "darwin", "suburb", "near me"];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function estimateTraffic(impressions: number, position: number | null | undefined) {
  const multiplier = position && position <= 10 ? 0.04 : position && position <= 20 ? 0.08 : 0.035;
  return Math.max(0, Math.round(impressions * multiplier));
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

function keywordMatchesPage(keyword: string, url: string | null) {
  if (!url || url === "/guides") return false;
  const normalised = normaliseUrl(url).replace(/[-/]/g, " ").toLowerCase();
  const terms = keyword.toLowerCase().split(/\s+/).filter((part) => part.length > 3);
  return terms.length > 0 && terms.some((part) => normalised.includes(part));
}

function relatedPagesFor(topic: string, fallback: string[]) {
  const lower = topic.toLowerCase();
  const related = corePages
    .filter((page) => page.topics.some((pageTopic) => lower.includes(pageTopic) || pageTopic.includes(lower)))
    .map((page) => page.url);
  return [...new Set([...related, ...fallback])].slice(0, 5);
}

function suggestedTypeForGap(gapType: string, affectedUrl: string) {
  if (gapType.includes("calculator")) return "calculator_page";
  if (gapType.includes("faq")) return "faq_section";
  if (gapType.includes("schema")) return "schema_markup";
  if (gapType.includes("comparison")) return "comparison_section";
  if (gapType.includes("example")) return "example_section";
  if (gapType.includes("internal_link")) return "internal_link_update";
  if (gapType.includes("state") || gapType.includes("suburb")) return "localized_seo_page";
  if (affectedUrl.startsWith("/guides")) return "guide_update";
  return "content_update";
}

function quickWin(gap: Omit<Gap, "is_quick_win">) {
  return gap.priority_score >= 72 &&
    ["missing_faqs", "missing_internal_links", "missing_comparison_section", "missing_examples", "missing_ai_overview_optimization", "missing_schema_opportunity", "keyword_without_matching_page"].includes(gap.gap_type);
}

function addGap(gaps: Map<string, Gap>, gap: Omit<Gap, "is_quick_win">) {
  const enriched = { ...gap, is_quick_win: quickWin(gap) };
  const key = `${enriched.gap_type}|${enriched.affected_url}|${enriched.suggested_fix}`;
  const existing = gaps.get(key);
  if (!existing || enriched.priority_score > existing.priority_score) {
    gaps.set(key, enriched);
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

  await supabase.from("sync_jobs").insert({
    id: jobId,
    job_type: "content_gap_analysis",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: keywords }, { data: programmaticPages }, { data: drafts }, { data: newsArticles }, { data: internalLinks }] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_impressions_28d, calcy_position, opportunity_score, content_gap_notes").eq("is_active", true).limit(1500),
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, h1, intro_text, meta_description, impressions_28d, position").eq("is_active", true).limit(1200),
      supabase.from("content_drafts").select("slug, title, target_keyword, category, status, word_count").in("status", ["brief", "draft", "approved", "published"]).limit(700),
      supabase.from("news_articles").select("slug, title, excerpt, is_published").eq("is_published", true).limit(200),
      supabase.from("internal_link_opportunities").select("source_page, target_page, priority, relationship_type").eq("status", "open").limit(1000),
    ]);

    const keywordRows = (keywords as KeywordRow[] | null) || [];
    const programmaticRows = (programmaticPages as ProgrammaticPageRow[] | null) || [];
    const draftRows = (drafts as DraftRow[] | null) || [];
    const articleRows = (newsArticles as NewsArticleRow[] | null) || [];
    const linkRows = (internalLinks as InternalLinkRow[] | null) || [];
    const activeUrls = new Set([...corePages.map((page) => page.url), ...programmaticRows.map((row) => normaliseUrl(row.url_path))]);
    const draftKeywords = new Set(draftRows.map((draft) => draft.target_keyword?.toLowerCase()).filter(Boolean));
    const gaps = new Map<string, Gap>();

    for (const calculator of futureCalculatorGaps) {
      if (activeUrls.has(calculator.url)) continue;
      const demand = keywordRows.filter((row) => calculator.topics.some((topic) => row.keyword.toLowerCase().includes(topic)));
      const impressions = demand.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
      addGap(gaps, {
        gap_type: "missing_calculator_page",
        affected_url: calculator.url,
        keyword_topic: calculator.topics[0],
        suggested_fix: calculator.fix,
        priority_score: clamp(calculator.score + Math.min(12, impressions / 250)),
        estimated_traffic_opportunity: estimateTraffic(impressions, 18),
        suggested_content_type: "calculator_page",
        suggested_related_pages: relatedPagesFor(calculator.topics.join(" "), ["/mortgage-calculator", "/borrowing-power-calculator"]),
        signals: { matching_keywords: demand.map((row) => row.keyword).slice(0, 10), impressions_28d: impressions, page_status: "missing" },
      });
    }

    for (const topic of missingFinanceTopics) {
      if (activeUrls.has(topic.url)) continue;
      const demand = keywordRows.filter((row) => row.keyword.toLowerCase().includes(topic.topic.split(" ")[0]));
      const impressions = demand.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
      addGap(gaps, {
        gap_type: "missing_topical_coverage",
        affected_url: topic.url,
        keyword_topic: topic.topic,
        suggested_fix: `Create an admin-approved ${topic.type.replaceAll("_", " ")} brief for "${topic.topic}" with original examples, FAQs, comparison context and links to related calculators before publishing.`,
        priority_score: clamp(58 + Math.min(24, impressions / 120) + (topic.type === "calculator_page" ? 8 : 0)),
        estimated_traffic_opportunity: estimateTraffic(impressions, 22),
        suggested_content_type: topic.type,
        suggested_related_pages: topic.related,
        signals: { matching_keywords: demand.map((row) => row.keyword).slice(0, 10), impressions_28d: impressions },
      });
    }

    for (const page of corePages) {
      const relatedKeywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === page.url || categoryTarget(row.category) === page.url);
      const impressions = relatedKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
      const avgPosition = relatedKeywords.length
        ? relatedKeywords.reduce((sum, row) => sum + (row.calcy_position || 80), 0) / relatedKeywords.length
        : null;
      const inboundLinks = linkRows.filter((row) => normaliseUrl(row.target_page) === page.url).length;

      if (!page.hasFaqs) {
        addGap(gaps, {
          gap_type: "missing_faqs",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Add admin-reviewed FAQs to ${page.title} that answer Australian borrower questions and support FAQ schema. Keep answers educational and assumption-led.`,
          priority_score: clamp(70 + Math.min(18, impressions / 180)),
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "faq_section",
          suggested_related_pages: relatedPagesFor(page.topics.join(" "), []),
          signals: { impressions_28d: impressions, average_position: avgPosition, current_faq_coverage: "missing" },
        });
      }

      if (inboundLinks < 3) {
        addGap(gaps, {
          gap_type: "missing_internal_links",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Add contextual links into ${page.title} from related calculators, guides and programmatic pages. Review anchors manually before publishing.`,
          priority_score: clamp(62 + Math.min(18, impressions / 220) + (page.type === "calculator" ? 8 : 0)),
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "internal_link_update",
          suggested_related_pages: relatedPagesFor(page.topics.join(" "), ["/best-home-loans-australia"]),
          signals: { inbound_link_suggestions: inboundLinks, impressions_28d: impressions, average_position: avgPosition },
        });
      }

      if (!page.hasComparison) {
        addGap(gaps, {
          gap_type: "missing_comparison_section",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Add a useful comparison section to ${page.title}, such as calculator vs related cost, repayment or eligibility scenario. Do not add generic filler.`,
          priority_score: clamp(60 + Math.min(16, impressions / 250)),
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "comparison_section",
          suggested_related_pages: relatedPagesFor(page.topics.join(" "), []),
          signals: { impressions_28d: impressions, average_position: avgPosition },
        });
      }

      if (!page.hasExamples) {
        addGap(gaps, {
          gap_type: "missing_examples",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Add realistic Australian examples or use cases to ${page.title} so users and AI answers can understand assumptions and next steps.`,
          priority_score: clamp(58 + Math.min(18, impressions / 220)),
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "example_section",
          suggested_related_pages: relatedPagesFor(page.topics.join(" "), []),
          signals: { impressions_28d: impressions, average_position: avgPosition },
        });
      }

      if (!page.hasAiOverviewBlock) {
        addGap(gaps, {
          gap_type: "missing_ai_overview_optimization",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Add a concise answer block to ${page.title} that defines the calculation, key inputs, limitations and next step in 40-70 words.`,
          priority_score: clamp(64 + Math.min(18, impressions / 200)),
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "answer_block",
          suggested_related_pages: relatedPagesFor(page.topics.join(" "), []),
          signals: { impressions_28d: impressions, average_position: avgPosition, answer_engine_target: true },
        });
      }

      if (!page.hasSchema) {
        addGap(gaps, {
          gap_type: "missing_schema_opportunity",
          affected_url: page.url,
          keyword_topic: page.topics[0],
          suggested_fix: `Review schema coverage for ${page.title}. Consider FAQ, Breadcrumb and SoftwareApplication schema where appropriate.`,
          priority_score: 72,
          estimated_traffic_opportunity: estimateTraffic(impressions, avgPosition),
          suggested_content_type: "schema_markup",
          suggested_related_pages: [],
          signals: { schema_gap: true },
        });
      }
    }

    for (const page of programmaticRows) {
      const introLength = page.intro_text?.trim().length || 0;
      const metaLength = page.meta_description?.trim().length || 0;
      const headingsWeak = (page.h1?.trim().length || 0) < 18 || !page.target_keyword;
      const impressions = page.impressions_28d || 0;
      const position = page.position || 99;

      if (introLength < 180 || metaLength < 80) {
        addGap(gaps, {
          gap_type: "weak_thin_page",
          affected_url: page.url_path,
          keyword_topic: page.target_keyword || page.page_type,
          suggested_fix: "Expand this programmatic SEO page with unique local context, assumptions, examples, FAQs and calculator links before further promotion.",
          priority_score: clamp(62 + impressions / 50 + (position <= 20 ? 10 : 0)),
          estimated_traffic_opportunity: estimateTraffic(impressions, position),
          suggested_content_type: "localized_seo_update",
          suggested_related_pages: relatedPagesFor(`${page.target_keyword || ""} ${page.page_type}`, ["/mortgage-calculator", "/stamp-duty-calculator", "/lmi-calculator"]),
          signals: { intro_length: introLength, meta_length: metaLength, impressions_28d: impressions, position },
        });
      }

      if (headingsWeak) {
        addGap(gaps, {
          gap_type: "weak_headings_structure",
          affected_url: page.url_path,
          keyword_topic: page.target_keyword || page.page_type,
          suggested_fix: "Review H1/H2 structure so the page clearly answers the local finance intent and includes calculation assumptions, costs and next-step links.",
          priority_score: clamp(55 + (position <= 20 ? 12 : 0) + Math.min(12, impressions / 120)),
          estimated_traffic_opportunity: estimateTraffic(impressions, position),
          suggested_content_type: "heading_update",
          suggested_related_pages: relatedPagesFor(`${page.target_keyword || ""} ${page.page_type}`, []),
          signals: { h1: page.h1, target_keyword: page.target_keyword, impressions_28d: impressions, position },
        });
      }
    }

    for (const draft of draftRows) {
      const wordCount = draft.word_count || 0;
      if (draft.status !== "published" || wordCount >= 700) continue;
      addGap(gaps, {
        gap_type: "weak_thin_page",
        affected_url: draft.slug ? `/guides/${draft.slug}` : "/guides",
        keyword_topic: draft.target_keyword || draft.title,
        suggested_fix: "Review this published article for semantic depth. Add original examples, source references, calculator links, FAQs and answer blocks before further promotion.",
        priority_score: clamp(56 + (700 - wordCount) / 20),
        estimated_traffic_opportunity: 0,
        suggested_content_type: "guide_update",
        suggested_related_pages: relatedPagesFor(`${draft.title} ${draft.target_keyword || ""}`, []),
        signals: { word_count: wordCount, target_keyword: draft.target_keyword, status: draft.status },
      });
    }

    for (const article of articleRows) {
      const text = `${article.title} ${article.excerpt || ""}`.toLowerCase();
      const hasCalculatorTopic = corePages.some((page) => page.topics.some((topic) => text.includes(topic)));
      if (!hasCalculatorTopic) continue;
      const articleUrl = `/news/${article.slug}`;
      const hasSuggestedOutbound = linkRows.some((row) => normaliseUrl(row.source_page) === articleUrl);
      if (hasSuggestedOutbound) continue;
      addGap(gaps, {
        gap_type: "missing_internal_links",
        affected_url: articleUrl,
        keyword_topic: article.title,
        suggested_fix: "Add contextual calculator links from this article to the most relevant money page and supporting guide. Keep anchors natural and editorial.",
        priority_score: 58,
        estimated_traffic_opportunity: 0,
        suggested_content_type: "internal_link_update",
        suggested_related_pages: relatedPagesFor(text, ["/mortgage-calculator"]),
        signals: { article_title: article.title, source_type: "news_article" },
      });
    }

    for (const row of keywordRows) {
      const impressions = row.calcy_impressions_28d || 0;
      const position = row.calcy_position || 99;
      const expectedTarget = categoryTarget(row.category);
      const hasMatchingPage = keywordMatchesPage(row.keyword, row.target_page) || keywordMatchesPage(row.keyword, expectedTarget);
      const lower = row.keyword.toLowerCase();
      const hasStateSignal = stateTerms.some((term) => lower.includes(term));
      const hasSuburbSignal = suburbSignals.some((term) => lower.includes(term));

      if ((!row.target_page || row.target_page === "/guides" || !hasMatchingPage || row.content_gap_notes) && impressions >= 20) {
        const alreadyDrafted = draftKeywords.has(row.keyword.toLowerCase());
        addGap(gaps, {
          gap_type: "keyword_without_matching_page",
          affected_url: row.target_page || expectedTarget,
          keyword_topic: row.keyword,
          suggested_fix: alreadyDrafted
            ? `Review the existing draft for "${row.keyword}" and decide whether it should update ${expectedTarget} or become a dedicated guide.`
            : `Create an admin-approved brief for "${row.keyword}" and map it to ${expectedTarget} or a dedicated guide before publishing.`,
          priority_score: clamp(45 + Math.min(30, impressions / 80) + (position <= 20 ? 15 : 0) + (row.content_gap_notes ? 8 : 0)),
          estimated_traffic_opportunity: estimateTraffic(impressions, position),
          suggested_content_type: expectedTarget === "/guides" ? "guide" : "content_update",
          suggested_related_pages: relatedPagesFor(row.keyword, [expectedTarget]),
          signals: {
            keyword: row.keyword,
            category: row.category,
            current_target_page: row.target_page,
            expected_target_page: expectedTarget,
            impressions_28d: impressions,
            position,
            already_drafted: alreadyDrafted,
            content_gap_notes: row.content_gap_notes,
          },
        });
      }

      if ((hasStateSignal || hasSuburbSignal) && impressions >= 10) {
        const proposedBase = row.category === "stamp_duty" ? "/stamp-duty-calculator" : row.category === "lmi" ? "/lmi-calculator" : "/mortgage-calculator";
        addGap(gaps, {
          gap_type: hasStateSignal ? "state_opportunity" : "suburb_opportunity",
          affected_url: proposedBase,
          keyword_topic: row.keyword,
          suggested_fix: `Assess a unique ${hasStateSignal ? "state" : "suburb"} page or guide for "${row.keyword}" with local assumptions, FAQs, examples and calculator links. Do not publish until it passes quality review.`,
          priority_score: clamp(48 + Math.min(25, impressions / 60) + (position <= 20 ? 12 : 0)),
          estimated_traffic_opportunity: estimateTraffic(impressions, position),
          suggested_content_type: "localized_seo_page",
          suggested_related_pages: relatedPagesFor(row.keyword, [proposedBase]),
          signals: { keyword: row.keyword, impressions_28d: impressions, position, category: row.category, detected_scope: hasStateSignal ? "state" : "suburb" },
        });
      }
    }

    const targetMap = new Map<string, KeywordRow[]>();
    for (const row of keywordRows) {
      const target = normaliseUrl(row.target_page || categoryTarget(row.category));
      if (!targetMap.has(target)) targetMap.set(target, []);
      targetMap.get(target)!.push(row);
    }
    for (const [target, rows] of targetMap.entries()) {
      const meaningful = rows.filter((row) => (row.calcy_impressions_28d || 0) >= 10);
      if (meaningful.length < 4) continue;
      const categories = new Set(meaningful.map((row) => row.category).filter(Boolean));
      if (categories.size <= 1) continue;
      addGap(gaps, {
        gap_type: "content_cannibalization_risk",
        affected_url: target,
        keyword_topic: meaningful.slice(0, 3).map((row) => row.keyword).join(", "),
        suggested_fix: "Review query intent mapping. Split mixed-intent keywords into clearer target pages or strengthen headings/internal links so Google understands the primary purpose of each URL.",
        priority_score: clamp(52 + Math.min(24, meaningful.length * 4)),
        estimated_traffic_opportunity: estimateTraffic(meaningful.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0), 20),
        suggested_content_type: "intent_mapping_review",
        suggested_related_pages: [...new Set(meaningful.map((row) => categoryTarget(row.category)))].slice(0, 5),
        signals: { keyword_count: meaningful.length, categories: [...categories], sample_keywords: meaningful.map((row) => row.keyword).slice(0, 8) },
      });
    }

    const results = [...gaps.values()].sort((a, b) => b.priority_score - a.priority_score).slice(0, 200);

    if (results.length > 0) {
      const { error: upsertError } = await supabase
        .from("content_gap_opportunities")
        .upsert(
          results.map((gap) => ({
            ...gap,
            status: "open",
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "gap_type,affected_url,suggested_fix" },
        );
      if (upsertError) throw upsertError;
    }

    const summary = {
      keywords_checked: keywordRows.length,
      programmatic_pages_checked: programmaticRows.length,
      articles_checked: articleRows.length,
      drafts_checked: draftRows.length,
      internal_link_suggestions_checked: linkRows.length,
      gaps_found: results.length,
      quick_wins: results.filter((gap) => gap.is_quick_win).length,
      high_priority: results.filter((gap) => gap.priority_score >= 70).length,
      estimated_traffic_opportunity: results.reduce((sum, gap) => sum + gap.estimated_traffic_opportunity, 0),
    };

    await supabase.from("seo_reports").insert({
      report_type: "content_gap_analysis",
      content_recommendations: results.slice(0, 40),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: keywordRows.length + programmaticRows.length + draftRows.length + articleRows.length,
      records_updated: results.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, gaps: results.slice(0, 40) }), {
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
