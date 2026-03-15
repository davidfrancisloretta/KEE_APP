import { z } from 'zod'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '../db'
import { users } from '../db/schema'

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['child', 'parent', 'teacher']).default('child'),
        ageGroup: z
          .enum(['little-explorers', 'junior-scholars', 'young-disciples'])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists',
        })
      }

      const passwordHash = await bcrypt.hash(input.password, 12)

      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role,
          ageGroup: input.ageGroup ?? null,
        })
        .returning({ id: users.id, email: users.email, name: users.name })

      return { success: true, user }
    }),

  updateAgeGroup: protectedProcedure
    .input(
      z.object({
        ageGroup: z.enum(['little-explorers', 'junior-scholars', 'young-disciples']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({ ageGroup: input.ageGroup, updatedAt: new Date() })
        .where(eq(users.id, ctx.session.user.id))

      return { success: true }
    }),
})
