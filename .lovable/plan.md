## Shareable URL with selected inputs and outputs

Generate a URL that encodes the user's calculator inputs so that opening the link reproduces the exact same scenario (and therefore the exact same outputs, since outputs are deterministically derived from inputs). Encoding only inputs keeps URLs short and tamper-resistant; outputs are recomputed on load to stay consistent with the live formulas.

### User experience

On every calculator (Repayment, Borrowing, Stamp Duty, Extra Repayments, Insurance, Comparison), a small action row sits directly under the hero result card with two buttons:

- **Copy link** — copies a URL like `/au/mortgage-calculator?s=<base64>` to the clipboard and shows a "Link copied" toast.
- **Share** — uses the native Web Share API on mobile (system share sheet with title, result text, and URL); falls back to copy-to-clipboard on desktop.

When someone opens a shared URL, the calculator reads `?s=` from the query string, decodes it, and applies those values as the initial state — so they immediately see the same inputs and the same computed result.

### Technical design

**1. New utility: `src/lib/share.ts`**
- `encodeState(obj)` → URL-safe base64 of `JSON.stringify(obj)` (handles unicode via `encodeURIComponent`).
- `decodeState(str)` → parsed object or `null` on failure.
- `readSharedState<T>()` → reads `?s=` from `window.location.search` and decodes it once at mount.
- `buildShareUrl(encoded)` → `${origin}${pathname}?s=${encoded}`.

**2. New component: `src/components/premium/ShareButton.tsx`**
- Props: `state` (the inputs object), `title`, `resultLabel`, `resultValue`.
- Two buttons (Copy link, Share) styled to match the bank-grade UI (rounded-full, border, primary fill).
- Uses `sonner` toast for feedback and `lucide-react` icons (`Link2`, `Check`, `Share2`).
- Web Share API with graceful fallback to clipboard.

**3. Refactor each calculator in `src/components/calculators/MortgageTools.tsx`**
- Replace the multiple `useState` calls per calculator with a single state object initialized from `readSharedState()` merged over per-country defaults.
- Example for Repayment:
  ```ts
  type RepaymentState = { amount: number; deposit: number; rate: number; term: number; frequency: Frequency };
  const defaults: RepaymentState = { amount: country.defaultAmount, deposit: ..., ... };
  const [s, setS] = useState<RepaymentState>(() => ({ ...defaults, ...(readSharedState<RepaymentState>() ?? {}) }));
  const set = <K extends keyof RepaymentState>(k: K, v: RepaymentState[K]) => setS(prev => ({ ...prev, [k]: v }));
  ```
- Replace each setter (`setAmount`, `setRate`, …) with `set("amount", v)`, etc.
- Render `<ShareButton state={s} resultLabel={...} resultValue={...} />` directly under the `HeroResultCard` inside each calculator's left column.

**4. Validation & safety**
- `decodeState` is wrapped in try/catch; bad/expired payloads simply fall back to defaults.
- Clamp/coerce decoded numeric values inside each calculator (`Math.max(min, Math.min(max, n))`) before use, so a tampered URL can't push sliders out of bounds.
- The `?s=` query string is non-canonical; existing `SEOHead` already emits canonical URLs without query params, so search engines won't index share variants.

**5. No backend required**
- All encoding happens client-side. No database, no auth, no Cloud — the URL itself carries the full state.

### Files

Created:
- `src/lib/share.ts`
- `src/components/premium/ShareButton.tsx`

Edited:
- `src/components/calculators/MortgageTools.tsx` — refactor 6 calculators to single-object state hydrated from `?s=`, render `<ShareButton>` under each hero card.

### Verification

- Change inputs on `/au/mortgage-calculator` → click Copy link → open in incognito → sliders, frequency, and computed repayment match the original.
- On mobile (384×676), Share opens the native sheet; on desktop it falls back to copy with a toast.
- Tampered/garbled `?s=` value renders defaults without errors.
- Build passes; no runtime errors.
