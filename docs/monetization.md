# Calcy — AdSense / Monetization Setup

## Required environment variables

Set these in your hosting provider before going live. None contain secrets — they
are publishable IDs, but they're env-driven so the same codebase ships to dev,
staging, and prod without surprises.

| Var | Purpose | Example |
|-----|---------|---------|
| `VITE_ADSENSE_CLIENT` | Your AdSense publisher ID | `ca-pub-1234567890123456` |
| `VITE_ADSENSE_SLOT_HEADER` | Slot ID for the leaderboard above each calculator | `1111111111` |
| `VITE_ADSENSE_SLOT_INLINE` | Slot ID for the in-content rectangle below the result | `2222222222` |
| `VITE_ADSENSE_SLOT_SIDEBAR` | Slot ID for the desktop sidebar (reserved; not yet rendered) | `3333333333` |
| `VITE_ADSENSE_SLOT_STICKY_MOBILE` | Slot ID for the mobile-only anchored bottom ad | `4444444444` |
| `VITE_GA4_ID` | Google Analytics 4 measurement ID | `G-XXXXXXXXXX` |

When `VITE_ADSENSE_CLIENT` is unset, every `<AdSlot>` renders a labelled
"Advertisement" placeholder so layout is preserved. The `adsbygoogle.js` script
is only injected when the client ID is present.

## ads.txt

`public/ads.txt` is served from the site root. Update the `pub-XXXXXXXXXXXXXXXX`
placeholder with the real publisher ID before submitting the site for AdSense
approval.

## Slot inventory

| Slot | Component | Where it appears |
|------|-----------|------------------|
| `header` | `<AdSlot slot="header" />` | Top of every calculator page (`CalculatorPageShell`) |
| `inline` | `<AdSlot slot="inline" />` | Below the calculator, above content sections |
| `sidebar` | `<AdSlot slot="sidebar" />` | Reserved for future two-column layout |
| `stickyMobile` | `<StickyMobileAd />` | Anchored bottom of viewport on `<md` after 400 px scroll, dismissible per session |

## Pre-approval checklist

1. 400+ words of original content per indexed page — covered by FAQ + content sections.
2. Privacy policy linked from footer — done.
3. `ads.txt` reachable at `/ads.txt` — done (pending real publisher ID).
4. Site indexed in Google Search Console — done after first deploy.
5. No prohibited content (gambling, financial-advice promises) — disclaimers in footer + Stamp Duty.
