import { NextRequest, NextResponse } from 'next/server'
import {
  clearPlayerOAuthReturnCookie,
  clearPlayerOAuthStateCookie,
  readPlayerOAuthReturn,
  readPlayerOAuthState,
  setPlayerSessionCookie,
} from '@/app/lib/player-auth'
import { ensureAccountForEmail } from '@/app/lib/players/queries'
import { isDbConfigured } from '@/app/lib/db'

function appBaseUrl(request: NextRequest): URL {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (appUrl) return new URL(appUrl)
  return new URL(request.url)
}

function playerErrorRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url))
}

export async function GET(request: NextRequest) {
  const clientId = process.env.PLAYER_GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.PLAYER_GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    return playerErrorRedirect(request, 'google_not_configured')
  }

  const expectedState = readPlayerOAuthState(request)
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')

  if (!expectedState || !state || expectedState !== state || !code) {
    return playerErrorRedirect(request, 'invalid_state')
  }

  const baseUrl = appBaseUrl(request)
  const redirectUri = new URL('/api/player/google/callback', baseUrl)

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri.toString(),
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    return playerErrorRedirect(request, 'token_exchange_failed')
  }

  const tokenData = (await tokenResponse.json()) as { id_token?: string }
  const idToken = tokenData.id_token
  if (!idToken) {
    return playerErrorRedirect(request, 'missing_id_token')
  }

  const verifyResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  )
  if (!verifyResponse.ok) {
    return playerErrorRedirect(request, 'token_verify_failed')
  }

  const profile = (await verifyResponse.json()) as {
    aud?: string
    email?: string
    email_verified?: string
  }

  const email = profile.email?.toLowerCase()
  if (!email || profile.email_verified !== 'true' || profile.aud !== clientId) {
    return playerErrorRedirect(request, 'invalid_google_identity')
  }

  if (isDbConfigured()) {
    await ensureAccountForEmail(email)
  }

  const returnTo = readPlayerOAuthReturn(request)
  const response = NextResponse.redirect(new URL(returnTo, request.url))
  clearPlayerOAuthStateCookie(response)
  clearPlayerOAuthReturnCookie(response)
  if (!setPlayerSessionCookie(response, email)) {
    return playerErrorRedirect(request, 'session_not_configured')
  }

  return response
}
