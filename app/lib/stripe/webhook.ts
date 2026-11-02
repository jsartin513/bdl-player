import 'server-only'

import type Stripe from 'stripe'
import { markLeagueRegistrationPaid } from '@/app/lib/registrations/mutations'
import { LEAGUE_CHECKOUT_METADATA_SOURCE } from '@/app/lib/stripe/checkout'
import { getStripeWebhookSecret } from '@/app/lib/stripe/config'
import { getStripeClient } from '@/app/lib/stripe/client'

export type StripeWebhookVerifyResult =
  | { ok: true; event: Stripe.Event }
  | { ok: false; status: number; error: string }

export function verifyStripeWebhookPayload(
  body: string,
  signature: string | null
): StripeWebhookVerifyResult {
  const stripe = getStripeClient()
  const webhookSecret = getStripeWebhookSecret()

  if (!stripe || !webhookSecret) {
    return { ok: false, status: 500, error: 'Webhook is not configured' }
  }
  if (!signature) {
    return { ok: false, status: 400, error: 'Missing signature' }
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return { ok: true, event }
  } catch {
    return { ok: false, status: 400, error: 'Invalid signature' }
  }
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type !== 'checkout.session.completed') return

  const session = event.data.object as Stripe.Checkout.Session
  if (session.metadata?.source !== LEAGUE_CHECKOUT_METADATA_SOURCE) return
  if (session.payment_status !== 'paid') return

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  await markLeagueRegistrationPaid({
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
  })
}
