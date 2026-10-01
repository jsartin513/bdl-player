/**
 * Edge-safe player session verification for middleware (Web Crypto HMAC).
 * Mirrors the cookie format produced by app/lib/player-auth.ts.
 */

export const PLAYER_SESSION_COOKIE = 'player_session'

export type PlayerSessionPayload = {
  email: string
  exp: number
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export async function readPlayerSessionEdge(
  token: string | null | undefined
): Promise<PlayerSessionPayload | null> {
  if (!token) return null
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const secret = process.env.PLAYER_SESSION_SECRET?.trim()
  if (!secret) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuf = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(encodedPayload)
  )
  const expected = bytesToBase64Url(sigBuf)
  if (!safeEqual(signature, expected)) return null

  try {
    const b64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const json = atob(b64 + pad)
    const payload = JSON.parse(json) as { email?: string; exp?: number }
    if (typeof payload.email !== 'string') return null
    if (typeof payload.exp !== 'number') return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null
    return { email: payload.email, exp: payload.exp }
  } catch {
    return null
  }
}
