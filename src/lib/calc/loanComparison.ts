import { calcMortgage } from "./mortgage";

export interface LoanScenario {
  amount: number;
  ratePct: number;
  termYears: number;
  upfrontFees: number;
  label: string;
}

export interface LoanComparison {
  a: ReturnType<typeof calcMortgage> & { trueCost: number };
  b: ReturnType<typeof calcMortgage> & { trueCost: number };
  winner: "a" | "b" | "tie";
  monthlyDiff: number;
  totalDiff: number;
}

export function compareLoans(a: LoanScenario, b: LoanScenario): LoanComparison {
  const ra = calcMortgage(a.amount, a.ratePct, a.termYears);
  const rb = calcMortgage(b.amount, b.ratePct, b.termYears);
  const aTrue = ra.totalRepaid + Math.max(0, a.upfrontFees);
  const bTrue = rb.totalRepaid + Math.max(0, b.upfrontFees);
  const winner: "a" | "b" | "tie" =
    Math.abs(aTrue - bTrue) < 1 ? "tie" : aTrue < bTrue ? "a" : "b";
  return {
    a: { ...ra, trueCost: aTrue },
    b: { ...rb, trueCost: bTrue },
    winner,
    monthlyDiff: Math.abs(ra.monthly - rb.monthly),
    totalDiff: Math.abs(aTrue - bTrue),
  };
}
