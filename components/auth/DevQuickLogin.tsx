'use client'

import { useState } from 'react'

const testAccounts = [
  { email: 'admin@test.com',    label: 'Super Admin',     icon: '🛡️', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { email: 'content@test.com',  label: 'Content Admin',   icon: '📝', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { email: 'reviewer@test.com', label: 'Reviewer',        icon: '📋', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { email: 'teacher@test.com',  label: 'Teacher',         icon: '👩‍🏫', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { email: 'parent@test.com',   label: 'Parent',          icon: '👨‍👧', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { email: 'child1@test.com',   label: 'Little Explorer', icon: '🌟', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { email: 'child2@test.com',   label: 'Junior Scholar',  icon: '📚', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { email: 'child3@test.com',   label: 'Young Disciple',  icon: '⚔️', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
]

const TEST_PASSWORD = 'test1234'

export function DevQuickLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (process.env.NODE_ENV === 'production') return null

  const handleQuickLogin = async (email: string) => {
    setLoading(email)
    setError('')

    try {
      // Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()

      // Post credentials directly
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Auth-Return-Redirect': '1',
        },
        body: new URLSearchParams({
          email,
          password: TEST_PASSWORD,
          csrfToken,
          callbackUrl: '/lessons',
        }),
      })

      const data = await res.json()

      setLoading(null)

      if (!res.ok || data.url?.includes('error')) {
        setError('Login failed — run: npx tsx scripts/seed-test-users.ts')
      } else {
        // Redirect to the returned URL or /lessons
        window.location.href = data.url || '/lessons'
      }
    } catch (err: any) {
      setLoading(null)
      setError(`Login failed: ${err.message}`)
    }
  }

  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-500">DEV QUICK LOGIN</span>
        <span className="rounded bg-yellow-200 px-1.5 py-0.5 text-[10px] font-bold text-yellow-800">
          DEV ONLY
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {testAccounts.map((account) => (
          <button
            key={account.email}
            onClick={() => handleQuickLogin(account.email)}
            disabled={loading !== null}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50 ${account.color}`}
          >
            <span className="text-lg">{account.icon}</span>
            <span className="truncate">
              {loading === account.email ? 'Signing in...' : account.label}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
