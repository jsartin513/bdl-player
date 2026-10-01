import { NextRequest, NextResponse } from 'next/server'
import {
  createPlayerOAuthState,
  setPlayerOAuthReturnCookie,
  setPlayerOAuthStateCookie,
} from '@/app/lib/player-auth'

function appBaseUrl(request: NextRequest): URL {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (appUrl) return new URL(appUrl)
  return new URL(request.url)
}

export async function GET(request: NextRequest) {
  const clientId = process.env.PLAYER_GOOGLE_CLIENT_ID?.trim()
  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url))
  }

  const returnTo = request.nextUrl.searchParams.get('returnTo')
  const baseUrl = appBaseUrl(request)
  const redirectUri = new URL('/api/player/google/callback', baseUrl)
  const state = createPlayerOAuthState()

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri.toString())
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(authUrl)
  setPlayerOAuthStateCookie(response, state)
  if (returnTo) setPlayerOAuthReturnCookie(response, returnTo)
  return response
}
