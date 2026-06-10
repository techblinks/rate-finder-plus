import { ArrowRight, ShieldAlert } from "lucide-react";
import type { WarRoomLane } from "./missionControlUtils";
import type { SubTab } from "./seoPanelTypes";

const priorityClass: Record<string, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const WeeklyWarRoom = ({
  lanes,
  onNavigate,
}: {
  lanes: WarRoomLane[];
  onNavigate: (tab: SubTab) => void;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3366FF]">Weekly war room</p>
        <h3 className="mt-2 text-xl font-semibold">Strategic execution lanes</h3>
      </div>
      <button
        onClick={() => onNavigate("weekly-plan")}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Open weekly plan
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>

    <div className="mt-5 grid gap-3 xl:grid-cols-4">
      {lanes.map((lane) => (
        <div key={lane.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#6EA8FF]" />
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">{lane.label}</h4>
          </div>
          <div className="mt-4 space-y-3">
            {lane.items.slice(0, 4).map((item, index) => (
              <div key={`${lane.label}-${item.title}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">{item.title}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityClass[item.priority] || priorityClass.medium}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{item.detail}</p>
              </div>
            ))}
            {lane.items.length === 0 && (
              <p className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">No loaded items in this lane.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);
