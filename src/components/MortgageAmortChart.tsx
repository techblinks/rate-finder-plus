import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { YearAmort } from "@/lib/calc/mortgageEngine";
import { haptic } from "@/lib/haptic";

interface Props {
  schedule: YearAmort[];
  /** When provided, render dual-line comparison (with offset vs without). */
  baselineSchedule?: YearAmort[];
}

const fmtAxis = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
};

const fmtAUD = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const TooltipBody = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as YearAmort;
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-[12px] shadow-lg">
      <p className="font-semibold">Year {label}</p>
      <p>Principal: {fmtAUD(row.principalPaid)}</p>
      <p>Interest: {fmtAUD(row.interestPaid)}</p>
      <p>Remaining: {fmtAUD(row.closingBalance)}</p>
    </div>
  );
};

const ComparisonTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as {
    withOffset: number;
    withoutOffset: number;
    interestWith: number;
    interestWithout: number;
    interestSavedYear: number;
    cumulativeSaved: number;
  };
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-[12px] shadow-lg space-y-1">
      <p className="font-semibold">Year {label}</p>
      <p style={{ color: "hsl(var(--accent))" }}>
        Balance with offset: {fmtAUD(row.withOffset)}
      </p>
      <p className="text-muted-foreground">
        Balance without: {fmtAUD(row.withoutOffset)}
      </p>
      <div className="pt-1 mt-1 border-t border-border">
        <p>Interest this year: {fmtAUD(row.interestWith)}</p>
        <p className="text-muted-foreground">
          (vs {fmtAUD(row.interestWithout)} without)
        </p>
        <p className="font-semibold text-success">
          Saved this year: {fmtAUD(row.interestSavedYear)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Cumulative saved: {fmtAUD(row.cumulativeSaved)}
        </p>
      </div>
    </div>
  );
};

const MortgageAmortChart = ({ schedule, baselineSchedule }: Props) => {
  const hasComparison = !!(baselineSchedule && baselineSchedule.length > 0);
  const [view, setView] = useState<"compare" | "breakdown">(
    hasComparison ? "compare" : "breakdown",
  );

  const activeView = hasComparison ? view : "breakdown";

  return (
    <div className="w-full">
      {hasComparison && (
        <div
          className="mb-3 inline-flex rounded-xl border border-border bg-muted/40 p-1 text-[12px]"
          role="tablist"
          aria-label="Chart view"
        >
          {(
            [
              { id: "compare", label: "Compare" },
              { id: "breakdown", label: "Breakdown" },
            ] as const
          ).map((opt) => {
            const isActive = activeView === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  haptic.light();
                  setView(opt.id);
                }}
                className={
                  "rounded-lg px-3 py-1.5 font-medium transition-colors " +
                  (isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="h-64 w-full">
        {activeView === "compare" && hasComparison ? (
          (() => {
            const maxYears = Math.max(schedule.length, baselineSchedule!.length);
            let cumulative = 0;
            const data = Array.from({ length: maxYears }, (_, i) => {
              const w = schedule[i];
              const b = baselineSchedule![i];
              const interestWith = w?.interestPaid ?? 0;
              const interestWithout = b?.interestPaid ?? 0;
              const interestSavedYear = Math.max(0, interestWithout - interestWith);
              cumulative += interestSavedYear;
              return {
                year: i + 1,
                withOffset: w?.closingBalance ?? 0,
                withoutOffset: b?.closingBalance ?? 0,
                interestWith,
                interestWithout,
                interestSavedYear,
                cumulativeSaved: cumulative,
              };
            });
            return (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={0.5} vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={fmtAxis} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={48} />
                  <Tooltip content={<ComparisonTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="withOffset"
                    name="With offset"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="withoutOffset"
                    name="Without offset"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          })()
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={schedule} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="prinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={0.5} vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickFormatter={fmtAxis} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={48} />
              <Tooltip content={<TooltipBody />} />
              <Area
                type="monotone"
                dataKey="principalPaid"
                stackId="a"
                stroke="hsl(var(--accent))"
                fill="url(#prinGrad)"
                name="Principal"
              />
              <Area
                type="monotone"
                dataKey="interestPaid"
                stackId="a"
                stroke="hsl(var(--warning))"
                fill="url(#intGrad)"
                name="Interest"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MortgageAmortChart;
