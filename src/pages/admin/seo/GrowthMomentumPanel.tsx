import { TrendingUp } from "lucide-react";
import type { Keyword, Report } from "./seoPanelTypes";
import { average, compactNumber, formatNumber, getLatestTraffic } from "./missionControlUtils";

const buildSparkline = (values: number[]) => {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 88 - 6;
      return `${x},${y}`;
    })
    .join(" ");
};

export const GrowthMomentumPanel = ({
  latestReport,
  keywords,
}: {
  latestReport: Report | null;
  keywords: Keyword[];
}) => {
  const traffic = getLatestTraffic(latestReport, keywords);
  const rising = keywords.filter((item) => item.trend_direction === "rising").length;
  const falling = keywords.filter((item) => item.trend_direction === "falling").length;
  const pageOne = keywords.filter((item) => Number(item.calcy_position || 999) <= 10).length;
  const positions = keywords.slice(0, 18).map((item) => Math.max(1, 40 - Number(item.calcy_position || 40)));
  const points = buildSparkline(positions.length > 2 ? positions : [20, 28, 25, 36, 42, 48, 54, 60]);
  const ctr = traffic.impressions ? (traffic.clicks / traffic.impressions) * 100 : average(keywords.map((item) => Number(item.calcy_ctr_28d || 0) * 100));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3366FF]">Growth momentum</p>
          <h3 className="mt-2 text-xl font-semibold">Ranking and traffic velocity</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <TrendingUp className="h-3.5 w-3.5" />
          {traffic.clicksChange >= 0 ? "Positive" : "Needs attention"}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <svg viewBox="0 0 100 100" className="h-44 w-full overflow-visible">
          <defs>
            <linearGradient id="growthLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3366FF" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="url(#growthLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={`${points} 100,100 0,100`} fill="rgba(51,102,255,0.09)" stroke="none" />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Tracked clicks", value: compactNumber(traffic.clicks), detail: `${formatNumber(ctr, 1)}% CTR` },
          { label: "Page-1 keywords", value: `${pageOne}`, detail: "Positions 1-10" },
          { label: "Rising keywords", value: `${rising}`, detail: "Current trend" },
          { label: "Watch list", value: `${falling}`, detail: "Declining trend" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-600">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
