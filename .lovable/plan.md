# Add News Section to Calcy

A new `/news` content area for RBA, mortgage and property news, backed by a new Supabase table, with listing + article pages, NewsArticle JSON-LD, and nav entries. No existing calculators, guides, or SEO content will be touched.

## Database

New table `public.news_articles`:

- `id` uuid primary key (default `gen_random_uuid()`)
- `title` text not null
- `slug` text not null unique
- `excerpt` text
- `body` text
- `published_at` timestamptz
- `is_published` boolean default false
- `author` text default `'Calcy Team'`
- `created_at` timestamptz default `now()`

RLS:
- Public can read only rows where `is_published = true`.
- Admins (via existing `has_role(auth.uid(), 'admin')`) have full access.

Index on `(is_published, published_at desc)` for listing performance.

## Routes & Pages

- `/news` — `src/pages/NewsIndex.tsx`
  - Title: "Australian Mortgage & Property News"
  - Meta description: "Latest RBA rate decisions, property market updates and mortgage news for Australian homeowners and buyers."
  - H1: "Latest mortgage & property news"
  - Fetches published articles ordered by `published_at desc`.
  - Card grid: headline, formatted date, 150-char excerpt (truncated from `excerpt` or `body`), "Read more" link to `/news/[slug]`.
  - Pagination: 12 per page using `?page=N` query param (range query against Supabase).
  - Empty state: "Check back soon for the latest RBA and property news."

- `/news/:slug` — `src/pages/NewsArticlePage.tsx`
  - Fetches single published article by slug; 404 if missing.
  - H1 = headline; shows published date and author (default "Calcy Team"); renders body.
  - Meta title = headline (via existing title template); meta description = excerpt.
  - JSON-LD `NewsArticle` (headline, datePublished, author, description, mainEntityOfPage) emitted via the existing `JsonLd` component pattern.
  - Bottom "Related calculators" section linking to `/mortgage-calculator`, `/borrowing-power`, `/refinance` (using existing route paths).

Both routes registered in `src/App.tsx` as lazy-loaded routes alongside existing entries.

## Navigation

- Desktop: add "News" link in `src/components/layout/Header.tsx`, placed alongside the existing Guides/Compare entries.
- Mobile: add "News" item in `src/components/MobileBottomNav.tsx` between Guides and Compare.

No other nav items are reordered or restyled.

## SEO

- Listing page: standard Helmet meta + canonical.
- Article page: NewsArticle JSON-LD only (no FAQ/Breadcrumb duplication concerns since these are new routes and prerender will not target them initially).

## Out of scope

- No admin CRUD UI for news in this task (content can be inserted directly in the backend until an editor is requested).
- No prerender/sitemap integration changes — can be added in a follow-up.
- No edits to existing calculators, guides, or SEO content.

## Files

New:
- `src/pages/NewsIndex.tsx`
- `src/pages/NewsArticlePage.tsx`
- `src/components/news/NewsCard.tsx` (small card component)

Edited:
- `src/App.tsx` (route registration)
- `src/components/layout/Header.tsx` (desktop nav)
- `src/components/MobileBottomNav.tsx` (mobile nav)

Migration:
- New `news_articles` table + RLS policies + index.
