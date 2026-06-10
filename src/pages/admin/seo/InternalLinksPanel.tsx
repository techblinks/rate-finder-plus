import type { InternalLinkOpportunity } from "./seoPanelTypes";

type InternalLinksPanelProps = {
  internalLinkOpportunities: InternalLinkOpportunity[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function InternalLinksPanel({ internalLinkOpportunities, running, callFunction }: InternalLinksPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Internal Linking Engine</h2>
          <p className="text-xs text-muted-foreground">
            Suggests contextual links between calculators, guides, articles, FAQs and programmatic SEO pages. Detects orphan pages, weak money-page support, related finance topics, missing contextual links and repeated anchor text. Suggestions are review-only.
          </p>
        </div>
        <button
          onClick={() => callFunction("score-internal-links")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "score-internal-links" ? "Scanning..." : "Run AI link scan"}
        </button>
      </div>
    </div>

    {internalLinkOpportunities.length === 0 && (
      <p className="text-sm text-muted-foreground">No internal link suggestions yet. Run the AI link scan to generate review-only suggestions.</p>
    )}

    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Source page</th>
            <th className="px-4 py-3">Target page</th>
            <th className="px-4 py-3">Anchor text</th>
            <th className="px-4 py-3">Relationship</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Priority</th>
          </tr>
        </thead>
        <tbody>
          {internalLinkOpportunities.map((item) => (
            <tr key={item.id} className="border-t border-border align-top">
              <td className="px-4 py-3">
                <a href={item.source_page} target="_blank" rel="noreferrer" className="text-accent underline">
                  {item.source_page}
                </a>
              </td>
              <td className="px-4 py-3">
                <a href={item.target_page} target="_blank" rel="noreferrer" className="text-accent underline">
                  {item.target_page}
                </a>
              </td>
              <td className="px-4 py-3 font-medium text-foreground">{item.suggested_anchor_text}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {(item.relationship_type || item.signals?.source_signal || "topic_overlap").replaceAll("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{item.reason}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  item.priority === "high" ? "bg-red-100 text-red-900" : item.priority === "medium" ? "bg-amber-100 text-amber-900" : "bg-muted text-muted-foreground"
                }`}>
                  {item.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
  );
}
