import { NextRequest, NextResponse } from 'next/server'
import {
  PLAYER_SESSION_COOKIE,
  readPlayerSessionEdge,
} from '@/app/lib/player-session-edge'

const PUBLIC_PREFIXES = [
  '/login',
  '/api/player/google/',
  '/api/player/logout',
  '/api/internal/',
]

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicPath(pathname)) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(PLAYER_SESSION_COOKIE)?.value
  const session = await readPlayerSessionEdge(token)
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const login = new URL('/login', request.url)
    login.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
