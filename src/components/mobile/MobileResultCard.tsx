import { Pencil } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { haptic } from "@/lib/haptic";

type EditField = "loan" | "rate" | "term";

interface MobileResultCardProps {
  primaryLabel: string;
  primaryValue: number;
  secondary: { label: string; value: number }[];
  loanAmount: number;
  rate: number;
  termYears: number;
  pending?: boolean;
  onEditField?: (field: EditField) => void;
}

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmtAud = (n: number) => AUD0.format(Math.max(0, Math.round(n)));
const fmtLoanChip = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2)}M` : `$${Math.round(n / 1000)}k`;

const Chip = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={() => {
      haptic.medium();
      onClick?.();
    }}
    aria-label={`Edit ${label}`}
    className="group inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 backdrop-blur-sm transition-all active:scale-[0.97]"
  >
    <span className="text-[10px] uppercase tracking-[0.06em] text-white/55">{label}</span>
    <span className="tnum font-semibold text-white">{value}</span>
    <Pencil className="h-3 w-3 text-white/40 transition-colors group-hover:text-white/70" aria-hidden />
  </button>
);

const MobileResultCard = ({
  primaryLabel,
  primaryValue,
  secondary,
  loanAmount,
  rate,
  termYears,
  pending,
  onEditField,
}: MobileResultCardProps) => {
  const animatedPrimary = useCountUp(primaryValue, 300);
  const animatedSecondaries = [
    useCountUp(secondary[0]?.value ?? 0, 300),
    useCountUp(secondary[1]?.value ?? 0, 300),
  ];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={pending ? "true" : undefined}
      className={`rounded-2xl bg-[var(--c-navy,#0a1628)] p-4 text-center text-white shadow-[0_8px_24px_-12px_hsl(var(--foreground)/0.25)] transition-opacity duration-150 ${
        pending ? "opacity-80" : "opacity-100"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/55">
        {primaryLabel}
      </p>
      <p className="tnum mt-1 text-[36px] font-bold leading-none text-white" aria-label={`${primaryLabel}: ${fmtAud(primaryValue)}`}>
        {fmtAud(animatedPrimary)}
      </p>

      {secondary.length > 0 && (
        <p className="mt-2 text-[12px] text-white/70 tnum">
          {secondary.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <span className="mx-1.5 text-white/30">·</span>}
              <span className="text-white/55">{s.label}</span>{" "}
              <span className="font-medium text-white/85">{fmtAud(animatedSecondaries[i] ?? s.value)}</span>
            </span>
          ))}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <Chip label="Loan" value={fmtLoanChip(loanAmount)} onClick={() => onEditField?.("loan")} />
        <Chip label="Rate" value={`${rate.toFixed(2)}%`} onClick={() => onEditField?.("rate")} />
        <Chip label="Term" value={`${termYears}yr`} onClick={() => onEditField?.("term")} />
      </div>
    </div>
  );
};

export default MobileResultCard;
