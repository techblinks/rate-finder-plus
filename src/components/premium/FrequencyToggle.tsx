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
  <div
    role="tablist"
    aria-label="Repayment frequency"
    className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-secondary"
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-[7px] transition-all ${
            active
              ? "bg-card text-navy shadow-sm"
              : "text-muted-foreground hover:text-navy"
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default FrequencyToggle;
