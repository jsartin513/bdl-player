import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/server', () => ({
  NextRequest: class NextRequest {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}))

import { createPlayerSessionToken, readPlayerSession } from '@/app/lib/player-auth'
import { readPlayerSessionEdge } from '@/app/lib/player-session-edge'

describe('player auth session', () => {
  const originalSecret = process.env.PLAYER_SESSION_SECRET

  beforeEach(() => {
    process.env.PLAYER_SESSION_SECRET = 'test-player-session-secret'
  })

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.PLAYER_SESSION_SECRET
    else process.env.PLAYER_SESSION_SECRET = originalSecret
  })

  it('creates and verifies a signed player session token', () => {
    const token = createPlayerSessionToken('player@example.com')
    expect(token).toBeTruthy()

    const session = readPlayerSession(token)
    expect(session?.email).toBe('player@example.com')
    expect(session?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('edge verifier accepts tokens from node signer', async () => {
    const token = createPlayerSessionToken('player@example.com')
    expect(token).toBeTruthy()
    const session = await readPlayerSessionEdge(token)
    expect(session?.email).toBe('player@example.com')
  })
})
