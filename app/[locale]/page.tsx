import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Home() {
  const t = useTranslations('home')
  const tAge = useTranslations('ageGroups')

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="text-6xl">🦉</div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-lg text-gray-500">{t('subtitle')}</p>
        <p className="mt-4 max-w-lg text-gray-600">{t('tagline')}</p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('startLearning')}
          </Link>
          <Link
            href="/lessons"
            className="rounded-xl border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('featuredLessons')}
          </Link>
        </div>
      </div>

      {/* Age group cards */}
      <div className="mt-16">
        <h2 className="mb-6 text-center text-2xl font-bold">{tAge('select')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {([
            { slug: 'little-explorers', name: 'littleExplorers', age: 'littleExplorersAge', desc: 'littleExplorersDesc', emoji: '🌟' },
            { slug: 'junior-scholars', name: 'juniorScholars', age: 'juniorScholarsAge', desc: 'juniorScholarsDesc', emoji: '📚' },
            { slug: 'young-disciples', name: 'youngDisciples', age: 'youngDisciplesAge', desc: 'youngDisciplesDesc', emoji: '⚔️' },
          ] as const).map((group) => (
            <Link
              key={group.slug}
              href={`/lessons?age=${group.slug}`}
              className="group rounded-2xl border bg-white p-6 text-center shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="text-4xl">{group.emoji}</div>
              <h3 className="mt-3 text-lg font-semibold group-hover:text-indigo-600">
                {tAge(group.name)}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{tAge(group.age)}</p>
              <p className="mt-2 text-sm text-gray-600">{tAge(group.desc)}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
