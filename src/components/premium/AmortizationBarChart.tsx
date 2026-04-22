import { AmortizationRow } from "@/lib/calculators";

interface Props {
  schedule: AmortizationRow[];
  symbol: string;
  height?: number;
}

/**
 * CSS-only amortization bar chart.
 * Aggregates the monthly schedule into yearly buckets and renders stacked
 * principal (blue) + interest (gold) bars.
 */
const AmortizationBarChart = ({ schedule, symbol, height = 140 }: Props) => {
  if (schedule.length === 0) return null;

  // Group monthly rows into 12-month yearly buckets.
  const years: { principal: number; interest: number; balance: number }[] = [];
  for (let i = 0; i < schedule.length; i += 12) {
    const slice = schedule.slice(i, i + 12);
    years.push({
      principal: slice.reduce((s, r) => s + r.principal, 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
      balance: slice[slice.length - 1]?.balance ?? 0,
    });
  }

  const maxYearTotal = Math.max(...years.map((y) => y.principal + y.interest));
  const fmt = (n: number) =>
    `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="bg-card border-[1.5px] border-border rounded-2xl shadow-md p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-4 gap-3">
        <h3 className="font-display text-xl font-bold text-navy">
          Principal vs Interest Over Time
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Principal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Interest
          </span>
        </div>
      </div>

      <div
        className="flex items-end gap-[3px] mb-2 group/chart"
        style={{ height }}
        aria-label="Amortization breakdown"
      >
        {years.map((y, idx) => {
          const total = y.principal + y.interest;
          const totalPct = (total / maxYearTotal) * 100;
          const interestPct = total > 0 ? (y.interest / total) * 100 : 0;
          const principalPct = total > 0 ? (y.principal / total) * 100 : 0;
          return (
            <div
              key={idx}
              className="relative flex-1 flex flex-col justify-end h-full group/bar"
              title={`Year ${idx + 1}: ${fmt(y.principal)} principal · ${fmt(y.interest)} interest`}
            >
              <div
                className="w-full flex flex-col rounded-t-md overflow-hidden transition-opacity hover:opacity-90"
                style={{ height: `${totalPct}%` }}
              >
                <div
                  className="bg-accent"
                  style={{ height: `${interestPct}%` }}
                  aria-hidden
                />
                <div
                  className="bg-primary"
                  style={{ height: `${principalPct}%` }}
                  aria-hidden
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 whitespace-nowrap bg-navy text-white text-[11px] rounded-md px-2 py-1.5 shadow-lg">
                <div className="font-semibold">Year {idx + 1}</div>
                <div className="text-white/70">P {fmt(y.principal)}</div>
                <div className="text-white/70">I {fmt(y.interest)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Year axis labels every 5 years (desktop) */}
      <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-[3px] mt-1">
        {years.map((_, idx) => (
          <div key={idx} className="flex-1 text-center">
            {idx === 0 || (idx + 1) % 5 === 0 || idx === years.length - 1 ? `Y${idx + 1}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmortizationBarChart;
