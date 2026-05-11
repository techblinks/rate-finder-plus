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

export interface SavedScenario extends MortgageScenarioInputs {
  id: string;
  label: string;
}

const SCENARIOS_KEY = "calcy_mortgage_scenarios";
const LAST_KEY = "calcy_mortgage_last";
const VISITS_KEY = "calcy_visits";

export const MAX_SCENARIOS = 3;

export function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX_SCENARIOS) : [];
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

export function haptic(duration = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    /* ignore */
  }
}
