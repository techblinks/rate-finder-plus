/**
 * Token substitution for editorial copy that references live rates.
 *
 * Use `{{rbaCashRate}}` in any string sourced from `src/data/*.ts`
 * (FAQ answers, guide paragraphs, etc.) and it will be replaced at render
 * time with the current value coming from `useRbaRates()` (which itself is
 * backed by the live `rate_data` table).
 *
 * This means we only ever store the rate in one place — the database — and
 * every page picks up changes automatically after the daily sync.
 */
export interface RateTokens {
  cashRate: number;
}

export function substituteRateTokens(text: string, rates: RateTokens): string {
  if (!text) return text;
  return text.replace(/\{\{\s*rbaCashRate\s*\}\}/g, rates.cashRate.toFixed(2));
}
