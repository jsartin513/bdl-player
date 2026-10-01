import { NextRequest, NextResponse } from 'next/server'
import { desc, eq, gt } from 'drizzle-orm'
import { playerAccounts, playerProfiles } from '@/app/db/schema'
import {
  buildChangeFeedV1Response,
  parseChangeFeedSinceParam,
} from '@/app/lib/change-feed'
import { getDb, isDbConfigured } from '@/app/lib/db'
import { verifyPlayerSyncSecret } from '@/app/lib/player-auth'

/**
 * Admin pull sync — change feed v1.
 *
 * - **Auth:** `X-BDL-Player-Sync-Secret` header (must match `PLAYER_SYNC_SECRET`).
 * - **Query `since` (optional):** ISO-8601 timestamp. Returns profiles whose
 *   `player_accounts.updated_at` is strictly after `since` (profile PATCH bumps
 *   account `updated_at`). Omit on first poll.
 * - **Response:** `{ version: "v1", cursor, profiles }` — each profile includes
 *   `accountId`, `email`, `firstName`, `lastName`, `selfReportedSkill`, `updatedAt`.
 * - **Cursor:** Pass returned `cursor` as `since` on the next poll. When the page
 *   is empty, `cursor` echoes the request `since` (or `null` if none). Up to 100
 *   profiles per request (newest first).
 */
export async function GET(request: NextRequest) {
  if (!verifyPlayerSyncSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isDbConfigured()) {
    return NextResponse.json(buildChangeFeedV1Response([], null))
  }

  const sinceRaw = request.nextUrl.searchParams.get('since')?.trim() || null
  const sinceDate = parseChangeFeedSinceParam(sinceRaw)
  if (sinceRaw && !sinceDate) {
    return NextResponse.json({ error: 'Invalid since parameter' }, { status: 400 })
  }

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
    .where(sinceDate ? gt(playerAccounts.updatedAt, sinceDate) : undefined)
    .orderBy(desc(playerAccounts.updatedAt))
    .limit(100)

  return NextResponse.json(buildChangeFeedV1Response(rows, sinceRaw))
}
