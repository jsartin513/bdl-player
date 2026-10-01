import { NextResponse } from 'next/server'
import { clearPlayerSessionCookie } from '@/app/lib/player-auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearPlayerSessionCookie(response)
  return response
}
