import { monthlyPayment } from "./mortgage";

export type BuyerType = "owner" | "investor";

export interface LmiResult {
  loanAmount: number;
  lvr: number;
  required: boolean;
  lmiCost: number;
  totalLoan: number;
  monthlyRepayment: number;
  savingsAt20: number;
  depositFor20: number;
}

/**
 * 2026 indicative LMI bands. Premiums are applied to the loan amount and
 * include an approximate 10% stamp-duty surcharge (charged in most states).
 * Rounded to the nearest $100.
 */
export function calcLmi(
  propertyValue: number,
  deposit: number,
  termYears: number,
  ratePct = 5.5,
  buyer: BuyerType = "owner",
): LmiResult {
  const loanAmount = Math.max(0, propertyValue - deposit);
  const lvr = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

  let required = false;
  let lmiRate = 0;
  if (lvr > 80) {
    required = true;
    if (lvr <= 85) lmiRate = buyer === "investor" ? 0.008 : 0.0066;
    else if (lvr <= 90) lmiRate = buyer === "investor" ? 0.0145 : 0.0119;
    else if (lvr <= 95) lmiRate = buyer === "investor" ? 0.023 : 0.0196;
    else lmiRate = buyer === "investor" ? 0.036 : 0.031;
  }
  const lmiPremium = loanAmount * lmiRate;
  const lmiWithStamp = lmiPremium * 1.1;
  const lmiCost = required ? Math.round(lmiWithStamp / 100) * 100 : 0;
  const totalLoan = loanAmount + lmiCost;

  const depositFor20 = propertyValue * 0.2;
  const savingsAt20 = required ? lmiCost : 0;

  return {
    loanAmount,
    lvr,
    required,
    lmiCost,
    totalLoan,
    monthlyRepayment: monthlyPayment(totalLoan, ratePct, termYears),
    savingsAt20,
    depositFor20,
  };
}

/** Total monthly-repayment dollars across a loan. */
export function totalRepayments(principal: number, annualRate: number, termYears: number) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (principal <= 0) return 0;
  if (r === 0) return Math.round(principal);
  const monthly = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  return Math.round(monthly * n);
}

/** Capitalised LMI total cost across the loan term (interest included). */
export function lmiCapitalisedCost(lmi: number, annualRate: number, termYears: number) {
  if (lmi <= 0) return 0;
  return totalRepayments(lmi, annualRate, termYears);
}

export interface PayNowVsWaitInputs {
  propertyValue: number;
  deposit: number;
  lmiAmount: number;
  interestRate: number;
  loanTerm: number;
  annualGrowthRate: number;
  monthsToSave: number;
  monthlyRent?: number;
}

export interface PayNowVsWaitResult {
  scenarioA: {
    propertyPrice: number;
    loanAmount: number;
    lmiCost: number;
    totalRepayments: number;
  };
  scenarioB: {
    propertyPrice: number;
    loanAmount: number;
    lmiCost: 0;
    additionalSavingsNeeded: number;
    rentWhileWaiting: number;
    totalRepayments: number;
    trueCost: number;
  };
  recommendation: "buy_now" | "wait";
  difference: number;
}

export function payNowVsWait(input: PayNowVsWaitInputs): PayNowVsWaitResult {
  const {
    propertyValue,
    deposit,
    lmiAmount,
    interestRate,
    loanTerm,
    annualGrowthRate,
    monthsToSave,
  } = input;

  const aLoan = Math.max(0, propertyValue - deposit) + lmiAmount;
  const aTotal = totalRepayments(aLoan, interestRate, loanTerm);

  const yearsToSave = monthsToSave / 12;
  const futureValue = propertyValue * Math.pow(1 + annualGrowthRate / 100, yearsToSave);
  const required20 = futureValue * 0.2;
  const additionalSavingsNeeded = Math.max(0, required20 - deposit);
  const bLoan = futureValue * 0.8;
  const bTotal = totalRepayments(bLoan, interestRate, loanTerm);

  const monthlyRent = input.monthlyRent ?? propertyValue * 0.004;
  const rentWhileWaiting = monthlyRent * monthsToSave;
  const bTrue = bTotal + rentWhileWaiting;

  return {
    scenarioA: {
      propertyPrice: propertyValue,
      loanAmount: Math.round(aLoan),
      lmiCost: lmiAmount,
      totalRepayments: aTotal,
    },
    scenarioB: {
      propertyPrice: Math.round(futureValue),
      loanAmount: Math.round(bLoan),
      lmiCost: 0,
      additionalSavingsNeeded: Math.round(additionalSavingsNeeded),
      rentWhileWaiting: Math.round(rentWhileWaiting),
      totalRepayments: bTotal,
      trueCost: Math.round(bTrue),
    },
    recommendation: aTotal < bTrue ? "buy_now" : "wait",
    difference: Math.abs(aTotal - bTrue),
  };
}
