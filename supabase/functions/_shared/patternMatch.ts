// Shared helpers to match SEO recommendation engines against learned winning patterns.
// Read-only: never mutates patterns. Returns boosts, warnings, and matched ids.

export type WinningPattern = {
  id: string;
  pattern_key: string;
  pattern_type: string;
  draft_type: string | null;
  page_type: string | null;
  keyword_intent: string | null;
  confidence_level: string; // low | medium | high
  average_ctr_delta: number | null;
  average_click_delta: number | null;
  average_position_delta: number | null;
  success_count: number;
  failure_count: number;
  neutral_count: number;
  recommendation: string | null;
  status: string; // winning | risky | neutral
};

export function inferPageType(url: string | null | undefined): string {
  if (!url) return "unknown";
  const u = String(url).toLowerCase();
  if (u.includes("/calculator") || /\/(mortgage|loan|borrowing|refinance|stamp-duty|lmi|extra-repayments|rent-vs-buy|hecs)/.test(u)) return "calculator";
  if (u.includes("/guide")) return "guide";
  if (u.includes("/news")) return "news";
  if (u.includes("/suburb") || u.includes("/city")) return "location";
  if (u.includes("/state") || /\/(nsw|vic|qld|wa|sa|tas|act|nt)/.test(u)) return "state";
  if (u === "/" || u.endsWith("/index")) return "home";
  return "other";
}

export type PatternMatch = {
  pattern_match_score: number; // -1 .. +1
  matched_pattern_ids: string[];
  pattern_reason: string | null;
  risk_pattern_warning: string | null;
  matched_patterns: WinningPattern[];
};

const EMPTY: PatternMatch = {
  pattern_match_score: 0,
  matched_pattern_ids: [],
  pattern_reason: null,
  risk_pattern_warning: null,
  matched_patterns: [],
};

const confidenceWeight = (c: string) => (c === "high" ? 1 : c === "medium" ? 0.6 : 0.3);

export function matchPatterns(
  patterns: WinningPattern[] | null | undefined,
  ctx: { url?: string | null; draftType?: string | null; keywordIntent?: string | null },
): PatternMatch {
  if (!patterns || patterns.length === 0) return EMPTY;
  const pageType = inferPageType(ctx.url);
  const dt = (ctx.draftType || "").toLowerCase() || null;
  const it = (ctx.keywordIntent || "").toLowerCase() || null;

  const matched = patterns.filter((p) => {
    if (p.draft_type && dt && p.draft_type.toLowerCase() !== dt) return false;
    if (p.page_type && p.page_type !== pageType) return false;
    if (p.keyword_intent && it && p.keyword_intent.toLowerCase() !== it) return false;
    // require at least one dimension actually matched
    return (p.draft_type && dt) || (p.page_type && pageType !== "unknown") || (p.keyword_intent && it);
  });

  if (matched.length === 0) return EMPTY;

  let score = 0;
  let winReason: string | null = null;
  let riskReason: string | null = null;
  for (const p of matched) {
    const w = confidenceWeight(p.confidence_level);
    if (p.status === "winning") {
      score += w;
      if (!winReason) winReason = p.recommendation || `Matches winning pattern (${p.pattern_type}).`;
    } else if (p.status === "risky") {
      score -= w;
      if (!riskReason) riskReason = p.recommendation || `Matches risky pattern (${p.pattern_type}) — review carefully.`;
    }
  }
  score = Math.max(-1, Math.min(1, score / Math.max(matched.length, 1)));

  return {
    pattern_match_score: Math.round(score * 100) / 100,
    matched_pattern_ids: matched.map((p) => p.id),
    pattern_reason: winReason,
    risk_pattern_warning: riskReason,
    matched_patterns: matched,
  };
}

export const INSUFFICIENT_LEARNING_DATA = "Learning data not sufficient yet.";

export function hasEnoughLearningData(patterns: WinningPattern[] | null | undefined): boolean {
  if (!patterns || patterns.length === 0) return false;
  // Need at least a handful of patterns with non-low confidence or solid sample
  return patterns.some((p) => p.confidence_level !== "low" || (p.success_count + p.failure_count + p.neutral_count) >= 4);
}
