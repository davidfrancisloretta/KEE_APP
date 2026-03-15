import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  users, usersRelations,
  lessons, lessonsRelations,
  lessonSteps, lessonStepsRelations,
  series,
  quizzes, quizzesRelations,
  questions, questionsRelations,
  quizAttempts, quizAttemptsRelations,
  userProgress, userProgressRelations,
  badges,
  userBadges, userBadgesRelations,
  streaks,
  contentUploads,
  lessonReviews,
} from './schema'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString)
export const db = drizzle(client, {
  schema: {
    users, usersRelations,
    lessons, lessonsRelations,
    lessonSteps, lessonStepsRelations,
    series,
    quizzes, quizzesRelations,
    questions, questionsRelations,
    quizAttempts, quizAttemptsRelations,
    userProgress, userProgressRelations,
    badges,
    userBadges, userBadgesRelations,
    streaks,
    contentUploads,
    lessonReviews,
  },
})
