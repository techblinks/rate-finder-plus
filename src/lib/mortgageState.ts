/**
 * Saved mortgage calculator scenarios persisted in localStorage.
 */
export interface MortgageScenarioInputs {
  loan: number;
  rate: number;
  term: number;
  freq: "weekly" | "fortnightly" | "monthly";
  extra: number;
  propValue?: number;
  offsetStart?: number;
  offsetMonthly?: number;
}

export interface SavedScenarioResult {
  repaymentAmount: number;
  repaymentFrequency: "weekly" | "fortnightly" | "monthly";
  totalInterest: number;
  totalRepaid: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraRepaymentImpact?: {
    interestSaved: number;
    yearsSaved: number;
    monthsSaved: number;
  };
  offsetImpact?: {
    interestSaved: number;
    yearsSaved: number;
  };
}

export interface SavedScenario extends MortgageScenarioInputs {
  id: string;
  label: string;
  savedAt?: number;
  result?: SavedScenarioResult;
}

const SCENARIOS_KEY = "calcy_mortgage_scenarios";
const LAST_KEY = "calcy_mortgage_last";
const VISITS_KEY = "calcy_visits";
const STORAGE_TEST_KEY = "calcy_storage_test";

export const MAX_SCENARIOS = 3;

export function canUseMortgageLocalStorage() {
  try {
    localStorage.setItem(STORAGE_TEST_KEY, "1");
    localStorage.removeItem(STORAGE_TEST_KEY);
    return true;
  } catch {
    return false;
  }
}

function isFrequency(value: unknown): value is MortgageScenarioInputs["freq"] {
  return value === "weekly" || value === "fortnightly" || value === "monthly";
}

function toFiniteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeScenario(value: unknown): SavedScenario | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.label !== "string") return null;
  if (!isFrequency(raw.freq)) return null;

  const loan = toFiniteNumber(raw.loan);
  const rate = toFiniteNumber(raw.rate);
  const term = toFiniteNumber(raw.term);
  if (loan <= 0 || rate < 0 || term <= 0) return null;

  const scenario: SavedScenario = {
    id: raw.id,
    label: raw.label.trim() || "Saved scenario",
    loan,
    rate,
    term,
    freq: raw.freq,
    extra: toFiniteNumber(raw.extra),
    propValue: toFiniteNumber(raw.propValue),
    offsetStart: toFiniteNumber(raw.offsetStart),
    offsetMonthly: toFiniteNumber(raw.offsetMonthly),
  };

  if (typeof raw.savedAt === "number" && Number.isFinite(raw.savedAt)) {
    scenario.savedAt = raw.savedAt;
  }

  const result = raw.result as Record<string, unknown> | undefined;
  if (result && isFrequency(result.repaymentFrequency)) {
    scenario.result = {
      repaymentAmount: toFiniteNumber(result.repaymentAmount),
      repaymentFrequency: result.repaymentFrequency,
      totalInterest: toFiniteNumber(result.totalInterest),
      totalRepaid: toFiniteNumber(result.totalRepaid),
      loanAmount: toFiniteNumber(result.loanAmount, loan),
      interestRate: toFiniteNumber(result.interestRate, rate),
      loanTerm: toFiniteNumber(result.loanTerm, term),
    };

    const extraImpact = result.extraRepaymentImpact as Record<string, unknown> | undefined;
    if (extraImpact) {
      scenario.result.extraRepaymentImpact = {
        interestSaved: toFiniteNumber(extraImpact.interestSaved),
        yearsSaved: toFiniteNumber(extraImpact.yearsSaved),
        monthsSaved: toFiniteNumber(extraImpact.monthsSaved),
      };
    }

    const offsetImpact = result.offsetImpact as Record<string, unknown> | undefined;
    if (offsetImpact) {
      scenario.result.offsetImpact = {
        interestSaved: toFiniteNumber(offsetImpact.interestSaved),
        yearsSaved: toFiniteNumber(offsetImpact.yearsSaved),
      };
    }
  }

  return scenario;
}

export function makeUniqueScenarioLabel(label: string, existing: SavedScenario[]) {
  const base = label.trim() || `Scenario ${String.fromCharCode(65 + existing.length)}`;
  const used = new Set(existing.map((s) => s.label.trim().toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;

  let index = 2;
  while (used.has(`${base} ${index}`.toLowerCase())) index++;
  return `${base} ${index}`;
}

export function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map(normalizeScenario)
      .filter((scenario): scenario is SavedScenario => Boolean(scenario))
      .slice(0, MAX_SCENARIOS);
  } catch {
    return [];
  }
}

export function saveScenarios(s: SavedScenario[]) {
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(s.slice(0, MAX_SCENARIOS)));
  } catch {
    /* ignore */
  }
}

interface LastSnapshot extends MortgageScenarioInputs {
  ts: number;
}

export function saveLast(inputs: MortgageScenarioInputs) {
  try {
    const snap: LastSnapshot = { ...inputs, ts: Date.now() };
    localStorage.setItem(LAST_KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

export function loadLast(): MortgageScenarioInputs | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as LastSnapshot;
    if (!s?.ts) return null;
    const ageDays = (Date.now() - s.ts) / (1000 * 60 * 60 * 24);
    if (ageDays > 90) return null;
    return s;
  } catch {
    return null;
  }
}

export function clearLast() {
  try {
    localStorage.removeItem(LAST_KEY);
  } catch {
    /* ignore */
  }
}

export function bumpVisits(): number {
  try {
    const v = parseInt(localStorage.getItem(VISITS_KEY) || "0", 10) + 1;
    localStorage.setItem(VISITS_KEY, String(v));
    return v;
  } catch {
    return 0;
  }
}

export function getVisits(): number {
  try {
    return parseInt(localStorage.getItem(VISITS_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

/* ---------- User-defined offset presets (localStorage) ---------- */

export interface OffsetPreset {
  id: string;
  name: string;
  start: number;
  monthly: number;
}

const OFFSET_PRESETS_KEY = "calcy_offset_presets";
export const MAX_OFFSET_PRESETS = 6;

export function loadOffsetPresets(): OffsetPreset[] {
  try {
    const raw = localStorage.getItem(OFFSET_PRESETS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          Number.isFinite(p.start) &&
          Number.isFinite(p.monthly),
      )
      .slice(0, MAX_OFFSET_PRESETS);
  } catch {
    return [];
  }
}

export function saveOffsetPresets(presets: OffsetPreset[]) {
  try {
    localStorage.setItem(
      OFFSET_PRESETS_KEY,
      JSON.stringify(presets.slice(0, MAX_OFFSET_PRESETS)),
    );
  } catch {
    /* ignore */
  }
}

export function haptic(duration = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    /* ignore */
  }
}
