// Shared "Decision Intelligence" helper.
// Builds an explainable reasoning object for every SEO recommendation so the
// admin UI can show WHY each suggestion exists, WHAT impact to expect,
// and WHICH learned patterns influenced it.
//
// Pure/deterministic: reads computed signals + pattern match output, returns
// human-readable strings. Never mutates DB, never publishes, never applies.

export type RecommendationKind =
  | "opportunity"
  | "weekly_task"
  | "draft"
  | "ctr"
  | "content_gap"
  | "internal_link"
  | "aeo"
  | "money_page"
  | "freshness";

export type ReasoningInput = {
  kind: RecommendationKind;
  // Optional context to ground the reasoning
  keyword?: string | null;
  target_url?: string | null;
  draft_type?: string | null;
  task_type?: string | null;
  intent?: string | null;
  confidence?: string | null; // low | medium | high
  score?: number | null; // 0..100 priority/opportunity score
  priority?: string | null; // low | medium | high
  risk_level?: string | null;
  impressions_28d?: number | null;
  clicks_28d?: number | null;
  ctr_28d?: number | null;
  expected_ctr?: number | null;
  position?: number | null;
  previous_position?: number | null;
  estimated_traffic_opportunity?: number | null;
  estimated_missed_clicks?: number | null;
  rpm_estimate?: number | null; // $ per 1k pageviews
  cpc_estimate?: number | null;
  // Pattern memory inputs (from patternMatch helper)
  pattern_match_score?: number | null; // -1..+1
  pattern_reason?: string | null;
  risk_pattern_warning?: string | null;
  matched_pattern_ids?: string[] | null;
  learning_data_ready?: boolean | null;
  // Free-form tags for nuance
  signals?: string[] | null;
  notes?: string | null;
};

export type DecisionReasoning = {
  why_matters: string;
  why_prioritized: string;
  expected_ranking_impact: string;
  expected_traffic_impact: string;
  expected_revenue_impact: string;
  pattern_reasoning: string;
  winning_patterns_used: string[];
  risky_patterns_avoided: string[];
  confidence_explanation: string;
  implementation_effort: "trivial" | "low" | "medium" | "high";
  expected_roi: "low" | "medium" | "high" | "very_high";
  business_impact_summary: string;
  seo_reasoning: string;
  risk_reasoning: string;
  signal_breakdown: { label: string; value: string | number }[];
  generated_at: string;
};

const FINANCE_RPM_DEFAULT = 38; // conservative AU finance vertical
const FINANCE_CPC_DEFAULT = 3.2;

function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v == null || !isFinite(v)) return "n/a";
  return `${(v * 100).toFixed(digits)}%`;
}

function fmtNum(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return "n/a";
  return Math.round(v).toLocaleString();
}

function roiTier(traffic: number, revenue: number): DecisionReasoning["expected_roi"] {
  if (traffic >= 1500 || revenue >= 200) return "very_high";
  if (traffic >= 400 || revenue >= 60) return "high";
  if (traffic >= 80 || revenue >= 15) return "medium";
  return "low";
}

function effortFor(kind: RecommendationKind, draftType?: string | null): DecisionReasoning["implementation_effort"] {
  if (kind === "internal_link") return "trivial";
  if (kind === "ctr") return "low";
  if (kind === "draft") {
    const dt = (draftType || "").toLowerCase();
    if (dt === "title_meta" || dt === "internal_link") return "low";
    if (dt === "faq" || dt === "aeo_answer" || dt === "comparison_table") return "medium";
    if (dt === "content_refresh") return "medium";
    return "medium";
  }
  if (kind === "aeo" || kind === "freshness") return "medium";
  if (kind === "content_gap") return "high";
  if (kind === "money_page") return "medium";
  if (kind === "weekly_task") return "medium";
  return "low";
}

function kindLabel(kind: RecommendationKind): string {
  switch (kind) {
    case "opportunity": return "Opportunity Radar signal";
    case "weekly_task": return "Weekly SEO task";
    case "draft": return "Approval-only draft";
    case "ctr": return "CTR uplift suggestion";
    case "content_gap": return "Content gap";
    case "internal_link": return "Internal link suggestion";
    case "aeo": return "AEO improvement";
    case "money_page": return "Money page action";
    case "freshness": return "Content refresh";
  }
}

export function buildReasoning(input: ReasoningInput): DecisionReasoning {
  const kind = input.kind;
  const url = input.target_url || "(unspecified URL)";
  const kw = input.keyword || null;
  const intent = (input.intent || "informational").toLowerCase();
  const confidence = (input.confidence || "low").toLowerCase();
  const impressions = input.impressions_28d ?? 0;
  const clicks = input.clicks_28d ?? 0;
  const ctr = input.ctr_28d ?? (impressions > 0 ? clicks / impressions : 0);
  const expectedCtr = input.expected_ctr ?? null;
  const position = input.position ?? null;
  const prev = input.previous_position ?? null;
  const score = input.score ?? 0;
  const priority = (input.priority || (score >= 70 ? "high" : score >= 40 ? "medium" : "low")).toLowerCase();
  const patternScore = input.pattern_match_score ?? 0;
  const rpm = input.rpm_estimate ?? FINANCE_RPM_DEFAULT;
  const cpc = input.cpc_estimate ?? FINANCE_CPC_DEFAULT;

  // ---- Why this matters
  const matterParts: string[] = [];
  if (kw) matterParts.push(`"${kw}" maps to ${url}`);
  else matterParts.push(`${kindLabel(kind)} for ${url}`);
  if (impressions > 0) matterParts.push(`${fmtNum(impressions)} 28d impressions`);
  if (position != null) matterParts.push(`avg position ${position.toFixed(1)}`);
  if (intent === "calculator" || intent === "transactional") matterParts.push("commercial/calculator intent");
  const why_matters = matterParts.join(" · ");

  // ---- Why prioritized
  const prioBits: string[] = [];
  prioBits.push(`priority score ${Math.round(score)}/100 (${priority})`);
  if (input.signals && input.signals.length) prioBits.push(`triggers: ${input.signals.slice(0, 5).join(", ")}`);
  if (prev != null && position != null && position < prev) prioBits.push(`rank improved ${prev.toFixed(1)}→${position.toFixed(1)}`);
  if (prev != null && position != null && position > prev) prioBits.push(`rank slipped ${prev.toFixed(1)}→${position.toFixed(1)}`);
  if (expectedCtr != null && ctr < expectedCtr * 0.8 && impressions >= 50) {
    prioBits.push(`CTR ${fmtPct(ctr)} vs expected ${fmtPct(expectedCtr)}`);
  }
  if (patternScore > 0.2) prioBits.push(`+${Math.round(patternScore * 10)} pts from winning patterns`);
  if (patternScore < -0.2) prioBits.push(`${Math.round(patternScore * 10)} pts from risky patterns`);
  const why_prioritized = prioBits.join(" · ");

  // ---- Expected ranking impact
  let rankingImpact = "Neutral ranking effect expected.";
  if (position != null) {
    if (position >= 8 && position <= 20) rankingImpact = `Currently position ${position.toFixed(1)} (page 1-2 fringe). Realistic move 2-5 positions toward top 10 if change ships and indexes cleanly.`;
    else if (position < 8) rankingImpact = `Already ranks top 8 — change should consolidate, not redefine ranking; modest 0-2 position gain typical.`;
    else if (position > 20) rankingImpact = `Deep position ${position.toFixed(1)} — ranking change is uncertain; treat as long-tail relevance signal rather than guaranteed climb.`;
  }
  if (kind === "internal_link") rankingImpact = "Strengthens internal authority flow toward the target. Direct ranking impact is incremental, compounding with sitewide link mesh quality.";
  if (kind === "content_gap" && !position) rankingImpact = "Net-new coverage — no current ranking baseline. Expect 4-12 weeks to surface in SERP after publish + indexing.";

  // ---- Expected traffic impact
  let estTraffic = 0;
  if (kind === "ctr" && input.estimated_missed_clicks != null) {
    estTraffic = Math.round(input.estimated_missed_clicks * 30 / 28); // missed clicks → monthly
  } else if (kind === "content_gap" && input.estimated_traffic_opportunity != null) {
    estTraffic = Math.round(input.estimated_traffic_opportunity);
  } else if (impressions > 0 && expectedCtr != null) {
    const lift = Math.max(0, expectedCtr - (ctr || 0));
    estTraffic = Math.round(lift * impressions * (30 / 28));
  } else if (impressions > 0 && position != null && position >= 8 && position <= 15) {
    estTraffic = Math.round(impressions * 0.04); // optimistic page-1 lift heuristic
  }
  if (patternScore > 0.3) estTraffic = Math.round(estTraffic * 1.15);
  if (patternScore < -0.3) estTraffic = Math.round(estTraffic * 0.85);
  const expected_traffic_impact = estTraffic > 0
    ? `~${fmtNum(estTraffic)} extra monthly clicks if change ships and patterns hold.`
    : "Traffic uplift not directly modellable yet — track via Impact Tracking after apply.";

  // ---- Expected revenue impact
  const monthlyRevenue = Math.round((estTraffic / 1000) * rpm);
  const expected_revenue_impact = estTraffic > 0
    ? `~$${monthlyRevenue.toLocaleString()} / month at ${rpm.toFixed(0)} RPM (AU finance avg, CPC ~$${cpc.toFixed(2)}). Realised revenue depends on ad density and seasonality.`
    : "Revenue impact pending — recompute after 7d + 30d post-apply windows.";

  // ---- Pattern reasoning
  const patternParts: string[] = [];
  if (input.learning_data_ready === false) {
    patternParts.push("Learning data not sufficient yet — pattern memory did not influence this score.");
  } else if (patternScore > 0) {
    patternParts.push(input.pattern_reason || "Matches previously-winning pattern.");
  } else if (patternScore < 0) {
    patternParts.push(input.risk_pattern_warning || "Resembles a previously-risky pattern — proceed with extra review.");
  } else {
    patternParts.push("No strong pattern signal detected for this combination yet.");
  }
  const pattern_reasoning = patternParts.join(" ");

  const winning_patterns_used: string[] = [];
  const risky_patterns_avoided: string[] = [];
  if (patternScore > 0 && input.pattern_reason) winning_patterns_used.push(input.pattern_reason);
  if (input.risk_pattern_warning) risky_patterns_avoided.push(input.risk_pattern_warning);

  // ---- Confidence explanation
  let confidenceText = `Confidence: ${confidence}.`;
  if (confidence === "high") confidenceText += " Strong signal: enough impressions, clear intent and consistent ranking data.";
  else if (confidence === "medium") confidenceText += " Reasonable signal but sample size or intent clarity could be stronger.";
  else confidenceText += " Low confidence — limited data or fuzzy intent. Treat as a hypothesis to validate.";
  if (input.learning_data_ready === false) confidenceText += " Pattern memory still warming up.";

  // ---- Risk reasoning
  const riskBits: string[] = [];
  if (input.risk_level) riskBits.push(`Declared risk level: ${input.risk_level}.`);
  if (input.risk_pattern_warning) riskBits.push(input.risk_pattern_warning);
  if (kind === "draft") riskBits.push("Admin approval + sandbox preview required before any public-page change.");
  if (kind === "internal_link") riskBits.push("Anchor diversification checked to avoid over-optimisation.");
  if (riskBits.length === 0) riskBits.push("No specific risks flagged — standard admin-review workflow still applies.");
  const risk_reasoning = riskBits.join(" ");

  const implementation_effort = effortFor(kind, input.draft_type);
  const expected_roi = roiTier(estTraffic, monthlyRevenue);

  // ---- Business impact summary
  const business_impact_summary = `${kindLabel(kind)} targeting ${url}${kw ? ` ("${kw}")` : ""}. Expected ROI: ${expected_roi.replace("_", " ")} (~${fmtNum(estTraffic)} clicks/mo, ~$${monthlyRevenue.toLocaleString()}/mo). Effort: ${implementation_effort}.`;

  // ---- SEO reasoning (one tight paragraph)
  const seoBits: string[] = [];
  if (position != null) seoBits.push(`current avg position ${position.toFixed(1)}`);
  if (expectedCtr != null) seoBits.push(`CTR ${fmtPct(ctr)} vs expected ${fmtPct(expectedCtr)}`);
  if (impressions > 0) seoBits.push(`${fmtNum(impressions)} impressions / 28d`);
  if (intent) seoBits.push(`${intent} intent`);
  const seo_reasoning = `Triggered by: ${seoBits.join(", ")}. ${pattern_reasoning}`;

  // ---- Signal breakdown for UI
  const signal_breakdown: { label: string; value: string | number }[] = [];
  if (impressions) signal_breakdown.push({ label: "Impressions (28d)", value: fmtNum(impressions) });
  if (clicks) signal_breakdown.push({ label: "Clicks (28d)", value: fmtNum(clicks) });
  if (ctr) signal_breakdown.push({ label: "CTR (28d)", value: fmtPct(ctr) });
  if (expectedCtr != null) signal_breakdown.push({ label: "Expected CTR", value: fmtPct(expectedCtr) });
  if (position != null) signal_breakdown.push({ label: "Avg position", value: position.toFixed(1) });
  if (prev != null) signal_breakdown.push({ label: "Previous position", value: prev.toFixed(1) });
  signal_breakdown.push({ label: "Priority score", value: `${Math.round(score)}/100` });
  signal_breakdown.push({ label: "Pattern influence", value: patternScore.toFixed(2) });
  signal_breakdown.push({ label: "Effort", value: implementation_effort });
  signal_breakdown.push({ label: "Expected ROI", value: expected_roi });

  return {
    why_matters,
    why_prioritized,
    expected_ranking_impact: rankingImpact,
    expected_traffic_impact,
    expected_revenue_impact,
    pattern_reasoning,
    winning_patterns_used,
    risky_patterns_avoided,
    confidence_explanation: confidenceText,
    implementation_effort,
    expected_roi,
    business_impact_summary,
    seo_reasoning,
    risk_reasoning,
    signal_breakdown,
    generated_at: new Date().toISOString(),
  };
}
