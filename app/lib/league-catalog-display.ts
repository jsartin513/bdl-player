import type {
  ParsedLeagueCatalog,
  PublicLeagueCatalogEntry,
  PublicLeagueProductEntry,
} from '@/app/lib/league-catalog-parse'
import type { PublicMeResponse } from '@/app/lib/players/public-me'

/** JSON-shaped props the leagues page renders (for contract tests). */
export type DisplayedLeagueCatalog = {
  version: number
  homeLeagues: Array<{
    code: string
    name: string
    logoUrl: string
  }>
  products: PublicLeagueProductEntry[]
}

export function adminOriginFromCatalogUrl(catalogUrl: string | undefined): string {
  if (!catalogUrl?.trim()) return ''
  try {
    const url = new URL(catalogUrl.trim())
    return url.origin
  } catch {
    return ''
  }
}

export function leagueLogoUrl(logoPath: string, catalogUrl: string | undefined): string {
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) return logoPath
  const origin = adminOriginFromCatalogUrl(catalogUrl)
  return origin ? `${origin}${logoPath}` : logoPath
}

export function displayedLeagueCatalog(
  catalog: ParsedLeagueCatalog,
  catalogUrl?: string
): DisplayedLeagueCatalog {
  return {
    version: catalog.version,
    homeLeagues: catalog.leagues.map((league: PublicLeagueCatalogEntry) => ({
      code: league.code,
      name: league.name,
      logoUrl: leagueLogoUrl(league.logoPath, catalogUrl),
    })),
    products: catalog.products,
  }
}

/** JSON-shaped profile fields shown on the home page (no notes). */
export type DisplayedProfile = Pick<
  PublicMeResponse,
  'email' | 'firstName' | 'lastName' | 'selfReportedSkill'
>

export function displayedProfile(me: PublicMeResponse): DisplayedProfile {
  return {
    email: me.email,
    firstName: me.firstName,
    lastName: me.lastName,
    selfReportedSkill: me.selfReportedSkill,
  }
}
