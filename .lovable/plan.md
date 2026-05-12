## Problem

In the mortgage calculator (and every other calculator that uses a `$` amount field), the loan/amount text box clamps to the minimum on **every keystroke**.

Example: the loan field has `min={50000}`. The user clears the field and types `7` to start typing `750000`. The handler immediately sees `7 < 50000` and rewrites the value to `$50,000`. The cursor then sits after the formatted value, and any further digits are appended to `50000` instead of replacing it — so the user perceives the field as "stuck at $50,000" and cannot type a smaller or different number.

The same logic also blocks typing values larger than `max` mid-entry (e.g. typing `3` when max is `3,000,000` is fine, but typing `30000000` clamps once you exceed the cap).

This affects every screen that uses `CurrencyInput`, which `RangeField` renders whenever `prefix === "$"`. That includes Mortgage, Borrowing Power, Extra Repayments, LMI, Loan Comparison, Refinance, Rent vs Buy, Stamp Duty, HECS — i.e. every calculator's dollar fields.

The slider itself works correctly; only the typed input is broken. The non-currency `NumberInput` (rate %, term yr) does **not** clamp while typing, so those fields are fine.

## Fix

Edit `src/components/CurrencyInput.tsx` (the `handleChange` function):

1. Remove the `n < min` clamp from the keystroke handler so users can freely type any value, including transitional ones below `min`.
2. Keep the `n > max` clamp on keystroke (prevents pasting/typing past the hard ceiling without surprise).
3. Apply the `min` clamp in `onBlur` instead — when the user leaves the field, if the value is below `min` (and not zero/empty), snap it up to `min`. Empty stays empty/0.
4. Re-format the display in `onBlur` accordingly so the parent state and the visible text agree.

This is the standard "validate on blur, not on every keystroke" pattern and is the minimum change needed to unstick the input.

## Audit / scope

- `RangeField` → `CurrencyInput` is the only path where this clamp-on-type bug exists. Fixing `CurrencyInput` automatically fixes every calculator's dollar field (loan amount, deposit, property value, extra repayments, offset balance, income, expenses, etc.).
- Sliders are unaffected — they cannot produce out-of-range values.
- `NumberInput` (rate, term, percentages) already has no clamp-on-type and needs no change.

No business logic, calculation, or layout changes. Frontend-only, single file.

## Files to change

- `src/components/CurrencyInput.tsx` — adjust `handleChange` (drop min clamp) and `onBlur` (apply min clamp + reformat).
