# Skill: Scaffold Router

## Trigger
User asks to create a new tRPC router or API endpoint.

## Input
- Router name (e.g., `notification`, `achievement`)
- Procedures needed (list of queries/mutations)
- Related schema tables

## Process

1. **Load authorities**:
   - architecture.md (API patterns)
   - coding-standards.md (naming, validation)
   - security.md (auth, input validation)
   - data-engineering.md (query patterns)

2. **Check schema** — are the required tables defined?
   - If not: architect agent designs schema first
   - If yes: proceed with router

3. **Generate router file**:
   ```
   server/routers/<name>.router.ts
   ```

4. **Register in app router**:
   ```
   server/routers/_app.ts
   ```

5. **Add Zod schemas** for all inputs

6. **Generate test file**:
   ```
   server/routers/<name>.router.test.ts
   ```

## Template
```typescript
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import { tableName } from '../db/schema'

export const featureRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(tableName)
        .limit(input.limit)
        .offset(input.offset)
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .select()
        .from(tableName)
        .where(eq(tableName.id, input.id))
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' })
      return item
    }),

  create: protectedProcedure
    .input(z.object({ /* fields */ }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(tableName)
        .values(input)
        .returning()
      return created
    }),
})
```
