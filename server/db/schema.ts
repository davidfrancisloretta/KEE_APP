import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ──────────────────────────────────────────────

export const ageGroupEnum = pgEnum('age_group', [
  'little-explorers',
  'junior-scholars',
  'young-disciples',
])

export const userRoleEnum = pgEnum('user_role', [
  'child',
  'parent',
  'teacher',
  'content_admin',
  'super_admin',
  'reviewer',
])

export const lessonStatusEnum = pgEnum('lesson_status', [
  'draft',
  'ai_processing',
  'review',
  'approved',
  'published',
  'archived',
])

export const questionTypeEnum = pgEnum('question_type', [
  'multiple_choice',
  'true_false',
  'fill_blank',
  'drag_drop',
])

// ── Users ──────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('child'),
  ageGroup: ageGroupEnum('age_group'),
  avatarUrl: text('avatar_url'),
  xp: integer('xp').default(0).notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  parent: one(users, { fields: [users.parentId], references: [users.id] }),
  progress: many(userProgress),
  quizAttempts: many(quizAttempts),
  badges: many(userBadges),
}))

// ── Lessons ────────────────────────────────────────────

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    ageGroup: ageGroupEnum('age_group').notNull(),
    status: lessonStatusEnum('status').notNull().default('draft'),
    sortOrder: integer('sort_order').default(0),
    seriesId: uuid('series_id'),
    thumbnailUrl: text('thumbnail_url'),
    estimatedMinutes: integer('estimated_minutes'),
    xpReward: integer('xp_reward').default(10),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ageGroupIdx: index('lessons_age_group_idx').on(table.ageGroup),
    statusIdx: index('lessons_status_idx').on(table.status),
  })
)

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  series: one(series, { fields: [lessons.seriesId], references: [series.id] }),
  steps: many(lessonSteps),
  quizzes: many(quizzes),
}))

// ── Lesson Steps ───────────────────────────────────────

export const lessonSteps = pgTable('lesson_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'narration', 'illustration', 'interaction', 'video'
  content: jsonb('content').notNull(), // flexible JSON payload per type
  audioUrl: text('audio_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const lessonStepsRelations = relations(lessonSteps, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonSteps.lessonId], references: [lessons.id] }),
}))

// ── Series ─────────────────────────────────────────────

export const series = pgTable('series', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  ageGroup: ageGroupEnum('age_group').notNull(),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Quizzes ────────────────────────────────────────────

export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  passingScore: integer('passing_score').default(70),
  xpReward: integer('xp_reward').default(20),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, { fields: [quizzes.lessonId], references: [lessons.id] }),
  questions: many(questions),
  attempts: many(quizAttempts),
}))

// ── Questions ──────────────────────────────────────────

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id')
    .notNull()
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  type: questionTypeEnum('type').notNull(),
  questionText: text('question_text').notNull(),
  options: jsonb('options'), // array of { label, value, isCorrect }
  correctAnswer: text('correct_answer').notNull(),
  hints: jsonb('hints'), // array of 3 progressive hints
  sortOrder: integer('sort_order').default(0),
  difficultyLevel: integer('difficulty_level').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
}))

// ── Quiz Attempts ──────────────────────────────────────

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    quizId: uuid('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    score: integer('score'),
    passed: boolean('passed').default(false),
    answers: jsonb('answers'), // { questionId, selectedAnswer, correct }[]
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    userIdx: index('quiz_attempts_user_idx').on(table.userId),
  })
)

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
}))

// ── User Progress ──────────────────────────────────────

export const userProgress = pgTable(
  'user_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id),
    lastStep: integer('last_step').default(0),
    completed: boolean('completed').default(false),
    completedAt: timestamp('completed_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userLessonIdx: index('user_progress_user_lesson_idx').on(table.userId, table.lessonId),
  })
)

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [userProgress.lessonId], references: [lessons.id] }),
}))

// ── Gamification ───────────────────────────────────────

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  xpThreshold: integer('xp_threshold'),
  criteria: jsonb('criteria'), // flexible unlock conditions
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp('earned_at').defaultNow().notNull(),
  },
  (table) => ({
    userBadgeIdx: index('user_badges_user_idx').on(table.userId),
  })
)

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}))

// ── Streaks ────────────────────────────────────────────

export const streaks = pgTable('streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Admin: Content Pipeline ────────────────────────────

export const contentUploads = pgTable('content_uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => users.id),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 20 }).notNull(), // 'docx' | 'pptx'
  fileUrl: text('file_url').notNull(),
  extractedContent: jsonb('extracted_content'),
  status: varchar('status', { length: 50 }).notNull().default('uploaded'),
  targetAgeGroup: ageGroupEnum('target_age_group'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const lessonReviews = pgTable('lesson_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id),
  reviewerId: uuid('reviewer_id')
    .notNull()
    .references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(), // 'approved' | 'revision_requested' | 'rejected'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
