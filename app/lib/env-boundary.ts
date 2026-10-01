/** Env keys that must not exist in the player app (admin / sensitive DB). */
export const FORBIDDEN_ENV_KEY_PATTERNS = [
  /^SENSITIVE_DATABASE_URL$/i,
  /^ADMIN_SESSION_SECRET$/i,
  /^ADMIN_GOOGLE_CLIENT_/i,
  /^DATABASE_URL$/i, // operational admin DB — player uses PLAYER_DATABASE_URL
] as const

export function forbiddenEnvKeysInExample(exampleText: string): string[] {
  const keys = new Set<string>()
  for (const line of exampleText.split('\n')) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=/.exec(line.trim())
    if (match) keys.add(match[1])
  }
  const forbidden: string[] = []
  for (const key of keys) {
    for (const pattern of FORBIDDEN_ENV_KEY_PATTERNS) {
      if (pattern.test(key)) forbidden.push(key)
    }
  }
  return forbidden
}
