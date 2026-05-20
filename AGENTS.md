# Calcy SEO Growth Engine Rules

Calcy.com.au is an Australian finance calculator platform.

Main goal:
Build an AI-powered SEO Growth Engine that improves organic traffic, rankings, internal linking, content quality, AEO visibility, and AdSense revenue without breaking existing SEO.

Always protect:
- existing URLs
- sitemap.xml
- programmatic sitemap
- metadata
- canonical tags
- schema
- calculator logic
- SSR/SSG rendering
- mobile UX
- Core Web Vitals
- existing admin features
- existing database logic

Never:
- break routes
- remove indexed pages
- auto-publish content without approval
- overwrite existing SEO content blindly
- create thin duplicate pages
- make large unrelated refactors
- damage calculator functionality

Implementation rules:
1. Work in phases only.
2. Audit before editing.
3. List files before changing them.
4. Explain SEO risks before implementation.
5. Keep all public-page changes behind admin approval.
6. Prefer suggestions first, auto-apply later.
7. Run lint/build/tests if available.
8. Preserve existing sitemap, schema, and metadata.
9. Add database migrations safely.
10. Keep backend modular and reusable.

Admin system should eventually include:
- Opportunity Radar
- Money Pages Scoring
- Internal Linking Engine
- Content Gap Analyzer
- CTR Optimization Engine
- AI Content Optimizer
- AEO Optimizer
- Topic Cluster Visualizer
- Semantic Finance Knowledge Graph
- Auto Refresh Engine
- Competitor Tracking
- Weekly SEO Briefing
