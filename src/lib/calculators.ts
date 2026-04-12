export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateMortgage(principal: number, annualRate: number, years: number, extraPayment = 0): MortgageResult {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;

  if (monthlyRate === 0) {
    const mp = principal / n;
    return {
      monthlyPayment: mp,
      totalPayment: principal,
      totalInterest: 0,
      schedule: Array.from({ length: n }, (_, i) => ({
        month: i + 1, payment: mp, principal: mp, interest: 0, balance: principal - mp * (i + 1),
      })),
    };
  }

  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;

  for (let i = 1; i <= n && balance > 0; i++) {
    const interestPart = balance * monthlyRate;
    let principalPart = monthlyPayment - interestPart + extraPayment;
    if (principalPart > balance) principalPart = balance;
    const payment = interestPart + principalPart;

    balance -= principalPart;
    totalInterest += interestPart;
    totalPayment += payment;

    schedule.push({
      month: i,
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interestPart * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });

    if (balance <= 0) break;
  }

  return { monthlyPayment: Math.round(monthlyPayment * 100) / 100, totalPayment: Math.round(totalPayment * 100) / 100, totalInterest: Math.round(totalInterest * 100) / 100, schedule };
}

export interface InterestResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
}

export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundingPerYear: number,
  monthlyContribution: number
): InterestResult {
  const r = annualRate / 100;
  const n = compoundingPerYear;
  const t = years;

  const compoundedPrincipal = principal * Math.pow(1 + r / n, n * t);
  const futureContributions = monthlyContribution > 0
    ? monthlyContribution * ((Math.pow(1 + r / n, n * t) - 1) / (r / n))
    : 0;

  const futureValue = compoundedPrincipal + futureContributions;
  const totalContributions = principal + monthlyContribution * 12 * years;
  const totalInterest = futureValue - totalContributions;

  return {
    futureValue: Math.round(futureValue * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}
