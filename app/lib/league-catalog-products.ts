import 'server-only'

import {
  findForbiddenKeys,
  type PublicLeagueProduct,
} from '@bdl/player-public-contract'

function parseProduct(row: unknown): PublicLeagueProduct | null {
  if (!row || typeof row !== 'object') return null
  const record = row as Record<string, unknown>
  const requiredStrings = [
    'adminEventId',
    'name',
    'eventDate',
    'ballType',
    'gender',
    'currency',
  ] as const
  for (const key of requiredStrings) {
    if (typeof record[key] !== 'string') return null
  }
  if (typeof record.priceCents !== 'number' || !Number.isFinite(record.priceCents)) {
    return null
  }

  const product: PublicLeagueProduct = {
    adminEventId: record.adminEventId as string,
    name: record.name as string,
    eventDate: record.eventDate as string,
    startDate: typeof record.startDate === 'string' ? record.startDate : null,
    endDate: typeof record.endDate === 'string' ? record.endDate : null,
    startTime: typeof record.startTime === 'string' ? record.startTime : null,
    endTime: typeof record.endTime === 'string' ? record.endTime : null,
    location: typeof record.location === 'string' ? record.location : null,
    eventFormat:
      record.eventFormat === 'byot' ||
      record.eventFormat === 'remix' ||
      record.eventFormat === 'draft'
        ? record.eventFormat
        : null,
    ballType: record.ballType as PublicLeagueProduct['ballType'],
    gender: record.gender as PublicLeagueProduct['gender'],
    priceCents: record.priceCents as number,
    currency: record.currency as string,
    capacity: typeof record.capacity === 'number' ? record.capacity : null,
    registrationOpensAt:
      typeof record.registrationOpensAt === 'string' ? record.registrationOpensAt : null,
    registrationClosesAt:
      typeof record.registrationClosesAt === 'string' ? record.registrationClosesAt : null,
    publicDescription:
      typeof record.publicDescription === 'string' ? record.publicDescription : null,
  }

  const forbidden = findForbiddenKeys(product)
  if (forbidden.length > 0) return null
  return product
}

export async function findCatalogProductByAdminEventId(
  adminEventId: string
): Promise<PublicLeagueProduct | null> {
  const url = process.env.NEXT_PUBLIC_LEAGUE_CATALOG_URL?.trim()
  if (!url) return null

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { products?: unknown }
    if (!Array.isArray(json.products)) return null

    for (const row of json.products) {
      const product = parseProduct(row)
      if (product?.adminEventId === adminEventId) return product
    }
    return null
  } catch {
    return null
  }
}
