import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcHecsBorrowing } from "@/lib/calc/hecsBorrowing";

interface Props {
  grossIncome: number;
  ratePct: number;
  monthlyExpenses: number;
  dtiPct: number;
  currentHecs: number;
}

const fmtAxisMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
};

const fmtAxisHecs = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;

const fmtAUD = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const TooltipBody = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const withHecs = payload.find((p: any) => p.dataKey === "withHecs")?.value ?? 0;
  const noHecs = payload.find((p: any) => p.dataKey === "noHecs")?.value ?? 0;
  const diff = noHecs - withHecs;
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-[12px] shadow-lg">
      <p className="font-semibold">HECS balance: {fmtAUD(label)}</p>
      <p className="text-muted-foreground">With HECS: {fmtAUD(withHecs)}</p>
      <p className="text-muted-foreground">After clearing: {fmtAUD(noHecs)}</p>
      <p className="mt-1 font-medium text-warning">Lost capacity: {fmtAUD(diff)}</p>
    </div>
  );
};

const HecsImpactChart = ({ grossIncome, ratePct, monthlyExpenses, dtiPct, currentHecs }: Props) => {
  const maxBalance = Math.max(80000, Math.ceil((currentHecs * 1.5) / 10000) * 10000);
  const steps = 16;
  const stepSize = maxBalance / steps;
  const data = Array.from({ length: steps + 1 }, (_, i) => {
    const balance = Math.round(i * stepSize);
    const r = calcHecsBorrowing({
      grossIncome,
      hecsBalance: balance,
      ratePct,
      monthlyExpenses,
      dtiPct,
    });
    return {
      balance,
      withHecs: Math.round(r.borrowingPower),
      noHecs: Math.round(r.borrowingPowerWithoutHecs),
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="balance"
            tickFormatter={fmtAxisHecs}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            label={{
              value: "HECS balance",
              position: "insideBottom",
              offset: -2,
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
            }}
          />
          <YAxis
            tickFormatter={fmtAxisMoney}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={56}
          />
          <Tooltip content={<TooltipBody />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            x={currentHecs}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: "Your balance", position: "top", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="withHecs"
            name="With HECS"
            stroke="hsl(var(--warning))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="noHecs"
            name="After clearing HECS"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HecsImpactChart;
