import { describe, expect, it } from 'vitest'
import { checkRegistrationEligibility } from '@/app/lib/registrations/eligibility'

const baseProduct = {
  gender: 'mixed' as const,
  eventFormat: 'byot' as const,
}

describe('checkRegistrationEligibility', () => {
  it('rejects male players for she/they products (placeholder)', () => {
    const result = checkRegistrationEligibility({
      product: { ...baseProduct, gender: 'she_they' },
      playerGender: 'male',
      requestedDivision: null,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('gender_mismatch')
  })

  it('rejects requested division until divisions ship', () => {
    const result = checkRegistrationEligibility({
      product: baseProduct,
      playerGender: 'female',
      requestedDivision: 'A',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('division_unavailable')
  })
})
