import { useTranslations } from 'next-intl'
import { LoginForm } from '@/components/auth/LoginForm'
import { DevQuickLogin } from '@/components/auth/DevQuickLogin'
import { EzraOwl } from '@/components/ui/EzraOwl'

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <EzraOwl size="md" />
        </div>
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('loginSubtitle')}</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <DevQuickLogin />
      </div>
    </main>
  )
}
