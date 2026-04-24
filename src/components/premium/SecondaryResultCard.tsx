interface SecondaryCardProps {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}

const SecondaryResultCard = ({ icon, label, value, hint, positive }: SecondaryCardProps) => (
  <div className={`rounded-xl border bg-card p-4 text-left shadow-sm ${positive ? "border-l-[3px] border-l-success bg-success/5" : "border-border"}`}>
    {icon && <div className="mb-2 text-xl leading-none" aria-hidden>{icon}</div>}
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
    <p className="mt-1.5 font-display text-[26px] tabular-nums text-foreground leading-tight">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default SecondaryResultCard;
