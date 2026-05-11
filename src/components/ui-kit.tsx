import { ReactNode } from "react";

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="field">
    <label className="text-[13px] font-medium text-foreground">{label}</label>
    {children}
    {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
}

export const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  ariaLabel,
}: NumberInputProps) => (
  <div className="relative">
    {prefix && (
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
        {prefix}
      </span>
    )}
    <input
      type="number"
      inputMode="decimal"
      pattern="[0-9]*"
      aria-label={ariaLabel}
      className={`field-input tnum w-full ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
      value={Number.isFinite(value) ? value : ""}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(0);
          return;
        }
        const n = Number(raw);
        if (!Number.isNaN(n)) onChange(n);
      }}
    />
    {suffix && (
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
        {suffix}
      </span>
    )}
  </div>
);

interface SelectInputProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: SelectInputProps<T>) {
  return (
    <select
      aria-label={ariaLabel}
      className="field-input w-full bg-background"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export const PrimaryButton = ({
  children,
  onClick,
  type = "submit",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <button type={type} onClick={onClick} disabled={disabled} className="btn-primary">
    {children}
  </button>
);

export const ResultRow = ({
  label,
  value,
  emphasis,
  positive,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
  positive?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-3 py-2">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span
      className={`tnum ${emphasis ? "text-[24px] font-semibold" : "text-[15px] font-medium"} ${
        positive ? "text-success" : "text-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);

export const Card = ({
  children,
  as: As = "div",
}: {
  children: ReactNode;
  as?: "div" | "section" | "form";
}) => <As className="surface-card">{children}</As>;

export const ResultCard = ({ children }: { children: ReactNode }) => (
  <div className="result-panel-navy rounded-lg border border-border bg-card p-4 md:p-7">
    {children}
  </div>
);
