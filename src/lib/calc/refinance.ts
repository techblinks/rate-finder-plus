// Refinance savings engine.
// Computes monthly saving, break-even month, total interest saved, and a
// cumulative-cost series for the savings timeline chart. Includes a simple
// fixed-rate break-cost estimate.

export type CurrentLoanType = "variable" | "fixed";
export type FixedRemaining = "<6m" | "6-12m" | "1-2y" | "2y+";
export type NewLoanType = "variable" | "fixed1" | "fixed2" | "fixed3" | "split";
export type LmiMode = "auto" | "no" | "yes";

export interface RefinanceInputs {
  currentBalance: number;
  currentRate: number; // %
  currentTermMonths: number;
  currentLoanType: CurrentLoanType;
  fixedRemaining?: FixedRemaining;
  exitFees: number;
  currentOffsetBalance: number;

  newRate: number; // %
  newTermMonths: number;
  newLenderFees: number;
  newOffsetBalance: number;
  cashback: number;

  lmiMode: LmiMode;
  propertyValue: number;
  manualLmi: number;

  estimatedBreakCost: number; // 0 unless variable was current = fixed
}

export interface RefinanceResult {
  currentRepayment: number;
  newRepayment: number;
  monthlySaving: number; // positive = saving
  annualSaving: number;
  saving5yr: number;
  totalInterestSaved: number;
  totalCurrentInterest: number;
  totalNewInterest: number;
  netSwitchingCost: number;
  switchingBreakdown: {
    exitFees: number;
    newLenderFees: number;
    lmi: number;
    breakCost: number;
    cashback: number;
  };
  breakEvenMonth: number | null; // null = never recoups
  immediateProfit: boolean; // cashback > costs and saving > 0
  lvr: number;
  lmiApplies: boolean;
  estimatedLmi: number;
  verdict: "recommended" | "marginal" | "not_recommended" | "not_now";
}

export function monthlyRepayment(balance: number, monthlyRate: number, months: number): number {
  if (balance <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return balance / months;
  return (
    (balance * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/** Indicative LMI premium when LVR > 80%. Mirrors the thresholds used in calcLmi. */
function indicativeLmi(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  const lvr = (loanAmount / propertyValue) * 100;
  if (lvr <= 80) return 0;
  let rate = 0;
  if (lvr <= 85) rate = 0.0066;
  else if (lvr <= 90) rate = 0.0119;
  else if (lvr <= 95) rate = 0.0196;
  else rate = 0.031;
  const premium = loanAmount * rate * 1.1; // ~10% stamp duty surcharge
  return Math.round(premium / 100) * 100;
}

const FIXED_REMAINING_MONTHS: Record<FixedRemaining, number> = {
  "<6m": 3,
  "6-12m": 9,
  "1-2y": 18,
  "2y+": 36,
};

export function fixedRemainingToMonths(f?: FixedRemaining): number {
  return f ? FIXED_REMAINING_MONTHS[f] : 0;
}

/** Simplified economic-cost / fixed-rate break-cost estimate. */
export function estimateBreakCost(
  loanBalance: number,
  contractedRate: number,
  currentWholesaleRate: number,
  remainingFixedMonths: number,
): number {
  const diff = (contractedRate - currentWholesaleRate) / 100;
  if (diff <= 0 || loanBalance <= 0 || remainingFixedMonths <= 0) return 0;
  return Math.max(0, Math.round(loanBalance * diff * (remainingFixedMonths / 12)));
}

export function calculateRefinance(input: RefinanceInputs): RefinanceResult {
  const {
    currentBalance,
    currentRate,
    currentTermMonths,
    currentLoanType,
    exitFees,
    currentOffsetBalance,
    newRate,
    newTermMonths,
    newLenderFees,
    newOffsetBalance,
    cashback,
    lmiMode,
    propertyValue,
    manualLmi,
    estimatedBreakCost,
  } = input;

  // LMI on refinance
  const lvr = propertyValue > 0 ? (currentBalance / propertyValue) * 100 : 0;
  const autoLmi = indicativeLmi(currentBalance, propertyValue);
  const lmiApplies = lmiMode === "yes" || (lmiMode === "auto" && lvr > 80);
  const lmi =
    lmiMode === "no"
      ? 0
      : lmiMode === "yes"
        ? Math.max(0, manualLmi)
        : autoLmi;

  const breakCost = currentLoanType === "fixed" ? Math.max(0, estimatedBreakCost) : 0;

  const switchingBreakdown = {
    exitFees: Math.max(0, exitFees),
    newLenderFees: Math.max(0, newLenderFees),
    lmi,
    breakCost,
    cashback: Math.max(0, cashback),
  };

  const netSwitchingCost =
    switchingBreakdown.exitFees +
    switchingBreakdown.newLenderFees +
    switchingBreakdown.lmi +
    switchingBreakdown.breakCost -
    switchingBreakdown.cashback;

  // Effective balances accounting for offset
  const effectiveCurrent = Math.max(0, currentBalance - Math.max(0, currentOffsetBalance));
  const effectiveNew = Math.max(0, currentBalance - Math.max(0, newOffsetBalance));

  const currMR = currentRate / 100 / 12;
  const newMR = newRate / 100 / 12;
  const currentRepayment = monthlyRepayment(effectiveCurrent, currMR, Math.max(1, currentTermMonths));
  const newRepayment = monthlyRepayment(effectiveNew, newMR, Math.max(1, newTermMonths));

  const monthlySaving = currentRepayment - newRepayment;
  const annualSaving = monthlySaving * 12;

  let breakEvenMonth: number | null = null;
  let immediateProfit = false;
  if (monthlySaving > 0 && netSwitchingCost <= 0) {
    breakEvenMonth = 0;
    immediateProfit = true;
  } else if (monthlySaving > 0 && netSwitchingCost > 0) {
    breakEvenMonth = Math.ceil(netSwitchingCost / monthlySaving);
  }
  // monthlySaving <= 0: never recoups (null)

  const totalCurrentInterest =
    currentRepayment * Math.max(1, currentTermMonths) - effectiveCurrent;
  const totalNewInterest = newRepayment * Math.max(1, newTermMonths) - effectiveNew;
  const totalInterestSaved =
    totalCurrentInterest - totalNewInterest - Math.max(0, netSwitchingCost);

  const saving5yr = monthlySaving * 60 - netSwitchingCost;

  let verdict: RefinanceResult["verdict"] = "marginal";
  if (monthlySaving <= 0) verdict = "not_recommended";
  else if (breakEvenMonth != null && breakEvenMonth <= 18 && monthlySaving >= 200)
    verdict = "recommended";
  else if (breakEvenMonth != null && breakEvenMonth > 36) verdict = "not_now";

  return {
    currentRepayment: Math.round(currentRepayment),
    newRepayment: Math.round(newRepayment),
    monthlySaving: Math.round(monthlySaving),
    annualSaving: Math.round(annualSaving),
    saving5yr: Math.round(saving5yr),
    totalInterestSaved: Math.round(totalInterestSaved),
    totalCurrentInterest: Math.round(totalCurrentInterest),
    totalNewInterest: Math.round(totalNewInterest),
    netSwitchingCost: Math.round(netSwitchingCost),
    switchingBreakdown,
    breakEvenMonth,
    immediateProfit,
    lvr,
    lmiApplies,
    estimatedLmi: autoLmi,
    verdict,
  };
}

/** Cumulative cost samples (every 3 months) for the timeline chart. */
export interface RefinanceTimelinePoint {
  month: number;
  current: number; // cumulative cost on current loan
  refinanced: number; // cumulative cost on refinanced loan (starts at netSwitchingCost)
}

export function buildRefinanceTimeline(
  input: RefinanceInputs,
  result: RefinanceResult,
  step = 3,
): RefinanceTimelinePoint[] {
  const months = Math.min(360, Math.max(input.currentTermMonths, input.newTermMonths));
  const points: RefinanceTimelinePoint[] = [{ month: 0, current: 0, refinanced: Math.max(0, result.netSwitchingCost) }];
  let curCum = 0;
  let newCum = Math.max(0, result.netSwitchingCost);
  for (let m = step; m <= months; m += step) {
    const curMonths = Math.min(step, Math.max(0, input.currentTermMonths - (m - step)));
    const newMonths = Math.min(step, Math.max(0, input.newTermMonths - (m - step)));
    curCum += result.currentRepayment * curMonths;
    newCum += result.newRepayment * newMonths;
    points.push({ month: m, current: Math.round(curCum), refinanced: Math.round(newCum) });
  }
  return points;
}
