/**
 * 2025-26 ATO HECS/HELP compulsory repayment thresholds.
 * Each entry: { min, rate } — applied to TOTAL gross income when income >= min.
 */
export const HECS_BRACKETS_2025_26: { min: number; max: number | null; rate: number }[] = [
  { min: 0, max: 54434, rate: 0 },
  { min: 54435, max: 62849, rate: 0.01 },
  { min: 62850, max: 66620, rate: 0.02 },
  { min: 66621, max: 70618, rate: 0.025 },
  { min: 70619, max: 74855, rate: 0.03 },
  { min: 74856, max: 79346, rate: 0.035 },
  { min: 79347, max: 84107, rate: 0.04 },
  { min: 84108, max: null, rate: 0.045 },
];

export interface HecsBorrowingInput {
  grossIncome: number;
  hecsBalance: number;
  ratePct: number; // e.g. 6.0
  monthlyExpenses?: number; // optional living expenses (per month)
  dtiPct?: number; // optional serviceability DTI as percent (e.g. 30 = 30%)
}

export interface HecsTimelineRow {
  year: number;
  openingBalance: number;
  repayment: number;
  rate: number;
  closingBalance: number;
  cumulativeRepaid: number;
}

/**
 * Year-by-year HECS payoff projection. Holds income constant, recomputes the
 * compulsory repayment rate each year against the current bracket. Caps the
 * final repayment at the remaining balance. Returns up to `maxYears`.
 */
export function buildHecsTimeline(
  grossIncome: number,
  startingBalance: number,
  maxYears = 40,
): HecsTimelineRow[] {
  const rows: HecsTimelineRow[] = [];
  let balance = Math.max(0, startingBalance);
  let cumulative = 0;
  const rate = getHecsRate(grossIncome);
  if (balance === 0 || rate === 0) return rows;
  for (let y = 1; y <= maxYears && balance > 0; y++) {
    const opening = balance;
    const annual = grossIncome * rate;
    const repayment = Math.min(annual, balance);
    balance = Math.max(0, balance - repayment);
    cumulative += repayment;
    rows.push({
      year: y,
      openingBalance: opening,
      repayment,
      rate,
      closingBalance: balance,
      cumulativeRepaid: cumulative,
    });
  }
  return rows;
}

export interface HecsBorrowingResult {
  hecsRate: number; // e.g. 0.045
  hecsAnnual: number;
  hecsMonthly: number;
  yearsToClear: number; // approximate, integer years
  grossMonthly: number;
  taxAnnual: number;
  netMonthlyAfterHecs: number;
  netMonthlyWithoutHecs: number;
  assessmentRate: number; // ratePct + 3% buffer, as percent
  monthlyFactor: number;
  borrowingPower: number;
  borrowingPowerWithoutHecs: number;
  hecsImpact: number; // borrowing reduction caused by HECS
}

/** Resident individual income tax (2025-26), simple progressive brackets. */
function annualTax(income: number): number {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.16;
  if (income <= 135000) return 4288 + (income - 45000) * 0.3;
  if (income <= 190000) return 31288 + (income - 135000) * 0.37;
  return 51638 + (income - 190000) * 0.45;
}

export function getHecsRate(grossIncome: number): number {
  for (const b of HECS_BRACKETS_2025_26) {
    if (grossIncome >= b.min && (b.max === null || grossIncome <= b.max)) return b.rate;
  }
  return 0;
}

/** Standard amortisation factor for a 30-year loan at given annual rate (%). */
export function monthlyRepaymentFactor(ratePct: number, months = 360): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return 1 / months;
  const pow = Math.pow(1 + r, months);
  return (r * pow) / (pow - 1);
}

export function calcHecsBorrowing(input: HecsBorrowingInput): HecsBorrowingResult {
  const grossIncome = Math.max(0, input.grossIncome);
  const hecsBalance = Math.max(0, input.hecsBalance);
  const ratePct = Math.max(0, input.ratePct);

  const hecsRate = hecsBalance > 0 ? getHecsRate(grossIncome) : 0;
  const hecsAnnual = grossIncome * hecsRate;
  const cappedHecsAnnual = Math.min(hecsAnnual, hecsBalance);
  const hecsMonthly = cappedHecsAnnual / 12;
  const yearsToClear =
    cappedHecsAnnual > 0 ? Math.ceil(hecsBalance / cappedHecsAnnual) : 0;

  const taxAnnual = annualTax(grossIncome);
  const netAnnual = Math.max(0, grossIncome - taxAnnual - cappedHecsAnnual);
  const netAnnualNoHecs = Math.max(0, grossIncome - taxAnnual);

  const grossMonthly = grossIncome / 12;
  const netMonthlyAfterHecs = netAnnual / 12;
  const netMonthlyWithoutHecs = netAnnualNoHecs / 12;

  const assessmentRate = ratePct + 3;
  const monthlyFactor = monthlyRepaymentFactor(assessmentRate, 360);

  // Lenders allow ~30% of net monthly income toward repayments (DTI-style estimate).
  // User can override DTI; living expenses are subtracted from net before applying DTI.
  const dti = Math.min(1, Math.max(0, (input.dtiPct ?? 30) / 100));
  const expenses = Math.max(0, input.monthlyExpenses ?? 0);
  const availableWithHecs = Math.max(0, netMonthlyAfterHecs - expenses);
  const availableNoHecs = Math.max(0, netMonthlyWithoutHecs - expenses);
  const monthlyCapacityWithHecs = availableWithHecs * dti;
  const monthlyCapacityNoHecs = availableNoHecs * dti;

  const borrowingPower = monthlyFactor > 0 ? monthlyCapacityWithHecs / monthlyFactor : 0;
  const borrowingPowerWithoutHecs =
    monthlyFactor > 0 ? monthlyCapacityNoHecs / monthlyFactor : 0;

  return {
    hecsRate,
    hecsAnnual: cappedHecsAnnual,
    hecsMonthly,
    yearsToClear,
    grossMonthly,
    taxAnnual,
    netMonthlyAfterHecs,
    netMonthlyWithoutHecs,
    assessmentRate,
    monthlyFactor,
    borrowingPower,
    borrowingPowerWithoutHecs,
    hecsImpact: Math.max(0, borrowingPowerWithoutHecs - borrowingPower),
  };
}
