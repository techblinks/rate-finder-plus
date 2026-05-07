import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { YearAmort } from "@/lib/calc/mortgageEngine";

interface Props {
  schedule: YearAmort[];
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

const MortgageAmortChart = ({ schedule }: Props) => (
  <div className="h-64 w-full">
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
  </div>
);

export default MortgageAmortChart;
