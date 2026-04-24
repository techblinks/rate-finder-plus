export type Frequency = "monthly" | "fortnightly" | "weekly";

interface FrequencyToggleProps {
  value: Frequency;
  onChange: (v: Frequency) => void;
}

const options: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "weekly", label: "Weekly" },
];

const FrequencyToggle = ({ value, onChange }: FrequencyToggleProps) => (
  <div role="tablist" aria-label="Repayment frequency" className="flex w-full items-center gap-1 rounded-lg border border-border bg-secondary p-1">
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button key={opt.value} role="tab" aria-selected={active} onClick={() => onChange(opt.value)} className={`flex-1 rounded-md px-2 py-2.5 text-[13px] transition-all ${active ? "bg-card font-bold text-foreground shadow-sm" : "font-medium text-muted-foreground hover:text-foreground"}`}>
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default FrequencyToggle;
