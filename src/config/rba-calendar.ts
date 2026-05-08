// RBA Board Meeting decision dates — update annually with official RBA calendar
export const RBA_MEETING_DATES_2026 = [
  "2026-02-18",
  "2026-03-31",
  "2026-05-19",
  "2026-06-30",
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
