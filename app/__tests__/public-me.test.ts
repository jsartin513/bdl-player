import { describe, expect, it } from 'vitest'
import { findForbiddenKeys } from '@bdl/player-public-contract'
import { toPublicMe } from '@/app/lib/players/public-me'

describe('toPublicMe', () => {
  it('returns only public fields', () => {
    const body = toPublicMe({
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      selfReportedSkill: 'beginner',
    })
    expect(findForbiddenKeys(body)).toEqual([])
    expect(body.selfReportedSkill).toBe('beginner')
  })

  it('drops invalid self-reported skill', () => {
    const body = toPublicMe({
      email: 'a@b.com',
      firstName: null,
      lastName: null,
      selfReportedSkill: 'worlds',
    })
    expect(body.selfReportedSkill).toBeNull()
  })
})
