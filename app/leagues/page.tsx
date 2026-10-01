import Link from 'next/link'
import { fetchLeagueCatalog } from '@/app/lib/league-catalog'

export default async function LeaguesPage() {
  const catalog = await fetchLeagueCatalog()

  return (
    <main className="mx-auto max-w-lg p-6">
      <p className="text-sm text-zinc-600">
        <Link href="/" className="underline">
          Home
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold">Leagues</h1>
      {!catalog.ok ? (
        <p className="mt-4 text-sm text-zinc-600">Catalog unavailable: {catalog.error}</p>
      ) : catalog.leagues.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">No leagues published yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {catalog.leagues.map((league) => (
            <li key={league.code} className="flex items-center gap-3 text-sm">
              <span className="font-medium">{league.name}</span>
              <span className="text-zinc-500">({league.code})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
