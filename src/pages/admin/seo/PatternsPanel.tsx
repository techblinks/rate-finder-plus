type PatternsPanelProps = {
  bestWinningPattern: any;
};

export function PatternsPanel({ bestWinningPattern }: PatternsPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Best winning pattern discovered</h3>
      <div className="mt-3 rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">
          {bestWinningPattern?.pattern || "No repeatable winning pattern detected yet"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {bestWinningPattern?.recommended_response || "Run more SEO intelligence jobs to identify repeatable patterns."}
        </p>
      </div>
    </section>
  );
}
