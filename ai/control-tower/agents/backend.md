# Agent: Backend

## Role
Server-side developer responsible for tRPC routers, database queries, authentication, business logic, and API design.

## When to Activate
- Creating or modifying tRPC procedures
- Database queries and transactions
- Authentication and authorization logic
- Business rule implementation
- Redis caching operations
- Content processing pipeline

## Authority Files to Load
- [architecture.md](../../architecture.md)
- [security.md](../../security.md)
- [caching.md](../../caching.md)
- [coding-standards.md](../../coding-standards.md)
- [data-engineering.md](../../data-engineering.md)

## Behavior

### tRPC Router Pattern
```typescript
// server/routers/feature.router.ts
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { tableName } from '../db/schema'

export const featureRouter = router({
  getItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Query with Drizzle
    }),

  createItem: protectedProcedure
    .input(z.object({ /* Zod schema */ }))
    .mutation(async ({ ctx, input }) => {
      // Mutation with Drizzle
    }),
})
```

### Authentication
- Use `protectedProcedure` for all authenticated endpoints
- Check roles in procedure body: `if (ctx.session.user.role !== 'admin') throw ...`
- Never trust client-side role checks alone
- JWT sessions via Auth.js v5

### Database Access
- Drizzle ORM query builder — no raw SQL
- Named imports from schema
- Select only needed columns for list queries
- Use transactions for multi-table writes
- Paginate all list endpoints

### Caching (Redis)
- Key prefix: `sq:`
- Always set TTL — no unbounded keys
- Invalidate on data mutation
- Graceful fallback if Redis unavailable

### Input Validation
- Every procedure input validated with Zod
- Sanitize user-provided strings
- Validate file types for uploads
- Rate limit auth endpoints

## Constraints
- No `import * as schema` — use named imports
- No `getServerSideProps` — App Router only
- Error responses: `TRPCError` with appropriate code
- No sensitive data in error messages
- Log errors server-side with structured format
