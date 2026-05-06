// Standard monthly amortisation. Returns monthly payment for the given loan.
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export interface MortgageBreakdown {
  monthly: number;
  fortnightly: number;
  weekly: number;
  totalRepaid: number;
  totalInterest: number;
  payoffDate: Date;
  yearlySchedule: YearRow[];
  monthlySchedule: MonthRow[];
}

export interface YearRow {
  year: number;
  opening: number;
  principal: number;
  interest: number;
  closing: number;
}

export interface MonthRow {
  month: number;
  opening: number;
  principal: number;
  interest: number;
  closing: number;
}

export function calcMortgage(
  principal: number,
  annualRatePct: number,
  years: number,
  extraMonthly = 0,
  startDate: Date = new Date(),
): MortgageBreakdown {
  const monthly = monthlyPayment(principal, annualRatePct, years);
  const r = annualRatePct / 100 / 12;
  const totalMonths = years * 12;

  let balance = principal;
  let totalInterest = 0;
  let totalRepaid = 0;
  let monthIndex = 0;

  const yearly: YearRow[] = [];
  const monthly_rows: MonthRow[] = [];
  let yearOpening = principal;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let m = 1; m <= totalMonths && balance > 0.005; m++) {
    const monthOpening = balance;
    const interest = balance * r;
    let principalPart = monthly - interest + extraMonthly;
    if (principalPart > balance) principalPart = balance;
    const payment = interest + principalPart;
    balance -= principalPart;
    totalInterest += interest;
    totalRepaid += payment;
    yearPrincipal += principalPart;
    yearInterest += interest;
    monthIndex = m;

    monthly_rows.push({
      month: m,
      opening: monthOpening,
      principal: principalPart,
      interest,
      closing: Math.max(0, balance),
    });

    if (m % 12 === 0 || balance <= 0.005) {
      yearly.push({
        year: Math.ceil(m / 12),
        opening: yearOpening,
        principal: yearPrincipal,
        interest: yearInterest,
        closing: Math.max(0, balance),
      });
      yearOpening = balance;
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const payoff = new Date(startDate);
  payoff.setMonth(payoff.getMonth() + monthIndex);

  return {
    monthly,
    fortnightly: monthly / 2,
    weekly: monthly / (52 / 12),
    totalRepaid,
    totalInterest,
    payoffDate: payoff,
    yearlySchedule: yearly,
    monthlySchedule: monthly_rows,
  };
}
