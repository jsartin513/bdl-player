import { describe, expect, it } from 'vitest'
import { findForbiddenKeys } from '@bdl/player-public-contract'
import {
  buildChangeFeedV1Response,
  changeFeedCursor,
  parseChangeFeedSinceParam,
} from '@/app/lib/change-feed'

describe('change feed v1', () => {
  const row = {
    accountId: '11111111-1111-1111-1111-111111111111',
    email: 'player@example.com',
    firstName: 'Pat',
    lastName: 'Lee',
    selfReportedSkill: 'intermediate',
    updatedAt: new Date('2026-09-30T12:00:00.000Z'),
  }

  it('maps profile fields for admin sync', () => {
    const body = buildChangeFeedV1Response([row], null)
    expect(body.version).toBe('v1')
    expect(body.profiles).toHaveLength(1)
    expect(body.profiles[0]).toMatchObject({
      accountId: row.accountId,
      email: row.email,
      firstName: 'Pat',
      lastName: 'Lee',
      selfReportedSkill: 'intermediate',
      updatedAt: '2026-09-30T12:00:00.000Z',
    })
    expect(findForbiddenKeys(body)).toEqual([])
  })

  it('uses newest updatedAt as cursor', () => {
    const newer = { ...row, updatedAt: new Date('2026-09-30T13:00:00.000Z') }
    const older = { ...row, updatedAt: new Date('2026-09-30T11:00:00.000Z') }
    expect(changeFeedCursor([newer, older], null)).toBe('2026-09-30T13:00:00.000Z')
  })

  it('echoes since when page is empty', () => {
    expect(changeFeedCursor([], '2026-09-30T10:00:00.000Z')).toBe('2026-09-30T10:00:00.000Z')
    expect(changeFeedCursor([], null)).toBeNull()
  })

  it('rejects invalid since timestamps', () => {
    expect(parseChangeFeedSinceParam('not-a-date')).toBeNull()
    expect(parseChangeFeedSinceParam('2026-09-30T12:00:00.000Z')?.toISOString()).toBe(
      '2026-09-30T12:00:00.000Z'
    )
  })
})
