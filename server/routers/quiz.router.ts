import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { db } from '../db'
import { quizzes, questions, quizAttempts } from '../db/schema'

export const quizRouter = router({
  getById: publicProcedure
    .input(z.object({ quizId: z.string().uuid() }))
    .query(async ({ input }) => {
      const quiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.id, input.quizId),
        with: { questions: true },
      })
      if (!quiz) return null

      return {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        xpReward: quiz.xpReward,
        questions: quiz.questions
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((q) => ({
            id: q.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options as { label: string; value: string }[] | null,
            hints: q.hints as string[] | null,
            sortOrder: q.sortOrder,
          })),
      }
    }),

  start: protectedProcedure
    .input(z.object({ quizId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const quiz = await db.query.quizzes.findFirst({
        where: eq(quizzes.id, input.quizId),
        with: { questions: true },
      })
      if (!quiz) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quiz not found' })
      }

      const [attempt] = await db
        .insert(quizAttempts)
        .values({ userId: ctx.session.user.id, quizId: input.quizId })
        .returning()

      const safeQuestions = quiz.questions
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((q) => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          hints: q.hints,
          sortOrder: q.sortOrder,
        }))

      return { attemptId: attempt.id, questions: safeQuestions }
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().uuid(),
        questionId: z.string().uuid(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const question = await db.query.questions.findFirst({
        where: eq(questions.id, input.questionId),
      })
      if (!question) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Question not found' })
      }

      const correct = question.correctAnswer === input.answer
      return {
        correct,
        hint: correct ? null : 'Try again — look carefully at the scripture passage.',
      }
    }),

  complete: protectedProcedure
    .input(z.object({ attemptId: z.string().uuid(), score: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(quizAttempts)
        .set({ score: input.score, passed: input.score >= 70, completedAt: new Date() })
        .where(eq(quizAttempts.id, input.attemptId))

      return { score: input.score, passed: input.score >= 70 }
    }),
})
