'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'

export function RegisterForm() {
  const t = useTranslations('auth')
  const tAge = useTranslations('ageGroups')
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'child' | 'parent' | 'teacher'>('child')
  const [ageGroup, setAgeGroup] = useState<'little-explorers' | 'junior-scholars' | 'young-disciples' | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const register = trpc.auth.register.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register.mutateAsync({
        name,
        email,
        password,
        role,
        ageGroup: ageGroup || undefined,
      })

      // Auto sign-in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      setLoading(false)

      if (result?.error) {
        setError('Account created but sign-in failed. Try logging in.')
      } else {
        router.push(ageGroup ? '/lessons' : '/lessons')
        router.refresh()
      }
    } catch (err: any) {
      setLoading(false)
      setError(err.message ?? 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('name')}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
          {t('email')}
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
          {t('password')}
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">I am a...</label>
        <div className="mt-2 flex gap-3">
          {(['child', 'parent', 'teacher'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                role === r
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {role === 'child' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {tAge('select')}
          </label>
          <div className="mt-2 space-y-2">
            {([
              { value: 'little-explorers', name: 'littleExplorers', age: 'littleExplorersAge', desc: 'littleExplorersDesc' },
              { value: 'junior-scholars', name: 'juniorScholars', age: 'juniorScholarsAge', desc: 'juniorScholarsDesc' },
              { value: 'young-disciples', name: 'youngDisciples', age: 'youngDisciplesAge', desc: 'youngDisciplesDesc' },
            ] as const).map((group) => (
              <button
                key={group.value}
                type="button"
                onClick={() => setAgeGroup(group.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  ageGroup === group.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">{tAge(group.name)}</span>
                <span className="ml-2 text-xs text-gray-500">{tAge(group.age)}</span>
                <p className="mt-0.5 text-xs text-gray-500">{tAge(group.desc)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {role === 'parent' && (
        <label className="flex items-start gap-2">
          <input type="checkbox" required className="mt-1 rounded" />
          <span className="text-sm text-gray-600">{t('parentConsent')}</span>
        </label>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? '...' : t('registerButton')}
      </button>

      <p className="text-center text-sm text-gray-600">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          {t('loginButton')}
        </Link>
      </p>
    </form>
  )
}
