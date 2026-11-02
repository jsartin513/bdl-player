import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicLeagueProduct } from '@bdl/player-public-contract'

const mockCreate = vi.fn()

vi.mock('@/app/lib/stripe/client', () => ({
  getStripeClient: vi.fn(() => ({
    checkout: { sessions: { create: mockCreate } },
    webhooks: { constructEvent: vi.fn() },
  })),
}))

vi.mock('@/app/lib/registrations/mutations', () => ({
  markLeagueRegistrationPaid: vi.fn().mockResolvedValue(true),
}))

import { createLeagueCheckoutSession } from '@/app/lib/stripe/checkout'
import { handleStripeWebhookEvent, verifyStripeWebhookPayload } from '@/app/lib/stripe/webhook'
import { markLeagueRegistrationPaid } from '@/app/lib/registrations/mutations'
import { getStripeClient } from '@/app/lib/stripe/client'

const product: PublicLeagueProduct = {
  adminEventId: 'evt_1',
  name: 'Fall BYOT',
  eventDate: '2026-09-01',
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  location: null,
  eventFormat: 'byot',
  ballType: 'foam',
  gender: 'mixed',
  priceCents: 4500,
  currency: 'USD',
  capacity: null,
  registrationOpensAt: null,
  registrationClosesAt: null,
  publicDescription: null,
}

describe('createLeagueCheckoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  it('returns error when Stripe client is unavailable', async () => {
    vi.mocked(getStripeClient).mockReturnValueOnce(null)
    const result = await createLeagueCheckoutSession({
      registrationId: 'reg_1',
      accountEmail: 'player@example.com',
      product,
    })
    expect(result.ok).toBe(false)
  })

  it('creates checkout with league metadata', async () => {
    mockCreate.mockResolvedValue({ id: 'cs_test', url: 'https://checkout.stripe.com' })
    const result = await createLeagueCheckoutSession({
      registrationId: 'reg_1',
      accountEmail: 'player@example.com',
      product,
    })
    expect(result.ok).toBe(true)
    expect(mockCreate).toHaveBeenCalled()
  })
})

describe('verifyStripeWebhookPayload', () => {
  it('rejects missing signature', () => {
    const result = verifyStripeWebhookPayload('{}', null)
    expect(result.ok).toBe(false)
  })
})

describe('handleStripeWebhookEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks registration paid for league sessions', async () => {
    await handleStripeWebhookEvent({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_status: 'paid',
          payment_intent: 'pi_123',
          metadata: { source: 'bdl_player_league' },
        },
      },
    } as never)
    expect(markLeagueRegistrationPaid).toHaveBeenCalled()
  })
})
