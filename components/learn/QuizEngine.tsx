'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EzraOwl } from '../ui/EzraOwl'

interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'drag_drop'
  questionText: string
  options?: { label: string; value: string }[]
  hints?: string[]
}

interface QuizEngineProps {
  quizId: string
  title: string
  questions: QuizQuestion[]
  onSubmitAnswer: (questionId: string, answer: string) => Promise<{ correct: boolean; hint: string | null }>
  onComplete: (score: number) => void
}

export function QuizEngine({
  title,
  questions,
  onSubmitAnswer,
  onComplete,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ correct: boolean; hint: string | null } | null>(null)
  const [score, setScore] = useState(0)
  const [hintLevel, setHintLevel] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  const handleSubmit = async () => {
    if (!selected || !question) return
    setSubmitting(true)

    const result = await onSubmitAnswer(question.id, selected)
    setFeedback(result)

    if (result.correct) {
      setScore((s) => s + 1)
    }

    setSubmitting(false)
  }

  const handleNext = () => {
    if (isLast) {
      const finalScore = Math.round(((score + (feedback?.correct ? 0 : 0)) / questions.length) * 100)
      onComplete(finalScore)
      return
    }

    setCurrentIndex((i) => i + 1)
    setSelected(null)
    setFeedback(null)
    setHintLevel(0)
  }

  const showHint = () => {
    if (question?.hints && hintLevel < question.hints.length) {
      setHintLevel((h) => h + 1)
    }
  }

  if (!question) return null

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-indigo-500"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 rounded-2xl border bg-white p-8 shadow-sm"
        >
          <p className="mb-6 text-lg font-medium">{question.questionText}</p>

          {/* Multiple choice / True-false options */}
          {question.options && (
            <div className="space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => !feedback && setSelected(opt.value)}
                  disabled={!!feedback}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    selected === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${feedback ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Fill in the blank */}
          {question.type === 'fill_blank' && (
            <input
              type="text"
              value={selected ?? ''}
              onChange={(e) => !feedback && setSelected(e.target.value)}
              disabled={!!feedback}
              placeholder="Type your answer..."
              className="w-full rounded-xl border px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          )}

          {/* Hints */}
          {question.hints && hintLevel > 0 && (
            <div className="mt-4 space-y-2">
              {question.hints.slice(0, hintLevel).map((hint, i) => (
                <div key={i} className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
                  Hint {i + 1}: {hint}
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                feedback.correct
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {feedback.correct ? 'Correct! Great job!' : 'Not quite. Keep trying!'}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        {!feedback && question.hints && hintLevel < question.hints.length && (
          <button
            onClick={showHint}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            Need a hint?
          </button>
        )}
        <div className="flex-1" />

        {!feedback ? (
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {submitting ? 'Checking...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isLast ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>

      {/* Ezra encouragement */}
      <div className="mt-6">
        <EzraOwl
          size="sm"
          message={
            feedback?.correct
              ? 'Amazing work! You really know your scripture!'
              : hintLevel > 0
                ? 'Take your time, you can do this!'
                : undefined
          }
        />
      </div>
    </div>
  )
}
