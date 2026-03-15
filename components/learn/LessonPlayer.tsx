'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EzraOwl } from '../ui/EzraOwl'

type LearningModality = 'READ' | 'WRITE' | 'LISTEN' | 'SPEAK' | 'THINK' | 'OBSERVE'

const MODALITY_META: Record<LearningModality, { icon: string; color: string; label: string }> = {
  READ:    { icon: '📖', color: 'bg-blue-100 text-blue-700',    label: 'Read' },
  WRITE:   { icon: '✏️',  color: 'bg-yellow-100 text-yellow-700', label: 'Write' },
  LISTEN:  { icon: '👂', color: 'bg-purple-100 text-purple-700', label: 'Listen' },
  SPEAK:   { icon: '💬', color: 'bg-green-100 text-green-700',   label: 'Speak' },
  THINK:   { icon: '🧠', color: 'bg-orange-100 text-orange-700', label: 'Think' },
  OBSERVE: { icon: '👁️', color: 'bg-pink-100 text-pink-700',    label: 'Observe' },
}

interface LessonStep {
  id: string
  stepOrder: number
  type: 'narration' | 'illustration' | 'interaction' | 'video'
  content: {
    text?: string
    heading?: string
    imageUrl?: string
    audioUrl?: string
    videoUrl?: string
    learningModalities?: LearningModality[]
  }
}

interface LessonPlayerProps {
  lessonId: string
  title: string
  steps: LessonStep[]
  initialStep?: number
  onComplete?: () => void
}

export function LessonPlayer({
  title,
  steps,
  initialStep = 0,
  onComplete,
}: LessonPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStep)
  const step = steps[currentIndex]
  const isLast = currentIndex === steps.length - 1

  const goNext = () => {
    if (isLast) {
      onComplete?.()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  if (!step) return null

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-indigo-500"
          animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <h2 className="mb-4 text-2xl font-bold">{title}</h2>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px] rounded-2xl border bg-white p-8 shadow-sm"
        >
          {/* Learning modality badges */}
          {step.content.learningModalities && step.content.learningModalities.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {step.content.learningModalities.map((m) => {
                const meta = MODALITY_META[m]
                return (
                  <span key={m} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                )
              })}
            </div>
          )}
          {step.content.heading && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{step.content.heading}</p>
          )}
          {step.type === 'narration' && (
            <div className="space-y-4">
              <EzraOwl message={step.content.text} size="md" />
              {step.content.audioUrl && (
                <audio controls className="mt-4 w-full">
                  <source src={step.content.audioUrl} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}

          {step.type === 'illustration' && (
            <div className="space-y-4">
              {step.content.imageUrl && (
                <img
                  src={step.content.imageUrl}
                  alt=""
                  className="mx-auto max-h-64 rounded-xl object-contain"
                />
              )}
              {step.content.text && (
                <p className="text-center text-gray-700">{step.content.text}</p>
              )}
            </div>
          )}

          {step.type === 'video' && step.content.videoUrl && (
            <video controls className="w-full rounded-xl">
              <source src={step.content.videoUrl} type="video/mp4" />
            </video>
          )}

          {step.type === 'interaction' && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-lg text-gray-700">{step.content.text}</p>
              {/* Interactive elements will be plugged in per content type */}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded-lg border px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          Back
        </button>

        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {steps.length}
        </span>

        <button
          onClick={goNext}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          {isLast ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}
