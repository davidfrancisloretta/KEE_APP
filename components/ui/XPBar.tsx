'use client'

import { motion } from 'framer-motion'

interface XPBarProps {
  current: number
  nextLevel: number
  level: number
}

export function XPBar({ current, nextLevel, level }: XPBarProps) {
  const pct = Math.min((current / nextLevel) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-indigo-600">Lv {level}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {current}/{nextLevel} XP
      </span>
    </div>
  )
}
