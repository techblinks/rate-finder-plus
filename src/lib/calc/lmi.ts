import { monthlyPayment } from "./mortgage";

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

export function calcLmi(
  propertyValue: number,
  deposit: number,
  termYears: number,
  ratePct = 5.5,
): LmiResult {
  const loanAmount = Math.max(0, propertyValue - deposit);
  const lvr = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

  let required = false;
  let lmiRate = 0;
  if (lvr > 80) {
    required = true;
    if (lvr <= 85) lmiRate = 0.0066;
    else if (lvr <= 90) lmiRate = 0.0119;
    else if (lvr <= 95) lmiRate = 0.0196;
    else lmiRate = 0.031;
  }
  const lmiCost = loanAmount * lmiRate;
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
