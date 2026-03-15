import { router } from '../trpc'
import { authRouter } from './auth.router'
import { lessonRouter } from './lesson.router'
import { quizRouter } from './quiz.router'
import { progressRouter } from './progress.router'
import { gamificationRouter } from './gamification.router'
import { dashboardRouter } from './dashboard.router'
import { adminRouter } from './admin.router'

export const appRouter = router({
  auth: authRouter,
  lesson: lessonRouter,
  quiz: quizRouter,
  progress: progressRouter,
  gamification: gamificationRouter,
  dashboard: dashboardRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
