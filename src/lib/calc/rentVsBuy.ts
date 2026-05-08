// Rent vs Buy comparison engine.
// Compares the buyer's net worth (property equity = market value - loan balance)
// against the renter's net worth (an investment portfolio seeded with the
// deposit + upfront costs and topped up monthly with the buy-vs-rent surplus).

import type { StateCode } from "./stampDuty";
import { calculateStampDutyByState } from "./stampDuty";
import { calcLmi } from "./lmi";

export interface RentVsBuyInputs {
  // Buying scenario
  propertyValue: number;
  deposit: number;
  interestRate: number; // %
  loanTermYears: number;
  annualPropertyGrowth: number; // %
  councilRates: number;
  insurance: number;
  strata: number;
  maintenancePct: number; // %
  state: StateCode;
  isFirstHomeBuyer: boolean;

  // Renting scenario
  weeklyRent: number;
  annualRentIncrease: number; // %
  investmentReturn: number; // %

  analysisYears: number;
}

export interface BuyYear {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  yearlyMortgageCost: number;
  yearlyInterest: number;
  yearlyOwnershipCosts: number;
  totalYearlyCostBuying: number;
  netWorth: number;
}

export interface RentYear {
  year: number;
  annualRent: number;
  investmentPortfolio: number;
  netWorth: number;
}

export interface RentVsBuyResult {
  buyData: BuyYear[];
  rentData: RentYear[];
  breakEvenYear: number | null;
  finalBuyNetWorth: number;
  finalRentNetWorth: number;
  difference: number;
  verdict: "buy" | "rent" | "close";
  monthlyMortgageRepayment: number;
  totalUpfrontCosts: number;
  loanAmount: number;
  stampDuty: number;
  lmi: number;
}

const CONVEYANCING = 2000;
const INSPECTION = 600;

export function calculateRentVsBuy(input: RentVsBuyInputs): RentVsBuyResult {
  const {
    propertyValue,
    deposit,
    interestRate,
    loanTermYears,
    annualPropertyGrowth,
    councilRates,
    insurance,
    strata,
    maintenancePct,
    state,
    isFirstHomeBuyer,
    weeklyRent,
    annualRentIncrease,
    investmentReturn,
    analysisYears,
  } = input;

  // Stamp duty
  const { duty, fhbDuty } = calculateStampDutyByState(
    propertyValue,
    state,
    isFirstHomeBuyer,
  );
  const stampDuty = Math.round(isFirstHomeBuyer ? fhbDuty : duty);

  // LMI (capitalised into loan if deposit < 20%)
  const lmiResult = calcLmi(propertyValue, deposit, loanTermYears, interestRate);
  const lmi = lmiResult.lmiCost;

  const loanAmount = Math.max(0, propertyValue - deposit) + lmi;
  const totalUpfrontCosts = stampDuty + CONVEYANCING + INSPECTION;

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const monthlyRepayment =
    loanAmount <= 0
      ? 0
      : monthlyRate === 0
        ? loanAmount / totalMonths
        : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // --- BUY scenario ---
  let loanBalance = loanAmount;
  const buyData: BuyYear[] = [];

  for (let year = 1; year <= analysisYears; year++) {
    const propertyValueThisYear =
      propertyValue * Math.pow(1 + annualPropertyGrowth / 100, year);
    const annualOwnershipCosts =
      councilRates +
      insurance +
      strata +
      (propertyValueThisYear * maintenancePct) / 100;

    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    for (let m = 0; m < 12; m++) {
      if (loanBalance <= 0) break;
      const interest = loanBalance * monthlyRate;
      const principal = Math.min(monthlyRepayment - interest, loanBalance);
      yearlyInterest += interest;
      yearlyPrincipal += principal;
      loanBalance = Math.max(0, loanBalance - principal);
    }

    const yearlyMortgageCost =
      yearlyInterest + yearlyPrincipal > 0 ? monthlyRepayment * 12 : 0;
    const equity = propertyValueThisYear - loanBalance;

    buyData.push({
      year,
      propertyValue: Math.round(propertyValueThisYear),
      loanBalance: Math.round(loanBalance),
      equity: Math.round(equity),
      yearlyMortgageCost: Math.round(yearlyMortgageCost),
      yearlyInterest: Math.round(yearlyInterest),
      yearlyOwnershipCosts: Math.round(annualOwnershipCosts),
      totalYearlyCostBuying: Math.round(yearlyMortgageCost + annualOwnershipCosts),
      netWorth: Math.round(equity),
    });
  }

  // --- RENT scenario ---
  let investmentPortfolio = deposit + totalUpfrontCosts;
  const rentData: RentYear[] = [];
  let currentWeeklyRent = weeklyRent;
  const monthlyReturn = investmentReturn / 100 / 12;

  for (let year = 1; year <= analysisYears; year++) {
    const annualRent = currentWeeklyRent * 52;
    const buyingCostThisYear = buyData[year - 1].totalYearlyCostBuying;
    const monthlySurplus = buyingCostThisYear / 12 - annualRent / 12;

    for (let m = 0; m < 12; m++) {
      investmentPortfolio = investmentPortfolio * (1 + monthlyReturn);
      investmentPortfolio += monthlySurplus;
      if (investmentPortfolio < 0) investmentPortfolio = 0;
    }

    rentData.push({
      year,
      annualRent: Math.round(annualRent),
      investmentPortfolio: Math.round(investmentPortfolio),
      netWorth: Math.round(investmentPortfolio),
    });

    currentWeeklyRent = currentWeeklyRent * (1 + annualRentIncrease / 100);
  }

  // Break-even: first year buyer net worth >= renter net worth
  let breakEvenYear: number | null = null;
  for (let y = 0; y < analysisYears; y++) {
    if (buyData[y].netWorth >= rentData[y].netWorth) {
      breakEvenYear = y + 1;
      break;
    }
  }

  const finalBuyNetWorth = buyData[analysisYears - 1].netWorth;
  const finalRentNetWorth = rentData[analysisYears - 1].netWorth;
  const difference = finalBuyNetWorth - finalRentNetWorth;
  const denom = Math.max(Math.abs(finalBuyNetWorth), Math.abs(finalRentNetWorth), 1);
  const closePct = Math.abs(difference) / denom;
  const verdict: "buy" | "rent" | "close" =
    closePct < 0.05 ? "close" : difference > 0 ? "buy" : "rent";

  return {
    buyData,
    rentData,
    breakEvenYear,
    finalBuyNetWorth,
    finalRentNetWorth,
    difference,
    verdict,
    monthlyMortgageRepayment: Math.round(monthlyRepayment),
    totalUpfrontCosts,
    loanAmount: Math.round(loanAmount),
    stampDuty,
    lmi,
  };
}

/**
 * Compute a 5x5 sensitivity grid: rows = investment return, cols = property growth.
 * Each cell returns the break-even year (1..N) or null if renting wins throughout.
 */
export interface SensitivityCell {
  growthPct: number;
  returnPct: number;
  breakEvenYear: number | null;
  rentWinsThroughout: boolean;
}

export function sensitivityGrid(
  base: RentVsBuyInputs,
  growthRates: number[] = [3, 5, 7, 9, 11],
  returnRates: number[] = [4, 7, 10, 13],
): SensitivityCell[][] {
  return returnRates.map((rRet) =>
    growthRates.map((rGrow) => {
      const result = calculateRentVsBuy({
        ...base,
        annualPropertyGrowth: rGrow,
        investmentReturn: rRet,
      });
      return {
        growthPct: rGrow,
        returnPct: rRet,
        breakEvenYear: result.breakEvenYear,
        rentWinsThroughout: result.breakEvenYear == null,
      };
    }),
  );
}
