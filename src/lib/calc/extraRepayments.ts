import { calcMortgage } from "./mortgage";

export interface ExtraComparison {
  base: ReturnType<typeof calcMortgage>;
  withExtra: ReturnType<typeof calcMortgage>;
  monthsSaved: number;
  interestSaved: number;
}

export function compareExtraRepayments(
  balance: number,
  ratePct: number,
  remainingYears: number,
  extraMonthly: number,
): ExtraComparison {
  const start = new Date();
  const base = calcMortgage(balance, ratePct, remainingYears, 0, new Date(start));
  const withExtra = calcMortgage(balance, ratePct, remainingYears, extraMonthly, new Date(start));

  // Months saved = difference between final months of last yearly row entries
  const baseMonths = base.yearlySchedule.length === 0 ? 0 : monthsFromPayoff(start, base.payoffDate);
  const extraMonths = withExtra.yearlySchedule.length === 0 ? 0 : monthsFromPayoff(start, withExtra.payoffDate);
  const monthsSaved = Math.max(0, baseMonths - extraMonths);
  const interestSaved = Math.max(0, base.totalInterest - withExtra.totalInterest);

  return { base, withExtra, monthsSaved, interestSaved };
}

function monthsFromPayoff(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export function formatYearsMonths(totalMonths: number): string {
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} month${m === 1 ? "" : "s"}`;
  if (m === 0) return `${y} year${y === 1 ? "" : "s"}`;
  return `${y} year${y === 1 ? "" : "s"} ${m} month${m === 1 ? "" : "s"}`;
}
