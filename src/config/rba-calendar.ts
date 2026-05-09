// RBA 2026 Rate History (as of May 2026):
// Pre-2026:    4.10% (rates had been cut during 2025)
// Feb 2026:    Hiked to 4.35% (25bps)
// Mar 2026:    Hiked further (verify exact new rate from RBA)
// May 2026:    Hiked to 4.35% (current as of 5 May 2026)
//
// IMPORTANT: The 2026 moves were HIKES not cuts. The cuts happened in 2025.
//
// Next meeting: 4 June 2026
// Westpac forecast: further hikes in June and August 2026 (to 4.85%)
// Always verify at: https://www.rba.gov.au/statistics/cash-rate/

// RBA Board Meeting decision dates — update annually with official RBA calendar
export const RBA_MEETING_DATES_2026 = [
  "2026-02-18", // February — HIKE: 4.10% → 4.35%
  "2026-03-18", // March — HIKE (verify exact date)
  "2026-05-05", // May — HIKE: 25bps to 4.35% (5 May 2026)
  "2026-06-04", // June — UPCOMING (next meeting)
  "2026-07-07",
  "2026-08-04",
  "2026-09-15",
  "2026-10-20",
  "2026-11-03",
];

export const RBA_MEETING_DATES_2027: string[] = [
  // To be added when announced
];

const ALL_DATES = [...RBA_MEETING_DATES_2026, ...RBA_MEETING_DATES_2027];

export function isRbaDecisionDay(): boolean {
  const today = new Date().toISOString().split("T")[0];
  return ALL_DATES.includes(today);
}

export function getNextRbaMeeting(): string | null {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = ALL_DATES.filter((d) => d >= today).sort();
  return upcoming[0] ?? null;
}

export function getDaysUntilNextRba(): number {
  const next = getNextRbaMeeting();
  if (!next) return -1;
  const ms = new Date(next).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
