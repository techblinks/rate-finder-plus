import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAmortisation } from "@/lib/calc/mortgageEngine";
import {
  canUseMortgageLocalStorage,
  loadScenarios,
  makeUniqueScenarioLabel,
  saveScenarios,
  type SavedScenario,
} from "@/lib/mortgageState";
import { ROUTES } from "@/data/routes";
import { DOWNLOADABLE_TOOLS } from "@/data/downloadableTools";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGE_SOURCE = readFileSync(
  join(__dirname, "..", "pages", "MortgageCalculatorPage.tsx"),
  "utf8",
);
const CALCULATOR_SOURCE = readFileSync(
  join(__dirname, "..", "components", "calculators", "MortgageCalculatorRedesign.tsx"),
  "utf8",
);
const DOWNLOADABLE_SECTION_SOURCE = readFileSync(
  join(__dirname, "..", "components", "DownloadableToolsSection.tsx"),
  "utf8",
);

beforeEach(() => {
  localStorage.clear();
});

describe("Mortgage hub shell guardrails", () => {
  it("preserves the existing mortgage calculator route and metadata manifest", () => {
    const route = ROUTES.find((item) => item.canonical === "/mortgage-calculator");
    expect(route).toBeTruthy();
    expect(route?.isCalculator).toBe(true);
    expect(route?.path).toBe("/mortgage-calculator");
  });

  it("preserves page-level canonical and SEO props in the mortgage page", () => {
    expect(PAGE_SOURCE).toContain('canonical="/mortgage-calculator"');
    expect(PAGE_SOURCE).toContain('metaTitle="Mortgage Repayment Calculator with Offset 2026 | Calcy"');
    expect(PAGE_SOURCE).toContain(
      'metaDescription="Australia\'s first mortgage calculator that models offset accounts like real lenders do. Live RBA rates, extra repayments, fortnightly options."',
    );
  });

  it("adds expected internal links without creating scenario routes or importing registry facts", () => {
    for (const path of [
      "/borrowing-power-calculator",
      "/stamp-duty-calculator",
      "/lmi-calculator",
      "/extra-repayments-calculator",
      "/refinance-calculator",
      "/rent-vs-buy-calculator",
      "/loan-comparison-calculator",
      "/hecs-borrowing-power",
    ]) {
      expect(PAGE_SOURCE).toContain(path);
    }

    expect(PAGE_SOURCE).not.toContain("/calculate/");
    expect(PAGE_SOURCE).not.toContain("financeFactsRegistry");
  });

  it("keeps mortgage calculation outputs stable while adding result insights", () => {
    const result = buildAmortisation(660000, 6.39, 30, "fortnightly", 0, 2026);
    const withExtra = buildAmortisation(660000, 6.39, 30, "fortnightly", 500, 2026);

    expect(Math.round(result.weekly)).toBe(951);
    expect(Math.round(result.fortnightly)).toBe(1902);
    expect(Math.round(result.monthly)).toBe(4124);
    expect(Math.round(result.totalInterest)).toBe(823944);
    expect(Math.round(result.totalRepaid)).toBe(1483944);
    expect(result.payoffYear).toBe(2056);
    expect(result.yearsTaken).toBe(30);
    expect(result.monthsRemainder).toBe(0);

    expect(Math.round(withExtra.totalInterest)).toBe(581606);
    expect(Math.round(withExtra.totalRepaid)).toBe(1241606);
    expect(withExtra.payoffYear).toBe(2049);
    expect(withExtra.yearsTaken).toBe(22);
    expect(withExtra.monthsRemainder).toBe(5);
  });

  it("renders Phase 1B result insight and chart sections from existing outputs", () => {
    expect(CALCULATOR_SOURCE).toContain("Estimated ${FREQ_LABEL[freq].toLowerCase()} repayment");
    expect(CALCULATOR_SOURCE).toContain("Total interest payable");
    expect(CALCULATOR_SOURCE).toContain("Principal vs interest");
    expect(CALCULATOR_SOURCE).toContain("Text fallback: principal");
    expect(CALCULATOR_SOURCE).toContain("Repayment timeline");
    expect(CALCULATOR_SOURCE).toContain("Extra repayment impact");
    expect(CALCULATOR_SOURCE).toContain("Offset impact");
    expect(CALCULATOR_SOURCE).not.toContain("financeFactsRegistry");
  });

  it("renders Phase 1C downloadable tool CTAs without wiring a broken capture endpoint", () => {
    for (const toolName of DOWNLOADABLE_TOOLS.map((tool) => tool.title)) {
      expect(toolName).toBeTruthy();
    }

    expect(PAGE_SOURCE).toContain("Downloadable mortgage planning tools");
    expect(PAGE_SOURCE).toContain("<DownloadableToolsSection />");
    expect(DOWNLOADABLE_SECTION_SOURCE).toContain("Get notified when downloads are ready");
    expect(DOWNLOADABLE_SECTION_SOURCE).toContain("onSubmit={(event) => event.preventDefault()}");
    expect(DOWNLOADABLE_SECTION_SOURCE).toContain("disabled");
    expect(DOWNLOADABLE_SECTION_SOURCE).not.toContain("submitLead");
    expect(DOWNLOADABLE_SECTION_SOURCE).not.toContain("calculation_leads");
    expect(DOWNLOADABLE_SECTION_SOURCE).not.toContain("supabase.from");
    expect(DOWNLOADABLE_TOOLS.filter((tool) => tool.downloadUrl).map((tool) => tool.downloadUrl)).toEqual([
      "/downloads/calcy-mortgage-repayment-spreadsheet.csv",
    ]);
  });

  it("renders Phase 1D local save and compare UI without backend calls", () => {
    expect(CALCULATOR_SOURCE).toContain("Save and compare");
    expect(CALCULATOR_SOURCE).toContain("Local mortgage scenarios");
    expect(CALCULATOR_SOURCE).toContain("Save this scenario");
    expect(CALCULATOR_SOURCE).toContain("Saved scenarios are stored only in your browser on this device");
    expect(CALCULATOR_SOURCE).toContain("Nothing is sent");
    expect(CALCULATOR_SOURCE).toContain("No saved scenarios yet");
    expect(CALCULATOR_SOURCE).not.toContain("supabase.from");
    expect(CALCULATOR_SOURCE).not.toContain("calculation_leads");
  });

  it("saves, loads, and deletes local mortgage scenarios safely", () => {
    expect(canUseMortgageLocalStorage()).toBe(true);

    const scenario: SavedScenario = {
      id: "scenario-1",
      label: "Base case",
      savedAt: 1_700_000_000_000,
      loan: 660000,
      rate: 6.39,
      term: 30,
      freq: "fortnightly",
      extra: 0,
      result: {
        repaymentAmount: 1902.49,
        repaymentFrequency: "fortnightly",
        totalInterest: 823943.97,
        totalRepaid: 1483943.97,
        loanAmount: 660000,
        interestRate: 6.39,
        loanTerm: 30,
      },
    };

    saveScenarios([scenario]);
    const saved = loadScenarios();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject(scenario);

    saveScenarios(loadScenarios().filter((item) => item.id !== scenario.id));
    expect(loadScenarios()).toEqual([]);
  });

  it("handles duplicate names, empty names, and corrupted localStorage data", () => {
    const existing: SavedScenario[] = [
      {
        id: "a",
        label: "Base case",
        loan: 660000,
        rate: 6.39,
        term: 30,
        freq: "fortnightly",
        extra: 0,
      },
    ];

    expect(makeUniqueScenarioLabel("Base case", existing)).toBe("Base case 2");
    expect(makeUniqueScenarioLabel("", existing)).toBe("Scenario B");

    localStorage.setItem("calcy_mortgage_scenarios", "{bad json");
    expect(loadScenarios()).toEqual([]);

    localStorage.setItem("calcy_mortgage_scenarios", JSON.stringify([{ label: "Missing id" }]));
    expect(loadScenarios()).toEqual([]);
  });
});
