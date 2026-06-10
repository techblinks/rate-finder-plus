import { ArrowRight, History, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ContentDraftImpactItem, DailySeoBriefing, WeeklySeoBriefing, WeeklySeoTask } from "./seoPanelTypes";
import type { SubTab } from "./seoPanelTypes";

export const ApprovalQueuePanel = ({
  weeklySeoTasks,
  weeklySeoBriefing,
  dailySeoBriefing,
  contentDrafts,
  onNavigate,
}: {
  weeklySeoTasks: WeeklySeoTask[];
  weeklySeoBriefing: WeeklySeoBriefing | null;
  dailySeoBriefing: DailySeoBriefing | null;
  contentDrafts: ContentDraftImpactItem[];
  onNavigate: (tab: SubTab) => void;
}) => {
  const pendingTasks = weeklySeoTasks.filter((item) => item.approval_status === "pending");
  const appliedDrafts = contentDrafts.filter((item) => ["published", "live", "done", "applied"].includes(item.status));
  const reviewItems = [
    ...pendingTasks.slice(0, 4).map((item) => ({
      title: item.task_title,
      detail: item.suggested_implementation_prompt,
      status: item.approval_status,
    })),
    ...(dailySeoBriefing?.approval_status === "pending" ? [{ title: "Daily briefing waiting for review", detail: dailySeoBriefing.daily_summary, status: "pending" }] : []),
    ...(weeklySeoBriefing?.approval_status === "pending" ? [{ title: "Weekly briefing waiting for review", detail: weeklySeoBriefing.executive_summary, status: "pending" }] : []),
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3366FF]">Approval command center</p>
          <h3 className="mt-2 text-xl font-semibold">Safe execution workflow</h3>
          <p className="mt-2 text-sm text-slate-600">Suggestions stay admin-only until reviewed through the existing approval flow.</p>
        </div>
        <button
          onClick={() => onNavigate("weekly-plan")}
          className="inline-flex items-center gap-2 rounded-lg border border-[#3366FF]/40 bg-[#3366FF]/10 px-3 py-2 text-xs font-semibold text-[#9fc2ff] hover:bg-[#3366FF]/20"
        >
          Review queue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          { label: "Pending approvals", value: pendingTasks.length, icon: LockKeyhole, detail: "Tasks awaiting admin decision" },
          { label: "Applied drafts", value: appliedDrafts.length, icon: ShieldCheck, detail: "Waiting for or carrying impact signals" },
          { label: "Rollback posture", value: "Ready", icon: History, detail: "Existing workflow remains preserved" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                </div>
                <Icon className="h-5 w-5 text-[#6EA8FF]" />
              </div>
              <p className="mt-2 text-xs text-slate-600">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {reviewItems.slice(0, 5).map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              </div>
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-amber-200">
                {item.status}
              </span>
            </div>
          </div>
        ))}
        {reviewItems.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No pending approval items are loaded. This area will populate when weekly tasks, briefings, or drafts require review.
          </div>
        )}
      </div>
    </section>
  );
};
