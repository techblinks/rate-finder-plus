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

type EntityType = "calculator" | "concept" | "article" | "faq" | "state" | "topic" | "programmatic" | "gap";
type RelationshipType = "calculates" | "explains" | "supports" | "depends_on" | "state_variant" | "related_to" | "missing" | "suggested_link";

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
  reason: string | null;
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
  status: string;
};

type ClusterRow = {
  cluster_key: string;
  cluster_name: string;
  health_score: number;
  authority_strength: number;
  graph_nodes: unknown;
  graph_edges: unknown;
  status: string;
};

type EntityNode = {
  id: string;
  label: string;
  type: EntityType;
  url: string | null;
  authority: number;
  cluster: string;
  terms: string[];
  x: number;
  y: number;
};

type EntityEdge = {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
  label: string;
};

type EntityDefinition = {
  id: string;
  label: string;
  type: EntityType;
  url: string | null;
  cluster: string;
  terms: string[];
  related: string[];
};

const baseEntities: EntityDefinition[] = [
  { id: "calc_mortgage", label: "Mortgage Calculator", type: "calculator", url: "/mortgage-calculator", cluster: "mortgage", terms: ["mortgage", "home loan", "repayment"], related: ["concept_interest_rate", "concept_loan_term", "calc_borrowing_power", "calc_lmi", "calc_extra_repayments", "calc_refinance"] },
  { id: "calc_borrowing_power", label: "Borrowing Power Calculator", type: "calculator", url: "/borrowing-power-calculator", cluster: "borrowing", terms: ["borrowing power", "serviceability", "income"], related: ["concept_serviceability", "concept_income", "concept_hecs", "calc_mortgage", "calc_lmi"] },
  { id: "calc_stamp_duty", label: "Stamp Duty Calculator", type: "calculator", url: "/stamp-duty-calculator", cluster: "stamp_duty", terms: ["stamp duty", "transfer duty", "upfront costs"], related: ["concept_first_home_buyer", "state_nsw", "state_vic", "state_qld", "calc_mortgage"] },
  { id: "calc_lmi", label: "LMI Calculator", type: "calculator", url: "/lmi-calculator", cluster: "lmi", terms: ["lmi", "lenders mortgage insurance", "deposit", "lvr"], related: ["concept_lvr", "concept_deposit", "concept_first_home_buyer", "calc_borrowing_power"] },
  { id: "calc_hecs", label: "HECS Borrowing Power", type: "calculator", url: "/hecs-borrowing-power", cluster: "borrowing", terms: ["hecs", "help debt", "student debt"], related: ["concept_hecs", "calc_borrowing_power", "concept_income"] },
  { id: "calc_refinance", label: "Refinance Calculator", type: "calculator", url: "/refinance-calculator", cluster: "refinance", terms: ["refinance", "switch home loan", "break even"], related: ["concept_refinance", "concept_interest_rate", "calc_mortgage", "calc_extra_repayments"] },
  { id: "calc_extra_repayments", label: "Extra Repayments Calculator", type: "calculator", url: "/extra-repayments-calculator", cluster: "mortgage", terms: ["extra repayments", "interest saved", "pay off loan faster"], related: ["concept_offset", "concept_interest_rate", "calc_mortgage"] },
  { id: "concept_interest_rate", label: "Interest Rate", type: "concept", url: null, cluster: "mortgage", terms: ["interest rate", "fixed rate", "variable rate"], related: ["calc_mortgage", "calc_refinance", "concept_rba_cash_rate"] },
  { id: "concept_rba_cash_rate", label: "RBA Cash Rate", type: "concept", url: null, cluster: "rates", terms: ["rba", "cash rate", "interest rates"], related: ["concept_interest_rate", "calc_mortgage", "calc_refinance"] },
  { id: "concept_serviceability", label: "Serviceability", type: "concept", url: null, cluster: "borrowing", terms: ["serviceability", "assessment rate", "buffer"], related: ["calc_borrowing_power", "concept_income", "concept_hecs"] },
  { id: "concept_hecs", label: "HECS / HELP Debt", type: "concept", url: null, cluster: "borrowing", terms: ["hecs", "help debt", "student debt"], related: ["calc_hecs", "calc_borrowing_power"] },
  { id: "concept_lvr", label: "Loan-to-Value Ratio", type: "concept", url: null, cluster: "lmi", terms: ["lvr", "loan to value", "deposit"], related: ["calc_lmi", "concept_deposit"] },
  { id: "concept_deposit", label: "Deposit", type: "concept", url: null, cluster: "lmi", terms: ["deposit", "savings", "first home buyer"], related: ["calc_lmi", "calc_stamp_duty", "concept_lvr"] },
  { id: "concept_first_home_buyer", label: "First Home Buyer", type: "concept", url: null, cluster: "buying", terms: ["first home buyer", "grant", "exemption"], related: ["calc_stamp_duty", "calc_lmi", "concept_deposit"] },
  { id: "concept_offset", label: "Offset Account", type: "concept", url: null, cluster: "mortgage", terms: ["offset", "offset account", "interest saved"], related: ["calc_extra_repayments", "calc_mortgage", "gap_offset_calculator"] },
  { id: "concept_refinance", label: "Refinancing", type: "concept", url: null, cluster: "refinance", terms: ["refinance", "switch home loan", "cashback"], related: ["calc_refinance", "concept_interest_rate"] },
  { id: "state_nsw", label: "NSW", type: "state", url: "/stamp-duty-calculator/nsw", cluster: "state", terms: ["nsw", "new south wales", "stamp duty"], related: ["calc_stamp_duty"] },
  { id: "state_vic", label: "VIC", type: "state", url: "/stamp-duty-calculator/vic", cluster: "state", terms: ["vic", "victoria", "stamp duty"], related: ["calc_stamp_duty"] },
  { id: "state_qld", label: "QLD", type: "state", url: "/stamp-duty-calculator/qld", cluster: "state", terms: ["qld", "queensland", "stamp duty"], related: ["calc_stamp_duty"] },
  { id: "gap_offset_calculator", label: "Offset Calculator", type: "gap", url: "/offset-calculator", cluster: "mortgage", terms: ["offset calculator", "offset account"], related: ["concept_offset", "calc_mortgage", "calc_extra_repayments"] },
  { id: "gap_property_affordability", label: "Property Affordability", type: "gap", url: "/property-affordability-calculator", cluster: "borrowing", terms: ["property affordability", "how much house can i afford"], related: ["calc_borrowing_power", "calc_stamp_duty", "calc_lmi"] },
  { id: "faq_lmi_lvr", label: "LMI and LVR FAQ", type: "faq", url: "/faq/lmi-deposit-and-lvr", cluster: "lmi", terms: ["lmi", "lvr", "deposit"], related: ["calc_lmi", "concept_lvr"] },
  { id: "faq_hecs_borrowing", label: "HECS Borrowing FAQ", type: "faq", url: "/faq/hecs-borrowing-power", cluster: "borrowing", terms: ["hecs", "borrowing power"], related: ["calc_hecs", "concept_hecs"] },
];

function normaliseUrl(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?calcy\.com\.au/i, "").replace(/\/$/, "") || "/";
}

function textMatches(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
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

function authorityFor(entity: EntityDefinition, keywordRows: KeywordRow[], moneyRows: MoneyRow[], clusterRows: ClusterRow[]) {
  const url = normaliseUrl(entity.url);
  const matchingKeywords = keywordRows.filter((row) => {
    const target = normaliseUrl(row.target_page) || categoryTarget(row.category);
    return target === url || textMatches(row.keyword, entity.terms);
  });
  const impressions = matchingKeywords.reduce((sum, row) => sum + (row.calcy_impressions_28d || 0), 0);
  const clicks = matchingKeywords.reduce((sum, row) => sum + (row.calcy_clicks_28d || 0), 0);
  const bestPosition = Math.min(...matchingKeywords.map((row) => row.calcy_position || 99), 99);
  const moneyScore = moneyRows.find((row) => normaliseUrl(row.page_url) === url)?.money_score || 0;
  const clusterStrength = clusterRows.find((row) => row.cluster_key === entity.cluster || row.cluster_name.toLowerCase().includes(entity.cluster))?.authority_strength || 0;
  const typeBoost = entity.type === "calculator" ? 16 : entity.type === "concept" ? 10 : entity.type === "state" ? 8 : entity.type === "gap" ? -8 : 5;
  return clamp(20 + typeBoost + Math.min(22, impressions / 220) + Math.min(12, clicks * 1.2) + (bestPosition <= 10 ? 12 : bestPosition <= 20 ? 6 : 0) + moneyScore * 0.14 + clusterStrength * 0.12);
}

function anglePosition(index: number, total: number, type: EntityType) {
  if (type === "calculator") {
    const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 24, y: 50 + Math.sin(angle) * 24 };
  }
  const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
  const radius = type === "concept" ? 36 : type === "gap" ? 43 : 40;
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
}

function relationshipTypeFor(source: EntityDefinition, target: EntityDefinition): RelationshipType {
  if (source.type === "gap" || target.type === "gap") return "missing";
  if (source.type === "calculator" && target.type === "concept") return "calculates";
  if (source.type === "concept" && target.type === "calculator") return "supports";
  if (source.type === "state" || target.type === "state") return "state_variant";
  if (source.type === "faq" || target.type === "faq" || source.type === "article" || target.type === "article") return "explains";
  return "related_to";
}

function buildKnowledgeGraph(
  keywordRows: KeywordRow[],
  programmaticRows: ProgrammaticPageRow[],
  articleRows: ArticleRow[],
  linkRows: LinkRow[],
  gapRows: GapRow[],
  moneyRows: MoneyRow[],
  clusterRows: ClusterRow[],
) {
  const dynamicEntities: EntityDefinition[] = [
    ...programmaticRows
      .filter((row) => row.target_keyword || row.h1)
      .slice(0, 18)
      .map((row, index) => ({
        id: `programmatic_${index}_${normaliseUrl(row.url_path).replace(/[^a-z0-9]+/gi, "_")}`,
        label: row.h1 || row.target_keyword || row.url_path,
        type: "programmatic" as EntityType,
        url: normaliseUrl(row.url_path),
        cluster: row.page_type,
        terms: [row.target_keyword || "", row.h1 || "", row.page_type].filter(Boolean),
        related: baseEntities.filter((entity) => textMatches(`${row.target_keyword || ""} ${row.h1 || ""} ${row.page_type}`, entity.terms)).map((entity) => entity.id).slice(0, 4),
      })),
    ...articleRows
      .filter((row) => textMatches(`${row.title} ${row.excerpt || ""}`, ["mortgage", "borrowing", "stamp duty", "lmi", "refinance", "hecs", "interest"]))
      .slice(0, 14)
      .map((row, index) => ({
        id: `article_${index}_${row.slug.replace(/[^a-z0-9]+/gi, "_")}`,
        label: row.title,
        type: "article" as EntityType,
        url: `/news/${row.slug}`,
        cluster: "article",
        terms: [row.title, row.excerpt || ""],
        related: baseEntities.filter((entity) => textMatches(`${row.title} ${row.excerpt || ""}`, entity.terms)).map((entity) => entity.id).slice(0, 4),
      })),
  ];

  const allEntities = [...baseEntities, ...dynamicEntities];
  const calculatorCount = allEntities.filter((entity) => entity.type === "calculator").length;
  const nodes: EntityNode[] = allEntities.map((entity, index) => {
    const position = anglePosition(index, allEntities.length, entity.type);
    return {
      id: entity.id,
      label: entity.label,
      type: entity.type,
      url: entity.url,
      authority: authorityFor(entity, keywordRows, moneyRows, clusterRows),
      cluster: entity.cluster,
      terms: entity.terms,
      x: entity.type === "calculator" ? anglePosition(index, calculatorCount, "calculator").x : position.x,
      y: entity.type === "calculator" ? anglePosition(index, calculatorCount, "calculator").y : position.y,
    };
  });

  const edges = new Map<string, EntityEdge>();
  const addEdge = (source: string, target: string, type: RelationshipType, strength: number, label: string) => {
    if (source === target) return;
    const id = `${source}->${target}:${type}`;
    if (!edges.has(id)) edges.set(id, { id, source, target, type, strength: clamp(strength), label });
  };

  for (const entity of allEntities) {
    for (const related of entity.related) {
      const target = allEntities.find((candidate) => candidate.id === related);
      if (!target) continue;
      addEdge(entity.id, target.id, relationshipTypeFor(entity, target), entity.type === "gap" || target.type === "gap" ? 45 : 74, "semantic relationship");
    }
  }

  for (const link of linkRows.slice(0, 120)) {
    const source = allEntities.find((entity) => entity.url && normaliseUrl(entity.url) === normaliseUrl(link.source_page));
    const target = allEntities.find((entity) => entity.url && normaliseUrl(entity.url) === normaliseUrl(link.target_page));
    if (source && target) addEdge(source.id, target.id, "suggested_link", link.priority === "high" ? 88 : link.priority === "medium" ? 68 : 52, link.suggested_anchor_text);
  }

  const semanticRelationships = [...edges.values()]
    .filter((edge) => ["calculates", "supports", "depends_on", "related_to"].includes(edge.type))
    .slice(0, 80);
  const entityRelationships = [...edges.values()].slice(0, 140);
  const suggestedInternalLinks = linkRows
    .filter((link) => textMatches(`${link.source_page} ${link.target_page} ${link.reason || ""}`, allEntities.flatMap((entity) => entity.terms)))
    .slice(0, 35)
    .map((link) => ({
      source: link.source_page,
      target: link.target_page,
      anchor: link.suggested_anchor_text,
      priority: link.priority,
      reason: link.reason || "Semantic relationship supports topical authority.",
    }));

  const missingEntityCoverage = [
    ...baseEntities.filter((entity) => entity.type === "gap").map((entity) => ({
      entity: entity.label,
      url: entity.url,
      type: "missing_entity_page",
      reason: `${entity.label} is semantically important to ${entity.cluster} but is not yet covered as a live primary page.`,
      related_entities: entity.related,
    })),
    ...gapRows
      .filter((gap) => gap.priority_score >= 60)
      .slice(0, 20)
      .map((gap) => ({
        entity: gap.keyword_topic || gap.gap_type.replaceAll("_", " "),
        url: gap.affected_url,
        type: gap.gap_type,
        reason: "Existing content gap indicates missing semantic coverage.",
        score: gap.priority_score,
      })),
  ];

  const authorityConnections = nodes
    .filter((node) => node.authority >= 65)
    .sort((a, b) => b.authority - a.authority)
    .slice(0, 20)
    .map((node) => ({
      entity: node.label,
      url: node.url,
      authority: node.authority,
      connection_count: [...edges.values()].filter((edge) => edge.source === node.id || edge.target === node.id).length,
    }));

  const topicRelationships = clusterRows.map((cluster) => ({
    topic: cluster.cluster_name,
    health_score: cluster.health_score,
    authority_strength: cluster.authority_strength,
    related_entities: nodes.filter((node) => node.cluster === cluster.cluster_key || node.cluster === cluster.cluster_name.toLowerCase()).map((node) => node.label).slice(0, 8),
  }));

  const relatedContentRecommendations = suggestedInternalLinks.slice(0, 20).map((link) => ({
    source: link.source,
    target: link.target,
    recommendation: `Add or review a contextual link using "${link.anchor}" after admin approval.`,
    priority: link.priority,
  }));

  const authorityScore = clamp(
    nodes.reduce((sum, node) => sum + node.authority, 0) / Math.max(1, nodes.length) +
    Math.min(18, entityRelationships.length / 8) -
    Math.min(16, missingEntityCoverage.length * 0.9),
  );

  return {
    graph_key: "calcy_finance",
    graph_name: "Calcy Australian Finance Knowledge Graph",
    authority_score: authorityScore,
    entity_count: nodes.length,
    relationship_count: edges.size,
    entity_nodes: nodes,
    entity_edges: [...edges.values()],
    topic_relationships: topicRelationships,
    authority_connections: authorityConnections,
    related_content_recommendations: relatedContentRecommendations,
    semantic_relationships: semanticRelationships,
    entity_relationships: entityRelationships,
    suggested_internal_links: suggestedInternalLinks,
    missing_entity_coverage: missingEntityCoverage,
    signals: {
      read_only: true,
      calculators: nodes.filter((node) => node.type === "calculator").length,
      concepts: nodes.filter((node) => node.type === "concept").length,
      states: nodes.filter((node) => node.type === "state").length,
      articles: nodes.filter((node) => node.type === "article").length,
      programmatic_pages: nodes.filter((node) => node.type === "programmatic").length,
      generated_from: ["seo_keywords", "programmatic_pages", "news_articles", "internal_link_opportunities", "content_gap_opportunities", "money_page_scores", "topic_cluster_visualizations"],
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
    job_type: "semantic_finance_knowledge_graph",
    triggered_by: req.headers.get("x-triggered-by") || "manual",
    status: "running",
  });

  try {
    const [keywordsRes, programmaticRes, articlesRes, linksRes, gapsRes, moneyRes, clustersRes] = await Promise.all([
      supabase.from("seo_keywords").select("keyword, category, target_page, calcy_impressions_28d, calcy_clicks_28d, calcy_position").eq("is_active", true).limit(2500),
      supabase.from("programmatic_pages").select("url_path, page_type, target_keyword, h1, impressions_28d, clicks_28d, position").eq("is_active", true).limit(1200),
      supabase.from("news_articles").select("slug, title, excerpt, is_published").eq("is_published", true).limit(300),
      supabase.from("internal_link_opportunities").select("source_page, target_page, suggested_anchor_text, priority, relationship_type, reason, status").eq("status", "open").limit(1200),
      supabase.from("content_gap_opportunities").select("affected_url, gap_type, keyword_topic, priority_score, suggested_content_type, status").eq("status", "open").limit(1200),
      supabase.from("money_page_scores").select("page_url, page_title, money_score, status").eq("status", "open").limit(100),
      supabase.from("topic_cluster_visualizations").select("cluster_key, cluster_name, health_score, authority_strength, graph_nodes, graph_edges, status").eq("status", "open").limit(50),
    ]);

    for (const result of [keywordsRes, programmaticRes, articlesRes, linksRes, gapsRes, moneyRes, clustersRes]) {
      if (result.error) throw result.error;
    }

    const graph = buildKnowledgeGraph(
      (keywordsRes.data as KeywordRow[] | null) || [],
      (programmaticRes.data as ProgrammaticPageRow[] | null) || [],
      (articlesRes.data as ArticleRow[] | null) || [],
      (linksRes.data as LinkRow[] | null) || [],
      (gapsRes.data as GapRow[] | null) || [],
      (moneyRes.data as MoneyRow[] | null) || [],
      (clustersRes.data as ClusterRow[] | null) || [],
    );

    const { error: upsertError } = await supabase
      .from("semantic_finance_knowledge_graphs")
      .upsert({
        ...graph,
        status: "open",
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "graph_key" });
    if (upsertError) throw upsertError;

    const summary = {
      entity_count: graph.entity_count,
      relationship_count: graph.relationship_count,
      authority_score: graph.authority_score,
      missing_entity_coverage: graph.missing_entity_coverage.length,
      suggested_internal_links: graph.suggested_internal_links.length,
    };

    await supabase.from("seo_reports").insert({
      report_type: "semantic_finance_knowledge_graph",
      content_recommendations: graph.related_content_recommendations.slice(0, 40),
      full_report_data: summary,
    });

    await supabase.from("sync_jobs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt.getTime(),
      records_checked: graph.entity_count,
      records_updated: 1,
      summary,
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true, ...summary, graph }), {
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
