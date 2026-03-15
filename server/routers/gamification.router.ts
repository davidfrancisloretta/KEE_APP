import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { users, userBadges } from '../db/schema'

export const gamificationRouter = router({
  awardXP: protectedProcedure
    .input(z.object({ amount: z.number().positive(), reason: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: XP ledger table for full audit trail
      return { newTotal: 0, leveledUp: false }
    }),

  unlockBadge: protectedProcedure
    .input(z.object({ badgeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await db.insert(userBadges).values({
        userId: ctx.session.user.id,
        badgeId: input.badgeId,
      })
      return { success: true }
    }),

  leaderboard: protectedProcedure
    .input(
      z.object({
        ageGroup: z.enum(['little-explorers', 'junior-scholars', 'young-disciples']),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const topUsers = await db
        .select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.ageGroup, input.ageGroup))
        .limit(input.limit)

      return { entries: topUsers }
    }),
})
