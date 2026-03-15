import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { users } from '../db/schema'

export const dashboardRouter = router({
  parentOverview: protectedProcedure
    .input(z.object({ childId: z.string().uuid().optional() }))
    .query(async ({ ctx }) => {
      const children = await db
        .select()
        .from(users)
        .where(eq(users.parentId, ctx.session.user.id))

      return { children }
    }),

  teacherOverview: protectedProcedure
    .input(z.object({ classId: z.string().uuid().optional() }))
    .query(async () => {
      // Placeholder — class/student association needed for full impl
      return { students: [], averageScore: 0 }
    }),
})
