// Seed Script - scans content folders, parses lessons, inserts into PostgreSQL.
// Usage: npx tsx scripts/seed.ts

import fs from 'fs'
import path from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import {
  series,
  lessons,
  lessonSteps,
  quizzes,
  questions,
  badges,
} from '../server/db/schema'
import { parseLesson, type ParsedLesson } from './parse-content'

// ── Config ─────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://sq:sq@localhost:5433/scripturequest'
const ROOT = path.resolve(__dirname, '..')

interface ContentSource {
  folder: string
  ageGroup: ParsedLesson['ageGroup']
  seriesName: string
  filePattern: 'flat' | 'nested'       // flat = *.pdf in folder, nested = Lesson N/**/*.docx
  preferDocx: boolean
}

const SOURCES: ContentSource[] = [
  {
    folder: 'Beginners',
    ageGroup: 'little-explorers',
    seriesName: 'Beginners — God\'s Story',
    filePattern: 'flat',
    preferDocx: false,
  },
  {
    folder: 'Biblical Doctrines/Level 1',
    ageGroup: 'junior-scholars',
    seriesName: 'Biblical Doctrines — Level 1',
    filePattern: 'nested',
    preferDocx: true,
  },
  {
    folder: 'Biblical Doctrines/Level 2&3',
    ageGroup: 'young-disciples',
    seriesName: 'Biblical Doctrines — Level 2 & 3',
    filePattern: 'nested',
    preferDocx: true,
  },
  {
    folder: 'Biblical Covenants/Level 1',
    ageGroup: 'junior-scholars',
    seriesName: 'Biblical Covenants — Level 1',
    filePattern: 'nested',
    preferDocx: true,
  },
  {
    folder: 'Biblical Covenants/Level 2 &3',
    ageGroup: 'young-disciples',
    seriesName: 'Biblical Covenants — Level 2 & 3',
    filePattern: 'nested',
    preferDocx: true,
  },
]

// ── File Discovery ─────────────────────────────────────

function discoverFiles(source: ContentSource): string[] {
  const base = path.join(ROOT, source.folder)
  if (!fs.existsSync(base)) {
    console.log(`  [skip] Folder not found: ${source.folder}`)
    return []
  }

  if (source.filePattern === 'flat') {
    return fs
      .readdirSync(base)
      .filter((f) => f.endsWith('.pdf') || f.endsWith('.docx'))
      .sort((a, b) => {
        const na = parseInt(a.match(/Lesson\s*(\d+)/i)?.[1] ?? '0')
        const nb = parseInt(b.match(/Lesson\s*(\d+)/i)?.[1] ?? '0')
        return na - nb
      })
      .map((f) => path.join(base, f))
  }

  // Nested: each "Lesson N" subfolder
  const lessonDirs = fs
    .readdirSync(base)
    .filter((d) => /^Lesson/i.test(d) && fs.statSync(path.join(base, d)).isDirectory())
    .sort((a, b) => {
      const na = parseInt(a.match(/(\d+)/)?.[1] ?? '0')
      const nb = parseInt(b.match(/(\d+)/)?.[1] ?? '0')
      return na - nb
    })

  const files: string[] = []

  for (const dir of lessonDirs) {
    const dirPath = path.join(base, dir)
    const dirFiles = fs.readdirSync(dirPath)

    // Prefer .docx over .pdf if configured
    let chosen: string | undefined
    if (source.preferDocx) {
      chosen = dirFiles.find((f) => f.endsWith('.docx'))
    }
    if (!chosen) {
      chosen = dirFiles.find((f) => f.endsWith('.pdf') || f.endsWith('.docx'))
    }

    if (chosen) {
      files.push(path.join(dirPath, chosen))
    }
  }

  return files
}

// ── Seed Logic ─────────────────────────────────────────

async function seed() {
  console.log('ScriptureQuest Seed Script')
  console.log('=========================\n')

  const sql = postgres(DATABASE_URL)
  const db = drizzle(sql)

  let totalLessons = 0
  let totalSteps = 0
  let totalQuestions = 0

  for (const source of SOURCES) {
    console.log(`\n📂 ${source.seriesName} (${source.ageGroup})`)
    console.log(`   Folder: ${source.folder}`)

    const files = discoverFiles(source)
    if (files.length === 0) continue

    console.log(`   Found ${files.length} lesson files`)

    // Create or find series
    const existingSeries = await db
      .select()
      .from(series)
      .where(eq(series.title, source.seriesName))

    let seriesId: string

    if (existingSeries.length > 0) {
      seriesId = existingSeries[0].id
      console.log(`   Series exists: ${seriesId}`)
    } else {
      const [newSeries] = await db
        .insert(series)
        .values({
          title: source.seriesName,
          description: `${source.seriesName} curriculum for ${source.ageGroup}`,
          ageGroup: source.ageGroup,
        })
        .returning()
      seriesId = newSeries.id
      console.log(`   Created series: ${seriesId}`)
    }

    // Process each lesson file
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]
      const fileName = path.basename(filePath)

      try {
        console.log(`   [${i + 1}/${files.length}] Parsing: ${fileName}`)

        const parsed = await parseLesson(filePath, source.ageGroup)

        // Insert lesson
        const [lesson] = await db
          .insert(lessons)
          .values({
            title: parsed.title,
            description: parsed.description,
            ageGroup: parsed.ageGroup,
            status: 'published',
            sortOrder: i + 1,
            seriesId,
            estimatedMinutes: parsed.estimatedMinutes,
            xpReward: parsed.xpReward,
          })
          .returning()

        totalLessons++

        // Insert lesson steps
        if (parsed.steps.length > 0) {
          await db.insert(lessonSteps).values(
            parsed.steps.map((step) => ({
              lessonId: lesson.id,
              stepOrder: step.stepOrder,
              type: step.type,
              content: step.content,
            }))
          )
          totalSteps += parsed.steps.length
        }

        // Create quiz if questions were extracted
        if (parsed.quizQuestions.length > 0) {
          const [quiz] = await db
            .insert(quizzes)
            .values({
              lessonId: lesson.id,
              title: `${parsed.title} — Quiz`,
              passingScore: 70,
              xpReward: parsed.xpReward,
            })
            .returning()

          await db.insert(questions).values(
            parsed.quizQuestions.map((q, idx) => ({
              quizId: quiz.id,
              type: q.type,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              hints: q.hints,
              sortOrder: idx + 1,
              difficultyLevel: source.ageGroup === 'little-explorers' ? 1 : source.ageGroup === 'junior-scholars' ? 2 : 3,
            }))
          )
          totalQuestions += parsed.quizQuestions.length
        }

        console.log(
          `            ✓ ${parsed.steps.length} steps, ${parsed.quizQuestions.length} quiz questions`
        )
      } catch (err: any) {
        console.error(`            ✗ Error: ${err.message}`)
      }
    }
  }

  // Seed some default badges
  console.log('\n🏅 Seeding badges...')
  const badgeData = [
    { name: 'First Steps', description: 'Complete your first lesson', xpThreshold: 0 },
    { name: 'Quiz Whiz', description: 'Pass 5 quizzes', xpThreshold: 100 },
    { name: 'Scripture Scholar', description: 'Complete 10 lessons', xpThreshold: 150 },
    { name: 'Faithful Friend', description: '7-day login streak', xpThreshold: 200 },
    { name: 'Bible Explorer', description: 'Complete 25 lessons', xpThreshold: 500 },
    { name: 'Covenant Keeper', description: 'Complete all Covenants lessons', xpThreshold: 300 },
    { name: 'Doctrine Master', description: 'Complete all Doctrines lessons', xpThreshold: 300 },
    { name: 'Knowledge Seeker', description: 'Earn 1000 XP', xpThreshold: 1000 },
  ]

  for (const badge of badgeData) {
    const existing = await db
      .select()
      .from(badges)
      .where(eq(badges.name, badge.name))

    if (existing.length === 0) {
      await db.insert(badges).values(badge)
      console.log(`   ✓ ${badge.name}`)
    } else {
      console.log(`   [skip] ${badge.name} already exists`)
    }
  }

  console.log('\n=========================')
  console.log(`Seed complete!`)
  console.log(`  Lessons:   ${totalLessons}`)
  console.log(`  Steps:     ${totalSteps}`)
  console.log(`  Questions: ${totalQuestions}`)
  console.log(`  Badges:    ${badgeData.length}`)

  await sql.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
