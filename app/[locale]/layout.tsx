import { NextIntlClientProvider, useMessages } from 'next-intl'
import { notFound } from 'next/navigation'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { TRPCProvider } from '@/components/providers/TRPCProvider'
import { Navigation } from '@/components/ui/Navigation'
import { locales, type Locale } from '@/i18n/config'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = useMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <TRPCProvider>
          <Navigation />
          <div className="pb-16 sm:pb-0">{children}</div>
        </TRPCProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
