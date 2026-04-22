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

const PremiumSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = defaultFormat,
  formatMinMax,
  hint,
}: PremiumSliderProps) => {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const minMaxFmt = formatMinMax ?? format;

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </label>
        <span className="font-display text-2xl font-bold tabular-nums text-navy leading-none">
          {format(value)}
        </span>
      </div>
      <div
        className="premium-range relative"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) ${pct}%, hsl(var(--gray-100)) ${pct}%, hsl(var(--gray-100)) 100%)`,
        }}
      >
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="premium-range absolute inset-0 bg-transparent"
          style={{ background: "transparent" }}
          aria-label={label}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground/70">
        <span>{minMaxFmt(min)}</span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
        <span>{minMaxFmt(max)}</span>
      </div>
    </div>
  );
};

export default PremiumSlider;
