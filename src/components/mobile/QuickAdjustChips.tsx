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
  const chips: { label: string; apply: () => void }[] = [
    { label: "−$10k", apply: () => setLoan(clamp(loan - 10000, loanBounds)) },
    { label: "+$10k", apply: () => setLoan(clamp(loan + 10000, loanBounds)) },
    { label: "−0.25%", apply: () => setRate(clamp(+(rate - 0.25).toFixed(2), rateBounds)) },
    { label: "+0.25%", apply: () => setRate(clamp(+(rate + 0.25).toFixed(2), rateBounds)) },
    { label: "−1 yr", apply: () => setTerm(clamp(term - 1, termBounds)) },
    { label: "+1 yr", apply: () => setTerm(clamp(term + 1, termBounds)) },
  ];

  return (
    <div className="md:hidden -mx-4 px-4 pb-1">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Quick adjust
      </p>
      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => {
              haptic.light();
              c.apply();
            }}
            className="snap-start shrink-0 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-semibold text-foreground active:scale-95 active:bg-accent-light transition-all tnum"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAdjustChips;
