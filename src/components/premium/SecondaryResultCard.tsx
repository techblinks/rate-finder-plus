interface SecondaryCardProps {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}

const SecondaryResultCard = ({ icon, label, value, hint }: SecondaryCardProps) => (
  <div className="bg-card border-[1.5px] border-border rounded-2xl shadow-md p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
    <div className="text-2xl mb-2 leading-none" aria-hidden>{icon}</div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
      {label}
    </p>
    <p className="font-display text-xl md:text-2xl font-bold tabular-nums text-navy leading-tight">
      {value}
    </p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

export default SecondaryResultCard;
