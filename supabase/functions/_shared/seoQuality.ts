// Shared SEO keyword quality + intent classification helpers.
// Inlined logic — edge functions import via relative path.

export const NOISE_PATTERNS = [
  /\byes\s+please\b/i,
  /\bno\s+thanks?\b/i,
  /\bthank\s+you\b/i,
  /\bhello\b/i,
  /\bhi\b/i,
  /\bok(ay)?\b/i,
  /\bplease\b/i,
  /\btest(ing)?\b/i,
  /\badmin\b/i,
  /\blogin\b/i,
  /\bsign[\s-]?in\b/i,
  /\bsign[\s-]?up\b/i,
  /\bpassword\b/i,
  /\blorem\b/i,
  /\bcalcy\b/i,
  /\bxyz\b/i,
  /^\W*$/,
];

export const FINANCE_TERMS: Record<string, number> = {
  mortgage: 10,
  "home loan": 10,
  "home loans": 10,
  repayment: 9,
  repayments: 9,
  "borrowing power": 10,
  "borrowing capacity": 10,
  borrow: 6,
  refinance: 10,
  refinancing: 10,
  "stamp duty": 10,
  "transfer duty": 9,
  lmi: 10,
  "lenders mortgage insurance": 10,
  hecs: 9,
  "help debt": 8,
  offset: 8,
  "extra repayment": 9,
  "extra repayments": 9,
  "interest rate": 8,
  "interest rates": 8,
  rba: 7,
  "cash rate": 8,
  "first home buyer": 9,
  fhb: 7,
  "investment property": 8,
  deposit: 6,
  loan: 5,
  calculator: 6,
  "rent vs buy": 9,
  "comparison rate": 8,
  amortisation: 7,
  amortization: 7,
  principal: 5,
  equity: 6,
  fixed: 4,
  variable: 4,
  refinanc: 8,
};

export type Intent =
  | "calculator"
  | "transactional"
  | "comparison"
  | "informational"
  | "educational"
  | "navigational";

export type Confidence = "high" | "medium" | "low";

export type KeywordQuality = {
  isNoise: boolean;
  noiseReason?: string;
  financeScore: number; // 0-10
  isFinance: boolean;
  intent: Intent;
  confidence: Confidence;
  qualityScore: number; // 0-100 weighted on impressions, position, finance, ctr signal
};

export function classifyKeyword(input: {
  keyword: string;
  category?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  position?: number | null;
}): KeywordQuality {
  const raw = (input.keyword || "").trim();
  const lower = raw.toLowerCase();
  const impressions = input.impressions ?? 0;
  const clicks = input.clicks ?? 0;
  const ctr = input.ctr ?? (impressions > 0 ? clicks / impressions : 0);
  const position = input.position;

  // Noise filters
  let isNoise = false;
  let noiseReason: string | undefined;

  if (lower.length < 3 || lower.split(/\s+/).filter(Boolean).length < 1) {
    isNoise = true;
    noiseReason = "too_short";
  }
  if (!isNoise) {
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(lower)) {
        isNoise = true;
        noiseReason = `noise_pattern:${pattern.source}`;
        break;
      }
    }
  }
  if (!isNoise && impressions < 10) {
    isNoise = true;
    noiseReason = "below_impression_threshold";
  }
  if (!isNoise && impressions <= 2 && clicks >= 1 && ctr >= 0.95) {
    isNoise = true;
    noiseReason = "accidental_single_click";
  }
  if (!isNoise && impressions < 5 && clicks <= 1) {
    isNoise = true;
    noiseReason = "low_confidence_volume";
  }

  // Finance relevance score (0-10) using term hits + category hint
  let financeScore = 0;
  for (const [term, weight] of Object.entries(FINANCE_TERMS)) {
    if (lower.includes(term)) financeScore = Math.max(financeScore, weight);
  }
  if ((input.category || "").trim() && financeScore < 6) financeScore = Math.max(financeScore, 6);

  const isFinance = financeScore >= 4;

  // Intent classification
  let intent: Intent = "informational";
  if (/\bcalculator|calculate|estimator|estimate\b/i.test(lower)) intent = "calculator";
  else if (/\bvs\b|\bversus\b|\bcompare|comparison|best\b/i.test(lower)) intent = "comparison";
  else if (/\bbuy|apply|get|cheapest|lowest|today\b/i.test(lower)) intent = "transactional";
  else if (/\blogin|sign\s?in|admin|dashboard\b/i.test(lower)) intent = "navigational";
  else if (/\bhow|what|why|guide|explain|meaning|definition\b/i.test(lower)) intent = "educational";

  // Confidence based on volume + finance + position presence
  let confidence: Confidence = "low";
  if (impressions >= 200 && isFinance) confidence = "high";
  else if (impressions >= 50 && isFinance) confidence = "medium";
  else if (impressions >= 100) confidence = "medium";

  // Quality score 0-100
  let qualityScore = 0;
  qualityScore += Math.min(35, Math.log10(impressions + 1) * 14);
  qualityScore += financeScore * 4; // up to 40
  if (position != null && position >= 4 && position <= 20) qualityScore += 15;
  if (intent === "calculator" || intent === "transactional" || intent === "comparison") qualityScore += 10;
  if (intent === "navigational") qualityScore -= 25;
  if (isNoise) qualityScore = 0;
  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

  return { isNoise, noiseReason, financeScore, isFinance, intent, confidence, qualityScore };
}
