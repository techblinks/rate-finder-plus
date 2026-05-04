export type StateCode = "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
export type BuyerType = "owner" | "fhb" | "investor";

export interface StampDutyResult {
  baseDuty: number;
  fhbSaving: number;
  netDuty: number;
  legal: number;
  building: number;
  pest: number;
  totalUpfront: number;
}

interface Bracket {
  upTo: number; // inclusive upper bound; Infinity for last
  base: number; // base duty at the start of the bracket
  ratePer100: number; // dollars per $100 over the threshold
  threshold: number; // value at which "over" starts
}

// Brackets encoded from the spec. ratePer100 expressed as $ per $100.
const BRACKETS: Record<Exclude<StateCode, "ACT" | "NT">, Bracket[]> = {
  NSW: [
    { upTo: 14000, base: 0, ratePer100: 1.25, threshold: 0 },
    { upTo: 32000, base: 175, ratePer100: 1.5, threshold: 14000 },
    { upTo: 85000, base: 445, ratePer100: 1.75, threshold: 32000 },
    { upTo: 319000, base: 1372, ratePer100: 3.5, threshold: 85000 },
    { upTo: 1064999, base: 9562, ratePer100: 4.5, threshold: 319000 },
    { upTo: Infinity, base: 43087, ratePer100: 5.5, threshold: 1064999 },
  ],
  VIC: [
    { upTo: 25000, base: 0, ratePer100: 1.4, threshold: 0 },
    { upTo: 130000, base: 350, ratePer100: 2.4, threshold: 25000 },
    { upTo: 960000, base: 2870, ratePer100: 6.0, threshold: 130000 },
    { upTo: 2000000, base: 55370, ratePer100: 5.5, threshold: 960000 },
    // Over $2m flat 6.5% on full value — handled separately.
    { upTo: Infinity, base: 0, ratePer100: 6.5, threshold: 0 },
  ],
  QLD: [
    { upTo: 5000, base: 0, ratePer100: 0, threshold: 0 },
    { upTo: 75000, base: 0, ratePer100: 1.5, threshold: 5000 },
    { upTo: 540000, base: 1050, ratePer100: 3.5, threshold: 75000 },
    { upTo: 1000000, base: 17325, ratePer100: 4.5, threshold: 540000 },
    { upTo: Infinity, base: 38025, ratePer100: 5.75, threshold: 1000000 },
  ],
  WA: [
    { upTo: 120000, base: 0, ratePer100: 1.9, threshold: 0 },
    { upTo: 150000, base: 2280, ratePer100: 2.85, threshold: 120000 },
    { upTo: 360000, base: 3135, ratePer100: 3.8, threshold: 150000 },
    { upTo: 725000, base: 11115, ratePer100: 4.75, threshold: 360000 },
    { upTo: Infinity, base: 28453, ratePer100: 5.15, threshold: 725000 },
  ],
  SA: [
    { upTo: 12000, base: 0, ratePer100: 1.0, threshold: 0 },
    { upTo: 30000, base: 120, ratePer100: 2.0, threshold: 12000 },
    { upTo: 50000, base: 480, ratePer100: 3.0, threshold: 30000 },
    { upTo: 100000, base: 1080, ratePer100: 3.5, threshold: 50000 },
    { upTo: 200000, base: 2830, ratePer100: 4.0, threshold: 100000 },
    { upTo: 250000, base: 6830, ratePer100: 4.25, threshold: 200000 },
    { upTo: 300000, base: 8955, ratePer100: 4.75, threshold: 250000 },
    { upTo: Infinity, base: 11330, ratePer100: 5.5, threshold: 300000 },
  ],
  TAS: [
    { upTo: 3000, base: 50, ratePer100: 0, threshold: 0 },
    { upTo: 25000, base: 50, ratePer100: 1.75, threshold: 3000 },
    { upTo: 75000, base: 435, ratePer100: 2.25, threshold: 25000 },
    { upTo: 200000, base: 1560, ratePer100: 3.5, threshold: 75000 },
    { upTo: 375000, base: 5935, ratePer100: 4.0, threshold: 200000 },
    { upTo: 725000, base: 12935, ratePer100: 4.25, threshold: 375000 },
    { upTo: Infinity, base: 27810, ratePer100: 4.5, threshold: 725000 },
  ],
};

function evalBrackets(value: number, brackets: Bracket[]): number {
  for (const b of brackets) {
    if (value <= b.upTo) {
      return b.base + ((value - b.threshold) * b.ratePer100) / 100;
    }
  }
  return 0;
}

function nswDuty(v: number) {
  return evalBrackets(v, BRACKETS.NSW);
}

function vicDuty(v: number) {
  if (v > 2000000) return v * 0.065;
  // Only iterate brackets up to the 2m one
  const bs = BRACKETS.VIC.slice(0, 4);
  return evalBrackets(v, bs);
}

function actDuty(v: number) {
  // Per spec approximation: value × 0.0492% × (value/1000)
  return v * 0.000492 * (v / 1000);
}

function ntDuty(v: number) {
  if (v > 525000) return v * 0.0495;
  const V = v / 1000;
  return ((0.06571441 * V + 15) * V * 1000) / 1000;
  // i.e. (0.06571441*V + 15) * V dollars, where V = value/1000.
}

function fhbConcession(state: StateCode, value: number, baseDuty: number): number {
  // Returns the dollar saving (positive number) compared to baseDuty.
  switch (state) {
    case "NSW":
      if (value <= 800000) return baseDuty;
      if (value < 1000000) {
        // Linear taper between $800k (full exempt) and $1m (no concession)
        const taper = 1 - (value - 800000) / 200000;
        return baseDuty * taper;
      }
      return 0;
    case "VIC":
      if (value <= 600000) return baseDuty;
      if (value <= 750000) {
        const taper = 1 - (value - 600000) / 150000;
        return baseDuty * taper;
      }
      return 0;
    case "QLD":
      if (value <= 500000) return baseDuty;
      if (value <= 550000) {
        const taper = 1 - (value - 500000) / 50000;
        return baseDuty * taper;
      }
      return 0;
    case "WA":
      if (value <= 430000) return baseDuty;
      if (value <= 530000) {
        const taper = 1 - (value - 430000) / 100000;
        return baseDuty * taper;
      }
      return 0;
    case "SA":
    case "TAS":
    case "ACT":
    case "NT":
      // No simple uniform FHB rule supplied; return 0 (covered in disclaimer).
      return 0;
  }
}

export function calcStampDuty(
  value: number,
  state: StateCode,
  buyer: BuyerType,
): StampDutyResult {
  const v = Math.max(0, value);

  let baseDuty = 0;
  if (state === "ACT") baseDuty = actDuty(v);
  else if (state === "NT") baseDuty = ntDuty(v);
  else if (state === "NSW") baseDuty = nswDuty(v);
  else if (state === "VIC") baseDuty = vicDuty(v);
  else baseDuty = evalBrackets(v, BRACKETS[state]);

  const fhbSaving = buyer === "fhb" ? fhbConcession(state, v, baseDuty) : 0;
  const netDuty = Math.max(0, baseDuty - fhbSaving);

  const legal = 2000;
  const building = 600;
  const pest = 400;

  return {
    baseDuty,
    fhbSaving,
    netDuty,
    legal,
    building,
    pest,
    totalUpfront: netDuty + legal + building + pest,
  };
}

export const STATES: { code: StateCode; name: string }[] = [
  { code: "NSW", name: "New South Wales" },
  { code: "VIC", name: "Victoria" },
  { code: "QLD", name: "Queensland" },
  { code: "WA", name: "Western Australia" },
  { code: "SA", name: "South Australia" },
  { code: "TAS", name: "Tasmania" },
  { code: "ACT", name: "Australian Capital Territory" },
  { code: "NT", name: "Northern Territory" },
];
