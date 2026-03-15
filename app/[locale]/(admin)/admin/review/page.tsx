'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'

type LearningModality = 'READ' | 'WRITE' | 'LISTEN' | 'SPEAK' | 'THINK' | 'OBSERVE'

const MODALITY_META: Record<LearningModality, { icon: string; color: string; label: string }> = {
  READ:    { icon: '📖', color: 'bg-blue-100 text-blue-700',    label: 'Read' },
  WRITE:   { icon: '✏️',  color: 'bg-yellow-100 text-yellow-700', label: 'Write' },
  LISTEN:  { icon: '👂', color: 'bg-purple-100 text-purple-700', label: 'Listen' },
  SPEAK:   { icon: '💬', color: 'bg-green-100 text-green-700',   label: 'Speak' },
  THINK:   { icon: '🧠', color: 'bg-orange-100 text-orange-700', label: 'Think' },
  OBSERVE: { icon: '👁️', color: 'bg-pink-100 text-pink-700',    label: 'Observe' },
}

const STATUS_STYLES: Record<string, string> = {
  review:   'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  draft:    'bg-gray-100 text-gray-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default function ReviewPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [filter, setFilter] = useState<'review' | 'approved' | 'rejected' | undefined>(undefined)

  const { data: reviewables, refetch } = trpc.admin.listReviewable.useQuery(
    filter ? { status: filter } : undefined
  )

  const { data: detail } = trpc.admin.getLessonForReview.useQuery(
    { lessonId: selectedId! },
    { enabled: !!selectedId }
  )

  const submitReview = trpc.admin.submitReview.useMutation({
    onSuccess: () => {
      setReviewNotes('')
      setSelectedId(null)
      refetch()
    },
  })

  const statusColor = (s: string) => STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-700'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-indigo-600">← Admin</Link>
        <div>
          <h1 className="text-3xl font-bold">Lesson Review</h1>
          <p className="mt-1 text-gray-600">Review, approve or reject AI-parsed lessons</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {[
          { value: undefined, label: 'All', count: reviewables?.length },
          { value: 'review' as const, label: 'Pending' },
          { value: 'approved' as const, label: 'Approved' },
          { value: 'rejected' as const, label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Lesson list */}
        <div className="lg:col-span-1">
          {(!reviewables || reviewables.length === 0) ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <div className="text-4xl">📋</div>
              <p className="mt-3 font-semibold text-gray-600">No lessons to review</p>
              <p className="mt-1 text-sm text-gray-400">Upload and parse content first</p>
              <Link
                href="/admin/upload"
                className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Upload Content
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewables.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedId(lesson.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selectedId === lesson.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                      : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-gray-800">{lesson.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(lesson.status)}`}>
                      {lesson.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{lesson.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize">{lesson.ageGroup?.replace(/-/g, ' ')}</span>
                    {lesson.estimatedMinutes && <span>{lesson.estimatedMinutes} min</span>}
                    {lesson.xpReward && <span>{lesson.xpReward} XP</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Lesson detail + review actions */}
        <div className="lg:col-span-2">
          {!selectedId ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">Select a lesson to review</p>
            </div>
          ) : !detail ? (
            <div className="flex h-64 items-center justify-center rounded-xl border">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lesson header */}
              <div className="rounded-xl border bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{detail.lesson.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{detail.lesson.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(detail.lesson.status)}`}>
                    {detail.lesson.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="capitalize">{detail.lesson.ageGroup?.replace(/-/g, ' ')}</span>
                  <span>{detail.lesson.estimatedMinutes} min</span>
                  <span>{detail.lesson.xpReward} XP</span>
                  <span>{detail.steps.length} steps</span>
                </div>
              </div>

              {/* Lesson steps with modality badges */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Lesson Steps</h3>
                {detail.steps.map((step) => {
                  const content = step.content as {
                    text?: string
                    heading?: string
                    learningModalities?: LearningModality[]
                  }
                  return (
                    <div key={step.id} className="rounded-xl border bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {step.stepOrder}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          {content.heading ?? step.type}
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">
                          {step.type}
                        </span>
                      </div>

                      {/* Modality badges */}
                      {content.learningModalities && content.learningModalities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {content.learningModalities.map((m) => {
                            const meta = MODALITY_META[m]
                            return (
                              <span key={m} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                                {meta.icon} {meta.label}
                              </span>
                            )
                          })}
                        </div>
                      )}

                      <p className="mt-3 whitespace-pre-line text-sm text-gray-700 line-clamp-6">
                        {content.text}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Past reviews */}
              {detail.reviews.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">Review History</h3>
                  <div className="space-y-2">
                    {detail.reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(r.status)}`}>
                            {r.status}
                          </span>
                          <span className="text-gray-500">by {r.reviewerName}</span>
                          <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.notes && <p className="mt-1 text-sm text-gray-600">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review actions */}
              <div className="rounded-xl border bg-white p-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Submit Review</h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes (optional)..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => submitReview.mutate({ lessonId: selectedId!, status: 'approved', notes: reviewNotes })}
                    disabled={submitReview.isLoading}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => submitReview.mutate({ lessonId: selectedId!, status: 'revision_requested', notes: reviewNotes })}
                    disabled={submitReview.isLoading}
                    className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => submitReview.mutate({ lessonId: selectedId!, status: 'rejected', notes: reviewNotes })}
                    disabled={submitReview.isLoading}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
