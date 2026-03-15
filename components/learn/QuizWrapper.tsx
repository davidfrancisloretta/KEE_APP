'use client'

import { trpc } from '@/lib/trpc'
import { QuizEngine } from './QuizEngine'
import { EzraOwl } from '@/components/ui/EzraOwl'
import { XPBar } from '@/components/ui/XPBar'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuizWrapperProps {
  quizId: string
}

export function QuizWrapper({ quizId }: QuizWrapperProps) {
  const t = useTranslations('quiz')
  const router = useRouter()
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  const { data: quiz, isLoading, error } = trpc.quiz.getById.useQuery({
    quizId,
  })

  const submitAnswer = trpc.quiz.submitAnswer.useMutation()

  const handleSubmitAnswer = async (questionId: string, answer: string) => {
    // For unauthenticated users, do client-side checking
    try {
      const res = await submitAnswer.mutateAsync({
        attemptId: quizId, // placeholder — real attempt created on start
        questionId,
        answer,
      })
      return { correct: res.correct, hint: res.hint }
    } catch {
      // Fallback for unauthenticated users
      return { correct: false, hint: 'Sign in to track your quiz progress!' }
    }
  }

  const handleComplete = (score: number) => {
    setResult({ score, passed: score >= 70 })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-indigo-100" />
          <p className="text-sm text-gray-500">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <EzraOwl message="I couldn't find that quiz. Let's try another lesson!" />
        <button
          onClick={() => router.push('/lessons')}
          className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Lessons
        </button>
      </div>
    )
  }

  // Result screen
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center gap-6"
      >
        <EzraOwl
          size="lg"
          message={
            result.passed
              ? t('passed')
              : t('failed')
          }
        />

        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('quizComplete')}</h2>
          <p className="mt-2 text-xl text-gray-600">
            {t('yourScore', { score: result.score })}
          </p>
        </div>

        {result.passed && quiz.xpReward && (
          <div className="w-64">
            <p className="mb-2 text-center text-sm font-medium text-green-600">
              +{quiz.xpReward} XP earned!
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {!result.passed && (
            <button
              onClick={() => setResult(null)}
              className="rounded-lg border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('retakeQuiz')}
            </button>
          )}
          <button
            onClick={() => router.push('/lessons')}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('backToLesson')}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <QuizEngine
      quizId={quizId}
      title={quiz.title}
      questions={quiz.questions.map((q) => ({
        id: q.id,
        type: q.type,
        questionText: q.questionText,
        options: q.options ?? undefined,
        hints: q.hints ?? undefined,
      }))}
      onSubmitAnswer={handleSubmitAnswer}
      onComplete={handleComplete}
    />
  )
}
