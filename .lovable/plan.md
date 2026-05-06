## Goal

Restyle the visual presentation of the site to match the look-and-feel of moneysmart.gov.au — rounded card-based hero, soft pastel section bands, pill-style topic chips, photo-rich content cards, and the same typeface family. **No copy, route, schema, or SEO content changes.** All existing text, FAQs, JSON-LD, canonicals, and calculator logic stay exactly as-is.

## Reference design cues (from attachment)

- **Typography**: Moneysmart uses a geometric humanist sans (Graphik/Inter-like) with bold weights for headings. We'll switch the heading font to **Plus Jakarta Sans** (close visual match, free on Google Fonts), keep **Inter** for body.
- **Hero**: Three-tile rounded composition — large solid-blue tile (heading + CTA), center photo tile, light-blue text tile. Heavy border-radius (~24px).
- **Section bands**: Alternating `#FFFFFF` and very pale blue (`#EAF2FF`-ish) full-width bands.
- **Topic pills**: White pills with thin border on a pale-blue band (we already have similar — refine sizing/shadow).
- **Calculator cards**: White cards with soft shadow, big icon at the bottom, "Get started ↗" pill button in brand blue.
- **Content cards**: Image-led cards with overlay text + bottom CTA pill (we'll use illustrative gradient placeholders since we won't fetch new photography unless requested).
- **Newsletter strip**: Dark band with inline CTA (we don't currently have one — skipping unless user wants it; not adding new content).
- **Buttons**: Pill-shaped (full radius), with small ↗ arrow icon.

## Changes

### 1. Fonts (`index.html` + `tailwind.config.ts` + `src/index.css`)
- Add Google Fonts link for `Plus Jakarta Sans` (400, 500, 600, 700, 800) alongside existing Inter.
- Add `display` font family in Tailwind: `font-display: 'Plus Jakarta Sans'`.
- Apply `Plus Jakarta Sans` to all `h1/h2/h3/h4` via `@layer base` in `index.css`.

### 2. Color tokens (`src/index.css`)
- Adjust `--surface` to a softer pale-blue `#EAF2FF` (matches Moneysmart bands) — affects existing `bg-surface` sections automatically. `--background` stays white.
- Add `--radius-xl: 24px` for hero/feature tiles.

### 3. Hero restyle (`src/pages/Home.tsx`)
- Convert hero into the **3-tile rounded layout**:
  - Left: solid-blue rounded tile (`rounded-[24px]`) with the existing H1, sub-line, and a white pill CTA "Get started ↗" linking to `/mortgage-calculator`.
  - Middle: rounded tile with a CSS gradient/illustration block (no new image fetch) — same height.
  - Right: pale-blue rounded tile containing the existing trust line ("6 calculators · All 8 states · Updated monthly") expanded into a short paragraph using existing words only.
- Keep the Quick Estimate card but move it to a separate section directly below the hero (so we don't lose functionality), styled as a white rounded-xl card with soft shadow.

### 4. Topic pills section
- Keep content. Restyle pills to match: white background, subtle 1px border, slight shadow on hover, sit on the new pale-blue band.

### 5. Calculator grid
- Restyle `.calc-card`: increase radius to `rounded-2xl`, add soft shadow `shadow-[0_2px_8px_rgba(15,17,23,0.04)]`, hover lifts shadow.
- Move icon to bottom-left of card, "Get started ↗" becomes a small blue pill button at the bottom.
- Heading centered or left-aligned matching reference.

### 6. "Current in home loans" cards
- Convert to image-led look: top portion uses a tinted gradient block (no new images) with the badge overlay, bottom white area with headline + CTA pill.
- Rounded `2xl`, soft shadow.

### 7. Why Calcy section
- Keep three columns. Restyle icon chips to larger rounded squares with brand-blue tint, matching reference's iconography style.

### 8. Header (`src/components/layout/Header.tsx`)
- Apply heading font to nav-less elements? Nav stays Inter. Add "Search" + menu pill buttons styling tweak only if user wants — **skip for now to preserve current header/logo behavior**.
- No logo changes.

### 9. Footer
- Light restyle: keep all links and disclaimer text verbatim; switch background to white with thin top border, add a tiny "Calcy" wordmark line. No content change.

## Out of scope (explicitly NOT touching)

- All copy, headings, FAQs, JSON-LD, canonical URLs, sitemap, robots.
- Calculator math, routes, components in `src/components/calculators/`.
- Admin pages, auth, Supabase schema.
- The logo file or favicon set.

## Files to edit

- `index.html` — add Plus Jakarta Sans link
- `tailwind.config.ts` — add `display` font family
- `src/index.css` — surface color tweak, heading font, radius token, card shadow utilities
- `src/pages/Home.tsx` — restructure hero into 3-tile layout, restyle sections (no copy changes)
- `src/components/layout/Footer.tsx` — minor visual tweak only

## Verification

After implementing, confirm in preview:
- All existing text strings are unchanged (will diff `Home.tsx` strings).
- All routes/links unchanged.
- SEO components (`SeoHead`, `BreadcrumbJsonLd`) untouched.
- New typeface loads; sections have alternating white / pale-blue bands; cards are rounded-2xl with soft shadow.
