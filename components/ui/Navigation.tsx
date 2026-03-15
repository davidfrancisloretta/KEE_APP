'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { LocaleSwitcher } from './LocaleSwitcher'

const navItems = [
  { href: '/', labelKey: 'home' as const },
  { href: '/lessons', labelKey: 'lessons' as const },
  { href: '/progress', labelKey: 'progress' as const },
]

const adminRoles = ['content_admin', 'super_admin', 'reviewer'] as const

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const { data: session } = useSession()

  const userRole = (session?.user as any)?.role as string | undefined
  const isAdmin = userRole ? adminRoles.includes(userRole as any) : false

  return (
    <nav className="border-b bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ScriptureQuest
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden text-sm font-medium transition-colors sm:block ${
                pathname === item.href || pathname?.endsWith(item.href)
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className={`hidden text-sm font-medium transition-colors sm:block ${
                pathname?.includes('/admin')
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('admin')}
            </Link>
          )}

          <LocaleSwitcher />

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-600 sm:block">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {tCommon('signOut')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center py-2 text-xs font-medium ${
              pathname === item.href || pathname?.endsWith(item.href)
                ? 'text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            {t(item.labelKey)}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-1 flex-col items-center py-2 text-xs font-medium ${
              pathname?.includes('/admin')
                ? 'text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            {t('admin')}
          </Link>
        )}
      </div>
    </nav>
  )
}
