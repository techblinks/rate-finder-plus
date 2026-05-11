import { NumberInput } from "@/components/ui-kit";
import CurrencyInput from "@/components/CurrencyInput";

interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

const RangeField = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
}: RangeFieldProps) => {
  const isCurrency = prefix === "$";
  return (
    <div className="field">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[13px] font-medium text-foreground">{label}</label>
        <div className="range-value-chip w-[44%] max-w-[180px]">
          {isCurrency ? (
            <CurrencyInput
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              ariaLabel={label}
            />
          ) : (
            <NumberInput
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              step={step}
              prefix={prefix}
              suffix={suffix}
              ariaLabel={label}
            />
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        className="range-slider mt-1 w-full"
        style={{
          ["--fill-pct" as string]:
            max > min
              ? `${Math.min(100, Math.max(0, ((Number(value) - min) / (max - min)) * 100))}%`
              : "0%",
        }}
      />
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </div>
  );
};

export default RangeField;
