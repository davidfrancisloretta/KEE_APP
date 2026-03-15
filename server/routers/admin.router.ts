import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { desc, eq, count, inArray } from 'drizzle-orm'
import { router, protectedProcedure } from '../trpc'
import { db } from '../db'
import { contentUploads, lessons, lessonSteps, lessonReviews, users } from '../db/schema'

const ADMIN_ROLES = ['super_admin', 'content_admin', 'reviewer']

function requireAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }
}

export const adminRouter = router({
  // List all uploads with pagination
  listUploads: protectedProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.session.user.role)
      const { limit = 20, offset = 0 } = input ?? {}

      const uploads = await db
        .select({
          id: contentUploads.id,
          fileName: contentUploads.fileName,
          fileType: contentUploads.fileType,
          status: contentUploads.status,
          targetAgeGroup: contentUploads.targetAgeGroup,
          createdAt: contentUploads.createdAt,
          uploadedBy: users.name,
        })
        .from(contentUploads)
        .leftJoin(users, eq(contentUploads.uploadedBy, users.id))
        .orderBy(desc(contentUploads.createdAt))
        .limit(limit)
        .offset(offset)

      return uploads
    }),

  // Dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.session.user.role)

    const [totalLessons] = await db.select({ count: count() }).from(lessons)
    const [totalUploads] = await db.select({ count: count() }).from(contentUploads)
    const [pendingReview] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.status, 'review'))
    const [totalUsers] = await db.select({ count: count() }).from(users)

    return {
      totalLessons: totalLessons.count,
      totalUploads: totalUploads.count,
      pendingReview: pendingReview.count,
      totalUsers: totalUsers.count,
    }
  }),

  // Update upload status
  updateUploadStatus: protectedProcedure
    .input(z.object({
      uploadId: z.string().uuid(),
      status: z.enum(['uploaded', 'processing', 'parsed', 'review', 'approved', 'rejected']),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.session.user.role)

      await db
        .update(contentUploads)
        .set({ status: input.status })
        .where(eq(contentUploads.id, input.uploadId))

      return { success: true }
    }),

  // List lessons pending review
  listReviewable: protectedProcedure
    .input(z.object({
      status: z.enum(['review', 'approved', 'rejected', 'draft']).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.session.user.role)
      const { status, limit = 20, offset = 0 } = input ?? {}

      const where = status ? eq(lessons.status, status) : inArray(lessons.status, ['review', 'approved', 'rejected'])

      const items = await db
        .select({
          id: lessons.id,
          title: lessons.title,
          description: lessons.description,
          ageGroup: lessons.ageGroup,
          status: lessons.status,
          estimatedMinutes: lessons.estimatedMinutes,
          xpReward: lessons.xpReward,
          createdAt: lessons.createdAt,
        })
        .from(lessons)
        .where(where)
        .orderBy(desc(lessons.createdAt))
        .limit(limit)
        .offset(offset)

      return items
    }),

  // Get a single lesson with its steps for review
  getLessonForReview: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.session.user.role)

      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.lessonId))

      if (!lesson) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Lesson not found' })
      }

      const steps = await db
        .select()
        .from(lessonSteps)
        .where(eq(lessonSteps.lessonId, input.lessonId))
        .orderBy(lessonSteps.stepOrder)

      const reviews = await db
        .select({
          id: lessonReviews.id,
          status: lessonReviews.status,
          notes: lessonReviews.notes,
          createdAt: lessonReviews.createdAt,
          reviewerName: users.name,
        })
        .from(lessonReviews)
        .leftJoin(users, eq(lessonReviews.reviewerId, users.id))
        .where(eq(lessonReviews.lessonId, input.lessonId))
        .orderBy(desc(lessonReviews.createdAt))

      return { lesson, steps, reviews }
    }),

  // Submit a review (approve / request revision / reject)
  submitReview: protectedProcedure
    .input(z.object({
      lessonId: z.string().uuid(),
      status: z.enum(['approved', 'revision_requested', 'rejected']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.session.user.role)

      // Insert review record
      await db.insert(lessonReviews).values({
        lessonId: input.lessonId,
        reviewerId: ctx.session.user.id,
        status: input.status,
        notes: input.notes ?? null,
      })

      // Update lesson status
      const newLessonStatus = input.status === 'approved' ? 'approved'
        : input.status === 'rejected' ? 'archived'
        : 'review'

      await db
        .update(lessons)
        .set({ status: newLessonStatus, updatedAt: new Date() })
        .where(eq(lessons.id, input.lessonId))

      return { success: true }
    }),
})
