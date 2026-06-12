import { RadioTower } from "lucide-react";
import type { MissionInsight } from "./missionControlUtils";

const dotClass: Record<MissionInsight["tone"], string> = {
  blue: "bg-[#6EA8FF] shadow-[0_0_12px_rgba(110,168,255,0.8)]",
  green: "bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]",
  amber: "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.75)]",
  red: "bg-red-300 shadow-[0_0_12px_rgba(252,165,165,0.75)]",
  neutral: "bg-slate-400",
};

export const LiveInsightsFeed = ({ insights }: { insights: MissionInsight[] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3366FF]">Live AI insights</p>
        <h3 className="mt-2 text-xl font-semibold">Operational feed</h3>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <RadioTower className="h-3.5 w-3.5" />
        Listening
      </span>
    </div>
    <div className="mt-5 max-h-[420px] space-y-2 overflow-hidden">
      {insights.map((insight, index) => (
        <div key={`${insight.label}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass[insight.tone]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold text-slate-950">{insight.label}</p>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-slate-500">{insight.time}</span>
              </div>
              <p className="mt-1 text-sm leading-5 text-slate-600">{insight.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
