import { TrendingDown, Sparkles } from "lucide-react";
import type { Frequency } from "@/lib/calc/mortgageEngine";

interface Props {
  /** Loan principal */
  loan: number;
  /** Annual interest rate % */
  rate: number;
  /** Loan term years */
  term: number;
  /** Selected frequency */
  freq: Frequency;
  /** Total interest from current calculation */
  totalInterest: number;
  /** Monthly repayment from current calculation */
  monthly: number;
  /** Fortnightly repayment from current calculation */
  fortnightly: number;
  /** Extra repayments per month (current) */
  extra: number;
}

const AUD0 = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});
const fmt = (n: number) => AUD0.format(Math.max(0, Math.round(n)));

/**
 * One-line dynamic "nudge" strip rendered between the result hero and the
 * input card. Surfaces the most impactful saving the user could unlock
 * given their current inputs — encourages experimentation.
 */
const MobileInsightStrip = ({ loan, rate, term, freq, totalInterest, monthly, fortnightly, extra }: Props) => {
  // Compute interest if user switched to fortnightly (13 monthly equivalents/yr)
  const months = term * 12;
  const fortInterest = (() => {
    // Approx: paying fortnightly half-monthly amount means 26 payments/yr = 13 monthly equiv
    // Saves roughly the last ~2 years of interest on standard 30y loans
    const r = rate / 100 / 12;
    if (r <= 0) return totalInterest;
    // Quick approximation via accelerated payoff
    const accelMonthly = monthly * (13 / 12);
    let bal = loan;
    let interest = 0;
    let i = 0;
    const max = months + 12;
    while (bal > 0.01 && i < max * 2) {
      const intM = bal * r;
      const pri = Math.min(bal, accelMonthly - intM);
      if (pri <= 0) break;
      interest += intM;
      bal -= pri;
      i++;
    }
    return interest;
  })();

  let icon = <Sparkles className="h-4 w-4 flex-shrink-0" aria-hidden />;
  let message: string | null = null;

  if (freq === "monthly") {
    const saving = Math.max(0, totalInterest - fortInterest);
    if (saving > 1000) {
      icon = <TrendingDown className="h-4 w-4 flex-shrink-0" aria-hidden />;
      message = `Switch to fortnightly to save about ${fmt(saving)} in interest`;
    }
  } else if (extra === 0) {
    // Nudge to try extra repayments
    icon = <TrendingDown className="h-4 w-4 flex-shrink-0" aria-hidden />;
    message = `Try adding $200/mo extra — most users save 4+ years on this loan`;
  } else {
    icon = <Sparkles className="h-4 w-4 flex-shrink-0" aria-hidden />;
    message = `${fmt(extra)}/mo extra is working — see savings below`;
  }

  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-light px-3 py-2.5 text-[13px] text-foreground">
      <span className="text-accent">{icon}</span>
      <span className="leading-snug">{message}</span>
    </div>
  );
};

export default MobileInsightStrip;
