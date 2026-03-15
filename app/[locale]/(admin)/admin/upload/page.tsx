'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'

type AgeGroup = 'little-explorers' | 'junior-scholars' | 'young-disciples'
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface PipelineStep {
  key: string
  label: string
  description: string
  icon: string
}

const PIPELINE_STEPS: PipelineStep[] = [
  { key: 'upload',  label: 'Upload',   description: 'File received and saved',        icon: '📤' },
  { key: 'parse',   label: 'Parse',    description: 'Extracting lesson structure',     icon: '🔍' },
  { key: 'review',  label: 'Review',   description: 'Ready for teacher verification',  icon: '📋' },
  { key: 'approve', label: 'Approve',  description: 'Approved and published',          icon: '✅' },
]

const AGE_GROUPS = [
  { value: 'little-explorers', label: 'Little Explorers', ages: '4–6', icon: '🌟' },
  { value: 'junior-scholars',  label: 'Junior Scholars',  ages: '7–10', icon: '📚' },
  { value: 'young-disciples',  label: 'Young Disciples',  ages: '11–14', icon: '⚔️' },
]

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile]         = useState<File | null>(null)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [status, setStatus]     = useState<UploadStatus>('idle')
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [result, setResult]     = useState<{ uploadId?: string; fileName?: string; error?: string; warning?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: uploads, refetch } = trpc.admin.listUploads.useQuery(undefined, {
    refetchInterval: status === 'processing' ? 2000 : false,
  })

  const { data: stats } = trpc.admin.stats.useQuery()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }, [])

  const validateAndSet = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['docx', 'pptx', 'pdf'].includes(ext ?? '')) {
      setResult({ error: 'Only .docx, .pptx, and .pdf files are supported.' })
      return
    }
    setFile(f)
    setResult(null)
    setStatus('idle')
    setCurrentStep(-1)
  }

  const handleUpload = async () => {
    if (!file || !ageGroup) return

    setStatus('uploading')
    setCurrentStep(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ageGroup', ageGroup)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setResult({ error: data.error || 'Upload failed' })
        return
      }

      // Trigger AI parsing pipeline
      setCurrentStep(1)
      setStatus('processing')

      const parseRes = await fetch('/api/admin/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: data.uploadId }),
      })
      const parseData = await parseRes.json()

      if (!parseRes.ok) {
        setStatus('error')
        setResult({ error: parseData.error || 'Parsing failed' })
        return
      }

      setCurrentStep(2)
      await new Promise(r => setTimeout(r, 500))

      setStatus('done')
      setCurrentStep(3)
      setResult({ uploadId: data.uploadId, fileName: data.fileName, warning: parseData.warning })
      refetch()
    } catch (err: any) {
      setStatus('error')
      setResult({ error: err.message })
    }
  }

  const reset = () => {
    setFile(null)
    setAgeGroup('')
    setStatus('idle')
    setCurrentStep(-1)
    setResult(null)
  }

  const statusColor = (s: string) => {
    if (s === 'uploaded')   return 'bg-blue-100 text-blue-700'
    if (s === 'processing') return 'bg-yellow-100 text-yellow-700'
    if (s === 'parsed')     return 'bg-purple-100 text-purple-700'
    if (s === 'review')     return 'bg-orange-100 text-orange-700'
    if (s === 'approved')   return 'bg-green-100 text-green-700'
    if (s === 'rejected')   return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-indigo-600">← Admin</Link>
        <div>
          <h1 className="text-3xl font-bold">Upload Content</h1>
          <p className="mt-1 text-gray-600">Upload .docx, .pptx or .pdf lesson files for AI parsing</p>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Lessons', value: stats.totalLessons, icon: '📖' },
            { label: 'Total Uploads', value: stats.totalUploads, icon: '📁' },
            { label: 'Pending Review', value: stats.pendingReview, icon: '⏳' },
            { label: 'Total Users',   value: stats.totalUsers,   icon: '👥' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-white p-4 text-center shadow-sm">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Upload form */}
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? 'border-indigo-400 bg-indigo-50' :
              file     ? 'border-green-400 bg-green-50' :
                         'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pptx,.pdf"
              className="hidden"
              onChange={e => e.target.files?.[0] && validateAndSet(e.target.files[0])}
            />
            {file ? (
              <>
                <div className="text-4xl">📄</div>
                <p className="mt-3 font-semibold text-gray-800">{file.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB — click to change
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl">📂</div>
                <p className="mt-3 font-semibold text-gray-700">Drop your file here</p>
                <p className="mt-1 text-sm text-gray-500">or click to browse</p>
                <p className="mt-3 text-xs text-gray-400">.docx · .pptx · .pdf</p>
              </>
            )}
          </div>

          {/* Age Group Selector */}
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">Select Age Group</p>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map(ag => (
                <button
                  key={ag.value}
                  onClick={() => setAgeGroup(ag.value as AgeGroup)}
                  className={`rounded-xl border p-3 text-center transition-colors ${
                    ageGroup === ag.value
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                      : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="text-2xl">{ag.icon}</div>
                  <div className="mt-1 text-xs font-semibold">{ag.label}</div>
                  <div className="text-[10px] text-gray-400">Ages {ag.ages}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {result?.error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              ❌ {result.error}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !ageGroup || status === 'uploading' || status === 'processing'}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'uploading'   ? '⏫ Uploading...' :
             status === 'processing'  ? '⚙️ Processing...' :
             status === 'done'        ? '✅ Done — Upload Another' :
             '⬆️ Upload & Parse Lesson'}
          </button>

          {status === 'done' && (
            <button onClick={reset} className="w-full rounded-xl border border-gray-300 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Clear &amp; Start Over
            </button>
          )}
        </div>

        {/* Right: Pipeline steps */}
        <div>
          <p className="mb-4 text-sm font-semibold text-gray-700">Content Pipeline</p>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, idx) => {
              const isActive    = currentStep === idx
              const isCompleted = currentStep > idx
              const isPending   = currentStep < idx

              return (
                <div key={step.key} className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                  isActive    ? 'border-indigo-300 bg-indigo-50' :
                  isCompleted ? 'border-green-300 bg-green-50' :
                                'border-gray-200 bg-white opacity-50'
                }`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive    ? 'bg-indigo-500 text-white' :
                                  'bg-gray-100'
                  }`}>
                    {isCompleted ? '✓' : isActive ? (
                      <span className="animate-spin">⚙</span>
                    ) : step.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{step.label}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {status === 'done' && result?.uploadId && (
            <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
              <p className="font-semibold text-green-700">✅ Upload complete!</p>
              <p className="mt-1 text-sm text-gray-600">{result.fileName} is ready for review.</p>
              {result.warning && (
                <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-300 px-3 py-2 text-sm text-yellow-800">
                  ⚠️ {result.warning}
                </div>
              )}
              <Link
                href="/admin/review"
                className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Go to Review →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upload history */}
      {uploads && uploads.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold">Recent Uploads</h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">File</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Age Group</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Uploaded By</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{u.fileName}</span>
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">{u.fileType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {u.targetAgeGroup?.replace(/-/g, ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.uploadedBy ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
