import { describe, expect, it } from 'vitest'
import { parseLeagueCatalogBody } from '@/app/lib/league-catalog-parse'

describe('league catalog parse', () => {
  it('accepts admin public leagues v1 shape', () => {
    const catalog = parseLeagueCatalogBody({
      leagues: [{ code: 'bdl', name: 'Boston Dodgeball League', logoPath: '/x.webp' }],
    })
    expect(catalog.version).toBe(1)
    expect(catalog.leagues).toHaveLength(1)
    expect(catalog.leagues[0].code).toBe('bdl')
    expect(catalog.products).toEqual([])
  })

  it('accepts admin catalog v2 with products', () => {
    const catalog = parseLeagueCatalogBody({
      version: 2,
      leagues: [{ code: 'bdl', name: 'BDL', logoPath: '/x.webp' }],
      products: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          name: 'Spring BYOT',
          startDate: '2026-04-01',
          endDate: null,
          time: null,
          location: null,
          format: 'byot',
          priceCents: 8500,
          capacity: 48,
          registrationOpensAt: null,
          registrationClosesAt: null,
          publicDescription: null,
        },
      ],
    })
    expect(catalog.version).toBe(2)
    expect(catalog.products[0].format).toBe('byot')
  })

  it('rejects payloads with forbidden keys', () => {
    expect(() =>
      parseLeagueCatalogBody({
        leagues: [{ code: 'bdl', name: 'BDL', logoPath: '/x.webp', skillLevel: 5 }],
      })
    ).toThrow(/forbidden/i)
  })

  it('requires products array for catalog v2', () => {
    expect(() =>
      parseLeagueCatalogBody({
        version: 2,
        leagues: [{ code: 'bdl', name: 'BDL', logoPath: '/x.webp' }],
      })
    ).toThrow(/products/i)
  })
})
