import { NextRequest, NextResponse } from 'next/server'
import { isSelfReportedSkill } from '@bdl/player-public-contract'
import { eq } from 'drizzle-orm'
import { playerAccounts, playerProfiles } from '@/app/db/schema'
import { getDb, isDbConfigured } from '@/app/lib/db'
import {
  playerUnauthorizedResponse,
  readPlayerSessionFromRequest,
} from '@/app/lib/player-auth'
import { toPublicMe } from '@/app/lib/players/public-me'
import { ensureAccountForEmail, getPublicMeByEmail } from '@/app/lib/players/queries'

export async function GET(request: NextRequest) {
  const session = readPlayerSessionFromRequest(request)
  if (!session) return playerUnauthorizedResponse()

  if (!isDbConfigured()) {
    return NextResponse.json(
      toPublicMe({
        email: session.email,
        firstName: null,
        lastName: null,
        selfReportedSkill: null,
      })
    )
  }

  const me = await getPublicMeByEmail(session.email)
  return NextResponse.json(me)
}

export async function PATCH(request: NextRequest) {
  const session = readPlayerSessionFromRequest(request)
  if (!session) return playerUnauthorizedResponse()
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = (await request.json()) as {
    firstName?: string | null
    lastName?: string | null
    selfReportedSkill?: string | null
  }

  if (
    body.selfReportedSkill !== undefined &&
    body.selfReportedSkill !== null &&
    !isSelfReportedSkill(body.selfReportedSkill)
  ) {
    return NextResponse.json({ error: 'Invalid selfReportedSkill' }, { status: 400 })
  }

  const accountId = await ensureAccountForEmail(session.email)
  const db = getDb()
  await db
    .update(playerProfiles)
    .set({
      ...(body.firstName !== undefined ? { firstName: body.firstName?.trim() || null } : {}),
      ...(body.lastName !== undefined ? { lastName: body.lastName?.trim() || null } : {}),
      ...(body.selfReportedSkill !== undefined
        ? { selfReportedSkill: body.selfReportedSkill }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(playerProfiles.accountId, accountId))
  await db
    .update(playerAccounts)
    .set({ updatedAt: new Date() })
    .where(eq(playerAccounts.id, accountId))

  const me = await getPublicMeByEmail(session.email)
  return NextResponse.json(me)
}
