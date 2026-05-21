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

type Priority = "high" | "medium" | "low";
type PageType = "calculator" | "article" | "seo" | "faq";
type RelationshipType =
  | "calculator_journey"
  | "topic_cluster"
  | "orphan_page_support"
  | "money_page_support"
  | "contextual_support"
  | "faq_answer_support"
  | "anchor_diversification";

type PageNode = {
  url: string;
  title: string;
  type: PageType;
  topics: string[];
  weight: number;
  existingLinks?: string[];
};

type KeywordRow = {
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_impressions_28d: number | null;
  calcy_position: number | null;
};

type ProgrammaticPageRow = {
  url_path: string;
  h1: string | null;
  target_keyword: string | null;
  page_type: string;
  is_active: boolean;
};

type NewsArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  is_published: boolean;
};

type DraftRow = {
  slug: string | null;
  title: string;
  target_keyword: string | null;
  category: string | null;
  status: string;
};

type LinkOpportunity = {
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  relationship_type: RelationshipType;
  reason: string;
  priority: Priority;
  signals: Record<string, unknown>;
};

const moneyPages: PageNode[] = [
  {
    url: "/mortgage-calculator",
    title: "Mortgage Calculator",
    type: "calculator",
    topics: ["mortgage", "home loan", "repayment", "interest", "amortisation"],
    weight: 10,
    existingLinks: ["/borrowing-power-calculator", "/extra-repayments-calculator", "/stamp-duty-calculator", "/lmi-calculator"],
  },
  {
    url: "/borrowing-power-calculator",
    title: "Borrowing Power Calculator",
    type: "calculator",
    topics: ["borrowing power", "borrow", "income", "serviceability", "apra"],
    weight: 9,
    existingLinks: ["/mortgage-calculator", "/stamp-duty-calculator", "/lmi-calculator", "/extra-repayments-calculator"],
  },
  {
    url: "/stamp-duty-calculator",
    title: "Stamp Duty Calculator",
    type: "calculator",
    topics: ["stamp duty", "transfer duty", "first home buyer", "upfront costs"],
    weight: 9,
    existingLinks: ["/mortgage-calculator", "/borrowing-power-calculator", "/lmi-calculator", "/extra-repayments-calculator", "/refinance-calculator"],
  },
  {
    url: "/lmi-calculator",
    title: "LMI Calculator",
    type: "calculator",
    topics: ["lmi", "lenders mortgage insurance", "deposit", "lvr", "first home guarantee"],
    weight: 8,
    existingLinks: ["/mortgage-calculator", "/borrowing-power-calculator", "/stamp-duty-calculator"],
  },
  {
    url: "/hecs-borrowing-power",
    title: "HECS Borrowing Power Calculator",
    type: "calculator",
    topics: ["hecs", "help debt", "student debt", "borrowing power", "income"],
    weight: 8,
    existingLinks: ["/borrowing-power-calculator", "/mortgage-calculator", "/lmi-calculator"],
  },
  {
    url: "/refinance-calculator",
    title: "Refinance Calculator",
    type: "calculator",
    topics: ["refinance", "switch home loan", "break even", "interest saving", "cashback"],
    weight: 8,
    existingLinks: ["/extra-repayments-calculator", "/mortgage-calculator", "/lmi-calculator"],
  },
  {
    url: "/extra-repayments-calculator",
    title: "Extra Repayments Calculator",
    type: "calculator",
    topics: ["extra repayments", "pay off loan faster", "interest saved", "lump sum", "offset"],
    weight: 7,
    existingLinks: ["/mortgage-calculator", "/borrowing-power-calculator", "/lmi-calculator"],
  },
];

const staticArticlePages: PageNode[] = [
  {
    url: "/guides/stamp-duty-australia-2026",
    title: "Stamp duty in Australia",
    type: "article",
    topics: ["stamp duty", "transfer duty", "first home buyer", "upfront costs"],
    weight: 6,
  },
  {
    url: "/guides/borrowing-power-australia",
    title: "Borrowing power in Australia",
    type: "article",
    topics: ["borrowing power", "serviceability", "income", "expenses"],
    weight: 6,
  },
  {
    url: "/guides/what-is-lmi",
    title: "What is LMI?",
    type: "article",
    topics: ["lmi", "lenders mortgage insurance", "deposit", "lvr"],
    weight: 6,
  },
  {
    url: "/guides/fixed-vs-variable-rate",
    title: "Fixed vs variable rates",
    type: "article",
    topics: ["mortgage", "home loan", "interest", "refinance"],
    weight: 5,
  },
  {
    url: "/best-home-loans-australia",
    title: "Best Home Loans Australia",
    type: "seo",
    topics: ["home loan", "mortgage", "refinance", "lmi"],
    weight: 7,
  },
];

const faqPages: PageNode[] = [
  {
    url: "/faq/mortgage-offset-vs-extra-repayments",
    title: "Offset vs extra repayments FAQ",
    type: "faq",
    topics: ["offset", "extra repayments", "interest saved", "mortgage"],
    weight: 5,
  },
  {
    url: "/faq/lmi-deposit-and-lvr",
    title: "LMI deposit and LVR FAQ",
    type: "faq",
    topics: ["lmi", "deposit", "lvr", "first home buyer"],
    weight: 5,
  },
  {
    url: "/faq/hecs-borrowing-power",
    title: "HECS and borrowing power FAQ",
    type: "faq",
    topics: ["hecs", "help debt", "borrowing power", "income"],
    weight: 5,
  },
];

function normaliseUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function includesTopic(text: string, topic: string) {
  return text.toLowerCase().includes(topic.toLowerCase());
}

function pageText(page: PageNode) {
  return `${page.title} ${page.url} ${page.topics.join(" ")}`.toLowerCase();
}

function overlapTopics(source: PageNode, target: PageNode) {
  const sourceText = pageText(source);
  return target.topics.filter((topic) => includesTopic(sourceText, topic));
}

function relationshipFor(source: PageNode, target: PageNode, sourceSignal: string): RelationshipType {
  if (sourceSignal === "orphan_page_support") return "orphan_page_support";
  if (sourceSignal === "weak_money_page_support") return "money_page_support";
  if (sourceSignal === "anchor_diversification") return "anchor_diversification";
  if (sourceSignal === "curated_money_page_mesh") return "calculator_journey";
  if (source.type === "faq" || target.type === "faq") return "faq_answer_support";
  if (source.type === "calculator" && target.type === "calculator") return "calculator_journey";
  if (source.type === "seo" || target.type === "seo") return "topic_cluster";
  return "contextual_support";
}

function anchorFor(target: PageNode, matchedTopic: string | null, relationshipType: RelationshipType, usedAnchors: Map<string, number>) {
  const candidates = [
    matchedTopic,
    relationshipType === "faq_answer_support" ? target.title.replace(/\sFAQ$/i, "") : null,
    target.topics[0],
    target.title.toLowerCase(),
  ].filter((anchor): anchor is string => Boolean(anchor && anchor.length <= 44));

  return candidates.find((anchor) => (usedAnchors.get(anchor.toLowerCase()) || 0) < 4) || target.title.toLowerCase();
}

function priorityFor(source: PageNode, target: PageNode, overlap: number, relationshipType: RelationshipType): Priority {
  if (relationshipType === "orphan_page_support") return target.weight >= 6 ? "high" : "medium";
  if (relationshipType === "money_page_support") return "high";
  if (relationshipType === "anchor_diversification") return "medium";
  if (target.weight >= 9 && overlap >= 2) return "high";
  if (target.weight >= 8 && overlap >= 1) return "high";
  if (target.weight >= 7 || overlap >= 2) return "medium";
  return "low";
}

function buildReason(
  source: PageNode,
  target: PageNode,
  matchedTopic: string | null,
  overlap: number,
  relationshipType: RelationshipType,
  extra?: string,
) {
  const topic = matchedTopic ? ` around "${matchedTopic}"` : "";
  const base = `${source.title} can link to ${target.title}${topic}. Relationship: ${relationshipType.replaceAll("_", " ")}. Overlap score: ${overlap}.`;
  return extra ? `${base} ${extra}` : base;
}

function addCandidate(
  candidates: Map<string, LinkOpportunity>,
  usedAnchors: Map<string, number>,
  source: PageNode,
  target: PageNode,
  matchedTopic: string | null,
  sourceSignal: string,
  extraReason?: string,
) {
  source.url = normaliseUrl(source.url);
  target.url = normaliseUrl(target.url);
  if (source.url === target.url) return;
  if (source.existingLinks?.map(normaliseUrl).includes(target.url)) return;

  const overlap = Math.max(overlapTopics(source, target).length, matchedTopic ? 1 : 0);
  if (overlap <= 0 && sourceSignal !== "orphan_page_support" && sourceSignal !== "weak_money_page_support") return;

  const relationshipType = relationshipFor(source, target, sourceSignal);
  const anchor = anchorFor(target, matchedTopic, relationshipType, usedAnchors);
  usedAnchors.set(anchor.toLowerCase(), (usedAnchors.get(anchor.toLowerCase()) || 0) + 1);

  const key = `${source.url}|${target.url}|${anchor}`;
  const priority = priorityFor(source, target, overlap, relationshipType);

  candidates.set(key, {
    source_page: source.url,
    target_page: target.url,
    suggested_anchor_text: anchor,
    relationship_type: relationshipType,
    reason: buildReason(source, target, matchedTopic, overlap, relationshipType, extraReason),
    priority,
    signals: {
      source_type: source.type,
      target_type: target.type,
      source_signal: sourceSignal,
      overlap_score: overlap,
      target_weight: target.weight,
      matched_topic: matchedTopic,
      source_topics: source.topics,
      target_topics: target.topics,
    },
  });
}

function pageFromKeyword(row: KeywordRow): PageNode | null {
  if (!row.target_page?.startsWith("/")) return null;
  return {
    url: row.target_page,
    title: row.keyword,
    type: "seo",
    topics: [row.keyword, row.category || ""].filter(Boolean),
    weight: row.calcy_impressions_28d && row.calcy_impressions_28d > 500 ? 6 : 4,
  };
}

function uniquePages(pages: PageNode[]) {
  const byUrl = new Map<string, PageNode>();
  for (const page of pages) {
    const url = normaliseUrl(page.url);
    const existing = byUrl.get(url);
    if (!existing || page.weight > existing.weight) {
      byUrl.set(url, { ...page, url });
    }
  }
  return [...byUrl.values()];
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
    job_type: "internal_link_opportunities",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [{ data: keywords }, { data: programmaticPages }, { data: newsArticles }, { data: drafts }, { data: existingSuggestions }] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_impressions_28d, calcy_position").eq("is_active", true),
      supabase.from("programmatic_pages").select("url_path, h1, target_keyword, page_type, is_active").eq("is_active", true).limit(300),
      supabase.from("news_articles").select("slug, title, excerpt, is_published").eq("is_published", true).limit(150),
      supabase.from("content_drafts").select("slug, title, target_keyword, category, status").in("status", ["approved", "published"]).limit(150),
      supabase.from("internal_link_opportunities").select("source_page, target_page, suggested_anchor_text, priority, relationship_type").eq("status", "open").limit(1000),
    ]);

    const keywordPages = ((keywords as KeywordRow[] | null) || [])
      .map(pageFromKeyword)
      .filter((page): page is PageNode => Boolean(page));

    const programmaticNodes: PageNode[] = ((programmaticPages as ProgrammaticPageRow[] | null) || []).map((page) => ({
      url: page.url_path,
      title: page.h1 || page.target_keyword || page.url_path,
      type: "seo",
      topics: [page.target_keyword || "", page.page_type].filter(Boolean),
      weight: page.page_type === "stamp_duty" || page.page_type === "lmi" ? 6 : 5,
    }));

    const newsNodes: PageNode[] = ((newsArticles as NewsArticleRow[] | null) || []).map((article) => ({
      url: `/news/${article.slug}`,
      title: article.title,
      type: "article",
      topics: [article.title, article.excerpt || ""],
      weight: 4,
    }));

    const draftNodes: PageNode[] = ((drafts as DraftRow[] | null) || [])
      .filter((draft) => draft.slug)
      .map((draft) => ({
        url: `/guides/${draft.slug}`,
        title: draft.title,
        type: "article",
        topics: [draft.title, draft.target_keyword || "", draft.category || ""].filter(Boolean),
        weight: draft.status === "published" ? 5 : 3,
      }));

    const allPages = uniquePages([...moneyPages, ...staticArticlePages, ...faqPages, ...programmaticNodes, ...newsNodes, ...draftNodes, ...keywordPages]);
    const candidates = new Map<string, LinkOpportunity>();
    const usedAnchors = new Map<string, number>();

    for (const row of ((existingSuggestions as Array<{ suggested_anchor_text: string }> | null) || [])) {
      usedAnchors.set(row.suggested_anchor_text.toLowerCase(), (usedAnchors.get(row.suggested_anchor_text.toLowerCase()) || 0) + 1);
    }

    for (const source of allPages) {
      for (const target of allPages) {
        if (source.url === target.url) continue;
        const matchedTopics = overlapTopics(source, target);
        const matchedTopic = matchedTopics[0] || null;
        if (!matchedTopic) continue;
        if (target.weight < 6 && matchedTopics.length < 2 && source.type !== "faq" && target.type !== "faq") continue;
        addCandidate(candidates, usedAnchors, source, target, matchedTopic, "topic_overlap");
      }
    }

    const curated: Array<[string, string, string, string, Priority]> = [
      ["/mortgage-calculator", "/lmi-calculator", "LMI calculator", "Mortgage users with less than 20% deposit need an LMI estimate before choosing a loan size.", "high"],
      ["/mortgage-calculator", "/extra-repayments-calculator", "extra repayments calculator", "Repayment users often need to model how extra payments reduce interest and loan term.", "high"],
      ["/borrowing-power-calculator", "/hecs-borrowing-power", "HECS borrowing power calculator", "Borrowing capacity can change materially when HECS/HELP repayments apply.", "high"],
      ["/borrowing-power-calculator", "/stamp-duty-calculator", "stamp duty calculator", "Borrowing power users also need upfront purchase cost estimates before setting a budget.", "high"],
      ["/stamp-duty-calculator", "/lmi-calculator", "LMI calculator", "Stamp duty and LMI are both major upfront or capitalised purchase costs.", "medium"],
      ["/lmi-calculator", "/mortgage-calculator", "mortgage repayment calculator", "LMI users need to understand the repayment impact if the premium is added to the loan.", "high"],
      ["/refinance-calculator", "/lmi-calculator", "LMI on refinance", "Refinance users above 80% LVR may need to pay a new LMI premium.", "medium"],
      ["/refinance-calculator", "/mortgage-calculator", "mortgage repayment calculator", "Refinance comparisons need repayment context on the new loan balance and rate.", "medium"],
      ["/hecs-borrowing-power", "/borrowing-power-calculator", "borrowing power calculator", "HECS users should compare their full borrowing estimate with and without study debt.", "high"],
      ["/extra-repayments-calculator", "/mortgage-calculator", "mortgage calculator", "Extra repayment users need a baseline repayment scenario before modelling accelerators.", "medium"],
    ];

    for (const [sourceUrl, targetUrl, anchor, reason, priority] of curated) {
      const source = allPages.find((page) => page.url === sourceUrl) || { url: sourceUrl, title: sourceUrl, type: "calculator" as PageType, topics: [], weight: 7 };
      const target = allPages.find((page) => page.url === targetUrl) || { url: targetUrl, title: targetUrl, type: "calculator" as PageType, topics: [], weight: 7 };
      candidates.set(`${sourceUrl}|${targetUrl}|${anchor}`, {
        source_page: sourceUrl,
        target_page: targetUrl,
        suggested_anchor_text: anchor,
        relationship_type: "calculator_journey",
        reason,
        priority,
        signals: {
          source_type: source.type,
          target_type: target.type,
          source_signal: "curated_money_page_mesh",
          target_weight: target.weight,
        },
      });
      usedAnchors.set(anchor.toLowerCase(), (usedAnchors.get(anchor.toLowerCase()) || 0) + 1);
    }

    const inboundCounts = new Map<string, number>();
    for (const page of allPages) inboundCounts.set(page.url, 0);
    for (const page of allPages) {
      for (const link of page.existingLinks || []) {
        const url = normaliseUrl(link);
        inboundCounts.set(url, (inboundCounts.get(url) || 0) + 1);
      }
    }
    for (const candidate of candidates.values()) {
      inboundCounts.set(candidate.target_page, (inboundCounts.get(candidate.target_page) || 0) + 1);
    }

    const topAuthoritySources = allPages
      .filter((page) => page.weight >= 7)
      .sort((a, b) => b.weight - a.weight);

    for (const target of allPages.filter((page) => (inboundCounts.get(page.url) || 0) <= 1 && page.weight >= 5).slice(0, 30)) {
      const source = topAuthoritySources.find((page) => page.url !== target.url && overlapTopics(page, target).length > 0) || topAuthoritySources.find((page) => page.url !== target.url);
      if (!source) continue;
      const matchedTopic = overlapTopics(source, target)[0] || target.topics[0] || null;
      addCandidate(
        candidates,
        usedAnchors,
        source,
        target,
        matchedTopic,
        "orphan_page_support",
        "This page appears to have weak generated inbound coverage and should be reviewed for a contextual support link.",
      );
    }

    for (const target of moneyPages.filter((page) => (inboundCounts.get(page.url) || 0) < 4)) {
      const source = allPages
        .filter((page) => page.url !== target.url)
        .sort((a, b) => overlapTopics(b, target).length - overlapTopics(a, target).length || b.weight - a.weight)[0];
      if (!source) continue;
      const matchedTopic = overlapTopics(source, target)[0] || target.topics[0] || null;
      addCandidate(
        candidates,
        usedAnchors,
        source,
        target,
        matchedTopic,
        "weak_money_page_support",
        "This money page needs stronger internal link support based on current generated coverage.",
      );
    }

    const overusedAnchors = [...usedAnchors.entries()].filter(([, count]) => count >= 6).map(([anchor]) => anchor);
    for (const anchor of overusedAnchors.slice(0, 12)) {
      const matching = [...candidates.values()].find((candidate) => candidate.suggested_anchor_text.toLowerCase() === anchor);
      if (!matching) continue;
      const target = allPages.find((page) => page.url === matching.target_page);
      const source = allPages.find((page) => page.url === matching.source_page);
      if (!source || !target) continue;
      const alternateAnchor = target.topics.find((topic) => topic.toLowerCase() !== anchor && topic.length <= 44) || target.title.toLowerCase();
      candidates.set(`${source.url}|${target.url}|${alternateAnchor}`, {
        source_page: source.url,
        target_page: target.url,
        suggested_anchor_text: alternateAnchor,
        relationship_type: "anchor_diversification",
        reason: `${anchor} appears frequently in generated suggestions. Use a natural variant for this link to avoid repetitive anchor text while preserving relevance to ${target.title}.`,
        priority: "medium",
        signals: {
          source_type: source.type,
          target_type: target.type,
          source_signal: "anchor_diversification",
          overused_anchor: anchor,
          anchor_usage_count: usedAnchors.get(anchor),
          target_weight: target.weight,
        },
      });
    }

    const opportunities = [...candidates.values()]
      .sort((a, b) => {
        const priorityRank: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        const relationshipRank: Record<RelationshipType, number> = {
          money_page_support: 7,
          orphan_page_support: 6,
          calculator_journey: 5,
          topic_cluster: 4,
          faq_answer_support: 3,
          contextual_support: 2,
          anchor_diversification: 1,
        };
        return priorityRank[b.priority] - priorityRank[a.priority] || relationshipRank[b.relationship_type] - relationshipRank[a.relationship_type];
      })
      .slice(0, 180);

    if (opportunities.length > 0) {
      const { error: upsertError } = await supabase
        .from("internal_link_opportunities")
        .upsert(
          opportunities.map((opportunity) => ({
            ...opportunity,
            status: "open",
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "source_page,target_page,suggested_anchor_text" },
        );
      if (upsertError) throw upsertError;
    }

    const summary = {
      source_pages_checked: allPages.length,
      suggestions_generated: opportunities.length,
      orphan_page_suggestions: opportunities.filter((item) => item.relationship_type === "orphan_page_support").length,
      money_page_suggestions: opportunities.filter((item) => item.relationship_type === "money_page_support").length,
      anchor_diversification_suggestions: opportunities.filter((item) => item.relationship_type === "anchor_diversification").length,
      high_priority: opportunities.filter((item) => item.priority === "high").length,
      medium_priority: opportunities.filter((item) => item.priority === "medium").length,
      low_priority: opportunities.filter((item) => item.priority === "low").length,
    };

    await supabase.from("seo_reports").insert({
      report_type: "ai_internal_link_opportunities",
      content_recommendations: opportunities.slice(0, 40),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: summary.source_pages_checked,
      records_updated: summary.suggestions_generated,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, opportunities: opportunities.slice(0, 40) }), {
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
