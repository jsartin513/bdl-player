import 'server-only'

import { eq } from 'drizzle-orm'
import { leagueRegistrations } from '@/app/db/schema'
import { getDb } from '@/app/lib/db'

export type LeagueRegistrationRow = {
  id: string
  accountId: string
  adminEventId: string
  status: string
}

export async function createPendingLeagueRegistration(input: {
  accountId: string
  adminEventId: string
  waiverAcceptedAt: Date
}): Promise<LeagueRegistrationRow> {
  const db = getDb()
  const [row] = await db
    .insert(leagueRegistrations)
    .values({
      accountId: input.accountId,
      adminEventId: input.adminEventId,
      status: 'pending_payment',
      waiverAcceptedAt: input.waiverAcceptedAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [leagueRegistrations.accountId, leagueRegistrations.adminEventId],
      set: {
        status: 'pending_payment',
        waiverAcceptedAt: input.waiverAcceptedAt,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: leagueRegistrations.id,
      accountId: leagueRegistrations.accountId,
      adminEventId: leagueRegistrations.adminEventId,
      status: leagueRegistrations.status,
    })

  if (!row) throw new Error('Failed to create registration')
  return row
}

export async function attachStripeCheckoutSession(
  registrationId: string,
  stripeCheckoutSessionId: string
): Promise<void> {
  const db = getDb()
  await db
    .update(leagueRegistrations)
    .set({
      stripeCheckoutSessionId,
      updatedAt: new Date(),
    })
    .where(eq(leagueRegistrations.id, registrationId))
}

export async function markLeagueRegistrationPaid(input: {
  stripeCheckoutSessionId: string
  stripePaymentIntentId: string | null
}): Promise<boolean> {
  const db = getDb()
  const [row] = await db
    .update(leagueRegistrations)
    .set({
      status: 'paid',
      stripePaymentIntentId: input.stripePaymentIntentId,
      updatedAt: new Date(),
    })
    .where(eq(leagueRegistrations.stripeCheckoutSessionId, input.stripeCheckoutSessionId))
    .returning({ id: leagueRegistrations.id })

  return Boolean(row)
}
