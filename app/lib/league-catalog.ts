import 'server-only'

import {
  parseLeagueCatalogBody,
  type PublicLeagueCatalogEntry,
} from '@/app/lib/league-catalog-parse'

export type { PublicLeagueCatalogEntry }

export type LeagueCatalogResult =
  | { ok: true; leagues: PublicLeagueCatalogEntry[] }
  | { ok: false; error: string }

function catalogUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_LEAGUE_CATALOG_URL?.trim()
  return url || null
}

/** Server-side fetch of the admin public league catalog. */
export async function fetchLeagueCatalog(): Promise<LeagueCatalogResult> {
  const url = catalogUrl()
  if (!url) {
    return { ok: false, error: 'NEXT_PUBLIC_LEAGUE_CATALOG_URL is not set' }
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return { ok: false, error: `Catalog HTTP ${res.status}` }
    }
    const json = (await res.json()) as unknown
    const leagues = parseLeagueCatalogBody(json)
    return { ok: true, leagues }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Catalog fetch failed'
    return { ok: false, error: message }
  }
}
