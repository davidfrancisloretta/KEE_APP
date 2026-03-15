import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { contentUploads, lessons, lessonSteps } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { parseLesson } from '@/scripts/parse-content'

const ADMIN_ROLES = ['super_admin', 'content_admin', 'reviewer']

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { uploadId } = await req.json()

    if (!uploadId) {
      return NextResponse.json({ error: 'uploadId is required' }, { status: 400 })
    }

    // Get upload record
    const [upload] = await db
      .select()
      .from(contentUploads)
      .where(eq(contentUploads.id, uploadId))

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    // Update status to processing
    await db
      .update(contentUploads)
      .set({ status: 'processing' })
      .where(eq(contentUploads.id, uploadId))

    // Resolve file path
    const filePath = path.join(process.cwd(), upload.fileUrl)
    const ageGroup = (upload.targetAgeGroup ?? 'junior-scholars') as 'little-explorers' | 'junior-scholars' | 'young-disciples'

    // Parse the lesson
    const parsed = await parseLesson(filePath, ageGroup)

    // Store extracted content on upload record
    await db
      .update(contentUploads)
      .set({ extractedContent: parsed, status: 'parsed' })
      .where(eq(contentUploads.id, uploadId))

    // Create lesson in DB
    const userId = (session.user as any).id as string
    const [lesson] = await db
      .insert(lessons)
      .values({
        title: parsed.title,
        description: parsed.description,
        ageGroup,
        status: 'review',
        estimatedMinutes: parsed.estimatedMinutes,
        xpReward: parsed.xpReward,
        createdBy: userId,
      })
      .returning()

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
    }

    // Update upload status to review
    await db
      .update(contentUploads)
      .set({ status: 'review' })
      .where(eq(contentUploads.id, uploadId))

    // Warn if the file yielded very little extractable text
    const warning = parsed.steps.length <= 1 && parsed.modalityCoverage.length <= 1
      ? 'This file appears to be image-heavy with minimal extractable text. Consider uploading a DOCX version for richer lesson content.'
      : undefined

    return NextResponse.json({
      success: true,
      lessonId: lesson.id,
      title: parsed.title,
      stepsCount: parsed.steps.length,
      quizCount: parsed.quizQuestions.length,
      modalityCoverage: parsed.modalityCoverage,
      warning,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
