// Frequency-aware amortisation engine matching the spec.
export type Frequency = "weekly" | "fortnightly" | "monthly";

const PERIODS_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
};

export interface YearAmort {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface AmortResult {
  perPeriod: number;
  weekly: number;
  fortnightly: number;
  monthly: number;
  totalRepaid: number;
  totalInterest: number;
  payoffYear: number;
  yearsTaken: number;
  monthsRemainder: number;
  schedule: YearAmort[];
}

function periodPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
  freq: Frequency,
): number {
  const n = PERIODS_PER_YEAR[freq];
  const r = annualRatePct / 100 / n;
  const periods = termYears * n;
  if (periods <= 0) return 0;
  if (r === 0) return principal / periods;
  return (principal * (r * Math.pow(1 + r, periods))) / (Math.pow(1 + r, periods) - 1);
}

export function buildAmortisation(
  principal: number,
  annualRatePct: number,
  termYears: number,
  freq: Frequency,
  extraMonthly = 0,
  startYear = new Date().getFullYear(),
): AmortResult {
  const n = PERIODS_PER_YEAR[freq];
  const r = annualRatePct / 100 / n;
  const base = periodPayment(principal, annualRatePct, termYears, freq);
  const extraPerPeriod = extraMonthly / (n / 12);

  // For comparison helpers across frequencies
  const monthlyBase = periodPayment(principal, annualRatePct, termYears, "monthly");
  const fortBase = periodPayment(principal, annualRatePct, termYears, "fortnightly");
  const weekBase = periodPayment(principal, annualRatePct, termYears, "weekly");

  let balance = principal;
  let totalInterest = 0;
  let totalRepaid = 0;
  const schedule: YearAmort[] = [];
  let periodsTaken = 0;

  outer: for (let year = 1; year <= termYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const opening = balance;
    for (let p = 0; p < n; p++) {
      if (balance <= 0) break;
      const interest = balance * r;
      let principalPaid = base - interest + extraPerPeriod;
      if (principalPaid > balance) principalPaid = balance;
      const payment = interest + principalPaid;
      yearInterest += interest;
      yearPrincipal += principalPaid;
      balance -= principalPaid;
      totalInterest += interest;
      totalRepaid += payment;
      periodsTaken++;
      if (balance < 0.01) balance = 0;
    }
    schedule.push({
      year,
      openingBalance: Math.round(opening),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      closingBalance: Math.round(Math.max(balance, 0)),
    });
    if (balance <= 0) break outer;
  }

  const yearsTaken = Math.floor(periodsTaken / n);
  const monthsRemainder = Math.round(((periodsTaken / n) - yearsTaken) * 12);

  return {
    perPeriod: base,
    weekly: weekBase,
    fortnightly: fortBase,
    monthly: monthlyBase,
    totalRepaid,
    totalInterest,
    payoffYear: startYear + yearsTaken + (monthsRemainder > 0 ? 1 : 0),
    yearsTaken,
    monthsRemainder,
    schedule,
  };
}
