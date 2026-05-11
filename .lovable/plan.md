# Calcy — Bug fixes + AU SEO/UX/Speed Master Plan

## Part 1 — Two critical bug fixes (do first)

### 1.1 Cookie banner unusable on mobile
**Cause:** `CookieConsent` is fixed at `bottom-0` and overlaps `MobileBottomNav` (also at `bottom-0`, 64px tall + safe-area). On small phones the "Accept all" / "Manage preferences" buttons land *underneath* the bottom nav so taps go to the wrong element. The dialog itself is z-10000 (visible) but the bottom-nav still receives clicks at the overlap rectangle on some browsers, and on very short viewports the buttons fall off-screen.

**Fix:**
- Lift the banner above the bottom nav on mobile: `bottom: calc(64px + env(safe-area-inset-bottom))` (md:bottom-0 keeps desktop unchanged).
- Mobile layout: compact single-row with text truncated to 2 lines, large 44px "Accept all" primary button and a smaller text "Manage" link — guarantees the primary action is always visible.
- Add `pointer-events-auto` and verify backdrop doesn't block.
- Hide `MobileBottomNav` while the cookie dialog is visible (or just z-order: nav `z-30`, cookie `z-50`).

### 1.2 Desktop "More calculators" dropdown disappears on hover-to-click
**Cause:** In `Header.tsx` the dropdown panel is `absolute top-full mt-2` — the 8px gap between trigger and panel breaks `onMouseLeave`, so moving the cursor toward an item closes the menu before the click registers.

**Fix:**
- Remove the visible gap: drop `mt-2`, instead pad the panel top so it's visually offset but mouse-contiguous.
- Wrap trigger + panel in a single hover container (already done) and add a small `before:` bridge or `pt-2` *inside* the wrapper.
- Add focus/click intent: open on click as well, close on outside-click and Escape — not just hover. Use `data-state` so keyboard users work.
- Replace ad-hoc menu with the existing Radix `dropdown-menu` component (`src/components/ui/dropdown-menu.tsx`) for accessibility and click-stickiness.

---

## Part 2 — System audit (UX, SEO, performance)

Findings from auditing the codebase against the live preview:

### UX issues
- Mobile drawer works but lacks active-state polish, swipe-to-close, and "Home" link.
- Cookie banner blocking primary CTAs on first visit (above).
- Result panels are full-bleed on mobile but inputs below the fold — no scroll cue. Add a subtle "Adjust inputs ↓" chip beneath the result on first paint.
- Sticky mobile result bar (`MobileStickyResultBar`) and bottom nav stack — verify only one shows at a time per route to avoid 128px of bottom chrome.
- Inconsistent CTA tone across calculators (some say "Get rate", others "Compare lenders"). Standardise.
- Guides index lacks visual hierarchy; thumbnails would lift engagement signals.

### SEO issues (AU ranking)
- Missing AU-specific signals: only some pages reference `/au/`, sitemap doesn't separate AU vs US/CA properly.
- No `LocalBusiness` or `FinancialService` schema with AU address/region.
- Stamp Duty state pages should target `["Stamp duty NSW","Stamp duty VIC", ...]` — verify each has unique H1, meta description, 800–1200 localised words, and internal links to the parent calculator + relevant guide.
- Internal linking is sparse: every calculator should link to 3 related calculators + 3 guides with descriptive anchors.
- FAQ JSON-LD present (good) but check `HowTo` schema on calculators (`scripts/howTos.generated.mjs`) is wired into every page.
- Add `BreadcrumbList` JSON-LD to all non-home routes (component exists, ensure used).
- Missing `hreflang` for AU as default + en-US/en-CA alternates.
- Sitemap freshness: confirm `<lastmod>` updates on content change, and submit `sitemap.xml` + RSS to GSC.
- E-E-A-T: add author bios, "last reviewed" dates, and citations to RBA/ABS on rates/stamp duty pages.
- Core Web Vitals are a ranking factor — covered in Part 3.

### Content gaps (high-intent AU keywords)
- "first home buyer grant [state]" — one page per state.
- "stamp duty calculator [state] 2026" — refresh year, add LMI waiver scenarios.
- "RBA cash rate forecast" + monthly auto-generated article via existing `generate-rba-article` edge function.
- "best home loan rates Australia" comparison hub.
- Suburb-level borrowing-power programmatic pages (top 200 AU suburbs).

### Performance issues
- AdSense + Google scripts load early — biggest LCP/INP cost. Defer ads until after main thread is idle and after first user interaction.
- Multiple sticky/fixed components on mobile cause layout work on scroll.
- Calculator pages import all calculator components eagerly via `App.tsx` routes — verify each route is `lazy()` loaded.
- Logo is `.webp` (good) but check `fetchPriority="high"` only on above-the-fold image, others lazy.
- Tailwind class strings inside large calculators create big HTML payloads — measure and consider extracting repeated panel markup.
- `framer-motion` (if used) — replace with CSS for trivial transitions.
- Service worker registered but not pre-caching critical routes.

---

## Part 3 — Action plan (prioritised)

### Sprint 1: Critical bug fixes + perf foundation (week 1)
1. Fix cookie banner mobile (1.1).
2. Replace "More calculators" custom dropdown with Radix `DropdownMenu` (1.2).
3. Lazy-load all calculator routes with `React.lazy` + `Suspense` fallback skeleton.
4. Defer AdSense: load `adsbygoogle.js` on `requestIdleCallback` and only after user interaction or 3s timeout; render placeholder boxes immediately to reserve space (no CLS).
5. Add `loading="lazy"` and `decoding="async"` to all non-hero images; preconnect to AdSense/GA domains.
6. Pre-cache shell + home + top 3 calculators in `sw.js` with stale-while-revalidate.

### Sprint 2: SEO foundation (week 2)
7. Add `BreadcrumbList`, `FinancialService`, `WebSite` + `SearchAction` JSON-LD to all relevant pages.
8. Add `hreflang` (`en-AU` default, `en-US`, `en-CA`, `x-default`) to every page.
9. Standardise meta titles `<60` chars, descriptions `<160`, single H1 per page, alt text everywhere.
10. Author bios + "Last reviewed: {date}" component on every calculator and guide; cite RBA/ABS.
11. Internal-linking pass: each calculator page renders 3 related calculators + 3 related guides with keyword anchors (component exists — populate data).
12. Refresh sitemap generator: split by region, include `<lastmod>` from content frontmatter, ping GSC.

### Sprint 3: Content depth for AU rankings (weeks 3–4)
13. State stamp-duty pages: ensure 1000+ word localised content, FHB concessions table, "last reviewed" date, FAQ schema.
14. First home buyer grant page per state (8 new pages).
15. Suburb borrowing-power programmatic pages — start with 50, expand to 200.
16. Monthly RBA forecast article auto-published via existing edge function — verify cron and quality.
17. Comparison hub: "Best home loans Australia 2026" with affiliate CTAs (respect existing financial disclaimer).

### Sprint 4: UX polish + Core Web Vitals (week 5)
18. Run Lighthouse on top 10 pages, target LCP < 2.0s, INP < 200ms, CLS < 0.05.
19. Replace any remaining JS animations with CSS `transform`/`opacity` only.
20. Move heaviest calculator engines (`mortgageEngine`, amortisation table) to a Web Worker so the main thread stays responsive while sliders drag.
21. Audit Tailwind output — purge unused, ensure single CSS file < 60kb gzipped.
22. Mobile drawer: add swipe-to-close, scroll-lock fade backdrop, active-route highlight, "Home" entry.
23. Standardise calculator CTAs and result-panel copy.

### Sprint 5: Monitoring & iteration (ongoing)
24. Wire Web Vitals reporting to your analytics so regressions are caught.
25. Weekly GSC review: top queries, CTR, position; tune titles where CTR < 3% and position 5–15.
26. A/B test result-panel CTA copy via existing analytics.

---

## Technical notes (for the engineer)
- Cookie fix: `src/components/CookieConsent.tsx` — change `bottom-0` to responsive: `style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}` on mobile (via Tailwind `md:bottom-0` plus inline style or new CSS class). Z-order: cookie `z-[60]`, bottom nav `z-30`.
- Dropdown fix: `src/components/layout/Header.tsx` — swap the custom `moreOpen` state for `DropdownMenu` from `@/components/ui/dropdown-menu`. Keeps styling via existing `dropdown-panel-redesign` class on `DropdownMenuContent`.
- AdSense defer: `src/components/AdSlot.tsx` + `src/lib/adsense.ts` — gate the `(adsbygoogle = window.adsbygoogle || []).push({})` behind `requestIdleCallback` and `IntersectionObserver` (only when slot enters viewport).
- Web Worker: new `src/workers/mortgage.worker.ts` wrapping `src/lib/calc/mortgageEngine.ts`; `useDebouncedCalculate` posts messages to it.
- Sitemap: `scripts/build-sitemap.mjs` already exists — extend with region groups and accurate `lastmod`.

---

## Out of scope (won't touch unless asked)
- No backend schema changes.
- No new auth flows.
- No design-system overhaul — keep existing navy + DM Mono identity.
- No replacement of existing calculator math.

Approving this plan will execute Sprint 1 first (bug fixes + perf foundation) so you see results immediately, then I'll check in before moving to Sprint 2.
