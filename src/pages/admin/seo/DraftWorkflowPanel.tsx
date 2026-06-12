type DraftWorkflowPanelProps = {
  implementationQueue: any[];
};

export function DraftWorkflowPanel({ implementationQueue }: DraftWorkflowPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Suggested implementation queue</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Task</th>
              <th className="py-2">Source</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Traffic</th>
              <th className="py-2">Revenue</th>
              <th className="py-2">Prompt</th>
            </tr>
          </thead>
          <tbody>
            {implementationQueue.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-muted-foreground">No implementation tasks generated yet.</td></tr>
            )}
            {implementationQueue.slice(0, 10).map((item: any, index: number) => (
              <tr key={`${item.task}-${index}`} className="border-t border-border">
                <td className="py-3 font-medium text-foreground">
                  <span>{item.task}</span>
                  <span className="mt-1 block break-all text-xs font-normal text-muted-foreground">{item.url}</span>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{item.source}</td>
                <td className="py-3 text-xs text-muted-foreground">{item.priority_level} / {item.risk_level} risk</td>
                <td className="py-3 text-xs text-muted-foreground">{item.expected_traffic_impact}</td>
                <td className="py-3 text-xs text-muted-foreground">{item.expected_revenue_impact}</td>
                <td className="py-3 text-xs text-muted-foreground">{item.prompt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
