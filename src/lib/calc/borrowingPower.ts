import { monthlyPayment } from "./mortgage";

export interface BorrowingInput {
  income1: number;
  income2: number;
  monthlyExpenses: number;
  otherRepayments: number;
  creditCardLimit: number;
  dependants: number;
  ratePct: number;
  termYears: number;
}

export interface BorrowingResult {
  conservative: number;
  maximum: number;
  assessmentRate: number;
  monthlyAtMax: number;
  netMonthly: number;
  totalCommitments: number;
}

const DEPENDANT_COSTS = [0, 500, 800, 1050, 1200];

export function calcBorrowingPower(input: BorrowingInput): BorrowingResult {
  const assessmentRate = input.ratePct + 3.0;
  const grossAnnual = Math.max(0, input.income1) + Math.max(0, input.income2);
  const netMonthly = (grossAnnual * 0.7) / 12;

  const creditCardMonthly = Math.max(0, input.creditCardLimit) * 0.038;
  const dep = DEPENDANT_COSTS[Math.min(Math.max(0, input.dependants), 4)] ?? 0;
  const totalCommitments =
    Math.max(0, input.monthlyExpenses) +
    Math.max(0, input.otherRepayments) +
    creditCardMonthly +
    dep;

  const available = Math.max(0, netMonthly - totalCommitments);

  const r = assessmentRate / 100 / 12;
  const n = input.termYears * 12;
  const max =
    r === 0
      ? available * n
      : (available * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));

  return {
    conservative: max * 0.8,
    maximum: max,
    assessmentRate,
    monthlyAtMax: monthlyPayment(max, input.ratePct, input.termYears),
    netMonthly,
    totalCommitments,
  };
}
