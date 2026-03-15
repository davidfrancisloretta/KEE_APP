import { useTranslations } from 'next-intl'
import { LessonGrid } from '@/components/learn/LessonGrid'

export default function LessonsPage() {
  const t = useTranslations('lessons')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-gray-600">{t('browse')}</p>
      <div className="mt-6">
        <LessonGrid />
      </div>
    </main>
  )
}
