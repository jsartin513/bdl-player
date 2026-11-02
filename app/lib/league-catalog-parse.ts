import { findForbiddenKeys } from '@bdl/player-public-contract'

/** Home-league branding row from admin `GET /api/public/leagues`. */
export type PublicLeagueCatalogEntry = {
  code: string
  name: string
  logoPath: string
}

/** Sellable league product from admin catalog v2 `products`. */
export type PublicLeagueProductEntry = {
  id: string
  name: string
  startDate: string
  endDate: string | null
  time: string | null
  location: string | null
  format: string | null
  priceCents: number | null
  capacity: number | null
  registrationOpensAt: string | null
  registrationClosesAt: string | null
  publicDescription: string | null
}

export type ParsedLeagueCatalog = {
  version: number
  leagues: PublicLeagueCatalogEntry[]
  products: PublicLeagueProductEntry[]
}

function parseLeagueRow(item: unknown): PublicLeagueCatalogEntry | null {
  if (!item || typeof item !== 'object') return null
  const row = item as Record<string, unknown>
  if (
    typeof row.code !== 'string' ||
    typeof row.name !== 'string' ||
    typeof row.logoPath !== 'string'
  ) {
    return null
  }
  return { code: row.code, name: row.name, logoPath: row.logoPath }
}

function parseProductRow(item: unknown): PublicLeagueProductEntry | null {
  if (!item || typeof item !== 'object') return null
  const row = item as Record<string, unknown>
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.startDate !== 'string') {
    return null
  }
  const priceCents =
    row.priceCents === null || row.priceCents === undefined
      ? null
      : typeof row.priceCents === 'number'
        ? row.priceCents
        : null
  const capacity =
    row.capacity === null || row.capacity === undefined
      ? null
      : typeof row.capacity === 'number'
        ? row.capacity
        : null
  return {
    id: row.id,
    name: row.name,
    startDate: row.startDate,
    endDate: typeof row.endDate === 'string' ? row.endDate : row.endDate === null ? null : null,
    time: typeof row.time === 'string' ? row.time : row.time === null ? null : null,
    location: typeof row.location === 'string' ? row.location : row.location === null ? null : null,
    format: typeof row.format === 'string' ? row.format : row.format === null ? null : null,
    priceCents,
    capacity,
    registrationOpensAt:
      typeof row.registrationOpensAt === 'string'
        ? row.registrationOpensAt
        : row.registrationOpensAt === null
          ? null
          : null,
    registrationClosesAt:
      typeof row.registrationClosesAt === 'string'
        ? row.registrationClosesAt
        : row.registrationClosesAt === null
          ? null
          : null,
    publicDescription:
      typeof row.publicDescription === 'string'
        ? row.publicDescription
        : row.publicDescription === null
          ? null
          : null,
  }
}

export function parseLeagueCatalogBody(json: unknown): ParsedLeagueCatalog {
  if (!json || typeof json !== 'object' || !('leagues' in json)) {
    throw new Error('Invalid catalog shape')
  }
  const forbidden = findForbiddenKeys(json)
  if (forbidden.length > 0) {
    throw new Error(`Catalog contains forbidden keys: ${forbidden.join(', ')}`)
  }

  const record = json as Record<string, unknown>
  const version =
    typeof record.version === 'number' && Number.isInteger(record.version) ? record.version : 1

  const leaguesRaw = record.leagues
  if (!Array.isArray(leaguesRaw)) throw new Error('Invalid catalog shape')

  const leagues: PublicLeagueCatalogEntry[] = []
  for (const item of leaguesRaw) {
    const row = parseLeagueRow(item)
    if (row) leagues.push(row)
  }

  let products: PublicLeagueProductEntry[] = []
  if (version >= 2) {
    if (!Array.isArray(record.products)) {
      throw new Error('Catalog v2 missing products array')
    }
    products = []
    for (const item of record.products) {
      const row = parseProductRow(item)
      if (row) products.push(row)
    }
  }

  return { version, leagues, products }
}
