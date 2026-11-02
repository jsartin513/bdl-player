import {
  findForbiddenKeys,
  type ChangeFeedProfile,
  type ChangeFeedV1Response,
} from '@bdl/player-public-contract'
import { toPublicMe } from '@/app/lib/players/public-me'

export type ChangeFeedRow = {
  accountId: string
  email: string
  firstName: string | null
  lastName: string | null
  selfReportedSkill: string | null
  updatedAt: Date
}

/** ISO-8601 cursor for the next `since` query (max updatedAt in this page). */
export function changeFeedCursor(
  rows: ChangeFeedRow[],
  since: string | null
): string | null {
  if (rows.length === 0) return since
  return rows[0].updatedAt.toISOString()
}

export function mapChangeFeedProfiles(rows: ChangeFeedRow[]): ChangeFeedProfile[] {
  return rows.map((row) => {
    const publicProfile = toPublicMe({
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      selfReportedSkill: row.selfReportedSkill,
    })
    return {
      accountId: row.accountId,
      email: publicProfile.email,
      firstName: publicProfile.firstName,
      lastName: publicProfile.lastName,
      selfReportedSkill: publicProfile.selfReportedSkill,
      updatedAt: row.updatedAt.toISOString(),
    }
  })
}

export function buildChangeFeedV1Response(
  rows: ChangeFeedRow[],
  since: string | null
): ChangeFeedV1Response {
  const profiles = mapChangeFeedProfiles(rows)
  const body: ChangeFeedV1Response = {
    version: 'v1',
    cursor: changeFeedCursor(rows, since),
    profiles,
  }
  const forbidden = findForbiddenKeys(body)
  if (forbidden.length > 0) {
    throw new Error(`Change feed contains forbidden keys: ${forbidden.join(', ')}`)
  }
  return body
}

export function parseChangeFeedSinceParam(since: string | null): Date | null {
  if (!since) return null
  const parsed = new Date(since)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}
