export type StateCode = "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT";
export type BuyerType = "owner" | "fhb" | "investor";
export type PropertyType = "established" | "new" | "vacant";

export interface StampDutyResult {
  baseDuty: number;
  fhbDuty: number;
  fhbSaving: number;
  netDuty: number;
  fhog: number;
  fhogEligible: boolean;
  legal: number;
  building: number;
  pest: number;
  totalUpfront: number;
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

/** First Home Owner Grant amounts for new homes (2026 indicative). */
export const FHOG: Record<StateCode, number> = {
  NSW: 10000,
  VIC: 10000,
  QLD: 30000,
  WA: 10000,
  SA: 15000,
  TAS: 30000,
  ACT: 0,
  NT: 10000,
};

/** Short context note shown when a state is selected. */
export const STATE_FHB_NOTE: Record<StateCode, string> = {
  NSW: "First home buyers exempt on properties up to $800,000",
  VIC: "First home buyers exempt on properties up to $600,000",
  QLD: "First home buyer concession on properties up to $500,000",
  WA: "First home buyers exempt on properties up to $430,000",
  SA: "No stamp duty exemption for FHBs — $15,000 FHOG on new homes",
  TAS: "First home buyers receive 50% stamp duty concession",
  ACT: "Home Buyer Concession Scheme — income-tested, no stamp duty",
  NT: "Territory Home Owner Discount of up to $18,601",
};

interface DutyResult {
  duty: number;
  fhbDuty: number;
}

function calculateNSW(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 16000) duty = value * 0.0125;
  else if (value <= 35000) duty = 200 + (value - 16000) * 0.015;
  else if (value <= 93000) duty = 485 + (value - 35000) * 0.0175;
  else if (value <= 351000) duty = 1500 + (value - 93000) * 0.035;
  else if (value <= 1168000) duty = 10530 + (value - 351000) * 0.045;
  else if (value <= 3505000) duty = 47295 + (value - 1168000) * 0.055;
  else duty = 175510 + (value - 3505000) * 0.07;

  let fhbDuty = duty;
  if (isFHB) {
    if (value <= 800000) fhbDuty = 0;
    else if (value <= 1000000) {
      const reduction = duty * ((1000000 - value) / 200000);
      fhbDuty = Math.max(0, duty - reduction);
    }
  }
  return { duty, fhbDuty };
}

function calculateVIC(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 25000) duty = value * 0.014;
  else if (value <= 130000) duty = 350 + (value - 25000) * 0.024;
  else if (value <= 960000) duty = 2870 + (value - 130000) * 0.06;
  else duty = 52490 + (value - 960000) * 0.065;

  let fhbDuty = duty;
  if (isFHB) {
    if (value <= 600000) fhbDuty = 0;
    else if (value <= 750000) {
      fhbDuty = duty * ((value - 600000) / 150000);
    }
  }
  return { duty, fhbDuty };
}

function calculateQLD(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 5000) duty = 0;
  else if (value <= 75000) duty = (value - 5000) * 0.015;
  else if (value <= 540000) duty = 1050 + (value - 75000) * 0.035;
  else if (value <= 1000000) duty = 17325 + (value - 540000) * 0.045;
  else duty = 38025 + (value - 1000000) * 0.0575;

  let fhbDuty = duty;
  if (isFHB) {
    if (value <= 500000) fhbDuty = 0;
    else if (value <= 550000) {
      fhbDuty = duty * ((value - 500000) / 50000);
    }
  }
  return { duty, fhbDuty };
}

function calculateWA(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 120000) duty = value * 0.019;
  else if (value <= 150000) duty = 2280 + (value - 120000) * 0.0285;
  else if (value <= 360000) duty = 3135 + (value - 150000) * 0.03;
  else if (value <= 725000) duty = 9435 + (value - 360000) * 0.0475;
  else if (value <= 1500000) duty = 26760 + (value - 725000) * 0.05;
  else duty = 65510 + (value - 1500000) * 0.06;

  let fhbDuty = duty;
  if (isFHB) {
    if (value <= 430000) fhbDuty = 0;
    else if (value <= 530000) {
      fhbDuty = duty * ((value - 430000) / 100000);
    }
  }
  return { duty, fhbDuty };
}

function calculateSA(value: number): DutyResult {
  let duty: number;
  if (value <= 12000) duty = value * 0.01;
  else if (value <= 30000) duty = 120 + (value - 12000) * 0.02;
  else if (value <= 50000) duty = 480 + (value - 30000) * 0.03;
  else if (value <= 100000) duty = 1080 + (value - 50000) * 0.035;
  else if (value <= 200000) duty = 2830 + (value - 100000) * 0.04;
  else if (value <= 250000) duty = 6830 + (value - 200000) * 0.0425;
  else if (value <= 300000) duty = 8955 + (value - 250000) * 0.0475;
  else if (value <= 500000) duty = 11330 + (value - 300000) * 0.05;
  else duty = 21330 + (value - 500000) * 0.055;
  return { duty, fhbDuty: duty };
}

function calculateTAS(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 3000) duty = 50;
  else if (value <= 25000) duty = 50 + (value - 3000) * 0.0175;
  else if (value <= 75000) duty = 435 + (value - 25000) * 0.025;
  else if (value <= 200000) duty = 1685 + (value - 75000) * 0.03;
  else if (value <= 375000) duty = 5435 + (value - 200000) * 0.035;
  else if (value <= 725000) duty = 11560 + (value - 375000) * 0.04;
  else duty = 25560 + (value - 725000) * 0.045;
  return { duty, fhbDuty: isFHB ? duty * 0.5 : duty };
}

function calculateACT(value: number, isFHB: boolean): DutyResult {
  let duty: number;
  if (value <= 200000) duty = value * 0.0206;
  else if (value <= 300000) duty = 4120 + (value - 200000) * 0.0332;
  else if (value <= 500000) duty = 7440 + (value - 300000) * 0.0419;
  else if (value <= 750000) duty = 15820 + (value - 500000) * 0.049;
  else if (value <= 1000000) duty = 28070 + (value - 750000) * 0.0491;
  else if (value <= 1455000) duty = 40345 + (value - 1000000) * 0.0493;
  else duty = 62789 + (value - 1455000) * 0.049;
  return { duty, fhbDuty: isFHB ? 0 : duty };
}

function calculateNT(value: number, isFHB: boolean): DutyResult {
  const V = value / 1000;
  const duty = ((0.06571441 * V + 15) * V) / 1000;
  const discount = isFHB ? Math.min(18601, duty) : 0;
  return { duty, fhbDuty: Math.max(0, duty - discount) };
}

export function calculateStampDutyByState(
  value: number,
  state: StateCode,
  isFHB: boolean,
): DutyResult {
  const v = Math.max(0, value);
  switch (state) {
    case "NSW": return calculateNSW(v, isFHB);
    case "VIC": return calculateVIC(v, isFHB);
    case "QLD": return calculateQLD(v, isFHB);
    case "WA":  return calculateWA(v, isFHB);
    case "SA":  return calculateSA(v);
    case "TAS": return calculateTAS(v, isFHB);
    case "ACT": return calculateACT(v, isFHB);
    case "NT":  return calculateNT(v, isFHB);
  }
}

export function calcStampDuty(
  value: number,
  state: StateCode,
  buyer: BuyerType,
  propertyType: PropertyType = "established",
): StampDutyResult {
  const isFHB = buyer === "fhb";
  const { duty, fhbDuty } = calculateStampDutyByState(value, state, isFHB);

  const baseDuty = Math.round(duty);
  const dutyPayable = Math.round(isFHB ? fhbDuty : duty);
  const fhbSaving = isFHB ? Math.max(0, baseDuty - dutyPayable) : 0;

  const fhogEligible = isFHB && propertyType === "new";
  const fhog = fhogEligible ? FHOG[state] : 0;

  const legal = 2000;
  const building = 600;
  const pest = 400;

  return {
    baseDuty,
    fhbDuty: Math.round(fhbDuty),
    fhbSaving,
    netDuty: dutyPayable,
    fhog,
    fhogEligible,
    legal,
    building,
    pest,
    totalUpfront: dutyPayable + legal + building + pest,
  };
}
