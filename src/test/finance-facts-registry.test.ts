import { describe, expect, it } from "vitest";
import {
  CALCULATE_SEO_POLICY,
  FINANCE_FACTS_ADMIN_READINESS,
  FINANCE_FACTS_REGISTRY,
  checkFactsNeedingReview,
  getFact,
  getFactDateLabels,
  getFactsByCategory,
  getFactsByJurisdiction,
  getNumericFactValue,
  type FinanceFact,
} from "@/data/financeFactsRegistry";
import { rbaRates } from "@/data/rbaRates";
import { calcBorrowingPowerV2 } from "@/lib/calc/borrowingPower";
import { calcHecsBorrowing, HECS_BRACKETS_2025_26 } from "@/lib/calc/hecsBorrowing";
import { calcLmi } from "@/lib/calc/lmi";
import { calcStampDuty, FHOG } from "@/lib/calc/stampDuty";

const requiredMetadata = (fact: FinanceFact) => {
  expect(fact.key).toBeTruthy();
  expect(fact.category).toBeTruthy();
  expect(fact.label).toBeTruthy();
  expect(fact.value).not.toBeUndefined();
  expect(fact.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(fact.sourceName).toBeTruthy();
  expect(fact.sourceUrl).toMatch(/^https?:\/\//);
  expect(["current", "needs_review", "deprecated"]).toContain(fact.status);
};

describe("finance facts source of truth", () => {
  it("loads a typed registry with unique keys and required metadata", () => {
    expect(FINANCE_FACTS_REGISTRY.length).toBeGreaterThan(20);
    expect(new Set(FINANCE_FACTS_REGISTRY.map((fact) => fact.key)).size).toBe(
      FINANCE_FACTS_REGISTRY.length,
    );
    FINANCE_FACTS_REGISTRY.forEach(requiredMetadata);
  });

  it("contains required national finance facts", () => {
    expect(getFact("rba_cash_rate")?.value).toBe(rbaRates.cashRate);
    expect(getNumericFactValue("apra_serviceability_buffer")).toBe(3);
    expect(getFact("hecs_help_thresholds_2025_26")?.value).toEqual(HECS_BRACKETS_2025_26);
    expect(getFact("lmi_bands_2026_indicative")?.status).toBe("needs_review");
    expect(getFact("medicare_levy_assumption")?.value).toEqual({ includedInCalculatorTax: false });
  });

  it("contains state finance facts by jurisdiction", () => {
    const nswFacts = getFactsByJurisdiction("NSW");
    expect(nswFacts.map((fact) => fact.key)).toEqual(
      expect.arrayContaining(["stamp_duty_thresholds_nsw", "fhog_nsw"]),
    );
    expect(getFact<number>("fhog_qld")?.value).toBe(FHOG.QLD);
    expect(getFactsByCategory("stamp_duty").length).toBeGreaterThanOrEqual(8);
  });

  it("detects facts needing review and exposes date labels for future UI", () => {
    const reviewFacts = checkFactsNeedingReview();
    expect(reviewFacts.length).toBeGreaterThan(0);
    expect(reviewFacts.some((fact) => fact.key === "stamp_duty_thresholds_qld")).toBe(true);

    const labels = getFactDateLabels("rba_cash_rate");
    expect(labels).toEqual({ effectiveDate: "2026-05-05", lastReviewed: "2026-05-22" });
  });

  it("documents admin/backend readiness without changing public behavior", () => {
    expect(FINANCE_FACTS_ADMIN_READINESS.currentState).toContain("typed registry");
    expect(FINANCE_FACTS_ADMIN_READINESS.safetyRule).toContain("Do not update public copy");
    expect(CALCULATE_SEO_POLICY.routePattern).toBe("/calculate/*");
  });
});

describe("backwards compatibility with current calculator logic", () => {
  it("does not change borrowing power serviceability behavior", () => {
    const result = calcBorrowingPowerV2({
      income: 100000,
      partnerIncome: 0,
      overtimeIncome: 0,
      rentalIncome: 0,
      monthlyExpenses: 3000,
      otherRepayments: 0,
      creditCardLimit: 0,
      dependants: 0,
      interestRate: 6.39,
      loanTerm: 30,
      deposit: 100000,
    });

    expect(result.assessmentRate).toBe(9.39);
    expect(result.conservativeRate).toBe(9.89);
  });

  it("does not change HECS calculator thresholds or tax behavior", () => {
    const result = calcHecsBorrowing({ grossIncome: 100000, hecsBalance: 50000, ratePct: 6.39 });
    expect(result.hecsRate).toBe(0.045);
    expect(result.assessmentRate).toBe(9.39);
    expect(result.taxAnnual).toBe(20788);
  });

  it("does not change stamp duty FHOG behavior", () => {
    const nsw = calcStampDuty(700000, "NSW", "fhb", "new");
    expect(nsw.netDuty).toBe(0);
    expect(nsw.fhog).toBe(FHOG.NSW);

    const qld = calcStampDuty(600000, "QLD", "fhb", "new");
    expect(qld.fhog).toBe(FHOG.QLD);
    expect(qld.netDuty).toBeGreaterThan(0);
  });

  it("does not change LMI band behavior", () => {
    const result = calcLmi(700000, 70000, 30, 6.39, "owner");
    expect(result.lvr).toBe(90);
    expect(result.required).toBe(true);
    expect(result.lmiCost).toBe(8200);
  });
});
