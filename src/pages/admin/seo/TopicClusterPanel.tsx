import type { TopicClusterVisualization, TopicGraphEdge, TopicGraphNode } from "./seoPanelTypes";

type TopicClusterPanelProps = {
  topicClusters: TopicClusterVisualization[];
  selectedTopicCluster: string | null;
  setSelectedTopicCluster: (value: string | null) => void;
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function TopicClusterPanel({ topicClusters, selectedTopicCluster, setSelectedTopicCluster, running, callFunction }: TopicClusterPanelProps) {
  const activeTopicCluster =
    topicClusters.find((cluster) => cluster.cluster_key === selectedTopicCluster) ||
    topicClusters[0] ||
    null;

  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Topic Cluster Visualizer</h2>
          <p className="text-xs text-muted-foreground">
            Visualizes topical authority, semantic hierarchy, internal linking strength, orphan pages, weak clusters and missing supporting content. Read-only graph, no link changes.
          </p>
        </div>
        <button
          onClick={() => callFunction("visualize-topic-clusters")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "visualize-topic-clusters" ? "Mapping..." : "Build topic graph"}
        </button>
      </div>
    </div>

    {topicClusters.length === 0 && (
      <p className="text-sm text-muted-foreground">No topic cluster graph yet. Build the topic graph after internal link, money page and content gap data has been refreshed.</p>
    )}

    {topicClusters.length > 0 && (
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {topicClusters.map((cluster) => (
            <button
              key={cluster.id}
              onClick={() => setSelectedTopicCluster(cluster.cluster_key)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                activeTopicCluster?.cluster_key === cluster.cluster_key
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{cluster.cluster_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cluster.node_count} nodes - {cluster.edge_count} edges
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  cluster.health_score < 55 ? "bg-red-100 text-red-900" : cluster.health_score < 75 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                }`}>
                  {cluster.health_score}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent" style={{ width: `${cluster.health_score}%` }} />
              </div>
            </button>
          ))}
        </aside>

        {activeTopicCluster && (() => {
          const nodes = Array.isArray(activeTopicCluster.graph_nodes) ? activeTopicCluster.graph_nodes as TopicGraphNode[] : [];
          const edges = Array.isArray(activeTopicCluster.graph_edges) ? activeTopicCluster.graph_edges as TopicGraphEdge[] : [];
          const alerts = Array.isArray(activeTopicCluster.alerts) ? activeTopicCluster.alerts as Array<{ type: string; severity: "high" | "medium" | "low"; message: string }> : [];
          const orphans = Array.isArray(activeTopicCluster.orphan_pages) ? activeTopicCluster.orphan_pages as Array<{ url: string | null; label: string; type: string; authority?: number }> : [];
          const weakLinks = Array.isArray(activeTopicCluster.weak_internal_links) ? activeTopicCluster.weak_internal_links as Array<{ source: string; target: string; reason: string }> : [];
          const gaps = Array.isArray(activeTopicCluster.topical_gaps) ? activeTopicCluster.topical_gaps as Array<{ url: string; topic: string; gap_type: string; score: number }> : [];
          const missingContent = Array.isArray(activeTopicCluster.missing_supporting_content) ? activeTopicCluster.missing_supporting_content as Array<{ url: string | null; label: string; type: string }> : [];
          const nodeById = new Map(nodes.map((node) => [node.id, node]));

          return (
            <div className="space-y-4">
              <section className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{activeTopicCluster.cluster_name} cluster</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Authority strength {activeTopicCluster.authority_strength} - read-only semantic graph
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-border bg-background px-3 py-2">
                      <p className="text-xs text-muted-foreground">Health</p>
                      <p className="text-lg font-semibold tnum text-foreground">{activeTopicCluster.health_score}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background px-3 py-2">
                      <p className="text-xs text-muted-foreground">Orphans</p>
                      <p className="text-lg font-semibold tnum text-foreground">{orphans.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background px-3 py-2">
                      <p className="text-xs text-muted-foreground">Gaps</p>
                      <p className="text-lg font-semibold tnum text-foreground">{gaps.length + missingContent.length}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                  <svg viewBox="0 0 100 100" role="img" aria-label={`${activeTopicCluster.cluster_name} topic cluster graph`} className="h-[460px] w-full">
                    <defs>
                      <marker id="topic-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                      </marker>
                    </defs>
                    {edges.map((edge) => {
                      const source = nodeById.get(edge.source);
                      const target = nodeById.get(edge.target);
                      if (!source || !target) return null;
                      const stroke = edge.type === "missing" ? "#dc2626" : edge.type === "suggested" ? "#d97706" : edge.type === "existing" ? "#059669" : "#64748b";
                      return (
                        <line
                          key={edge.id}
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={stroke}
                          strokeWidth={Math.max(0.35, edge.strength / 140)}
                          strokeDasharray={edge.type === "missing" ? "2 2" : edge.type === "semantic" ? "3 2" : undefined}
                          opacity={0.72}
                        />
                      );
                    })}
                    {nodes.map((node) => {
                      const fill = node.type === "hub" ? "#003680" : node.is_gap ? "#fee2e2" : node.is_orphan ? "#fef3c7" : node.type === "calculator" ? "#dbeafe" : node.type === "faq" ? "#dcfce7" : "#f1f5f9";
                      const stroke = node.type === "hub" ? "#003680" : node.is_gap ? "#dc2626" : node.is_orphan ? "#d97706" : "#94a3b8";
                      const textFill = node.type === "hub" ? "#ffffff" : "#0f172a";
                      const radius = node.type === "hub" ? 7.5 : node.type === "gap" ? 5.4 : 5.8;
                      return (
                        <g key={node.id}>
                          <circle cx={node.x} cy={node.y} r={radius} fill={fill} stroke={stroke} strokeWidth={0.7} />
                          <title>{`${node.label} - ${node.type} - authority ${node.authority}`}</title>
                          <text
                            x={node.x}
                            y={node.y + 0.6}
                            textAnchor="middle"
                            fontSize={node.type === "hub" ? 2.4 : 1.85}
                            fontWeight={node.type === "hub" ? 700 : 600}
                            fill={textFill}
                          >
                            {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">existing links</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">suggested links</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">semantic relationships</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-900">missing support</span>
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-2xl border border-border bg-surface p-5">
                  <h4 className="text-sm font-semibold text-foreground">Weak Cluster Alerts</h4>
                  <div className="mt-3 space-y-2">
                    {alerts.length === 0 && <p className="text-sm text-muted-foreground">No cluster alerts detected.</p>}
                    {alerts.slice(0, 8).map((alert, index) => (
                      <div key={`${activeTopicCluster.id}-alert-${index}`} className="rounded-lg border border-border bg-background p-3">
                        <p className={`text-xs font-semibold ${alert.severity === "high" ? "text-red-700" : "text-amber-700"}`}>{alert.type.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-sm text-foreground">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5">
                  <h4 className="text-sm font-semibold text-foreground">Orphan Pages</h4>
                  <div className="mt-3 space-y-2">
                    {orphans.length === 0 && <p className="text-sm text-muted-foreground">No orphan pages detected in this cluster.</p>}
                    {orphans.slice(0, 8).map((page) => (
                      <div key={`${activeTopicCluster.id}-${page.url || page.label}`} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-sm font-medium text-foreground">{page.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{page.url || "planned page"} - {page.type} - authority {page.authority ?? 0}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5">
                  <h4 className="text-sm font-semibold text-foreground">Weak Internal Linking</h4>
                  <div className="mt-3 space-y-2">
                    {weakLinks.length === 0 && <p className="text-sm text-muted-foreground">No weak-link alerts detected.</p>}
                    {weakLinks.slice(0, 8).map((link) => (
                      <div key={`${activeTopicCluster.id}-${link.source}-${link.target}`} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted-foreground">{link.source} {"->"} {link.target}</p>
                        <p className="mt-1 text-sm text-foreground">{link.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5">
                  <h4 className="text-sm font-semibold text-foreground">Topical Gaps</h4>
                  <div className="mt-3 space-y-2">
                    {gaps.length === 0 && missingContent.length === 0 && <p className="text-sm text-muted-foreground">No missing supporting content detected.</p>}
                    {missingContent.slice(0, 5).map((gap) => (
                      <div key={`${activeTopicCluster.id}-missing-${gap.url || gap.label}`} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-sm font-medium text-foreground">{gap.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{gap.url || "planned page"} - {gap.type}</p>
                      </div>
                    ))}
                    {gaps.slice(0, 5).map((gap) => (
                      <div key={`${activeTopicCluster.id}-gap-${gap.url}-${gap.topic}`} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-sm font-medium text-foreground">{gap.topic}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{gap.gap_type.replaceAll("_", " ")} - score {gap.score}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          );
        })()}
      </div>
    )}
  </section>
  );
}
