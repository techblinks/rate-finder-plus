import type { MoneyPageScore } from "./seoPanelTypes";

type MoneyPagesPanelProps = {
  moneyPageScores: MoneyPageScore[];
  running: string | null;
  callFunction: (name: any, body?: any) => void | Promise<void>;
};

export function MoneyPagesPanel({ moneyPageScores, running, callFunction }: MoneyPagesPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Money Pages Scoring</h2>
          <p className="text-xs text-muted-foreground">
            Scores core calculator pages by estimated RPM/CPC potential, finance topic value, ranking opportunity, traffic potential, internal link importance, and calculator engagement value. Suggestions are admin-only.
          </p>
        </div>
        <button
          onClick={() => callFunction("score-money-pages")}
          disabled={running !== null}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {running === "score-money-pages" ? "Scoring..." : "Run money page scoring"}
        </button>
      </div>
    </div>

    {moneyPageScores.length === 0 && (
      <p className="text-sm text-muted-foreground">No money page scores yet. Run scoring after GSC data is synced for better ranking and traffic signals.</p>
    )}

    {moneyPageScores.map((page) => {
      const signals = page.signals || {};
      const linksNeeded = Array.isArray(page.related_internal_links_needed)
        ? page.related_internal_links_needed as Array<{ target: string; anchor: string; reason: string }>
        : [];
      return (
        <div key={page.id} className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{page.page_title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <a href={page.page_url} target="_blank" rel="noreferrer" className="text-accent underline">{page.page_url}</a>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Money score</p>
              <p className="mt-1 text-2xl font-bold tnum text-foreground">{page.money_score}/100</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["RPM potential", signals.adsense_rpm_potential],
              ["CPC / intent", signals.cpc_commercial_intent_estimate],
              ["Ranking opportunity", signals.ranking_opportunity],
              ["Traffic potential", signals.traffic_potential],
              ["Finance topic", signals.finance_topic_value],
              ["Internal links", signals.internal_link_importance],
              ["Engagement value", signals.calculator_conversion_engagement_value],
              ["Impressions", signals.impressions_28d],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-semibold tnum text-foreground">
                  {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-1 text-sm text-foreground">{page.reason}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Recommended action</p>
            <p className="mt-1 text-sm text-foreground">{page.recommended_action}</p>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Related internal links needed</p>
            {linksNeeded.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No obvious missing calculator-mesh links detected from current suggestions.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {linksNeeded.map((link) => (
                  <li key={`${page.page_url}-${link.target}`} className="rounded-lg bg-muted/50 p-2">
                    <span className="font-medium text-foreground">{link.target}</span>
                    <span className="text-muted-foreground"> → anchor: </span>
                    <span className="font-medium text-foreground">{link.anchor}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{link.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    })}
  </section>
  );
}
