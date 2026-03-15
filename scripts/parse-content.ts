/**
 * Content Parser — extracts structured lesson data from DOCX, PPTX, and PDF files.
 *
 * Outputs a normalized LessonData object with:
 *   - title, objectives, scripture, memoryVerse
 *   - steps tagged with learningModalities (READ, WRITE, LISTEN, SPEAK, THINK, OBSERVE)
 *   - quiz questions extracted from the lesson content
 *
 * Learning Framework (6 Modalities — see ai/ai-pipeline.md):
 *   READ 📖   WRITE ✏️   LISTEN 👂   SPEAK 💬   THINK 🧠   OBSERVE 👁️
 */

import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'

// ── Learning Modalities ────────────────────────────────

export type LearningModality = 'READ' | 'WRITE' | 'LISTEN' | 'SPEAK' | 'THINK' | 'OBSERVE'

export const MODALITY_META: Record<LearningModality, { icon: string; color: string; label: string }> = {
  READ:    { icon: '📖', color: 'bg-blue-100 text-blue-700',   label: 'Read' },
  WRITE:   { icon: '✏️',  color: 'bg-yellow-100 text-yellow-700', label: 'Write' },
  LISTEN:  { icon: '👂', color: 'bg-purple-100 text-purple-700', label: 'Listen' },
  SPEAK:   { icon: '💬', color: 'bg-green-100 text-green-700',  label: 'Speak' },
  THINK:   { icon: '🧠', color: 'bg-orange-100 text-orange-700', label: 'Think' },
  OBSERVE: { icon: '👁️', color: 'bg-pink-100 text-pink-700',   label: 'Observe' },
}

// Section → primary modalities mapping
const SECTION_MODALITIES: Record<string, LearningModality[]> = {
  attentionGetter: ['OBSERVE', 'SPEAK'],
  bibleStory:      ['LISTEN', 'READ'],
  craft:           ['OBSERVE'],
  game:            ['OBSERVE', 'SPEAK'],
  application:     ['THINK', 'WRITE'],
  prayer:          ['SPEAK'],
  memoryVerse:     ['READ', 'SPEAK'],
  scripture:       ['READ'],
  objectives:      ['READ'],
  materials:       ['OBSERVE'],
}

// ── Types ──────────────────────────────────────────────

export interface LessonStep {
  type: 'narration' | 'illustration' | 'interaction' | 'video'
  content: {
    text: string
    heading?: string
    learningModalities: LearningModality[]
  }
  stepOrder: number
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'true_false' | 'fill_blank'
  questionText: string
  options?: { label: string; value: string }[]
  correctAnswer: string
  hints: string[]
}

export interface ParsedLesson {
  title: string
  description: string
  ageGroup: 'little-explorers' | 'junior-scholars' | 'young-disciples'
  memoryVerse: string
  scripturePortion: string
  objectives: string[]
  steps: LessonStep[]
  quizQuestions: QuizQuestion[]
  estimatedMinutes: number
  xpReward: number
  modalityCoverage: LearningModality[]  // which of the 6 are present
}

// ── Section Detection ──────────────────────────────────

const SECTION_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  {
    key: 'objectives',
    patterns: [/learning\s*objectives?/i, /objectives?:/i, /by the end of this lesson/i],
  },
  {
    key: 'scripture',
    patterns: [/scripture\s*(portion|reference)/i, /scripture:/i],
  },
  {
    key: 'memoryVerse',
    patterns: [/memory\s*verse/i],
  },
  {
    key: 'materials',
    patterns: [/materials?\s*(required|needed)/i],
  },
  {
    key: 'attentionGetter',
    patterns: [/attention\s*getter/i, /introduction/i],
  },
  {
    key: 'bibleStory',
    patterns: [/big\s*bible\s*story/i, /bible\s*narrative/i, /teaching\s*content/i],
  },
  {
    key: 'craft',
    patterns: [/craft/i],
  },
  {
    key: 'game',
    patterns: [/game/i, /activity/i],
  },
  {
    key: 'application',
    patterns: [/life\s*application/i, /application/i, /what\s*does\s*this\s*mean/i],
  },
  {
    key: 'prayer',
    patterns: [/closing\s*prayer/i, /prayer\s*&?\s*blessing/i, /prayer/i],
  },
]

function detectSection(line: string): string | null {
  const trimmed = line.trim()
  for (const { key, patterns } of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) return key
    }
  }
  return null
}

// ── Text Extraction ────────────────────────────────────

async function extractTextFromDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractTextFromPptx(filePath: string): Promise<string> {
  // officeparser extracts text from all PPTX slides and returns an AST
  const { parseOffice } = await import('officeparser')
  const ast = await parseOffice(filePath)
  return ast.toText()
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const { execSync } = await import('child_process')
  const pyScript = path.resolve(__dirname, 'extract-pdf.py')
  const result = execSync(`python -X utf8 "${pyScript}" "${filePath}"`, {
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf-8',
  })
  return result
}

export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.docx') return extractTextFromDocx(filePath)
  if (ext === '.pptx') return extractTextFromPptx(filePath)
  if (ext === '.pdf')  return extractTextFromPdf(filePath)
  throw new Error(`Unsupported file type: ${ext}`)
}

// ── Parsing ────────────────────────────────────────────

function extractTitle(text: string, fileName: string): string {
  const lines = text.split('\n').filter((l) => l.trim().length > 3)
  const firstLine = lines[0]?.trim() ?? ''

  if (firstLine.length < 100 && !firstLine.includes(':')) {
    return firstLine
  }

  const match = fileName.match(/Lesson\s*\d+[^.]*/)
  return match ? match[0].replace(/[-_]/g, ' ').trim() : fileName.replace(/\.\w+$/, '')
}

function extractMemoryVerse(sections: Record<string, string[]>): string {
  const lines = sections['memoryVerse'] ?? []
  const verseLine = lines.find((l) => /\w+\s+\d+:\d+/.test(l))
  if (verseLine) return verseLine.trim()
  return lines.join(' ').trim()
}

function extractObjectives(sections: Record<string, string[]>): string[] {
  const lines = sections['objectives'] ?? []
  return lines
    .filter((l) => l.trim().length > 10)
    .map((l) => l.replace(/^[\s•\-\d.]+/, '').trim())
    .filter((l) => l.length > 0)
    .slice(0, 6)
}

function extractQuizQuestions(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  const askPatterns = text.match(/Ask:\s*(.+?)(?=\n(?:Say:|Ask:|$))/gs) ?? []

  for (const block of askPatterns.slice(0, 5)) {
    const questionMatch = block.match(/Ask:\s*(.+?)(?:\?|$)/s)
    if (!questionMatch) continue

    const questionText = questionMatch[1].trim().replace(/\s+/g, ' ')
    if (questionText.length < 15 || questionText.length > 300) continue

    if (/\b(is this|do you think|did|was|can|does)\b/i.test(questionText)) {
      questions.push({
        type: 'true_false',
        questionText: questionText + (questionText.endsWith('?') ? '' : '?'),
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        correctAnswer: 'yes',
        hints: [
          'Think about what the Bible says.',
          'Remember what happened in the story.',
          'Look at the scripture verse for help.',
        ],
      })
    }
  }

  return questions.slice(0, 5)
}

function buildSteps(sections: Record<string, string[]>, fullText: string): LessonStep[] {
  const steps: LessonStep[] = []
  let order = 1

  const sectionToStep: { key: string; heading: string; type: LessonStep['type'] }[] = [
    { key: 'attentionGetter', heading: 'Attention Getter', type: 'interaction' },
    { key: 'bibleStory',      heading: 'Bible Story',      type: 'narration' },
    { key: 'craft',           heading: 'Craft Activity',   type: 'interaction' },
    { key: 'game',            heading: 'Game',             type: 'interaction' },
    { key: 'application',     heading: 'Life Application', type: 'narration' },
    { key: 'memoryVerse',     heading: 'Memory Verse',     type: 'narration' },
    { key: 'prayer',          heading: 'Closing Prayer',   type: 'narration' },
  ]

  for (const { key, heading, type } of sectionToStep) {
    const lines = sections[key]
    if (!lines || lines.length === 0) continue

    const text = lines
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n')

    if (text.length < 10) continue

    const modalities = SECTION_MODALITIES[key] ?? ['READ']

    steps.push({
      type,
      content: { text, heading, learningModalities: modalities },
      stepOrder: order++,
    })
  }

  // If no sections were detected, create a single step from the full text
  // This handles image-heavy PPTX files where officeparser extracts minimal text
  if (steps.length === 0 && fullText.trim().length > 10) {
    steps.push({
      type: 'narration',
      content: {
        text: fullText.trim(),
        heading: 'Lesson Content',
        learningModalities: ['READ'],
      },
      stepOrder: 1,
    })
  }

  return steps
}

function computeModalityCoverage(steps: LessonStep[]): LearningModality[] {
  const found = new Set<LearningModality>()
  for (const step of steps) {
    for (const m of step.content.learningModalities) {
      found.add(m)
    }
  }
  return Array.from(found)
}

// ── Main Parse Function ────────────────────────────────

export async function parseLesson(
  filePath: string,
  ageGroup: ParsedLesson['ageGroup']
): Promise<ParsedLesson> {
  const text = await extractText(filePath)
  const fileName = path.basename(filePath)
  const lines = text.split('\n')

  // Split text into sections
  const sections: Record<string, string[]> = {}
  let currentSection: string | null = null

  for (const line of lines) {
    const detected = detectSection(line)
    if (detected) {
      currentSection = detected
      if (!sections[currentSection]) sections[currentSection] = []
      continue
    }
    if (currentSection && line.trim().length > 0) {
      sections[currentSection].push(line)
    }
  }

  const title = extractTitle(text, fileName)
  const objectives = extractObjectives(sections)
  const memoryVerse = extractMemoryVerse(sections)
  const steps = buildSteps(sections, text)
  const quizQuestions = extractQuizQuestions(text)
  const modalityCoverage = computeModalityCoverage(steps)

  const scripturePortion =
    (sections['scripture'] ?? []).join(' ').trim() || 'See lesson content'

  const estimatedMinutes = steps.length * 3 + (quizQuestions.length > 0 ? 2 : 0)

  const xpMap = { 'little-explorers': 10, 'junior-scholars': 15, 'young-disciples': 20 }

  return {
    title,
    description: objectives[0] ?? `Learn about ${title}`,
    ageGroup,
    memoryVerse,
    scripturePortion,
    objectives,
    steps,
    quizQuestions,
    estimatedMinutes: Math.max(estimatedMinutes, 10),
    xpReward: xpMap[ageGroup],
    modalityCoverage,
  }
}
