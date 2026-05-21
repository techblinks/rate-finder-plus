import { haptic } from "@/lib/haptic";

interface Bounds {
  min: number;
  max: number;
}

interface QuickAdjustChipsProps {
  loan: number;
  setLoan: (n: number) => void;
  loanBounds: Bounds;
  rate: number;
  setRate: (n: number) => void;
  rateBounds: Bounds;
  term: number;
  setTerm: (n: number) => void;
  termBounds: Bounds;
}

const clamp = (n: number, b: Bounds) => Math.min(b.max, Math.max(b.min, n));

/**
 * Mobile-only fast-tweak chip row. Lets users compare scenarios with one tap
 * without opening any input. Clamps to the current input bounds.
 *
 * Rendered with `md:hidden` by parents — desktop stays untouched.
 */
const QuickAdjustChips = ({
  loan,
  setLoan,
  loanBounds,
  rate,
  setRate,
  rateBounds,
  term,
  setTerm,
  termBounds,
}: QuickAdjustChipsProps) => {
  const chips: { label: string; ariaLabel: string; disabled: boolean; apply: () => void }[] = [
    {
      label: "−$10k",
      ariaLabel: "Decrease loan amount by $10,000",
      disabled: loan <= loanBounds.min,
      apply: () => setLoan(clamp(loan - 10000, loanBounds)),
    },
    {
      label: "+$10k",
      ariaLabel: "Increase loan amount by $10,000",
      disabled: loan >= loanBounds.max,
      apply: () => setLoan(clamp(loan + 10000, loanBounds)),
    },
    {
      label: "−0.25%",
      ariaLabel: "Decrease interest rate by 0.25 percentage points",
      disabled: rate <= rateBounds.min,
      apply: () => setRate(clamp(+(rate - 0.25).toFixed(2), rateBounds)),
    },
    {
      label: "+0.25%",
      ariaLabel: "Increase interest rate by 0.25 percentage points",
      disabled: rate >= rateBounds.max,
      apply: () => setRate(clamp(+(rate + 0.25).toFixed(2), rateBounds)),
    },
    {
      label: "−1 yr",
      ariaLabel: "Reduce loan term by 1 year",
      disabled: term <= termBounds.min,
      apply: () => setTerm(clamp(term - 1, termBounds)),
    },
    {
      label: "+1 yr",
      ariaLabel: "Increase loan term by 1 year",
      disabled: term >= termBounds.max,
      apply: () => setTerm(clamp(term + 1, termBounds)),
    },
  ];

  return (
    <div className="md:hidden max-w-full rounded-2xl border border-border bg-card px-3 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Quick adjust
      </p>
      <div
        className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            aria-label={c.ariaLabel}
            disabled={c.disabled}
            onClick={() => {
              if (c.disabled) return;
              haptic.light();
              c.apply();
            }}
            className="tnum min-h-[38px] shrink-0 snap-start rounded-full border border-border bg-background px-4 py-2 text-[13px] font-semibold text-foreground transition-all active:scale-95 active:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAdjustChips;
