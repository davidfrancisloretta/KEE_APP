'use client'

import { motion } from 'framer-motion'

interface EzraOwlProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-20 h-20 text-4xl',
  lg: 'w-32 h-32 text-6xl',
}

export function EzraOwl({ message, size = 'md' }: EzraOwlProps) {
  return (
    <div className="flex items-end gap-3">
      <motion.div
        className={`${sizeMap[size]} flex items-center justify-center rounded-full bg-amber-100`}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Placeholder for Ezra owl character — will be replaced with illustrated asset */}
        <span role="img" aria-label="Ezra the Owl">🦉</span>
      </motion.div>

      {message && (
        <motion.div
          className="max-w-xs rounded-xl rounded-bl-none bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
