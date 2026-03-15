import { z } from 'zod'
import { eq, desc, count } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { users, userProgress, quizAttempts, streaks, userBadges, badges } from '../db/schema'

export const progressRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    const [lessonsResult] = await db
      .select({ value: count() })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))

    const [quizzesResult] = await db
      .select({ value: count() })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))

    const streak = await db.query.streaks.findFirst({
      where: eq(streaks.userId, userId),
    })

    const earnedBadges = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))

    const totalXP = user?.xp ?? 0
    const level = Math.floor(totalXP / 100) + 1
    const xpInLevel = totalXP % 100

    return {
      totalXP,
      level,
      xpInLevel,
      xpToNextLevel: 100,
      lessonsCompleted: lessonsResult?.value ?? 0,
      quizzesPassed: quizzesResult?.value ?? 0,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      badges: earnedBadges,
    }
  }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      const completed = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, ctx.session.user.id))
        .orderBy(desc(userProgress.updatedAt))
        .limit(input.limit)

      return { activities: completed }
    }),
})
