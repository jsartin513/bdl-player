import 'server-only'

export function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  return key ? key : null
}

export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  return secret ? secret : null
}

export function isStripeConfigured(): boolean {
  return getStripeSecretKey() !== null
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  return url || 'http://localhost:3000'
}
