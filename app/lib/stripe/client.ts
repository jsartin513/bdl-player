import 'server-only'

import Stripe from 'stripe'
import { getStripeSecretKey } from '@/app/lib/stripe/config'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe | null {
  const key = getStripeSecretKey()
  if (!key) return null
  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true })
  }
  return stripeClient
}
