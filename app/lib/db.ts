import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

export function getPlayerDatabaseUrl(): string | null {
  const url = process.env.PLAYER_DATABASE_URL?.trim()
  return url ? url : null
}

export function getDb() {
  const url = getPlayerDatabaseUrl()
  if (!url) {
    throw new Error('PLAYER_DATABASE_URL is not set')
  }
  return drizzle(neon(url))
}

export function isDbConfigured(): boolean {
  return getPlayerDatabaseUrl() !== null
}
