import Link from 'next/link'
import { displayedLeagueCatalog } from '@/app/lib/league-catalog-display'
import { fetchLeagueCatalog } from '@/app/lib/league-catalog'

function formatPrice(cents: number | null, currency = 'USD'): string | null {
  if (cents === null) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export default async function LeaguesPage() {
  const catalog = await fetchLeagueCatalog()
  const catalogUrl = process.env.NEXT_PUBLIC_LEAGUE_CATALOG_URL

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
      ) : (
        <>
          <p className="mt-2 text-xs text-zinc-500">Catalog version {catalog.version}</p>
          {(() => {
            const display = displayedLeagueCatalog(catalog, catalogUrl)
            return (
              <>
                <section className="mt-8">
                  <h2 className="text-lg font-medium">Home leagues</h2>
                  {display.homeLeagues.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-600">No home leagues published yet.</p>
                  ) : (
                    <ul className="mt-4 space-y-4">
                      {display.homeLeagues.map((league) => (
                        <li key={league.code} className="flex items-center gap-3 text-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={league.logoUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{league.name}</p>
                            <p className="text-zinc-500">{league.code}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
                {catalog.version >= 2 ? (
                  <section className="mt-10">
                    <h2 className="text-lg font-medium">Open registrations</h2>
                    {display.products.length === 0 ? (
                      <p className="mt-2 text-sm text-zinc-600">No league products published yet.</p>
                    ) : (
                      <ul className="mt-4 space-y-4">
                        {display.products.map((product) => {
                          const price = formatPrice(product.priceCents)
                          return (
                            <li
                              key={product.id}
                              className="rounded-lg border border-zinc-200 p-4 text-sm"
                            >
                              <p className="font-medium">{product.name}</p>
                              <p className="mt-1 text-zinc-600">
                                {product.startDate}
                                {product.endDate ? ` – ${product.endDate}` : ''}
                              </p>
                              {product.time ? (
                                <p className="text-zinc-600">{product.time}</p>
                              ) : null}
                              {product.location ? (
                                <p className="text-zinc-600">{product.location}</p>
                              ) : null}
                              {product.format ? (
                                <p className="mt-1 text-zinc-500 capitalize">{product.format}</p>
                              ) : null}
                              {price ? <p className="mt-2 font-medium">{price}</p> : null}
                              {product.publicDescription ? (
                                <p className="mt-2 text-zinc-600">{product.publicDescription}</p>
                              ) : null}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </section>
                ) : null}
              </>
            )
          })()}
        </>
      )}
    </main>
  )
}
