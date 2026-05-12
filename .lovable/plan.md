## Goal
Allow separate logo height control for **mobile** and **desktop** from the admin backend.

## Changes

### 1. Database migration
Add a new column `logo_height_mobile` to `site_settings` (existing `logo_height` becomes the desktop value).
```sql
alter table public.site_settings
  add column if not exists logo_height_mobile int not null default 28;
```
No data loss; existing `logo_height` stays as desktop value.

### 2. `src/hooks/useSiteSettings.ts`
- Add `logo_height_mobile: number` to `SiteSettings` interface.
- Add `logo_height_mobile: 28` to `DEFAULTS`.
- Add `logo_height_mobile` to `SELECT_COLS`.

### 3. `src/components/layout/Header.tsx`
- Destructure `logo_height_mobile` alongside `logo_height`.
- Use `logo_height_mobile` (clamped 20–60) for the mobile branch (`md:hidden` block).
- Use `logo_height` (clamped 20–72) for the desktop branch (unchanged behavior).

### 4. `src/pages/admin/AdminDashboard.tsx`
In the Branding → Logo card, replace the single slider with **two sliders**:
- **Desktop logo height** — slider 20–72px, bound to `logoHeight` state, saves `logo_height`.
- **Mobile logo height** — new slider 20–60px, bound to new `logoHeightMobile` state, saves `logo_height_mobile`.
Each has its own "Save size" button (or one combined button that saves both). Plan: one "Save sizes" button that persists both at once for simplicity.
Add live preview note showing both px values.

### 5. Tests
- Update `src/test/seo-regression.test.ts` mock to include `logo_height_mobile: 28`.
- Run vitest; update homepage snapshot only if affected (shouldn't be — default mobile height stays 28, same as current clamp result).

## Out of scope
No changes to copy, SEO, or other settings. No UI redesign — same admin card, just an extra slider.