# Caching Authority

## Cache Layers

### Layer 1: React Query (Client)
```tsx
// Lesson list — content changes infrequently
{ staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 }

// User progress — changes on every action
{ staleTime: 0, cacheTime: 5 * 60 * 1000 }

// Leaderboard — poll every 30s when visible
{ refetchInterval: 30 * 1000 }
```

### Layer 2: Next.js (ISR / Static)
- Landing page: static generation
- Lesson metadata: ISR with 1-hour revalidation
- User-specific pages: no static caching (dynamic)

### Layer 3: Redis
- **Session tokens**: TTL 7 days
- **Leaderboard**: sorted sets by age group, rebuild every 5 minutes
- **Streak data**: daily check-in timestamps, TTL 30 days
- **Rate limiting**: sliding window counters, TTL 15 minutes
- **Quiz locks**: prevent double-submit, TTL 30 seconds

### Layer 4: PostgreSQL
- Prepared statements cached per connection
- Query plan caching automatic
- Consider materialized views for aggregate dashboards

## Cache Invalidation

| Event | Invalidate |
|-------|-----------|
| Lesson completed | User progress, leaderboard |
| Quiz submitted | Quiz attempt, user XP, leaderboard |
| Badge earned | User badges, badge count |
| Content uploaded | Lesson list (ISR revalidate) |
| User role changed | Session, permissions |

## Rules

- Never cache user-specific data in shared caches
- Redis keys: prefix with `sq:` namespace (e.g., `sq:leaderboard:junior-scholars`)
- TTLs on ALL Redis keys — no unbounded growth
- Cache warming: populate leaderboard on server start
- Graceful fallback: if Redis is down, skip caching (don't crash)
