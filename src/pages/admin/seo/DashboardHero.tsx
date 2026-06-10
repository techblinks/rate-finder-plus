import { Activity, Bot, CheckCircle2, CircleDollarSign, Gauge, RadioTower, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { MissionMetric } from "./missionControlUtils";

const toneClass: Record<MissionMetric["tone"], string> = {
  blue: "border-[#3366FF]/25 bg-[#3366FF]/10 text-[#8fb8ff]",
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  red: "border-red-400/25 bg-red-400/10 text-red-300",
  neutral: "border-white/10 bg-white/[0.035] text-white/75",
};

const icons = [TrendingUp, Bot, ShieldCheck, CircleDollarSign, Activity, Sparkles, Zap, CheckCircle2, RadioTower, Gauge];

export const DashboardHero = ({
  metrics,
  momentum,
  healthScore,
}: {
  metrics: MissionMetric[];
  momentum: number;
  healthScore: number;
}) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050505] p-5 text-white shadow-sm md:p-6">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

    <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3366FF]/30 bg-[#3366FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9fc2ff]">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            AI Growth OS
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            Admin-only mission control
          </span>
        </div>

        <div className="mt-6 max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Calcy organic growth command center
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 md:text-base">
            One operating layer for ranking momentum, revenue opportunity, AI visibility, approvals, and system health.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Growth momentum</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-semibold tabular-nums">{Math.round(momentum)}</span>
              <span className="mb-1 text-xs text-emerald-300">live pulse</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#3366FF] transition-all duration-700" style={{ width: `${momentum}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">System health</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-semibold tabular-nums">{Math.round(healthScore)}</span>
              <span className="mb-1 text-xs text-white/50">out of 100</span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300 transition-all duration-700" style={{ width: `${healthScore}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-[#6EA8FF]/20 bg-[#003680]/20 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Operating mode</p>
            <p className="mt-4 text-2xl font-semibold">Review, approve, execute</p>
            <p className="mt-2 text-xs text-white/55">No public changes apply without admin workflow approval.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div key={metric.label} className={`rounded-xl border p-4 backdrop-blur ${toneClass[metric.tone]}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                </div>
                <Icon className="h-5 w-5 opacity-80" />
              </div>
              <p className="mt-2 min-h-8 text-xs leading-5 text-white/55">{metric.detail}</p>
              {typeof metric.progress === "number" && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${metric.progress}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
