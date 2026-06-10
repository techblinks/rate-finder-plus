import type { MissionGoal } from "./missionControlUtils";

export const GoalTrackingPanel = ({ goals }: { goals: MissionGoal[] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6EA8FF]">Goal tracking</p>
      <h3 className="mt-2 text-xl font-semibold">Business progress</h3>
    </div>
    <div className="mt-5 space-y-3">
      {goals.map((goal) => (
        <div key={goal.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">{goal.label}</p>
              <p className="mt-1 text-xs text-slate-600">{goal.detail}</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-slate-950">{goal.value}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-[#3366FF] via-[#6EA8FF] to-emerald-300 transition-all duration-700" style={{ width: `${goal.progress}%` }} />
          </div>
          <p className="mt-2 text-right text-[11px] uppercase tracking-[0.14em] text-slate-500">{Math.round(goal.progress)}% complete</p>
        </div>
      ))}
    </div>
  </section>
);
