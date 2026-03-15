import { useTranslations } from 'next-intl'
import { ProgressDashboard } from '@/components/learn/ProgressDashboard'

export default function ProgressPage() {
  const t = useTranslations('progress')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <div className="mt-6">
        <ProgressDashboard />
      </div>
    </main>
  )
}
