import { NextRequest, NextResponse } from 'next/server'
import { isDbConfigured } from '@/app/lib/db'
import {
  handleStripeWebhookEvent,
  verifyStripeWebhookPayload,
} from '@/app/lib/stripe/webhook'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  const verified = verifyStripeWebhookPayload(body, signature)
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status })
  }

  if (isDbConfigured()) {
    await handleStripeWebhookEvent(verified.event)
  }

  return NextResponse.json({ received: true })
}
