import 'server-only'

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const PLAYER_SESSION_COOKIE = 'player_session'
const PLAYER_OAUTH_STATE_COOKIE = 'player_oauth_state'
const PLAYER_OAUTH_RETURN_COOKIE = 'player_oauth_return'
const PLAYER_SESSION_TTL_SECONDS = 60 * 60 * 12
const PLAYER_OAUTH_STATE_TTL_SECONDS = 60 * 10

export type PlayerSessionPayload = {
  email: string
  exp: number
}

function getPlayerSessionSecret(): string | null {
  const secret = process.env.PLAYER_SESSION_SECRET?.trim()
  return secret ? secret : null
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeSignatureMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(actualBuffer, expectedBuffer)
}

export function createPlayerSessionToken(email: string): string | null {
  const secret = getPlayerSessionSecret()
  if (!secret) return null
  const payload: PlayerSessionPayload = {
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + PLAYER_SESSION_TTL_SECONDS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

function readPlayerSessionPayload(token: string | null | undefined): PlayerSessionPayload | null {
  if (!token) return null
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const secret = getPlayerSessionSecret()
  if (!secret) return null

  const expected = signPayload(encodedPayload, secret)
  if (!safeSignatureMatch(signature, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      email?: string
      exp?: number
    }
    if (typeof payload.email !== 'string') return null
    if (typeof payload.exp !== 'number') return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null
    return { email: payload.email, exp: payload.exp }
  } catch {
    return null
  }
}

export function readPlayerSession(token: string | null | undefined): PlayerSessionPayload | null {
  return readPlayerSessionPayload(token)
}

export function readPlayerSessionFromRequest(request: NextRequest): PlayerSessionPayload | null {
  const token = request.cookies.get(PLAYER_SESSION_COOKIE)?.value
  return readPlayerSession(token)
}

function playerSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function setPlayerSessionCookie(response: NextResponse, email: string): boolean {
  const token = createPlayerSessionToken(email)
  if (!token) return false
  response.cookies.set({
    name: PLAYER_SESSION_COOKIE,
    value: token,
    ...playerSessionCookieOptions(PLAYER_SESSION_TTL_SECONDS),
  })
  return true
}

export function clearPlayerSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: PLAYER_SESSION_COOKIE,
    value: '',
    ...playerSessionCookieOptions(0),
  })
}

export function createPlayerOAuthState(): string {
  return randomBytes(24).toString('base64url')
}

export function setPlayerOAuthStateCookie(response: NextResponse, state: string) {
  response.cookies.set({
    name: PLAYER_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PLAYER_OAUTH_STATE_TTL_SECONDS,
  })
}

export function readPlayerOAuthState(request: NextRequest): string | null {
  return request.cookies.get(PLAYER_OAUTH_STATE_COOKIE)?.value ?? null
}

export function clearPlayerOAuthStateCookie(response: NextResponse) {
  response.cookies.set({
    name: PLAYER_OAUTH_STATE_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function sanitizePlayerReturnTo(returnTo: string | null): string {
  const fallback = '/'
  if (!returnTo) return fallback
  const trimmed = returnTo.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback
  if (trimmed.includes('\\') || trimmed.includes('..')) return fallback
  return trimmed
}

export function setPlayerOAuthReturnCookie(response: NextResponse, returnTo: string) {
  response.cookies.set({
    name: PLAYER_OAUTH_RETURN_COOKIE,
    value: sanitizePlayerReturnTo(returnTo),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PLAYER_OAUTH_STATE_TTL_SECONDS,
  })
}

export function readPlayerOAuthReturn(request: NextRequest): string {
  const value = request.cookies.get(PLAYER_OAUTH_RETURN_COOKIE)?.value
  return sanitizePlayerReturnTo(value ?? null)
}

export function clearPlayerOAuthReturnCookie(response: NextResponse) {
  response.cookies.set({
    name: PLAYER_OAUTH_RETURN_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function playerUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function verifyPlayerSyncSecret(request: NextRequest): boolean {
  const expected = process.env.PLAYER_SYNC_SECRET?.trim()
  if (!expected) return false
  const provided = request.headers.get('x-bdl-player-sync-secret')?.trim()
  return Boolean(provided && provided === expected)
}
