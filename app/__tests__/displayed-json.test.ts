import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findForbiddenKeys } from '@bdl/player-public-contract'
import { displayedLeagueCatalog, displayedProfile } from '@/app/lib/league-catalog-display'
import { parseLeagueCatalogBody } from '@/app/lib/league-catalog-parse'
import { toPublicMe } from '@/app/lib/players/public-me'

const fixturesDir = join(__dirname, 'fixtures')

describe('displayed JSON fixtures', () => {
  it('catalog v2 fixture parses and displays without forbidden keys', () => {
    const raw = JSON.parse(
      readFileSync(join(fixturesDir, 'catalog-v2-admin.json'), 'utf8')
    ) as unknown
    const parsed = parseLeagueCatalogBody(raw)
    expect(parsed.version).toBe(2)
    const display = displayedLeagueCatalog(
      parsed,
      'https://admin-preview.bostondodgeballleague.com/api/public/leagues'
    )
    expect(findForbiddenKeys(display)).toEqual([])
    expect(display.homeLeagues[0].logoUrl).toContain('boston_dodgeball_league.webp')
    expect(display.products).toHaveLength(1)
  })

  it('displayed profile fixture has no forbidden keys', () => {
    const fixture = JSON.parse(
      readFileSync(join(fixturesDir, 'displayed-profile.json'), 'utf8')
    ) as unknown
    expect(findForbiddenKeys(fixture)).toEqual([])
    const fromHelper = displayedProfile(
      toPublicMe({
        email: 'player@example.com',
        firstName: 'Alex',
        lastName: 'Player',
        selfReportedSkill: 'intermediate',
      })
    )
    expect(fromHelper).toEqual(fixture)
  })
})
