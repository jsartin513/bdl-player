import { findForbiddenKeys } from '@bdl/player-public-contract'

/** Matches admin `GET /api/public/leagues` payload (home-league picker). */
export type PublicLeagueCatalogEntry = {
  code: string
  name: string
  logoPath: string
}

export function parseLeagueCatalogBody(json: unknown): PublicLeagueCatalogEntry[] {
  if (!json || typeof json !== 'object' || !('leagues' in json)) {
    throw new Error('Invalid catalog shape')
  }
  const forbidden = findForbiddenKeys(json)
  if (forbidden.length > 0) {
    throw new Error(`Catalog contains forbidden keys: ${forbidden.join(', ')}`)
  }
  const leagues = (json as { leagues: unknown }).leagues
  if (!Array.isArray(leagues)) throw new Error('Invalid catalog shape')

  const parsed: PublicLeagueCatalogEntry[] = []
  for (const item of leagues) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (
      typeof row.code !== 'string' ||
      typeof row.name !== 'string' ||
      typeof row.logoPath !== 'string'
    ) {
      continue
    }
    parsed.push({ code: row.code, name: row.name, logoPath: row.logoPath })
  }

  return parsed
}
