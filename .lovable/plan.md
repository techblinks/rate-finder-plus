## Goal
Make the mobile homepage feel like a native app, matching the second reference:
- Logo on the **left**, a **search button** on the **right**
- **No divider line** under the header
- Hero keeps "Australian mortgage calculators", but **"mortgage"** is rendered in **italic blue**

## 1. Mobile header (`src/components/layout/Header.tsx`)
Replace the centered logo bar (mobile branch only, `md:hidden`) with:
- `flex items-center justify-between`, height 60px, **no `border-b`**, white background blending into hero
- **Left:** existing `<Link to="/">` Calcy logo (unchanged size)
- **Right:** 40×40 icon button (lucide `Search`) that opens a global search sheet
- Keep `env(safe-area-inset-top)` padding
- Desktop branch (`hidden md:block`) untouched

## 2. Global search (mobile)
New component `src/components/mobile/MobileSearchSheet.tsx`:
- Open state lifted into Header via `useState`
- Full-screen slide-down overlay with:
  - Search input (autoFocus) + Cancel button
  - Live filter over a static index of routes: 8 calculators, Guides index, top guide slugs, Stamp Duty state pages
  - Grouped results: **Calculators**, **Guides**, **Pages**
  - Tap → navigate + close; ESC / Cancel / backdrop closes
- Index built from existing `CALCULATORS` list + `src/data/allGuides.ts` + `src/data/routes.ts` (no new data files)
- Pure client-side lowercase `includes` match, no backend

## 3. Hero copy (`src/components/mobile/MobileHomepage.tsx`)
Keep the H1 text as **"Australian mortgage calculators"** but render "mortgage" as `<em>` styled `font-serif italic text-accent` (brand blue `#0162E3`):
```
Australian <em>mortgage</em> calculators
```
- Bump H1 to `text-[28px]`, tighten leading to match reference proportions
- Subhead, RBA chip, and everything below unchanged

## 4. SEO / AEO safety
- Visible H1 text reads identically to before — only "mortgage" gets italic styling
- Page `<title>`, meta description, JSON-LD, llms.txt all unchanged
- Desktop H1 unchanged
- No changes to FAQ schema, sitemaps, or content data

## 5. Tests
- Run vitest suite; update only the mobile homepage snapshot if it fails (cosmetic-only diff)
- Confirm 831 tests pass

## Technical notes
- Search sheet rendered as portal sibling so it overlays everything below safe-area
- Search button uses existing `text-accent` + `active:scale-95` pattern from `MobileCalcHeader`
- No changes to `MobileBottomNav`, routing, or any calculator logic
