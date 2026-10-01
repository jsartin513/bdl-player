import { eq } from 'drizzle-orm'
import { playerAccounts, playerProfiles } from '@/app/db/schema'
import { getDb } from '@/app/lib/db'
import { toPublicMe, type PublicMeResponse } from '@/app/lib/players/public-me'

export async function ensureAccountForEmail(email: string): Promise<string> {
  const db = getDb()
  const normalized = email.toLowerCase()
  const [existing] = await db
    .select({ id: playerAccounts.id })
    .from(playerAccounts)
    .where(eq(playerAccounts.email, normalized))
    .limit(1)
  if (existing) return existing.id

  const [created] = await db
    .insert(playerAccounts)
    .values({ email: normalized })
    .returning({ id: playerAccounts.id })
  await db.insert(playerProfiles).values({ accountId: created.id })
  return created.id
}

export async function getPublicMeByEmail(email: string): Promise<PublicMeResponse> {
  const db = getDb()
  const normalized = email.toLowerCase()
  const [row] = await db
    .select({
      email: playerAccounts.email,
      firstName: playerProfiles.firstName,
      lastName: playerProfiles.lastName,
      selfReportedSkill: playerProfiles.selfReportedSkill,
    })
    .from(playerAccounts)
    .leftJoin(playerProfiles, eq(playerProfiles.accountId, playerAccounts.id))
    .where(eq(playerAccounts.email, normalized))
    .limit(1)

  if (!row) {
    return toPublicMe({
      email: normalized,
      firstName: null,
      lastName: null,
      selfReportedSkill: null,
    })
  }

  return toPublicMe({
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    selfReportedSkill: row.selfReportedSkill,
  })
}
