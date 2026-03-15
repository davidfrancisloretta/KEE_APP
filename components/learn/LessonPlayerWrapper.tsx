'use client'

import { trpc } from '@/lib/trpc'
import { LessonPlayer } from './LessonPlayer'
import { EzraOwl } from '@/components/ui/EzraOwl'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface LessonPlayerWrapperProps {
  lessonId: string
}

export function LessonPlayerWrapper({ lessonId }: LessonPlayerWrapperProps) {
  const t = useTranslations('lessons')
  const router = useRouter()

  const { data: lesson, isLoading, error } = trpc.lesson.getById.useQuery({
    id: lessonId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-indigo-100" />
          <p className="text-sm text-gray-500">{t('startLesson')}...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <EzraOwl message="I couldn't find that lesson. Let's go back and try another one!" />
        <button
          onClick={() => router.push('/lessons')}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('browse')}
        </button>
      </div>
    )
  }

  const steps = (lesson.steps ?? [])
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((step) => ({
      id: step.id,
      stepOrder: step.stepOrder,
      type: step.type as 'narration' | 'illustration' | 'interaction' | 'video',
      content: step.content as { text?: string; heading?: string; imageUrl?: string; audioUrl?: string; videoUrl?: string },
    }))

  const handleComplete = () => {
    // Navigate to quiz if one exists, otherwise back to lessons
    router.push('/lessons')
  }

  if (steps.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <EzraOwl message="This lesson doesn't have any content yet. Check back soon!" />
        <button
          onClick={() => router.push('/lessons')}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('browse')}
        </button>
      </div>
    )
  }

  return (
    <LessonPlayer
      lessonId={lessonId}
      title={lesson.title}
      steps={steps}
      onComplete={handleComplete}
    />
  )
}
