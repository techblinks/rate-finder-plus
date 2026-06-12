import type { ContentGapOpportunity } from "./seoPanelTypes";

type ContentGapPanelProps = {
  contentGapOpportunities: ContentGapOpportunity[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function ContentGapPanel({ contentGapOpportunities, running, callFunction }: ContentGapPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI SEO Content Gap Analyzer</h2>
          <p className="text-xs text-muted-foreground">
            Finds missing SEO opportunities, weak pages, missing topical coverage, FAQs, localized finance content, schema, comparisons, examples, AI Overview gaps and cannibalization risks. Suggestions are admin-only.
          </p>
        </div>
        <button
          onClick={() => callFunction("analyze-content-gaps")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "analyze-content-gaps" ? "Analyzing..." : "Run gap analyzer"}
        </button>
      </div>
    </div>

    {contentGapOpportunities.length === 0 && (
      <p className="text-sm text-muted-foreground">No content gaps yet. Run the analyzer to generate review-only suggestions.</p>
    )}

    {contentGapOpportunities.some((item) => item.is_quick_win) && (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-emerald-950">Quick Win Opportunities</h3>
            <p className="text-xs text-emerald-800">
              High-priority gaps that should be reviewable without creating new public pages automatically.
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-950">
            {contentGapOpportunities.filter((item) => item.is_quick_win).length} quick wins
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {contentGapOpportunities.filter((item) => item.is_quick_win).slice(0, 6).map((item) => (
            <article key={`quick-${item.id}`} className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{item.gap_type.replaceAll("_", " ")}</p>
              <h4 className="mt-1 text-sm font-semibold text-emerald-950">{item.keyword_topic || item.affected_url}</h4>
              <p className="mt-1 text-xs text-emerald-900">{item.suggested_fix}</p>
              <p className="mt-2 text-xs text-emerald-800">
                Score <span className="font-semibold tnum">{item.priority_score}</span>
                {" "}· est. traffic <span className="font-semibold tnum">{item.estimated_traffic_opportunity || 0}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    )}

    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Gap type</th>
            <th className="px-4 py-3">Affected URL</th>
            <th className="px-4 py-3">Keyword/topic</th>
            <th className="px-4 py-3">Content type</th>
            <th className="px-4 py-3">Est. traffic</th>
            <th className="px-4 py-3">Suggested fix</th>
            <th className="px-4 py-3">Related pages</th>
            <th className="px-4 py-3">Priority score</th>
          </tr>
        </thead>
        <tbody>
          {contentGapOpportunities.map((item) => {
            const relatedPages = Array.isArray(item.suggested_related_pages)
              ? item.suggested_related_pages as string[]
              : [];
            return (
              <tr key={item.id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                      {item.gap_type.replaceAll("_", " ")}
                    </span>
                    {item.is_quick_win && (
                      <span className="w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                        quick win
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a href={item.affected_url} target="_blank" rel="noreferrer" className="text-accent underline">
                    {item.affected_url}
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-foreground">{item.keyword_topic || item.signals?.keyword || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {(item.suggested_content_type || "content_update").replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 tnum text-xs text-foreground">{(item.estimated_traffic_opportunity || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.suggested_fix}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {relatedPages.length === 0 ? "—" : (
                    <div className="flex flex-col gap-1">
                      {relatedPages.slice(0, 4).map((page) => (
                        <a key={`${item.id}-${page}`} href={page} target="_blank" rel="noreferrer" className="text-accent underline">
                          {page}
                        </a>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-accent" style={{ width: `${item.priority_score}%` }} />
                    </div>
                    <span className="tnum text-xs font-semibold text-foreground">{item.priority_score}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
  );
}
