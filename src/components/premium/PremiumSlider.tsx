import { useId } from "react";

interface PremiumSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  formatMinMax?: (value: number) => string;
  hint?: string;
}

const defaultFormat = (n: number) => n.toLocaleString();

const PremiumSlider = ({ label, value, min, max, step = 1, onChange, format = defaultFormat, formatMinMax, hint }: PremiumSliderProps) => {
  const id = useId();
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const minMaxFmt = formatMinMax ?? format;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-muted-foreground">
          {label}
        </label>
        <span className="font-display text-[26px] tabular-nums text-foreground leading-none">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="premium-range"
        style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--secondary)) ${pct}%)` }}
        aria-label={label}
      />
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{minMaxFmt(min)}</span>
        {hint && <span>{hint}</span>}
        <span>{minMaxFmt(max)}</span>
      </div>
    </div>
  );
};

export default PremiumSlider;
