type ImpactTrackingPanelProps = {
  riskAlerts: any[];
};

export function ImpactTrackingPanel({ riskAlerts }: ImpactTrackingPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Risk alerts</h3>
      <div className="mt-3 space-y-3">
        {riskAlerts.length === 0 && <p className="text-sm text-muted-foreground">No material risk alerts detected.</p>}
        {riskAlerts.slice(0, 5).map((alert: any, index: number) => (
          <div key={`${alert.type}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">{alert.type || "Risk"}</p>
            <p className="mt-1 text-xs text-amber-800">{alert.message}</p>
            {alert.url && <p className="mt-1 break-all text-xs text-amber-700">{alert.url}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
