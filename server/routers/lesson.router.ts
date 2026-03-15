import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '../db'
import { lessons, lessonSteps, userProgress } from '../db/schema'

export const lessonRouter = router({
  list: publicProcedure
    .input(
      z.object({
        ageGroup: z.enum(['little-explorers', 'junior-scholars', 'young-disciples']).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(lessons.status, 'published')]
      if (input.ageGroup) {
        conditions.push(eq(lessons.ageGroup, input.ageGroup))
      }

      const result = await db
        .select()
        .from(lessons)
        .where(and(...conditions))
        .orderBy(lessons.sortOrder)
        .limit(input.limit)

      return { lessons: result }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, input.id),
        with: { steps: true },
      })
      return lesson ?? null
    }),

  markComplete: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await db.insert(userProgress).values({
        userId: ctx.session.user.id,
        lessonId: input.lessonId,
        completed: true,
        completedAt: new Date(),
      })
      return { success: true }
    }),
})
