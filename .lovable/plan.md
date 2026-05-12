## Plan: Add Worker Fallback for RBA Rate in useLiveRates

### Summary
When the Supabase `rate_data` query fails in `useLiveRates.ts`, attempt to fetch the current RBA cash rate from a Cloudflare Worker before falling back to hardcoded defaults.

### Change Details
**File:** `src/hooks/useLiveRates.ts`

**Current behavior (lines 100–104):**
```
catch (err) {
  if (!cancelled) {
    setError(...);
    setRates(getDefaultRates());
  }
}
```

**New behavior:**
1. In the `catch` block, call `getDefaultRates()` into a local `fallbackRates` variable.
2. Attempt `fetch('https://calcy-rba-worker.yadavabikash.workers.dev/rate')`.
3. If the response contains `rate`, overwrite:
   ```
   fallbackRates.rba_cash_rate.national.cash_rate = {
     rate: parseFloat(workerData.rate),
     effective_date: new Date().toISOString().split('T')[0]
   };
   ```
4. Call `setRates(fallbackRates)` regardless of whether the Worker fetch succeeded.
5. If the Worker also fails, `fallbackRates` remains the original hardcoded defaults.

No other logic in the file changes.