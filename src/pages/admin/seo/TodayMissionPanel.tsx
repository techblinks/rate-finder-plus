import { ArrowRight, CheckCircle2, Target, Zap } from "lucide-react";
import type { MissionAction } from "./missionControlUtils";
import type { SubTab } from "./seoPanelTypes";

const difficultyClass: Record<MissionAction["difficulty"], string> = {
  Low: "text-emerald-700",
  Medium: "text-amber-700",
  High: "text-red-700",
};

export const TodayMissionPanel = ({
  actions,
  onNavigate,
}: {
  actions: MissionAction[];
  onNavigate: (tab: SubTab) => void;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3366FF]">Today's mission</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Highest ROI actions</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Focused queue from daily briefing, weekly plan, opportunity radar, CTR, and freshness signals.
        </p>
      </div>
      <button
        onClick={() => onNavigate("daily-briefing")}
        className="inline-flex items-center gap-2 rounded-lg border border-[#3366FF]/40 bg-[#3366FF]/10 px-3 py-2 text-xs font-semibold text-[#9fc2ff] hover:bg-[#3366FF]/20"
      >
        Daily briefing
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-5 grid gap-3 xl:grid-cols-3">
      {actions.map((action, index) => (
        <article key={`${action.title}-${index}`} className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#6EA8FF] hover:bg-white">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#3366FF]/40 bg-[#3366FF]/15 text-sm font-semibold text-[#9fc2ff]">
              {index + 1}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              ROI {Math.round(action.roi)}
            </span>
          </div>
          <h4 className="mt-4 line-clamp-2 text-lg font-semibold text-slate-950">{action.title}</h4>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#3366FF]">{action.source}</p>
          {action.url && <p className="mt-2 truncate text-xs text-slate-500">{action.url}</p>}
          <p className="mt-4 line-clamp-4 min-h-20 text-sm leading-6 text-slate-600">{action.why}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-slate-500">Traffic</p>
              <p className="mt-1 line-clamp-2 text-slate-800">{action.trafficImpact}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-slate-500">Revenue</p>
              <p className="mt-1 line-clamp-2 text-slate-800">{action.revenueImpact}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className={`inline-flex items-center gap-1.5 ${difficultyClass[action.difficulty]}`}>
              <Zap className="h-3.5 w-3.5" />
              {action.difficulty} difficulty
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {Math.round(action.confidence)} confidence
            </span>
          </div>

          {action.pattern && (
            <div className="mt-4 rounded-lg border border-[#6EA8FF]/20 bg-[#3366FF]/10 px-3 py-2 text-xs text-[#b8d2ff]">
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {action.pattern}
              </span>
            </div>
          )}
        </article>
      ))}

      {actions.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 xl:col-span-3">
          No priority actions are loaded yet. Run GSC sync, Opportunity Radar, and Daily SEO Briefing to populate the mission queue.
        </div>
      )}
    </div>
  </section>
);
