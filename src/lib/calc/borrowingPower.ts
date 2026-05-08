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

/**
 * Legacy simple borrowing-power model used by the old calculator UI.
 * Retained so existing imports keep working; the redesigned UI uses
 * `calcBorrowingPowerV2` below which models HEM, joint income,
 * overtime/rental shading and a separate conservative buffer.
 */
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

// -------- Redesigned model (v2) --------

export interface BorrowingInputV2 {
  income: number;          // annual gross
  partnerIncome: number;   // annual gross
  overtimeIncome: number;  // annual gross
  rentalIncome: number;    // annual gross
  monthlyExpenses: number;
  otherRepayments: number; // monthly
  creditCardLimit: number;
  dependants: number;
  interestRate: number;    // % e.g. 6.14
  loanTerm: number;        // years
  deposit: number;
}

export interface BorrowingResultV2 {
  borrowingPower: number;        // rounded to nearest $1,000
  conservative: number;          // rounded to nearest $1,000
  reducedBuffer: number;         // borrowing if buffer were 2.5%
  maxPurchasePrice: number;
  lvr: number;                   // %
  monthlyRepaymentActual: number;
  monthlyRepaymentAssessed: number;
  assessmentRate: number;
  conservativeRate: number;
  availableRepayment: number;
  hem: number;
  hemUsed: number;
  creditCardObligation: number;
}

function maxLoan(monthlyRepayment: number, annualRate: number, termYears: number) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return monthlyRepayment * n;
  return (monthlyRepayment * (1 - Math.pow(1 + r, -n))) / r;
}

function pmt(principal: number, annualRate: number, termYears: number) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

const HEM_BASE = 2000;
const HEM_PARTNER = 800;
const HEM_PER_DEPENDANT = 400;

export function calcHem(partnerIncome: number, dependants: number) {
  return (
    HEM_BASE +
    (partnerIncome > 0 ? HEM_PARTNER : 0) +
    Math.max(0, dependants) * HEM_PER_DEPENDANT
  );
}

export function calcBorrowingPowerV2(input: BorrowingInputV2): BorrowingResultV2 {
  const income = Math.max(0, input.income);
  const partnerIncome = Math.max(0, input.partnerIncome);
  const overtimeIncome = Math.max(0, input.overtimeIncome);
  const rentalIncome = Math.max(0, input.rentalIncome);
  const monthlyExpenses = Math.max(0, input.monthlyExpenses);
  const otherRepayments = Math.max(0, input.otherRepayments);
  const creditCardLimit = Math.max(0, input.creditCardLimit);
  const dependants = Math.max(0, Math.min(10, input.dependants));
  const interestRate = Math.max(0, input.interestRate);
  const loanTerm = Math.max(1, input.loanTerm);
  const deposit = Math.max(0, input.deposit);

  const hem = calcHem(partnerIncome, dependants);

  const grossMonthlyIncome =
    (income + partnerIncome + overtimeIncome * 0.8 + rentalIncome * 0.8) / 12;
  const netMonthlyIncome = grossMonthlyIncome * 0.7;

  const creditCardObligation = (creditCardLimit * 0.038) / 12;
  const hemUsed = Math.max(monthlyExpenses, hem);
  const committedExpenses = hemUsed + otherRepayments + creditCardObligation;
  const availableRepayment = Math.max(0, netMonthlyIncome - committedExpenses);

  const assessmentRate = interestRate + 3.0;
  const conservativeRate = interestRate + 3.5;
  const reducedBufferRate = interestRate + 2.5;

  const round1k = (n: number) => Math.round(n / 1000) * 1000;

  const borrowingPower = availableRepayment > 0
    ? round1k(maxLoan(availableRepayment, assessmentRate, loanTerm))
    : 0;
  const conservative = availableRepayment > 0
    ? round1k(maxLoan(availableRepayment, conservativeRate, loanTerm))
    : 0;
  const reducedBuffer = availableRepayment > 0
    ? round1k(maxLoan(availableRepayment, reducedBufferRate, loanTerm))
    : 0;

  const maxPurchasePrice = borrowingPower + deposit;
  const lvr = maxPurchasePrice > 0 ? (borrowingPower / maxPurchasePrice) * 100 : 0;

  return {
    borrowingPower,
    conservative,
    reducedBuffer,
    maxPurchasePrice,
    lvr,
    monthlyRepaymentActual: borrowingPower > 0 ? pmt(borrowingPower, interestRate, loanTerm) : 0,
    monthlyRepaymentAssessed: borrowingPower > 0 ? pmt(borrowingPower, assessmentRate, loanTerm) : 0,
    assessmentRate,
    conservativeRate,
    availableRepayment,
    hem,
    hemUsed,
    creditCardObligation,
  };
}
