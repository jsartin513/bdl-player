import { NextRequest, NextResponse } from 'next/server'
import { isDbConfigured } from '@/app/lib/db'
import { findCatalogProductByAdminEventId } from '@/app/lib/league-catalog-products'
import {
  playerUnauthorizedResponse,
  readPlayerSessionFromRequest,
} from '@/app/lib/player-auth'
import {
  checkRegistrationEligibility,
  type PlayerGenderSelfReport,
} from '@/app/lib/registrations/eligibility'
import {
  attachStripeCheckoutSession,
  createPendingLeagueRegistration,
} from '@/app/lib/registrations/mutations'
import { ensureAccountForEmail } from '@/app/lib/players/queries'
import { createLeagueCheckoutSession } from '@/app/lib/stripe/checkout'
import { isStripeConfigured } from '@/app/lib/stripe/config'

type RegisterBody = {
  waiverAccepted?: unknown
  playerGender?: unknown
  requestedDivision?: unknown
}

function parsePlayerGender(value: unknown): PlayerGenderSelfReport {
  if (value === null || value === undefined) return null
  if (
    value === 'male' ||
    value === 'female' ||
    value === 'non_binary' ||
    value === 'unknown'
  ) {
    return value
  }
  return 'unknown'
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ adminEventId: string }> }
) {
  const session = readPlayerSessionFromRequest(request)
  if (!session) return playerUnauthorizedResponse()

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { adminEventId } = await context.params
  if (!adminEventId?.trim()) {
    return NextResponse.json({ error: 'adminEventId is required' }, { status: 400 })
  }

  const body = (await request.json()) as RegisterBody
  if (body.waiverAccepted !== true) {
    return NextResponse.json({ error: 'waiverAccepted must be true' }, { status: 400 })
  }

  const product = await findCatalogProductByAdminEventId(adminEventId)
  if (!product) {
    return NextResponse.json({ error: 'League product not found' }, { status: 404 })
  }

  const eligibility = checkRegistrationEligibility({
    product,
    playerGender: parsePlayerGender(body.playerGender),
    requestedDivision:
      typeof body.requestedDivision === 'string' ? body.requestedDivision : null,
  })
  if (!eligibility.ok) {
    return NextResponse.json(
      { error: eligibility.message, code: eligibility.code },
      { status: 400 }
    )
  }

  const accountId = await ensureAccountForEmail(session.email)
  const registration = await createPendingLeagueRegistration({
    accountId,
    adminEventId: product.adminEventId,
    waiverAcceptedAt: new Date(),
  })

  const checkout = await createLeagueCheckoutSession({
    registrationId: registration.id,
    accountEmail: session.email,
    product,
  })
  if (!checkout.ok) {
    return NextResponse.json({ error: checkout.error }, { status: 502 })
  }
  if (!checkout.session.url || !checkout.session.id) {
    return NextResponse.json({ error: 'Stripe session missing url' }, { status: 502 })
  }

  await attachStripeCheckoutSession(registration.id, checkout.session.id)

  return NextResponse.json({
    registrationId: registration.id,
    checkoutUrl: checkout.session.url,
    stripeCheckoutSessionId: checkout.session.id,
  })
}
