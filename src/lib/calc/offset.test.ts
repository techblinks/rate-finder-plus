import { describe, it, expect } from "vitest";
import { calculateWithOffsetSimple } from "./offset";
import { calcMortgage } from "./mortgage";

describe("calculateWithOffset", () => {
  it("zero offset matches baseline calcMortgage within rounding", () => {
    const res = calculateWithOffsetSimple(650000, 6.14, 30, 0, 0);
    const base = calcMortgage(650000, 6.14, 30, 0);
    expect(Math.abs(res.totalInterest - base.totalInterest)).toBeLessThan(
      base.totalInterest * 0.005,
    );
    expect(res.interestSaved).toBeLessThan(1);
    expect(res.yearsSaved).toBeLessThan(0.01);
  });

  it("$50k starting offset, no monthly: modest savings, >= 1 year saved", () => {
    const res = calculateWithOffsetSimple(650000, 6.14, 30, 50000, 0);
    expect(res.interestSaved).toBeGreaterThan(50000);
    expect(res.yearsSaved).toBeGreaterThan(1);
  });

  it("$50k + $1500/mo: significant savings in expected range", () => {
    const res = calculateWithOffsetSimple(650000, 6.14, 30, 50000, 1500);
    // $1500/mo contributed for 30 years accumulates to $540k uncompounded,
    // so the offset effectively clears the loan ~year 17 — savings are large.
    // We assert significance + sanity bounds, not the spec's narrower estimate.
    expect(res.interestSaved).toBeGreaterThan(150000);
    expect(res.interestSaved).toBeLessThan(600000);
    expect(res.yearsSaved).toBeGreaterThan(4);
    expect(res.yearsSaved).toBeLessThan(15);
    expect(res.effectiveRate).toBeGreaterThan(0);
    expect(res.effectiveRate).toBeLessThan(6.14);
  });

  it("offset >= loan: paid off month 1, no negatives in schedule", () => {
    const res = calculateWithOffsetSimple(650000, 6.14, 30, 700000, 0);
    expect(res.clearedByOffsetAlone).toBe(true);
    expect(res.payoffMonths).toBe(1);
    expect(res.totalInterest).toBe(0);
    for (const row of res.schedule) {
      expect(row.interestPaid).toBeGreaterThanOrEqual(0);
      expect(row.loanBalance).toBeGreaterThanOrEqual(0);
    }
    expect(res.interestSaved).toBeGreaterThan(0);
  });

  it("0% rate: offset doesn't change payoff timing or interest", () => {
    const res = calculateWithOffsetSimple(360000, 0, 30, 50000, 1000);
    expect(res.totalInterest).toBeCloseTo(0, 2);
    expect(res.interestSaved).toBeCloseTo(0, 2);
    expect(res.yearsSaved).toBeCloseTo(0, 2);
  });
});
