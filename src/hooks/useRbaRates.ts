import { useLiveRates } from "./useLiveRates";
import { rbaRates as fallback } from "@/data/rbaRates";

/**
 * Drop-in replacement for the static `rbaRates` constant.
 * Returns the same shape but sourced from live rate_data when available,
 * falling back to the hardcoded values in `@/data/rbaRates`.
 */
export function useRbaRates() {
  const { rates, rbaRate } = useLiveRates();

  const ooNode = rates?.lender_rates?.national?.owner_occupier as
    | { rate?: number }
    | undefined;
  const invNode = rates?.lender_rates?.national?.investor as
    | { rate?: number }
    | undefined;

  const meta = (rates?.rba_cash_rate?.national?.cash_rate as
    | { _meta?: { last_verified?: string } }
    | undefined)?._meta;

  const lastUpdated = meta?.last_verified
    ? new Date(meta.last_verified).toLocaleDateString("en-AU", {
        month: "short",
        year: "numeric",
      })
    : fallback.lastUpdated;

  return {
    cashRate: rbaRate,
    ownerOccupier: ooNode?.rate ?? fallback.ownerOccupier,
    investor: invNode?.rate ?? fallback.investor,
    lastUpdated,
    averageLoanSize: fallback.averageLoanSize,
    source: fallback.source,
  };
}
