'use client'

import { trpc } from '@/lib/trpc'
import { XPBar } from '@/components/ui/XPBar'
import { EzraOwl } from '@/components/ui/EzraOwl'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export function ProgressDashboard() {
  const t = useTranslations('progress')
  const tBadge = useTranslations('badges')

  const { data, isLoading, error } = trpc.progress.get.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
        <EzraOwl message="Sign in to see your progress!" />
        <a
          href="/login"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sign In
        </a>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: t('totalXP'), value: data.totalXP, icon: '⚡' },
    { label: t('lessonsCompleted'), value: data.lessonsCompleted, icon: '📖' },
    { label: t('quizzesPassed'), value: data.quizzesPassed, icon: '✅' },
    { label: t('currentStreak'), value: t('days', { count: data.currentStreak }), icon: '🔥' },
  ]

  return (
    <div className="space-y-8">
      {/* XP + Level */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('level', { level: data.level })}</h2>
          <span className="text-sm text-gray-500">
            {t('xpToNext', { xp: data.xpToNextLevel - data.xpInLevel })}
          </span>
        </div>
        <XPBar current={data.xpInLevel} nextLevel={data.xpToNextLevel} level={data.level} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border bg-white p-4 text-center shadow-sm"
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="mt-2 text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t('badges')}</h2>
        {data.badges.length === 0 ? (
          <div className="rounded-2xl border bg-gray-50 p-8 text-center">
            <EzraOwl size="sm" message={t('noBadges')} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="text-3xl">{badge.iconUrl ?? '🏅'}</div>
                <p className="mt-2 text-sm font-medium">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ezra encouragement */}
      <div className="flex justify-center">
        <EzraOwl
          size="sm"
          message={
            data.currentStreak > 0
              ? `${data.currentStreak} day streak! Keep it up!`
              : 'Start a lesson today to begin your streak!'
          }
        />
      </div>
    </div>
  )
}
