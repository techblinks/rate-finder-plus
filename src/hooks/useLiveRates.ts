import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MetaInfo {
  last_verified: string;
  last_changed: string;
}

type RateNode = Record<string, unknown> & { _meta?: MetaInfo };

export interface RateData {
  [category: string]: {
    [stateOrNational: string]: {
      [key: string]: RateNode;
    };
  };
}

export interface UseLiveRatesReturn {
  rates: RateData | null;
  loading: boolean;
  error: string | null;
  rbaRate: number;
  getFHOG: (
    state: string,
  ) => { amount: number; newHomesOnly: boolean; maxPropertyValue: number | null } | null;
  getFHBThreshold: (
    state: string,
  ) => { fullExemptionTo: number; concessionTo: number } | null;
  getLMIBands: (
    buyerType: "owner_occupier" | "investor",
  ) => Array<{ lvrFrom: number; lvrTo: number; rate: number }> | null;
  getHIAScheme: () =>
    | {
        placesPerYear: number;
        minDepositPct: number;
        individualIncomeCap: number;
        coupleIncomeCap: number;
        priceCaps: Record<string, number>;
      }
    | null;
  lastUpdated: Date | null;
}

// Module-level cache so all calculators share one fetch per session.
let ratesCache: RateData | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 3_600_000; // 1 hour

/** Bust the cache. Call after admin saves a rate so calculators pick up changes. */
export function invalidateLiveRatesCache() {
  ratesCache = null;
  cacheTimestamp = null;
}

export function useLiveRates(): UseLiveRatesReturn {
  const [rates, setRates] = useState<RateData | null>(ratesCache ?? getDefaultRates());
  const [loading, setLoading] = useState(!ratesCache);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    cacheTimestamp ? new Date(cacheTimestamp) : null,
  );

  useEffect(() => {
    if (ratesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
      setRates(ratesCache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error: dbError } = await supabase
          .from("rate_data")
          .select("category, state, key, value, last_verified_at, last_changed_at")
          .eq("is_active", true);
        if (dbError) throw dbError;

        const transformed: RateData = {};
        for (const row of data || []) {
          const stateKey = row.state || "national";
          transformed[row.category] ??= {};
          transformed[row.category][stateKey] ??= {};
          transformed[row.category][stateKey][row.key] = {
            ...(row.value as Record<string, unknown>),
            _meta: {
              last_verified: row.last_verified_at as string,
              last_changed: row.last_changed_at as string,
            },
          };
        }

        ratesCache = transformed;
        cacheTimestamp = Date.now();
        if (!cancelled) {
          setRates(transformed);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load rates");
          const fallbackRates = getDefaultRates();
          try {
            const workerRes = await fetch("https://calcy-rba-worker.yadavabikash.workers.dev/rate");
            const workerData = await workerRes.json();
            if (workerData?.rate) {
              fallbackRates.rba_cash_rate.national.cash_rate = {
                rate: parseFloat(workerData.rate),
                effective_date: new Date().toISOString().split("T")[0],
              };
            }
          } catch {
            // Worker also failed — use hardcoded defaults as-is
          }
          if (!cancelled) setRates(fallbackRates);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rbaRate =
    (rates?.rba_cash_rate?.national?.cash_rate as { rate?: number } | undefined)?.rate ?? 4.35;

  const getFHOG: UseLiveRatesReturn["getFHOG"] = (state) => {
    const data = rates?.fhog?.[state]?.grant as
      | { amount: number; new_homes_only: boolean; max_property_value: number | null }
      | undefined;
    if (!data) return null;
    return {
      amount: data.amount,
      newHomesOnly: data.new_homes_only,
      maxPropertyValue: data.max_property_value,
    };
  };

  const getFHBThreshold: UseLiveRatesReturn["getFHBThreshold"] = (state) => {
    const data = rates?.fhb_threshold?.[state]?.stamp_duty as
      | { full_exemption_to: number; concession_to: number }
      | undefined;
    if (!data) return null;
    return { fullExemptionTo: data.full_exemption_to, concessionTo: data.concession_to };
  };

  const getLMIBands: UseLiveRatesReturn["getLMIBands"] = (buyerType) => {
    const data = rates?.lmi_bands?.national?.[buyerType] as
      | { bands: Array<{ lvr_from: number; lvr_to: number; rate: number }> }
      | undefined;
    if (!data?.bands) return null;
    return data.bands.map((b) => ({ lvrFrom: b.lvr_from, lvrTo: b.lvr_to, rate: b.rate }));
  };

  const getHIAScheme: UseLiveRatesReturn["getHIAScheme"] = () => {
    const data = rates?.hia_scheme?.national?.first_home_guarantee as
      | {
          places_per_year: number;
          min_deposit_pct: number;
          individual_income_cap: number;
          couple_income_cap: number;
          price_caps: Record<string, number>;
        }
      | undefined;
    if (!data) return null;
    return {
      placesPerYear: data.places_per_year,
      minDepositPct: data.min_deposit_pct,
      individualIncomeCap: data.individual_income_cap,
      coupleIncomeCap: data.couple_income_cap,
      priceCaps: data.price_caps,
    };
  };

  return { rates, loading, error, rbaRate, getFHOG, getFHBThreshold, getLMIBands, getHIAScheme, lastUpdated };
}

// Hardcoded fallback. Keep in sync with seed data in supabase migrations.
function getDefaultRates(): RateData {
  return {
    rba_cash_rate: {
      national: { cash_rate: { rate: 4.35, effective_date: "2026-05-05" } },
    },
    fhog: {
      NSW: { grant: { amount: 10000, new_homes_only: true, max_property_value: 600000 } },
      VIC: { grant: { amount: 10000, new_homes_only: true, max_property_value: 750000 } },
      QLD: { grant: { amount: 30000, new_homes_only: true, max_property_value: 750000 } },
      WA: { grant: { amount: 10000, new_homes_only: true, max_property_value: 750000 } },
      SA: { grant: { amount: 15000, new_homes_only: true, max_property_value: null } },
      TAS: { grant: { amount: 30000, new_homes_only: true, max_property_value: null } },
      ACT: { grant: { amount: 0, new_homes_only: true, max_property_value: null } },
      NT: { grant: { amount: 10000, new_homes_only: true, max_property_value: null } },
    },
    fhb_threshold: {
      NSW: { stamp_duty: { full_exemption_to: 800000, concession_to: 1000000 } },
      VIC: { stamp_duty: { full_exemption_to: 600000, concession_to: 750000 } },
      QLD: { stamp_duty: { full_exemption_to: 500000, concession_to: 550000 } },
      WA: { stamp_duty: { full_exemption_to: 430000, concession_to: 530000 } },
    },
    lmi_bands: {
      national: {
        owner_occupier: {
          bands: [
            { lvr_from: 80.01, lvr_to: 85.0, rate: 0.0066 },
            { lvr_from: 85.01, lvr_to: 90.0, rate: 0.0119 },
            { lvr_from: 90.01, lvr_to: 95.0, rate: 0.0196 },
            { lvr_from: 95.01, lvr_to: 100.0, rate: 0.031 },
          ],
        },
        investor: {
          bands: [
            { lvr_from: 80.01, lvr_to: 85.0, rate: 0.008 },
            { lvr_from: 85.01, lvr_to: 90.0, rate: 0.0145 },
            { lvr_from: 90.01, lvr_to: 95.0, rate: 0.023 },
            { lvr_from: 95.01, lvr_to: 100.0, rate: 0.036 },
          ],
        },
      },
    },
  };
}
