import 'server-only'

import type { PublicLeagueProduct } from '@bdl/player-public-contract'
import type Stripe from 'stripe'
import { getStripeClient } from '@/app/lib/stripe/client'
import { getAppBaseUrl } from '@/app/lib/stripe/config'

export const LEAGUE_CHECKOUT_METADATA_SOURCE = 'bdl_player_league'

export type CreateLeagueCheckoutSessionInput = {
  registrationId: string
  accountEmail: string
  product: PublicLeagueProduct
}

export type CreateLeagueCheckoutSessionResult =
  | { ok: true; session: Stripe.Checkout.Session }
  | { ok: false; error: string }

export async function createLeagueCheckoutSession(
  input: CreateLeagueCheckoutSessionInput
): Promise<CreateLeagueCheckoutSessionResult> {
  const stripe = getStripeClient()
  if (!stripe) {
    return { ok: false, error: 'Stripe is not configured' }
  }

  if (input.product.priceCents <= 0) {
    return { ok: false, error: 'Product price is not set for checkout' }
  }

  const baseUrl = getAppBaseUrl().replace(/\/$/, '')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: input.accountEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.product.currency.toLowerCase(),
            unit_amount: input.product.priceCents,
            product_data: {
              name: input.product.name,
              description: input.product.publicDescription ?? undefined,
            },
          },
        },
      ],
      success_url: `${baseUrl}/leagues?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/leagues?checkout=cancelled`,
      metadata: {
        source: LEAGUE_CHECKOUT_METADATA_SOURCE,
        registration_id: input.registrationId,
        admin_event_id: input.product.adminEventId,
      },
    })

    return { ok: true, session }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed'
    return { ok: false, error: message }
  }
}
