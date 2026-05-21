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

type NodeType = "hub" | "calculator" | "article" | "faq" | "programmatic" | "gap";
type EdgeType = "existing" | "suggested" | "semantic" | "missing";

type KeywordRow = {
  keyword: string;
  category: string | null;
  target_page: string | null;
  calcy_impressions_28d: number | null;
  calcy_clicks_28d: number | null;
  calcy_position: number | null;
};

type ProgrammaticPageRow = {
  url_path: string;
  page_type: string;
  target_keyword: string | null;
  h1: string | null;
  impressions_28d: number | null;
  clicks_28d: number | null;
  position: number | null;
};

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  is_published: boolean;
};

type LinkRow = {
  source_page: string;
  target_page: string;
  suggested_anchor_text: string;
  priority: "high" | "medium" | "low";
  relationship_type: string | null;
  status: string;
};

type GapRow = {
  affected_url: string;
  gap_type: string;
  keyword_topic: string | null;
  priority_score: number;
  suggested_content_type: string | null;
  status: string;
};

type MoneyRow = {
  page_url: string;
  page_title: string;
  money_score: number;
  related_internal_links_needed: unknown;
  status: string;
};

type GraphNode = {
  id: string;
  label: string;
  url: string | null;
  type: NodeType;
  cluster: string;
  authority: number;
  inbound: number;
  outbound: number;
  is_orphan: boolean;
  is_gap: boolean;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  strength: number;
  label: string;
};

type ClusterDefinition = {
  key: string;
  name: string;
  hub: { url: string; title: string };
  terms: string[];
  calculators: Array<{ url: string; title: string }>;
  expectedSupport: Array<{ url: string; title: string; type: NodeType; terms: string[] }>;
};

const clusters: ClusterDefinition[] = [
  {
    key: "mortgage",
    name: "Mortgage",
    hub: { url: "/mortgage-calculator", title: "Mortgage Calculator" },
    terms: ["mortgage", "home loan", "repayment", "interest rate", "offset", "amortisation"],
    calculators: [
      { url: "/borrowing-power-calculator", title: "Borrowing Power" },
      { url: "/lmi-calculator", title: "LMI" },
      { url: "/hecs-borrowing-power", title: "HECS" },
      { url: "/refinance-calculator", title: "Refinance" },
      { url: "/extra-repayments-calculator", title: "Extra Repayments" },
      { url: "/stamp-duty-calculator", title: "Stamp Duty" },
    ],
    expectedSupport: [
      { url: "/offset-calculator", title: "Offset Calculator", type: "gap", terms: ["offset", "interest saved"] },
      { url: "/interest-only-calculator", title: "Interest Only Calculator", type: "gap", terms: ["interest only", "mortgage"] },
      { url: "/guides/fixed-vs-variable-rate", title: "Fixed vs Variable Rates", type: "article", terms: ["fixed", "variable", "interest rate"] },
      { url: "/faq/mortgage-offset-vs-extra-repayments", title: "Offset vs Extra Repayments FAQ", type: "faq", terms: ["offset", "extra repayments"] },
    ],
  },
  {
    key: "borrowing_power",
    name: "Borrowing Power",
    hub: { url: "/borrowing-power-calculator", title: "Borrowing Power Calculator" },
    terms: ["borrowing power", "borrow", "serviceability", "income", "expenses", "hecs"],
    calculators: [
      { url: "/mortgage-calculator", title: "Mortgage Calculator" },
      { url: "/hecs-borrowing-power", title: "HECS Borrowing Power" },
      { url: "/lmi-calculator", title: "LMI Calculator" },
      { url: "/stamp-duty-calculator", title: "Stamp Duty Calculator" },
    ],
    expectedSupport: [
      { url: "/property-affordability-calculator", title: "Property Affordability Calculator", type: "gap", terms: ["affordability", "deposit"] },
      { url: "/first-home-buyer-deposit-calculator", title: "First Home Buyer Deposit Calculator", type: "gap", terms: ["first home buyer", "deposit"] },
      { url: "/faq/hecs-borrowing-power", title: "HECS Borrowing Power FAQ", type: "faq", terms: ["hecs", "borrowing power"] },
    ],
  },
  {
    key: "stamp_duty",
    name: "Stamp Duty",
    hub: { url: "/stamp-duty-calculator", title: "Stamp Duty Calculator" },
    terms: ["stamp duty", "transfer duty", "first home buyer", "upfront costs", "property tax"],
    calculators: [
      { url: "/mortgage-calculator", title: "Mortgage Calculator" },
      { url: "/borrowing-power-calculator", title: "Borrowing Power" },
      { url: "/lmi-calculator", title: "LMI" },
    ],
    expectedSupport: [
      { url: "/guides/stamp-duty-australia-2026", title: "Stamp Duty Australia Guide", type: "article", terms: ["stamp duty", "state"] },
      { url: "/first-home-buyer-deposit-calculator", title: "First Home Buyer Deposit Calculator", type: "gap", terms: ["first home buyer", "deposit"] },
      { url: "/calculate/stamp-duty-nsw", title: "NSW Stamp Duty Scenario Pages", type: "programmatic", terms: ["nsw", "stamp duty"] },
    ],
  },
  {
    key: "refinance",
    name: "Refinance",
    hub: { url: "/refinance-calculator", title: "Refinance Calculator" },
    terms: ["refinance", "switch home loan", "cashback", "break even", "interest saving"],
    calculators: [
      { url: "/mortgage-calculator", title: "Mortgage Calculator" },
      { url: "/loan-comparison-calculator", title: "Loan Comparison" },
      { url: "/extra-repayments-calculator", title: "Extra Repayments" },
    ],
    expectedSupport: [
      { url: "/fixed-vs-variable-calculator", title: "Fixed vs Variable Calculator", type: "gap", terms: ["fixed", "variable", "refinance"] },
      { url: "/guides/refinance-home-loan-australia", title: "Refinance Guide", type: "article", terms: ["refinance", "home loan"] },
      { url: "/offset-calculator", title: "Offset Calculator", type: "gap", terms: ["offset", "interest saving"] },
    ],
  },
  {
    key: "lmi",
    name: "LMI",
    hub: { url: "/lmi-calculator", title: "LMI Calculator" },
    terms: ["lmi", "lenders mortgage insurance", "deposit", "lvr", "first home guarantee"],
    calculators: [
      { url: "/mortgage-calculator", title: "Mortgage Calculator" },
      { url: "/borrowing-power-calculator", title: "Borrowing Power" },
      { url: "/stamp-duty-calculator", title: "Stamp Duty" },
    ],
    expectedSupport: [
      { url: "/guides/what-is-lmi", title: "What is LMI?", type: "article", terms: ["lmi", "deposit"] },
      { url: "/faq/lmi-deposit-and-lvr", title: "LMI Deposit and LVR FAQ", type: "faq", terms: ["lmi", "lvr"] },
      { url: "/first-home-buyer-deposit-calculator", title: "First Home Buyer Deposit Calculator", type: "gap", terms: ["deposit", "first home buyer"] },
    ],
  },
];

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function textMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
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

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function authorityFor(url: string, keywordRows: KeywordRow[], moneyRows: MoneyRow[]) {
  const keywords = keywordRows.filter((row) => normaliseUrl(row.target_page) === url || categoryTarget(row.category) === url);
  const impressions = keywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  const clicks = keywords.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0);
  const bestPosition = Math.min(...keywords.map((row) => row.calcy_position || 99), 99);
  const money = moneyRows.find((row) => normaliseUrl(row.page_url) === url)?.money_score || 0;
  return clamp(18 + Math.min(30, impressions / 180) + Math.min(18, clicks * 1.8) + (bestPosition <= 10 ? 16 : bestPosition <= 20 ? 9 : 0) + money * 0.18);
}

function pageExists(url: string, programmaticRows: ProgrammaticPageRow[], articleRows: ArticleRow[]) {
  if (clusters.some((cluster) => cluster.hub.url === url || cluster.calculators.some((page) => page.url === url))) return true;
  if (programmaticRows.some((row) => normaliseUrl(row.url_path) === url)) return true;
  if (articleRows.some((row) => `/news/${row.slug}` === url || `/guides/${row.slug}` === url)) return true;
  return false;
}

function nodeId(clusterKey: string, url: string) {
  return `${clusterKey}:${url.replace(/[^a-z0-9]+/gi, "_")}`;
}

function buildCluster(
  cluster: ClusterDefinition,
  keywordRows: KeywordRow[],
  programmaticRows: ProgrammaticPageRow[],
  articleRows: ArticleRow[],
  linkRows: LinkRow[],
  gapRows: GapRow[],
  moneyRows: MoneyRow[],
) {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const weakInternalLinks: Array<{ source: string; target: string; reason: string }> = [];
  const topicalGaps = gapRows
    .filter((gap) => textMatches(`${gap.gap_type} ${gap.keyword_topic || ""} ${gap.affected_url}`, cluster.terms))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 8)
    .map((gap) => ({
      url: gap.affected_url,
      topic: gap.keyword_topic || gap.gap_type.replaceAll("_", " "),
      gap_type: gap.gap_type,
      score: gap.priority_score,
    }));

  const addNode = (url: string | null, label: string, type: NodeType, index: number, total: number, isGap = false) => {
    const id = nodeId(cluster.key, url || label);
    const angle = total <= 1 ? 0 : (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = type === "hub" ? 0 : type === "gap" ? 38 : 32;
    const inbound = linkRows.filter((row) => normaliseUrl(row.target_page) === url).length;
    const outbound = linkRows.filter((row) => normaliseUrl(row.source_page) === url).length;
    nodes.set(id, {
      id,
      label,
      url,
      type,
      cluster: cluster.key,
      authority: url ? authorityFor(url, keywordRows, moneyRows) : 20,
      inbound,
      outbound,
      is_orphan: type !== "hub" && !isGap && inbound === 0,
      is_gap: isGap,
      x: type === "hub" ? 50 : 50 + Math.cos(angle) * radius,
      y: type === "hub" ? 50 : 50 + Math.sin(angle) * radius,
    });
    return id;
  };

  const supportPages = [
    ...cluster.calculators.map((page) => ({ ...page, type: "calculator" as NodeType, isGap: false })),
    ...cluster.expectedSupport.map((page) => ({
      url: page.url,
      title: page.title,
      type: pageExists(page.url, programmaticRows, articleRows) && page.type === "gap" ? "article" as NodeType : page.type,
      isGap: !pageExists(page.url, programmaticRows, articleRows) || page.type === "gap",
    })),
  ];

  const relatedProgrammatic = programmaticRows
    .filter((row) => textMatches(`${row.url_path} ${row.h1 || ""} ${row.target_keyword || ""} ${row.page_type}`, cluster.terms))
    .slice(0, 4)
    .map((row) => ({ url: normaliseUrl(row.url_path), title: row.h1 || row.target_keyword || row.url_path, type: "programmatic" as NodeType, isGap: false }));

  const relatedArticles = articleRows
    .filter((row) => textMatches(`${row.title} ${row.excerpt || ""}`, cluster.terms))
    .slice(0, 4)
    .map((row) => ({ url: `/news/${row.slug}`, title: row.title, type: "article" as NodeType, isGap: false }));

  const allSupport = [...supportPages, ...relatedProgrammatic, ...relatedArticles]
    .filter((page, index, arr) => arr.findIndex((candidate) => candidate.url === page.url) === index)
    .slice(0, 16);

  const hubId = addNode(cluster.hub.url, cluster.hub.title, "hub", 0, 1);
  for (const [index, page] of allSupport.entries()) {
    const targetId = addNode(page.url, page.title, page.type, index, allSupport.length, page.isGap);
    const hasSuggestedLink = linkRows.some((row) => {
      const source = normaliseUrl(row.source_page);
      const target = normaliseUrl(row.target_page);
      return (source === cluster.hub.url && target === page.url) || (source === page.url && target === cluster.hub.url);
    });
    const existingCurated = cluster.calculators.some((calculator) => calculator.url === page.url);
    const isMissing = page.isGap;
    const edgeType: EdgeType = isMissing ? "missing" : hasSuggestedLink ? "suggested" : existingCurated ? "existing" : "semantic";
    edges.push({
      id: `${hubId}->${targetId}`,
      source: hubId,
      target: targetId,
      type: edgeType,
      strength: edgeType === "existing" ? 90 : edgeType === "suggested" ? 72 : edgeType === "semantic" ? 52 : 30,
      label: edgeType === "missing" ? "missing support" : edgeType,
    });
    if (!hasSuggestedLink && !existingCurated && !isMissing) {
      weakInternalLinks.push({
        source: cluster.hub.url,
        target: page.url,
        reason: `${page.title} is semantically related to ${cluster.name} but has weak detected internal linking support.`,
      });
    }
  }

  for (const link of linkRows.filter((row) => textMatches(`${row.source_page} ${row.target_page} ${row.suggested_anchor_text}`, cluster.terms)).slice(0, 16)) {
    const sourceUrl = normaliseUrl(link.source_page);
    const targetUrl = normaliseUrl(link.target_page);
    const sourceNode = [...nodes.values()].find((node) => node.url === sourceUrl);
    const targetNode = [...nodes.values()].find((node) => node.url === targetUrl);
    if (sourceNode && targetNode && !edges.some((edge) => edge.source === sourceNode.id && edge.target === targetNode.id)) {
      edges.push({
        id: `${sourceNode.id}->${targetNode.id}:suggested`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "suggested",
        strength: link.priority === "high" ? 82 : link.priority === "medium" ? 65 : 50,
        label: link.suggested_anchor_text,
      });
    }
  }

  const nodeList = [...nodes.values()];
  const orphanPages = nodeList
    .filter((node) => node.is_orphan)
    .map((node) => ({ url: node.url, label: node.label, type: node.type, authority: node.authority }));
  const missingSupportingContent = nodeList
    .filter((node) => node.is_gap)
    .map((node) => ({ url: node.url, label: node.label, type: node.type }));

  const authorityStrength = clamp(nodeList.reduce((sum, node) => sum + node.authority, 0) / Math.max(1, nodeList.length));
  const linkCoverage = Math.min(100, (edges.filter((edge) => edge.type !== "missing").length / Math.max(1, nodeList.length - 1)) * 65);
  const gapPenalty = Math.min(28, missingSupportingContent.length * 5 + topicalGaps.length * 2);
  const orphanPenalty = Math.min(20, orphanPages.length * 4);
  const healthScore = clamp(35 + authorityStrength * 0.35 + linkCoverage * 0.35 - gapPenalty - orphanPenalty);
  const alerts = [
    ...orphanPages.slice(0, 5).map((page) => ({ type: "orphan_page", severity: page.authority >= 55 ? "high" : "medium", message: `${page.label} has weak detected inbound cluster support.` })),
    ...weakInternalLinks.slice(0, 5).map((link) => ({ type: "weak_internal_linking", severity: "medium", message: link.reason })),
    ...missingSupportingContent.slice(0, 5).map((page) => ({ type: "missing_supporting_content", severity: "high", message: `${page.label} is expected supporting content for ${cluster.name}.` })),
    ...(healthScore < 55 ? [{ type: "weak_cluster", severity: "high", message: `${cluster.name} cluster health is below target.` }] : []),
  ];

  return {
    cluster_key: cluster.key,
    cluster_name: cluster.name,
    health_score: healthScore,
    authority_strength: authorityStrength,
    node_count: nodeList.length,
    edge_count: edges.length,
    orphan_pages: orphanPages,
    weak_internal_links: weakInternalLinks,
    topical_gaps: topicalGaps,
    missing_supporting_content: missingSupportingContent,
    graph_nodes: nodeList,
    graph_edges: edges,
    semantic_hierarchy: [
      { level: "hub", pages: [cluster.hub] },
      { level: "calculators", pages: cluster.calculators },
      { level: "supporting_content", pages: allSupport.filter((page) => page.type !== "calculator") },
    ],
    alerts,
    signals: {
      read_only: true,
      terms: cluster.terms,
      keyword_count: keywordRows.filter((row) => textMatches(row.keyword, cluster.terms)).length,
      generated_from: ["seo_keywords", "internal_link_opportunities", "content_gap_opportunities", "money_page_scores", "programmatic_pages", "news_articles"],
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
    job_type: "topic_cluster_visualization",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [keywordsRes, programmaticRes, articlesRes, linksRes, gapsRes, moneyRes] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_impressions_28d, calcy_clicks_28d, calcy_position").eq("is_active", true).limit(2500),
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, h1, impressions_28d, clicks_28d, position").eq("is_active", true).limit(1200),
      supabase.from("news_articles").select("slug, title, excerpt, is_published").eq("is_published", true).limit(250),
      supabase.from("internal_link_opportunities").select("source_page, target_page, suggested_anchor_text, priority, relationship_type, status").eq("status", "open").limit(1200),
      supabase.from("content_gap_opportunities").select("affected_url, gap_type, keyword_topic, priority_score, suggested_content_type, status").eq("status", "open").limit(1200),
      supabase.from("money_page_scores").select("page_url, page_title, money_score, related_internal_links_needed, status").eq("status", "open").limit(100),
    ]);

    for (const result of [keywordsRes, programmaticRes, articlesRes, linksRes, gapsRes, moneyRes]) {
      if (result.error) throw result.error;
    }

    const rows = clusters.map((cluster) => buildCluster(
      cluster,
      (keywordsRes.data as KeywordRow[] | null) || [],
      (programmaticRes.data as ProgrammaticPageRow[] | null) || [],
      (articlesRes.data as ArticleRow[] | null) || [],
      (linksRes.data as LinkRow[] | null) || [],
      (gapsRes.data as GapRow[] | null) || [],
      (moneyRes.data as MoneyRow[] | null) || [],
    ));

    const { error: upsertError } = await supabase
      .from("topic_cluster_visualizations")
      .upsert(
        rows.map((row) => ({
          ...row,
          status: "open",
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "cluster_key" },
      );
    if (upsertError) throw upsertError;

    const summary = {
      clusters_checked: rows.length,
      weak_clusters: rows.filter((row) => row.health_score < 55).length,
      orphan_pages: rows.reduce((sum, row) => sum + row.orphan_pages.length, 0),
      missing_supporting_content: rows.reduce((sum, row) => sum + row.missing_supporting_content.length, 0),
      weak_internal_links: rows.reduce((sum, row) => sum + row.weak_internal_links.length, 0),
    };

    await supabase.from("seo_reports").insert({
      report_type: "topic_cluster_visualization",
      content_recommendations: rows.map((row) => ({
        cluster: row.cluster_name,
        health_score: row.health_score,
        alerts: row.alerts.slice(0, 5),
      })),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: rows.length,
      records_updated: rows.length,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, clusters: rows }), {
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
