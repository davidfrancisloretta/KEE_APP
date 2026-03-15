'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { LessonCard } from '@/components/ui/LessonCard'
import { useTranslations } from 'next-intl'

const AGE_GROUPS = [
  { value: undefined, labelKey: 'allSeries' },
  { value: 'little-explorers' as const, labelKey: 'littleExplorers' },
  { value: 'junior-scholars' as const, labelKey: 'juniorScholars' },
  { value: 'young-disciples' as const, labelKey: 'youngDisciples' },
] as const

export function LessonGrid() {
  const [ageGroup, setAgeGroup] = useState<
    'little-explorers' | 'junior-scholars' | 'young-disciples' | undefined
  >(undefined)

  const t = useTranslations('lessons')
  const tAge = useTranslations('ageGroups')

  const { data, isLoading, error } = trpc.lesson.list.useQuery({
    ageGroup,
    limit: 50,
  })

  return (
    <div>
      {/* Age group filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {AGE_GROUPS.map((group) => (
          <button
            key={group.labelKey}
            onClick={() => setAgeGroup(group.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              ageGroup === group.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {group.labelKey === 'allSeries'
              ? t('allSeries')
              : tAge(group.labelKey)}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Failed to load lessons. Make sure the database is running.
        </div>
      )}

      {/* Lesson grid */}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              description={lesson.description}
              estimatedMinutes={lesson.estimatedMinutes}
              xpReward={lesson.xpReward}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && data.lessons.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          No lessons found for this age group.
        </p>
      )}
    </div>
  )
}
