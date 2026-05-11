/**
 * Offset account simulation.
 *
 * Models an Australian-style 100% offset account against a P&I mortgage:
 * each month, interest accrues on (loanBalance - offsetBalance), the
 * repayment amount stays the same, and excess goes to principal. The
 * offset balance grows by an optional monthly contribution.
 *
 * Day-count: we use the equivalence
 *   monthlyInterest = (loanBal - effOffset) * (annualRate/100/365) * (365/12)
 *                   = (loanBal - effOffset) * (annualRate/100/12)
 * so that with offset = 0 the simulation matches the standard monthly
 * amortisation engine exactly (Sprint 4 hard gate #8).
 */

import { monthlyPayment } from "./mortgage";

export interface OffsetInputs {
  loanAmount: number;
  annualRate: number; // percent, e.g. 6.14
  termYears: number;
  monthlyPayment: number; // base P&I payment for the (loanAmount, rate, term)
  startingOffset: number;
  monthlyOffsetContribution: number;
}

export interface OffsetScheduleRow {
  month: number;
  loanBalance: number; // closing balance
  offsetBalance: number; // closing offset accumulator (uncapped)
  interestPaid: number;
  principalPaid: number;
}

export interface OffsetResult {
  interestSaved: number;
  yearsSaved: number;
  effectiveRate: number; // percent
  payoffMonths: number;
  baselinePayoffMonths: number;
  baselineTotalInterest: number;
  totalInterest: number;
  clearedByOffsetAlone: boolean;
  schedule: OffsetScheduleRow[];
}

function simulate(
  loanAmount: number,
  annualRate: number,
  payment: number,
  startingOffset: number,
  monthlyOffsetContribution: number,
  maxMonths: number,
): {
  schedule: OffsetScheduleRow[];
  totalInterest: number;
  payoffMonths: number;
  avgLoanBal: number;
  avgEffectiveOffset: number;
} {
  const r = annualRate / 100 / 12;
  let loanBal = loanAmount;
  let offsetBal = startingOffset;
  let totalInterest = 0;
  const schedule: OffsetScheduleRow[] = [];

  let sumLoanBal = 0;
  let sumEffOffset = 0;
  let months = 0;

  for (let m = 1; m <= maxMonths && loanBal > 0.005; m++) {
    const openingLoan = loanBal;
    const effOffset = Math.min(offsetBal, loanBal);
    sumLoanBal += openingLoan;
    sumEffOffset += effOffset;

    const interest = Math.max(0, (openingLoan - effOffset) * r);
    let principalPart = payment - interest;
    if (principalPart < 0) principalPart = 0;
    if (principalPart > loanBal) principalPart = loanBal;

    loanBal -= principalPart;
    offsetBal += monthlyOffsetContribution;
    totalInterest += interest;
    months = m;

    schedule.push({
      month: m,
      loanBalance: Math.max(0, loanBal),
      offsetBalance: offsetBal,
      interestPaid: interest,
      principalPaid: principalPart,
    });

    if (loanBal <= 0.005) break;
  }

  return {
    schedule,
    totalInterest,
    payoffMonths: months,
    avgLoanBal: months > 0 ? sumLoanBal / months : 0,
    avgEffectiveOffset: months > 0 ? sumEffOffset / months : 0,
  };
}

export function calculateWithOffset(inputs: OffsetInputs): OffsetResult {
  const {
    loanAmount,
    annualRate,
    termYears,
    monthlyPayment: payment,
    startingOffset,
    monthlyOffsetContribution,
  } = inputs;

  const maxMonths = Math.max(termYears * 12 + 600, 12);

  // Edge case: starting offset already clears the loan.
  if (startingOffset >= loanAmount && loanAmount > 0) {
    const baseline = simulate(loanAmount, annualRate, payment, 0, 0, maxMonths);
    return {
      interestSaved: baseline.totalInterest,
      yearsSaved: baseline.payoffMonths / 12,
      effectiveRate: 0,
      payoffMonths: 1,
      baselinePayoffMonths: baseline.payoffMonths,
      baselineTotalInterest: baseline.totalInterest,
      totalInterest: 0,
      clearedByOffsetAlone: true,
      schedule: [
        {
          month: 1,
          loanBalance: 0,
          offsetBalance: startingOffset - loanAmount,
          interestPaid: 0,
          principalPaid: loanAmount,
        },
      ],
    };
  }

  const baseline = simulate(loanAmount, annualRate, payment, 0, 0, maxMonths);
  const withOffset = simulate(
    loanAmount,
    annualRate,
    payment,
    Math.max(0, startingOffset),
    Math.max(0, monthlyOffsetContribution),
    maxMonths,
  );

  const interestSaved = Math.max(0, baseline.totalInterest - withOffset.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - withOffset.payoffMonths);
  const yearsSaved = monthsSaved / 12;

  const effectiveRate =
    withOffset.avgLoanBal > 0
      ? annualRate *
        Math.max(0, 1 - withOffset.avgEffectiveOffset / withOffset.avgLoanBal)
      : annualRate;

  return {
    interestSaved,
    yearsSaved,
    effectiveRate,
    payoffMonths: withOffset.payoffMonths,
    baselinePayoffMonths: baseline.payoffMonths,
    baselineTotalInterest: baseline.totalInterest,
    totalInterest: withOffset.totalInterest,
    clearedByOffsetAlone: false,
    schedule: withOffset.schedule,
  };
}

/** Convenience wrapper that derives the base monthly payment for you. */
export function calculateWithOffsetSimple(
  loanAmount: number,
  annualRate: number,
  termYears: number,
  startingOffset: number,
  monthlyOffsetContribution: number,
): OffsetResult {
  const payment = monthlyPayment(loanAmount, annualRate, termYears);
  return calculateWithOffset({
    loanAmount,
    annualRate,
    termYears,
    monthlyPayment: payment,
    startingOffset,
    monthlyOffsetContribution,
  });
}
