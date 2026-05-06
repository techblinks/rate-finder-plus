## Goal
Replace the empty gradient strips at the top of the four "Current in home loans" cards with bold **stat tiles** so the section looks like a real fintech dashboard.

## Changes — `src/pages/Home.tsx` only

### 1. Extend `CURRENT_CARDS` data with stat fields
Add three fields per card (no copy changes to existing `tag`, `headline`, `body`, `cta`, `to`):
- `stat`: the big number
- `statLabel`: small caption underneath
- `trend`: `"up" | "down" | "neutral"` for the icon

| Card | stat | statLabel | trend |
|---|---|---|---|
| Rate update | `4.10%` | RBA cash rate · May 2026 | down |
| First home buyers | `$800k` | NSW stamp duty exemption cap | neutral |
| Buying costs | `20%` | Deposit to avoid LMI | neutral |
| Refinancing | `$74,880` | Saved on a $650k loan over 30 years | up |

### 2. Replace the gradient header block in the JSX
Currently:
```tsx
<div className="relative h-32 p-5 ..." style={{ background: "linear-gradient(...)" }}>
  <span className="badge ...">{c.tag}</span>
</div>
```
Becomes a clean white panel with:
- The existing `<span className="badge badge-brand">{c.tag}</span>` in the top-left
- A small trend chip in the top-right (TrendingDown / TrendingUp / Minus icon from lucide-react, color-tinted: green for down-rates/savings, blue for neutral)
- A large `font-display` number (`text-[40px] font-extrabold`) showing `c.stat`
- Caption `text-[12px] text-muted-foreground` showing `c.statLabel`
- Subtle bottom hairline (`border-b border-border`) to separate from the body

Background: solid `bg-surface` (the pale-blue) for the top panel — keeps brand consistency, removes the unfinished gradient look.

### 3. Imports
Add `TrendingDown, TrendingUp, Minus` to the existing `lucide-react` import.

## Result
Each card shows: brand-tinted top half with badge + trend chip + big stat + label, then the existing white bottom half with headline + body + CTA pill. No new images, no copy changes, no SEO impact.
