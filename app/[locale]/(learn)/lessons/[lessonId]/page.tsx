import { LessonPlayerWrapper } from '@/components/learn/LessonPlayerWrapper'

interface LessonPageProps {
  params: { lessonId: string }
}

export default function LessonPlayerPage({ params }: LessonPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <LessonPlayerWrapper lessonId={params.lessonId} />
    </main>
  )
}
