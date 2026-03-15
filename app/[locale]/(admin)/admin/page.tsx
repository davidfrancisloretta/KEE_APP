'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
const adminCards = [
  {
    href: '/admin/upload',
    labelKey: 'upload' as const,
    desc: 'Upload .docx or .pptx files for AI lesson generation',
    icon: '📤',
  },
  {
    href: '/admin/review',
    labelKey: 'review' as const,
    desc: 'Review and approve AI-generated lessons',
    icon: '📋',
  },
  {
    href: '/admin',
    labelKey: 'manageUsers' as const,
    desc: 'View and manage user accounts and roles',
    icon: '👥',
  },
  {
    href: '/admin',
    labelKey: 'manageSeries' as const,
    desc: 'Organize lesson series and curricula',
    icon: '📚',
  },
]

export default function AdminPortalPage() {
  const t = useTranslations('admin')
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role as string | undefined

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-gray-600">
          Content management and lesson pipeline
        </p>
        {userRole && (
          <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            {userRole.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {adminCards.map((card) => (
          <Link
            key={card.labelKey}
            href={card.href}
            className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
          >
            <div className="text-3xl">{card.icon}</div>
            <h3 className="mt-3 text-lg font-semibold group-hover:text-indigo-600">
              {t(card.labelKey)}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{card.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
