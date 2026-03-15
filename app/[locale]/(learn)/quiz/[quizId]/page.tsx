import { QuizWrapper } from '@/components/learn/QuizWrapper'

interface QuizPageProps {
  params: { quizId: string }
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <QuizWrapper quizId={params.quizId} />
    </main>
  )
}
