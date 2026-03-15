'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface LessonCardProps {
  id: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  estimatedMinutes?: number | null
  xpReward?: number | null
  completed?: boolean
}

export function LessonCard({
  id,
  title,
  description,
  estimatedMinutes,
  xpReward,
  completed,
}: LessonCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/lessons/${id}`}
        className="block rounded-2xl border bg-white p-6 transition-colors hover:border-indigo-200"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {completed && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Done
            </span>
          )}
        </div>

        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          {estimatedMinutes && <span>{estimatedMinutes} min</span>}
          {xpReward && <span>+{xpReward} XP</span>}
        </div>
      </Link>
    </motion.div>
  )
}
