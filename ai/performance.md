# Performance Authority

## Budgets

| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTI (Time to Interactive) | < 3.5s | Lighthouse |
| JS Bundle (initial) | < 200KB gzipped | webpack-bundle-analyzer |
| Page weight (total) | < 1MB | DevTools |

## Next.js Optimization

### Server Components
- Default to server components — zero client JS
- Move `'use client'` as deep as possible in component tree
- Use `Suspense` boundaries for streaming

### Image Optimization
- Always use `next/image` — never raw `<img>`
- Serve WebP/AVIF via Next.js image optimizer
- Explicit `width`/`height` to prevent CLS
- Priority loading for above-fold images
- Lazy load below-fold images (default behavior)

### Code Splitting
- Dynamic imports for heavy components: `next/dynamic`
- Route-based splitting: automatic with App Router
- Lazy load: quiz engine, lesson player, admin tools

### Fonts
- `next/font` for system fonts + Indic scripts
- `font-display: swap` — never block render for fonts
- Subset Indic fonts to used characters where possible

## Data Fetching

### tRPC + React Query
- Stale time: 5 minutes for lesson lists
- Cache time: 30 minutes for static content
- Prefetch on hover for lesson cards
- Optimistic updates for quiz submissions
- Infinite queries for progress history

### Database
- Indexes on: `userId`, `lessonId`, `ageGroup`, `seriesId`, `createdAt`
- Limit result sets (pagination, not full table scans)
- Use `select()` to pick only needed columns
- Connection pooling via postgres.js

## Caching Layers

1. **Browser**: React Query in-memory cache
2. **CDN/ISR**: Next.js static generation where possible
3. **Redis**: Session data, leaderboard, streak counts
4. **Database**: Query-level caching via prepared statements

## Monitoring

- Track Core Web Vitals in production
- Alert on LCP > 4s, CLS > 0.25
- Bundle size check in CI pipeline
