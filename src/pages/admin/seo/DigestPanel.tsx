import type { SeoDigestLog, SeoDigestPreference } from "./seoPanelTypes";

type DigestPanelProps = {
  digestSuccess: string | null;
  digestError: string | null;
  digestPreference: SeoDigestPreference | null;
  digestLogs: SeoDigestLog[];
  running: string | null;
  generateSeoDigest: (digestType: "daily" | "weekly") => void | Promise<void>;
  saveDigestPreference: (updates: Partial<SeoDigestPreference>) => void | Promise<void>;
  setDigestPreference: (preference: SeoDigestPreference) => void;
};

export function DigestPanel({ digestSuccess, digestError, digestPreference, digestLogs, running, generateSeoDigest, saveDigestPreference, setDigestPreference }: DigestPanelProps) {
  return (
<section className="space-y-4">
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Admin SEO Digest Notifications</h2>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Configure daily or weekly SEO summaries for admins. Digests are disabled by default and never publish, apply metadata, edit content, or change public pages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => generateSeoDigest("daily")}
            disabled={running !== null}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {running === "digest:daily" ? "Generating..." : "Generate daily digest"}
          </button>
          <button
            type="button"
            onClick={() => generateSeoDigest("weekly")}
            disabled={running !== null}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            {running === "digest:weekly" ? "Generating..." : "Generate weekly digest"}
          </button>
        </div>
      </div>
    </div>

    {digestSuccess && (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        {digestSuccess}
      </div>
    )}

    {digestError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {digestError}
      </div>
    )}

    {!digestPreference && (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <h3 className="text-base font-semibold text-foreground">Digest preferences not created yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Apply the latest database migration to create the default disabled digest preference.</p>
      </div>
    )}

    {digestPreference && (
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Delivery settings</h3>
            <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm">
              <span>
                <span className="block font-medium text-foreground">Daily digest</span>
                <span className="block text-xs text-muted-foreground">Allow scheduled daily SEO summary generation.</span>
              </span>
              <input
                type="checkbox"
                checked={digestPreference.daily_enabled}
                disabled={running !== null}
                onChange={(event) => saveDigestPreference({ daily_enabled: event.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm">
              <span>
                <span className="block font-medium text-foreground">Weekly digest</span>
                <span className="block text-xs text-muted-foreground">Allow scheduled weekly SEO summary generation.</span>
              </span>
              <input
                type="checkbox"
                checked={digestPreference.weekly_enabled}
                disabled={running !== null}
                onChange={(event) => saveDigestPreference({ weekly_enabled: event.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm">
              <span>
                <span className="block font-medium text-foreground">Email delivery</span>
                <span className="block text-xs text-muted-foreground">Requires an email provider secret. Default is off.</span>
              </span>
              <input
                type="checkbox"
                checked={digestPreference.email_enabled}
                disabled={running !== null}
                onChange={(event) => saveDigestPreference({ email_enabled: event.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-sm">
              <span>
                <span className="block font-medium text-foreground">Admin notification logs</span>
                <span className="block text-xs text-muted-foreground">Save digest summaries inside admin even when email is unavailable.</span>
              </span>
              <input
                type="checkbox"
                checked={digestPreference.admin_notifications_enabled}
                disabled={running !== null}
                onChange={(event) => saveDigestPreference({ admin_notifications_enabled: event.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Recipient and timing</h3>
            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">Recipient email</span>
              <input
                type="email"
                value={digestPreference.recipient_email || ""}
                disabled={running !== null}
                onChange={(event) => setDigestPreference({ ...digestPreference, recipient_email: event.target.value })}
                onBlur={(event) => saveDigestPreference({ recipient_email: event.target.value || null })}
                placeholder="admin@example.com"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">Send time</span>
              <input
                type="time"
                value={digestPreference.send_time_local}
                disabled={running !== null}
                onChange={(event) => saveDigestPreference({ send_time_local: event.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">Timezone</span>
              <input
                value={digestPreference.timezone}
                disabled={running !== null}
                onChange={(event) => setDigestPreference({ ...digestPreference, timezone: event.target.value })}
                onBlur={(event) => saveDigestPreference({ timezone: event.target.value || "Australia/Brisbane" })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
              <p>Last daily sent: {digestPreference.last_daily_sent_at ? new Date(digestPreference.last_daily_sent_at).toLocaleString("en-AU") : "Never"}</p>
              <p className="mt-1">Last weekly sent: {digestPreference.last_weekly_sent_at ? new Date(digestPreference.last_weekly_sent_at).toLocaleString("en-AU") : "Never"}</p>
              {digestPreference.last_error && <p className="mt-2 text-red-600">{digestPreference.last_error}</p>}
            </div>
          </div>
        </div>
      </section>
    )}

    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Recent digest logs</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Digest</th>
              <th className="py-2">Channel</th>
              <th className="py-2">Status</th>
              <th className="py-2">Provider</th>
              <th className="py-2">Generated</th>
              <th className="py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {digestLogs.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-muted-foreground">No digest logs yet.</td></tr>
            )}
            {digestLogs.map((log) => (
              <tr key={log.id} className="border-t border-border align-top">
                <td className="py-3">
                  <p className="font-medium text-foreground">{log.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.digest_type}</p>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{log.channel}</td>
                <td className="py-3 text-xs text-muted-foreground">{log.status}</td>
                <td className="py-3 text-xs text-muted-foreground">
                  {log.email_provider_configured ? "Configured" : "Email provider not configured"}
                </td>
                <td className="py-3 text-xs text-muted-foreground">
                  {log.generated_at ? new Date(log.generated_at).toLocaleString("en-AU") : "Unknown"}
                </td>
                <td className="py-3 max-w-sm text-xs text-muted-foreground">
                  {log.error_message || log.message || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </section>
  );
}
