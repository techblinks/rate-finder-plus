import type { SeoAutomationRun, SeoAutomationSchedule } from "./seoPanelTypes";

type AutomationPanelProps = {
  automationSuccess: string | null;
  automationError: string | null;
  automationSchedules: SeoAutomationSchedule[];
  automationRuns: SeoAutomationRun[];
  running: string | null;
  loadAll: () => void | Promise<void>;
  updateAutomationSchedule: (schedule: SeoAutomationSchedule, updates: Partial<Pick<SeoAutomationSchedule, "enabled" | "frequency">>) => void | Promise<void>;
  runAutomationSchedule: (schedule: SeoAutomationSchedule) => void | Promise<void>;
};

export function AutomationPanel({ automationSuccess, automationError, automationSchedules, automationRuns, running, loadAll, updateAutomationSchedule, runAutomationSchedule }: AutomationPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">SEO Automation Scheduling</h2>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Schedule and manually trigger admin-only SEO Intelligence jobs. Runs generate data and recommendations only; they do not publish, apply metadata, change links, or edit public pages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadAll()}
          disabled={running !== null}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>

    {automationSuccess && (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        {automationSuccess}
      </div>
    )}

    {automationError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {automationError}
      </div>
    )}

    {automationSchedules.length === 0 && (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <h3 className="text-base font-semibold text-foreground">No automation schedules found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Apply the latest database migration to create the default SEO automation schedules.</p>
      </div>
    )}

    {automationSchedules.length > 0 && (
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Job</th>
                <th className="py-2">Enabled</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Status</th>
                <th className="py-2">Last run</th>
                <th className="py-2">Next run</th>
                <th className="py-2">Rows</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {automationSchedules.map((schedule) => {
                const isUpdating = running === `automation-update:${schedule.job_key}`;
                const isRunning = running === `automation:${schedule.job_key}`;
                return (
                  <tr key={schedule.id} className="border-t border-border align-top">
                    <td className="py-3">
                      <p className="font-semibold text-foreground">{schedule.job_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{schedule.function_name || "No function mapped"}</p>
                      {schedule.last_error && <p className="mt-2 max-w-xs text-xs text-red-600">{schedule.last_error}</p>}
                    </td>
                    <td className="py-3">
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={schedule.enabled}
                          disabled={running !== null}
                          onChange={(event) => updateAutomationSchedule(schedule, { enabled: event.target.checked })}
                          className="h-4 w-4 rounded border-border"
                        />
                        {schedule.enabled ? "On" : "Off"}
                      </label>
                    </td>
                    <td className="py-3">
                      <select
                        value={schedule.frequency}
                        disabled={running !== null}
                        onChange={(event) => updateAutomationSchedule(schedule, { frequency: event.target.value as SeoAutomationSchedule["frequency"] })}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="manual">Manual</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                      {isUpdating && <p className="mt-1 text-xs text-muted-foreground">Saving...</p>}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        schedule.status === "error"
                          ? "bg-red-100 text-red-800"
                          : schedule.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : schedule.status === "running"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-muted text-muted-foreground"
                      }`}>
                        {isRunning ? "running" : schedule.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {schedule.last_run_at ? new Date(schedule.last_run_at).toLocaleString("en-AU") : "Never"}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString("en-AU") : "Not scheduled"}
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      <span className="block">Processed {schedule.rows_processed.toLocaleString()}</span>
                      <span className="block">Created {schedule.rows_created.toLocaleString()}</span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => runAutomationSchedule(schedule)}
                        disabled={running !== null}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {isRunning ? "Running..." : "Run now"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    )}

    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Recent automation runs</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Job</th>
              <th className="py-2">Trigger</th>
              <th className="py-2">Status</th>
              <th className="py-2">Rows</th>
              <th className="py-2">Started</th>
              <th className="py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {automationRuns.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-muted-foreground">No automation runs logged yet.</td></tr>
            )}
            {automationRuns.slice(0, 20).map((run) => (
              <tr key={run.id} className="border-t border-border align-top">
                <td className="py-3 font-medium text-foreground">{run.job_name}</td>
                <td className="py-3 text-xs text-muted-foreground">{run.trigger_type}</td>
                <td className="py-3 text-xs text-muted-foreground">{run.status}</td>
                <td className="py-3 text-xs text-muted-foreground">
                  {run.rows_processed.toLocaleString()} processed / {run.rows_created.toLocaleString()} created
                </td>
                <td className="py-3 text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString("en-AU")}</td>
                <td className="py-3 max-w-xs text-xs text-red-600">{run.error_message || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </section>
  );
}
