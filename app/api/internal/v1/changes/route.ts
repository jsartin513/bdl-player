import { NextRequest, NextResponse } from 'next/server'
import { CHANGE_FEED_VERSION } from '@bdl/player-public-contract'
import { desc, eq, gt } from 'drizzle-orm'
import { playerAccounts, playerProfiles } from '@/app/db/schema'
import { getDb, isDbConfigured } from '@/app/lib/db'
import { verifyPlayerSyncSecret } from '@/app/lib/player-auth'
import { toPublicMe } from '@/app/lib/players/public-me'

export async function GET(request: NextRequest) {
  if (!verifyPlayerSyncSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isDbConfigured()) {
    return NextResponse.json({
      version: CHANGE_FEED_VERSION,
      cursor: null,
      profiles: [],
    })
  }

  const since = request.nextUrl.searchParams.get('since')?.trim() || null
  const db = getDb()

  const rows = await db
    .select({
      accountId: playerAccounts.id,
      email: playerAccounts.email,
      firstName: playerProfiles.firstName,
      lastName: playerProfiles.lastName,
      selfReportedSkill: playerProfiles.selfReportedSkill,
      updatedAt: playerAccounts.updatedAt,
    })
    .from(playerAccounts)
    .leftJoin(playerProfiles, eq(playerProfiles.accountId, playerAccounts.id))
    .where(since ? gt(playerAccounts.updatedAt, new Date(since)) : undefined)
    .orderBy(desc(playerAccounts.updatedAt))
    .limit(100)

  const profiles = rows.map((row) => {
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

  const cursor =
    rows.length > 0 ? rows[rows.length - 1].updatedAt.toISOString() : since

  return NextResponse.json({
    version: CHANGE_FEED_VERSION,
    cursor,
    profiles,
  })
}
