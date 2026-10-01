import { describe, expect, it } from 'vitest'
import { parseLeagueCatalogBody } from '@/app/lib/league-catalog-parse'

describe('league catalog parse', () => {
  it('accepts admin public leagues shape', () => {
    const leagues = parseLeagueCatalogBody({
      leagues: [{ code: 'bdl', name: 'Boston Dodgeball League', logoPath: '/x.webp' }],
    })
    expect(leagues).toHaveLength(1)
    expect(leagues[0].code).toBe('bdl')
  })

  it('rejects payloads with forbidden keys', () => {
    expect(() =>
      parseLeagueCatalogBody({
        leagues: [{ code: 'bdl', name: 'BDL', logoPath: '/x.webp', skillLevel: 5 }],
      })
    ).toThrow(/forbidden/i)
  })
})
