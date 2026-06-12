import type { KnowledgeGraphEdge, KnowledgeGraphNode, SemanticFinanceKnowledgeGraph } from "./seoPanelTypes";

type KnowledgeGraphPanelProps = {
  knowledgeGraphs: SemanticFinanceKnowledgeGraph[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function KnowledgeGraphPanel({ knowledgeGraphs, running, callFunction }: KnowledgeGraphPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Semantic Finance Knowledge Graph</h2>
          <p className="text-xs text-muted-foreground">
            Connects calculators, finance concepts, articles, FAQs, state entities and Australian finance terminology. Admin insights only, no automatic page edits or link changes.
          </p>
        </div>
        <button
          onClick={() => callFunction("build-knowledge-graph")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "build-knowledge-graph" ? "Building..." : "Build knowledge graph"}
        </button>
      </div>
    </div>

    {knowledgeGraphs.length === 0 && (
      <p className="text-sm text-muted-foreground">No knowledge graph yet. Build it after topic clusters, internal links and content gap data have been refreshed.</p>
    )}

    {knowledgeGraphs.map((graph) => {
      const nodes = Array.isArray(graph.entity_nodes) ? graph.entity_nodes as KnowledgeGraphNode[] : [];
      const edges = Array.isArray(graph.entity_edges) ? graph.entity_edges as KnowledgeGraphEdge[] : [];
      const nodeById = new Map(nodes.map((node) => [node.id, node]));
      const missing = Array.isArray(graph.missing_entity_coverage) ? graph.missing_entity_coverage as Array<{ entity: string; url: string | null; type: string; reason: string; score?: number; related_entities?: string[] }> : [];
      const links = Array.isArray(graph.suggested_internal_links) ? graph.suggested_internal_links as Array<{ source: string; target: string; anchor: string; priority: string; reason: string }> : [];
      const contentRecs = Array.isArray(graph.related_content_recommendations) ? graph.related_content_recommendations as Array<{ source: string; target: string; recommendation: string; priority: string }> : [];
      const authority = Array.isArray(graph.authority_connections) ? graph.authority_connections as Array<{ entity: string; url: string | null; authority: number; connection_count: number }> : [];
      const topics = Array.isArray(graph.topic_relationships) ? graph.topic_relationships as Array<{ topic: string; health_score: number; authority_strength: number; related_entities: string[] }> : [];

      return (
        <div key={graph.id} className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{graph.graph_name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {graph.entity_count} entities - {graph.relationship_count} relationships - read-only semantic map
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Authority</p>
                  <p className="text-lg font-semibold tnum text-foreground">{graph.authority_score}</p>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Missing</p>
                  <p className="text-lg font-semibold tnum text-foreground">{missing.length}</p>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Links</p>
                  <p className="text-lg font-semibold tnum text-foreground">{links.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
              <svg viewBox="0 0 100 100" role="img" aria-label="Semantic finance knowledge graph" className="h-[520px] w-full">
                {edges.slice(0, 180).map((edge) => {
                  const source = nodeById.get(edge.source);
                  const target = nodeById.get(edge.target);
                  if (!source || !target) return null;
                  const stroke = edge.type === "missing" ? "#dc2626" : edge.type === "suggested_link" ? "#d97706" : edge.type === "state_variant" ? "#0e7490" : edge.type === "calculates" ? "#059669" : "#64748b";
                  return (
                    <line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={stroke}
                      strokeWidth={Math.max(0.25, edge.strength / 165)}
                      strokeDasharray={edge.type === "missing" ? "2 2" : edge.type === "suggested_link" ? "4 2" : undefined}
                      opacity={0.62}
                    />
                  );
                })}
                {nodes.slice(0, 90).map((node) => {
                  const fill = node.type === "calculator" ? "#dbeafe" : node.type === "concept" ? "#dcfce7" : node.type === "state" ? "#cffafe" : node.type === "gap" ? "#fee2e2" : node.type === "programmatic" ? "#fef3c7" : "#f1f5f9";
                  const stroke = node.type === "gap" ? "#dc2626" : node.authority >= 70 ? "#003680" : "#94a3b8";
                  const radius = node.type === "calculator" ? 5.8 : node.type === "concept" ? 5.2 : node.type === "gap" ? 4.9 : 4.4;
                  return (
                    <g key={node.id}>
                      <circle cx={node.x} cy={node.y} r={radius} fill={fill} stroke={stroke} strokeWidth={0.65} />
                      <title>{`${node.label} - ${node.type} - authority ${node.authority}`}</title>
                      <text x={node.x} y={node.y + 0.55} textAnchor="middle" fontSize={1.75} fontWeight={600} fill="#0f172a">
                        {node.label.length > 17 ? `${node.label.slice(0, 15)}...` : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-900">calculators</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">concepts</span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-900">states</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">suggested links</span>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-900">missing coverage</span>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h4 className="text-sm font-semibold text-foreground">Authority Connections</h4>
              <div className="mt-3 space-y-2">
                {authority.slice(0, 8).map((item) => (
                  <div key={`${graph.id}-authority-${item.entity}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{item.entity}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Authority {item.authority} - {item.connection_count} connections {item.url ? `- ${item.url}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h4 className="text-sm font-semibold text-foreground">Missing Entity Coverage</h4>
              <div className="mt-3 space-y-2">
                {missing.length === 0 && <p className="text-sm text-muted-foreground">No missing entity coverage detected.</p>}
                {missing.slice(0, 8).map((item) => (
                  <div key={`${graph.id}-missing-${item.entity}-${item.url || ""}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{item.entity}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h4 className="text-sm font-semibold text-foreground">Suggested Internal Links</h4>
              <div className="mt-3 space-y-2">
                {links.slice(0, 8).map((link) => (
                  <div key={`${graph.id}-link-${link.source}-${link.target}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{link.source} {"->"} {link.target}</p>
                    <p className="mt-1 text-sm text-foreground">Anchor: "{link.anchor}" - {link.reason}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h4 className="text-sm font-semibold text-foreground">Topic Relationships</h4>
              <div className="mt-3 space-y-2">
                {topics.slice(0, 8).map((topic) => (
                  <div key={`${graph.id}-topic-${topic.topic}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Health {topic.health_score} - authority {topic.authority_strength}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{topic.related_entities?.slice(0, 5).join(", ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 md:col-span-2">
              <h4 className="text-sm font-semibold text-foreground">Related Content Recommendations</h4>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {contentRecs.slice(0, 10).map((rec) => (
                  <div key={`${graph.id}-rec-${rec.source}-${rec.target}`} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{rec.source} {"->"} {rec.target}</p>
                    <p className="mt-1 text-sm text-foreground">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      );
    })}
  </section>
  );
}
